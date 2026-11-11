// ─────────────────────────────────────────────────────────────────────────────
// Admin Security Token (Web Crypto HMAC-SHA256)
// Works seamlessly across Node.js and Edge Middleware Runtime
// ─────────────────────────────────────────────────────────────────────────────

const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY || 'KenyaCupAdmin2026!SecureKey';

export interface AdminTokenPayload {
  email: string;
  role: 'ADMIN';
  exp: number;
}

function stringToBufferSource(str: string): BufferSource {
  return new TextEncoder().encode(str) as unknown as BufferSource;
}

function base64UrlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return atob(base64);
}

async function getHmacKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    stringToBufferSource(ADMIN_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

/**
 * Creates an Edge-verifiable signed admin token valid for 24 hours.
 */
export async function createAdminToken(email: string): Promise<string> {
  const payload: AdminTokenPayload = {
    email: email.toLowerCase(),
    role: 'ADMIN',
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  };

  const payloadStr = JSON.stringify(payload);
  const encodedPayload = btoa(payloadStr)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const key = await getHmacKey();
  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    stringToBufferSource(encodedPayload)
  );
  const encodedSignature = base64UrlEncode(signatureBuffer);

  return `${encodedPayload}.${encodedSignature}`;
}

/**
 * Verifies the admin token at the Edge.
 */
export async function verifyAdminToken(token: string | undefined | null): Promise<{ valid: boolean; payload?: AdminTokenPayload }> {
  if (!token || typeof token !== 'string') return { valid: false };

  const parts = token.split('.');
  if (parts.length !== 2) return { valid: false };

  const [encodedPayload, encodedSignature] = parts;

  try {
    const key = await getHmacKey();

    // Reconstruct signature bytes
    const binarySig = base64UrlDecode(encodedSignature);
    const sigBytes = new Uint8Array(binarySig.length);
    for (let i = 0; i < binarySig.length; i++) {
      sigBytes[i] = binarySig.charCodeAt(i);
    }

    const isValidSig = await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes as unknown as BufferSource,
      stringToBufferSource(encodedPayload)
    );

    if (!isValidSig) return { valid: false };

    const payloadJson = base64UrlDecode(encodedPayload);
    const payload: AdminTokenPayload = JSON.parse(payloadJson);

    if (payload.role !== 'ADMIN') return { valid: false };
    if (typeof payload.exp !== 'number' || payload.exp < Date.now()) return { valid: false };

    return { valid: true, payload };
  } catch {
    return { valid: false };
  }
}
