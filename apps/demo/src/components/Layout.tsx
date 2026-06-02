import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { ErrorBoundary } from './ErrorBoundary';

// Sidebar sections. The playground is the home; every other entry renders the
// matching example into the main area without leaving the page.
const SECTIONS: { title: string; items: { to: string; label: string; end?: boolean }[] }[] = [
  {
    title: 'Playground',
    items: [{ to: '/', label: '🛝 Playground', end: true }],
  },
  {
    title: 'Composed widget',
    items: [
      { to: '/full-demo', label: 'Full widget' },
      { to: '/modes-demo', label: 'Position modes' },
      { to: '/inline-demo', label: 'Inline mode' },
      { to: '/custom-shell', label: 'Custom shell' },
    ],
  },
  {
    title: 'Per-package',
    items: [
      { to: '/chat-only', label: 'Chat panel' },
      { to: '/search-only', label: 'Search panel' },
      { to: '/browse-only', label: 'Browse panel' },
      { to: '/agent-chat-only', label: 'Agent chat' },
      { to: '/ui-shared', label: 'UI shared (theme)' },
      { to: '/headless-demo', label: 'Headless hooks' },
    ],
  },
];

const linkStyle = (isActive: boolean): React.CSSProperties => ({
  display: 'block',
  padding: '7px 10px',
  borderRadius: 8,
  fontSize: 14,
  textDecoration: 'none',
  color: isActive ? '#fff' : '#344054',
  background: isActive ? '#7f56d9' : 'transparent',
  fontWeight: isActive ? 600 : 400,
  marginBottom: 2,
});

export default function Layout() {
  const location = useLocation();
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <aside
        style={{
          width: 240,
          flexShrink: 0,
          boxSizing: 'border-box',
          borderRight: '1px solid #e4e6ea',
          background: '#fafafa',
          padding: '20px 12px',
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflowY: 'auto',
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 15, padding: '0 10px 16px' }}>Sharely WebControl</div>
        {SECTIONS.map((section) => (
          <div key={section.title} style={{ marginBottom: 16 }}>
            <div
              style={{
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                color: '#98a2b3',
                padding: '8px 10px 4px',
                fontWeight: 600,
              }}
            >
              {section.title}
            </div>
            {section.items.map((it) => (
              <NavLink key={it.to} to={it.to} end={it.end} style={({ isActive }) => linkStyle(isActive)}>
                {it.label}
              </NavLink>
            ))}
          </div>
        ))}
      </aside>

      <main style={{ flex: 1, minWidth: 0, overflowX: 'hidden' }}>
        {/* Key on pathname so the boundary resets when you navigate. */}
        <ErrorBoundary key={location.pathname}>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  );
}
