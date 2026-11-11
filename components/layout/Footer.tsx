'use client';
import Link from 'next/link';
import { Trophy, Shield, ExternalLink } from 'lucide-react';
import { KenyaCupLogo, OfficialSanctionedBadge } from '@/components/common/BrandLogo';

export function Footer() {
  return (
    <footer style={{
      background: 'linear-gradient(180deg, #050914 0%, #02050b 100%)',
      borderTop: '1px solid rgba(212, 175, 55, 0.18)',
      color: 'var(--text-secondary)',
      padding: '56px 24px 32px',
      fontSize: '13px',
      position: 'relative',
      zIndex: 10,
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Main 4-column layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '40px',
          marginBottom: '48px',
        }}>
          {/* Brand & Mission */}
          <div style={{ maxWidth: '340px' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', marginBottom: '16px' }}>
              <KenyaCupLogo size={36} />
              <span className="font-condensed" style={{
                fontSize: '20px', fontWeight: 800,
                background: 'linear-gradient(135deg, #D4AF37, #F0CF6E)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                letterSpacing: '0.04em',
              }}>
                KENYA CUP FANTASY
              </span>
            </Link>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '13px', margin: 0 }}>
              The official fantasy rugby platform for Kenya Cup Season 2026/27. Pick your 23-man matchday squad, captain strategically, and compete across mini-leagues powered by Tisini live stats.
            </p>

            <div style={{ marginTop: '16px' }}>
              <OfficialSanctionedBadge />
            </div>

            {/* Social Links (X & Instagram) */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              {/* X (formerly Twitter) */}
              <a
                href="https://x.com/KenyaCup"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Kenya Cup on X"
                style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#CBD5E1', textDecoration: 'none',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(212, 175, 55, 0.15)';
                  e.currentTarget.style.borderColor = 'var(--gold)';
                  e.currentTarget.style.color = '#FFF';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.color = '#CBD5E1';
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com/official_kenyacup"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Kenya Cup on Instagram"
                style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#CBD5E1', textDecoration: 'none',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(236, 72, 153, 0.15)';
                  e.currentTarget.style.borderColor = '#EC4899';
                  e.currentTarget.style.color = '#FFF';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.color = '#CBD5E1';
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Nav */}
          <div>
            <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#FFF', marginBottom: '16px' }}>
              Fantasy Game
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>
                <Link href="/dashboard" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#FFF')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
                  Manager Dashboard
                </Link>
              </li>
              <li>
                <Link href="/squad" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#FFF')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
                  My Squad (23-Man Roster)
                </Link>
              </li>
              <li>
                <Link href="/players" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#FFF')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
                  Transfer Market
                </Link>
              </li>
              <li>
                <Link href="/leagues" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#FFF')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
                  Mini-Leagues & Rankings
                </Link>
              </li>
              <li>
                <Link href="/points" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#FFF')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
                  Gameweek Points & Chips
                </Link>
              </li>
            </ul>
          </div>

          {/* Tournament & Partners */}
          <div>
            <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#FFF', marginBottom: '16px' }}>
              Tournament & Rules
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>
                <span style={{ color: 'var(--text-muted)' }}>Season 2026/27 Kenya Cup</span>
              </li>
              <li>
                <span style={{ color: 'var(--text-muted)' }}>Matchday 1: Nov 21, 2026</span>
              </li>
              <li>
                <span style={{ color: 'var(--text-muted)' }}>KES 150M Salary Cap</span>
              </li>
              <li>
                <span style={{ color: 'var(--text-muted)' }}>Tisini Live Match Statistics</span>
              </li>
              <li>
                <span style={{ color: 'var(--text-muted)' }}>4 Tactical Chips (Bench Boost)</span>
              </li>
            </ul>
          </div>

          {/* Legal Pages */}
          <div>
            <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#FFF', marginBottom: '16px' }}>
              Legal & Privacy
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>
                <Link href="/privacy-policy" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#FFF')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-of-condition" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#FFF')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
                  Terms of Condition
                </Link>
              </li>
              <li>
                <Link href="/cookies-policy" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#FFF')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
                  Cookies Policy
                </Link>
              </li>
              <li>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
                  Kenya Data Protection Act 2019
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright bar */}
        <div style={{
          paddingTop: '24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          fontSize: '12px',
          color: 'var(--text-muted)',
        }}>
          <div>
            © 2026 Kenya Cup Fantasy. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <Link href="/privacy-policy" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Privacy</Link>
            <span>·</span>
            <Link href="/terms-of-condition" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Terms</Link>
            <span>·</span>
            <Link href="/cookies-policy" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

