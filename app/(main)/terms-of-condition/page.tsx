import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Condition | Kenya Cup Fantasy',
  description: 'Rules, fair play policies, and terms of service for Kenya Cup Fantasy managers.',
};

export default function TermsOfConditionPage() {
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
          <FileText size={24} />
        </div>
        <div>
          <h1 className="font-condensed" style={{ fontSize: '32px', fontWeight: 800, margin: 0, color: '#FFF' }}>
            TERMS OF CONDITION
          </h1>
          <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '13px' }}>
            Season 2026/2027 · Governing Kenya Cup Fantasy Tournament Regulations
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
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#FFF', marginBottom: '8px' }}>1. Acceptance of Terms</h2>
          <p>
            By registering an account and assembling a matchday squad on Kenya Cup Fantasy, you agree to comply with and be bound by these Terms of Condition. If you do not agree, you must refrain from using the platform.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#FFF', marginBottom: '8px' }}>2. Squad Assembly & Roster Rules</h2>
          <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
            <li><strong>23-Man Matchday Squad:</strong> Each manager selects 15 starters and 8 substitutes. Only starting players score points unless the <em>Bench Boost</em> tactical chip is activated.</li>
            <li><strong>Salary Cap:</strong> Squads must strictly adhere to the starting budget cap of 150,000,000 KES.</li>
            <li><strong>Club Limit:</strong> Managers may select a maximum of 4 players from any single Kenya Cup club.</li>
            <li><strong>Lockout Timings:</strong> Player transfers, captaincy switches, and bench swaps lock at the scheduled kickoff time of each respective fixture.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#FFF', marginBottom: '8px' }}>3. Fair Play & Multi-Accounting Policy</h2>
          <p>
            Each human participant is entitled to exactly one team. Creating multiple accounts to manipulate mini-leagues or hoard transfers is strictly prohibited. The administration reserves the right to disqualify squads, deduct points, or ban accounts found in breach of fair play.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#FFF', marginBottom: '8px' }}>4. Scoring & Official Statistics</h2>
          <p>
            Fantasy points are awarded based on live match events verified through Tisini and Kenya Rugby Union (KRU) match reports. While points are updated in real time, official gameweek point totals are finalized and verified within 24 hours following the conclusion of the round.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#FFF', marginBottom: '8px' }}>5. Intellectual Property</h2>
          <p>
            Kenya Cup club names, emblems, and player imagery are utilized under editorial and fan-engagement rights. All platform design, code, scoring engines, and brand assets are the exclusive intellectual property of Kenya Cup Fantasy.
          </p>
        </section>
      </div>
    </div>
  );
}

