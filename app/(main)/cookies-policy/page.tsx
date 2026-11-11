import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Cookie } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Cookies Policy | Kenya Cup Fantasy',
  description: 'How Kenya Cup Fantasy uses essential cookies and local storage.',
};

export default function CookiesPolicyPage() {
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
          <Cookie size={24} />
        </div>
        <div>
          <h1 className="font-condensed" style={{ fontSize: '32px', fontWeight: 800, margin: 0, color: '#FFF' }}>
            COOKIES POLICY
          </h1>
          <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '13px' }}>
            Transparency regarding cookies, authentication tokens, and browser storage
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
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#FFF', marginBottom: '8px' }}>1. What Are Cookies?</h2>
          <p>
            Cookies and local web storage are small data files saved to your browser when visiting websites. They ensure essential functions like staying logged into your manager account and preserving tactical squad drafts across page transitions.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#FFF', marginBottom: '8px' }}>2. Categories of Storage We Use</h2>
          <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
            <li><strong>Strictly Necessary Cookies:</strong> Secure Supabase auth tokens that keep your manager session alive securely. Without these, you cannot log in or save transfers.</li>
            <li><strong>Functional Local Storage:</strong> Client-side state persistence (e.g. your active pitch view preferences, optimistic squad edits, and mini-league filters).</li>
            <li><strong>Zero Third-Party Advertising Trackers:</strong> We do not deploy intrusive third-party ad networks, behavioural profiling cookies, or cross-site tracking scripts.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#FFF', marginBottom: '8px' }}>3. Managing Cookies</h2>
          <p>
            You can control or clear cookies and local storage at any time via your browser settings. Please note that disabling essential authentication cookies will prevent you from accessing authenticated manager features and saving your matchday 23 squad.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#FFF', marginBottom: '8px' }}>4. Questions</h2>
          <p>
            If you have questions regarding our cookie practices, reach out to our technical team at <span style={{ color: '#D4AF37' }}>support@kenyacupfantasy.co.ke</span>.
          </p>
        </section>
      </div>
    </div>
  );
}

