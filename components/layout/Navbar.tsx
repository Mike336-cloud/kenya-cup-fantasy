'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Trophy, Users, BarChart3, Calendar, Menu, X, Zap, LogOut, LogIn } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';

const GAME_NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard',  icon: BarChart3 },
  { href: '/squad',     label: 'My Squad',   icon: Users },
  { href: '/players',   label: 'Players',    icon: Zap },
  { href: '/leagues',   label: 'Leagues',    icon: Trophy },
  { href: '/points',    label: 'Points',     icon: Calendar },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isLoggedIn, isLoading, email, signOut } = useAuth();

  // Only show game tabs when logged in
  const navItems = isLoggedIn ? GAME_NAV_ITEMS : [];

  return (
    <>
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(2, 8, 23, 0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(212,175,55,0.15)',
        height: '64px',
      }}>
        <div style={{
          maxWidth: '1400px', margin: '0 auto',
          padding: '0 24px',
          height: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {/* Logo */}
          <Link href={isLoggedIn ? '/dashboard' : '/'} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{
              width: '36px', height: '36px',
              background: 'linear-gradient(135deg, #A8891C, #D4AF37, #F0CF6E)',
              borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px', fontWeight: '900',
              boxShadow: '0 0 20px rgba(212,175,55,0.3)',
            }}>🏉</div>
            <div>
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700, fontSize: '18px',
                background: 'linear-gradient(135deg, #D4AF37, #F0CF6E)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                lineHeight: 1,
              }}>
                KENYA CUP
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.1em', lineHeight: 1 }}>
                FANTASY RUGBY
              </div>
            </div>
          </Link>

          {/* Desktop nav — only shown when logged in */}
          <nav style={{ display: 'flex', gap: '4px' }} className="desktop-nav">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link key={href} href={href} style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 14px', borderRadius: '8px',
                  fontSize: '13px', fontWeight: active ? 600 : 500,
                  color: active ? 'var(--gold)' : 'var(--text-secondary)',
                  background: active ? 'rgba(212,175,55,0.1)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                  border: active ? '1px solid rgba(212,175,55,0.2)' : '1px solid transparent',
                }}>
                  <Icon size={14} />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Right side: auth state */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isLoading ? (
              <div style={{ width: '60px', height: '28px', borderRadius: '100px', background: 'rgba(255,255,255,0.05)' }} />
            ) : isLoggedIn ? (
              <>
                {/* Season badge */}
                <div style={{
                  padding: '4px 12px',
                  background: 'rgba(57,255,20,0.08)',
                  border: '1px solid rgba(57,255,20,0.25)',
                  borderRadius: '100px',
                  fontSize: '11px', fontWeight: 700,
                  color: 'var(--neon)',
                  letterSpacing: '0.05em',
                }}>
                  ● LIVE · GW4
                </div>
                {/* User email badge */}
                <div style={{
                  fontSize: '11px', color: 'var(--text-muted)',
                  maxWidth: '120px', overflow: 'hidden',
                  textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }} className="desktop-nav">
                  {email}
                </div>
                {/* Sign out */}
                <button onClick={signOut} title="Sign out" style={{
                  padding: '6px 10px', borderRadius: '6px',
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.25)',
                  cursor: 'pointer', color: '#FCA5A5',
                  display: 'flex', alignItems: 'center', gap: '4px',
                  fontSize: '11px', fontWeight: 600,
                }} className="desktop-nav">
                  <LogOut size={12} /> Sign Out
                </button>
              </>
            ) : (
              <Link href="/" style={{
                padding: '8px 16px', borderRadius: '8px',
                background: 'rgba(212,175,55,0.15)',
                border: '1px solid rgba(212,175,55,0.3)',
                color: 'var(--gold)', textDecoration: 'none',
                fontSize: '12px', fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: '6px',
              }}>
                <LogIn size={13} /> Sign In
              </Link>
            )}

            {/* Mobile menu toggle */}
            {isLoggedIn && (
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                style={{
                  display: 'none', padding: '8px',
                  background: 'transparent', border: 'none',
                  color: 'var(--text-secondary)', cursor: 'pointer',
                }}
                className="mobile-menu-btn"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile nav drawer */}
      {mobileOpen && isLoggedIn && (
        <div style={{
          position: 'fixed', top: '64px', left: 0, right: 0, bottom: 0,
          background: 'rgba(2,8,23,0.97)', backdropFilter: 'blur(20px)',
          zIndex: 99, padding: '16px',
        }}>
          {GAME_NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '16px', borderRadius: '10px', marginBottom: '4px',
                  color: active ? 'var(--gold)' : 'var(--text-secondary)',
                  background: active ? 'rgba(212,175,55,0.08)' : 'transparent',
                  textDecoration: 'none', fontSize: '15px', fontWeight: 600,
                  border: active ? '1px solid rgba(212,175,55,0.15)' : '1px solid transparent',
                }}>
                <Icon size={18} />
                {label}
              </Link>
            );
          })}

          {/* Mobile Admin Portal link */}
          <Link href="/admin/login" onClick={() => setMobileOpen(false)} style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '14px 16px', borderRadius: '10px', marginTop: '12px',
            color: '#F87171', background: 'rgba(239,68,68,0.06)',
            border: '1px solid rgba(239,68,68,0.2)',
            textDecoration: 'none', fontSize: '14px', fontWeight: 600,
          }}>
            🔒 Admin Portal
          </Link>

          {/* Mobile sign out */}
          <button onClick={signOut} style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '16px', borderRadius: '10px', marginTop: '8px', width: '100%',
            color: '#FCA5A5', background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.15)',
            fontSize: '15px', fontWeight: 600, cursor: 'pointer',
          }}>
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}
