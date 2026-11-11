import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | Kenya Cup Fantasy',
  description: 'Kenya Cup Fantasy Privacy Policy - compliance with Kenya Data Protection Act 2019.',
};

export default function PrivacyPolicyPage() {
  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '48px 24px 80px' }}>
      <Link
        href="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          color: '#D4AF37',
          textDecoration: 'none',
          fontSize: '13px',
          fontWeight: 600,
          marginBottom: '32px',
        }}
      >
        <ArrowLeft size={16} /> Back to Home
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: 'rgba(212, 175, 55, 0.12)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#D4AF37',
        }}>
          <ShieldCheck size={24} />
        </div>
        <div>
          <h1 className="font-condensed" style={{ fontSize: '32px', fontWeight: 800, margin: 0, color: '#FFF' }}>
            PRIVACY POLICY
          </h1>
          <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '13px' }}>
            Effective Date: November 2026 · Compliant with the Kenya Data Protection Act 2019
          </p>
        </div>
      </div>

      <div
        className="card-surface"
        style={{
          padding: '36px',
          lineHeight: 1.7,
          color: 'var(--text-secondary)',
          fontSize: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#FFF', marginBottom: '8px' }}>1. Introduction</h2>
          <p>
            Welcome to Kenya Cup Fantasy (&quot;we&quot;, &quot;our&quot;, or &quot;the Platform&quot;). We respect your privacy and are committed to protecting your personal data in strict compliance with the <strong>Kenya Data Protection Act, 2019</strong> and international data privacy best practices.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#FFF', marginBottom: '8px' }}>2. Data We Collect</h2>
          <p>We only collect information necessary to operate your fantasy manager account and mini-leagues:</p>
          <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
            <li><strong>Account Data:</strong> Manager name, team name, email address, and authentication credentials.</li>
            <li><strong>Gameplay Data:</strong> Squad selections, transfers, captain/vice-captain designations, chip usage (Triple Captain, Bench Boost, Co-Captain), and accumulated leaderboard points.</li>
            <li><strong>Technical Data:</strong> IP address, device type, browser metadata, and cookie session identifiers strictly required for secure authentication.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#FFF', marginBottom: '8px' }}>3. How We Use Your Data</h2>
          <p>Your personal information is used exclusively to:</p>
          <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
            <li>Compute gameweek fantasy scores and maintain public and private mini-league standings.</li>
            <li>Send essential gameweek deadline reminders and tournament announcements.</li>
            <li>Prevent fraud, multi-accounting, and ensure fair play across Kenya Cup Fantasy competitions.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#FFF', marginBottom: '8px' }}>4. Data Protection & Security</h2>
          <p>
            All user data is encrypted in transit using Transport Layer Security (TLS 1.3) and encrypted at rest with row-level security (RLS) policies within our database infrastructure. We never sell, rent, or trade your personal information to third parties.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#FFF', marginBottom: '8px' }}>5. Your Rights Under Kenyan Law</h2>
          <p>
            In accordance with the Kenya Data Protection Act 2019, you have the right to request access to your personal data, request correction of inaccurate data, object to processing, or request complete deletion of your manager account.
          </p>
          <p>
            To exercise these rights, contact our Data Protection Officer at <span style={{ color: '#D4AF37' }}>privacy@kenyacupfantasy.co.ke</span>.
          </p>
        </section>
      </div>
    </div>
  );
}

