'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Calendar, BarChart3, Shield, Building2, ChevronRight, LogOut, Zap } from 'lucide-react';
import { PlayerRegistry } from './views/PlayerRegistry';
import { FixtureController } from './views/FixtureController';
import { StatOverrides } from './views/StatOverrides';
import { LeagueModeration } from './views/LeagueModeration';
import { ClubRegistry } from './views/ClubRegistry';

type AdminView = 'players' | 'fixtures' | 'stats' | 'leagues' | 'clubs';

const SIDEBAR_ITEMS: { id: AdminView; label: string; icon: React.ElementType; desc: string }[] = [
  { id: 'clubs',    label: 'Club Registry',      icon: Building2, desc: 'CRUD + logo uploads' },
  { id: 'players',  label: 'Player Registry',    icon: Users,     desc: 'CRUD + Cloudinary headshots' },
  { id: 'fixtures', label: 'Fixture Controller',  icon: Calendar,  desc: 'Kickoff & lockout overrides' },
  { id: 'stats',    label: 'Stat Overrides',      icon: BarChart3, desc: 'Tisini matchday data entry' },
  { id: 'leagues',  label: 'League Moderation',   icon: Shield,    desc: 'Hard-delete / user removal' },
];

export function AdminDashboard() {
  const router = useRouter();
  const [activeView, setActiveView] = useState<AdminView>('clubs');

  const current = SIDEBAR_ITEMS.find(i => i.id === activeView)!;

  return (
    <div className="admin-dashboard-container" style={{ display: 'flex', width: '100%', minHeight: 'calc(100vh - 64px)' }}>

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside className="admin-sidebar" style={{
        width: '260px', flexShrink: 0,
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        padding: '0',
      }}>
        {/* Admin badge */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid var(--border)',
          background: 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(239,68,68,0.05))',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '8px',
              background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Zap size={18} color="#F87171" />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#F87171' }}>ADMIN PORTAL</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
                SEASON 26/27
              </div>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="admin-nav" style={{ padding: '12px', flex: 1 }}>
          {SIDEBAR_ITEMS.map(({ id, label, icon: Icon, desc }) => {
            const active = activeView === id;
            return (
              <button key={id} onClick={() => setActiveView(id)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 14px', borderRadius: '10px', marginBottom: '4px',
                border: active ? '1px solid rgba(212,175,55,0.25)' : '1px solid transparent',
                background: active ? 'rgba(212,175,55,0.08)' : 'transparent',
                cursor: 'pointer', textAlign: 'left',
                transition: 'all 0.15s',
              }}
                onMouseEnter={e => !active && (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                onMouseLeave={e => !active && (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{
                  width: '34px', height: '34px', borderRadius: '8px', flexShrink: 0,
                  background: active ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${active ? 'rgba(212,175,55,0.3)' : 'rgba(255,255,255,0.06)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={15} color={active ? 'var(--gold)' : 'var(--text-muted)'} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: active ? 700 : 500, color: active ? 'var(--gold)' : 'var(--text-primary)', lineHeight: 1.2 }}>
                    {label}
                  </div>
                  <div className="admin-nav-desc" style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {desc}
                  </div>
                </div>
                {active && <ChevronRight size={12} color="var(--gold)" />}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Logged in as admin
          </div>
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                sessionStorage.removeItem('kc_admin_session');
                sessionStorage.removeItem('kc_admin_email');
              }
              router.push('/admin/login');
            }}
            className="btn btn-danger"
            style={{ width: '100%', fontSize: '12px', padding: '8px' }}
          >
            <LogOut size={13} /> Sign Out Admin
          </button>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <main style={{ flex: 1, overflow: 'auto', background: 'var(--bg-base)' }}>
        {/* Page header */}
        <div style={{
          padding: '24px 32px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-surface)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <h1 className="font-condensed" style={{ fontSize: '28px', fontWeight: 800, lineHeight: 1, color: 'var(--text-primary)', marginBottom: '4px' }}>
              {current.label}
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{current.desc}</p>
          </div>
          <div style={{
            padding: '6px 14px',
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: '8px',
            fontSize: '11px', fontWeight: 700, color: '#F87171',
            letterSpacing: '0.08em',
          }}>
            🔒 ADMIN ONLY
          </div>
        </div>

        {/* View panels */}
        <div className="admin-content-padding" style={{ padding: '28px 32px' }}>
          {activeView === 'clubs'    && <ClubRegistry />}
          {activeView === 'players'  && <PlayerRegistry />}
          {activeView === 'fixtures' && <FixtureController />}
          {activeView === 'stats'    && <StatOverrides />}
          {activeView === 'leagues'  && <LeagueModeration />}
        </div>
      </main>

      <style>{`
        @media (max-width: 768px) {
          .admin-dashboard-container {
            flex-direction: column !important;
          }
          .admin-sidebar {
            width: 100% !important;
            border-right: none !important;
            border-bottom: 1px solid var(--border) !important;
          }
          .admin-nav {
            display: flex !important;
            overflow-x: auto !important;
            padding: 8px !important;
            gap: 6px !important;
            -webkit-overflow-scrolling: touch;
          }
          .admin-nav button {
            flex-shrink: 0 !important;
            width: auto !important;
            padding: 8px 12px !important;
            margin-bottom: 0 !important;
          }
          .admin-nav-desc {
            display: none !important;
          }
          .admin-content-padding {
            padding: 16px 12px !important;
          }
        }
      `}</style>
    </div>
  );
}
