'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import AuthProvider from '@/app/providers';

function DashboardLayoutInner({ children }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { href: '/dashboard', label: 'Overview', icon: <i className="fa-solid fa-chart-simple"></i> },
    { href: '/dashboard#clips', label: 'My Clips', icon: <i className="fa-solid fa-clapperboard"></i> },
    { href: '/dashboard#upload', label: 'Upload', icon: <i className="fa-solid fa-cloud-arrow-up"></i> },
    { href: '/dashboard#brand', label: 'Brand Kit', icon: <i className="fa-solid fa-palette"></i> },
    { href: '/dashboard#publish', label: 'Publish Queue', icon: <i className="fa-solid fa-rectangle-list"></i> },
    { href: '/pricing', label: 'Pricing', icon: <i className="fa-solid fa-gem"></i> },
    { href: '/dashboard#settings', label: 'Settings', icon: <i className="fa-solid fa-sliders"></i> },
  ];

  return (
    <div className="dash-layout">
      {/* Mobile Header */}
      <div className="dash-mobile-header">
        <Link href="/" className="nav-logo" style={{ fontSize: '16px' }}>
          <svg className="nav-logo-icon" width="22" height="22" viewBox="0 0 32 32" fill="none" style={{ flexShrink: 0 }}>
            <rect width="32" height="32" rx="8" fill="#000" />
            <path d="M8 22L12 10L16 18L20 12L24 22" stroke="white" stroke-width="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="10" r="2" fill="#66CBFD" />
          </svg>
          ViralCut
        </Link>
        <button
          className="nav-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle sidebar"
          style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <span style={{ width: '20px', height: '2px', background: 'var(--ink)', display: 'block' }}></span>
          <span style={{ width: '20px', height: '2px', background: 'var(--ink)', display: 'block' }}></span>
          <span style={{ width: '20px', height: '2px', background: 'var(--ink)', display: 'block' }}></span>
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <Link href="/" className="nav-logo">
          <svg className="nav-logo-icon" width="24" height="24" viewBox="0 0 32 32" fill="none" style={{ flexShrink: 0 }}>
            <rect width="32" height="32" rx="8" fill="#000" />
            <path d="M8 22L12 10L16 18L20 12L24 22" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
            <circle cx="12" cy="10" r="2" fill="#66CBFD" />
          </svg>
          ViralCut
        </Link>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${pathname === item.href ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sidebar-link-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          {session?.user && (
            <div style={{ marginBottom: 'var(--sp-4)' }}>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semi)', color: 'var(--ink)', marginBottom: '2px' }}>
                {session.user.name || session.user.email?.split('@')[0]}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                {session.user.email}
              </div>
            </div>
          )}
          <button
            className="sidebar-link"
            onClick={() => signOut({ callbackUrl: '/' })}
            style={{ color: 'var(--accent-red)' }}
          >
            <span className="sidebar-link-icon"><i className="fa-solid fa-right-from-bracket"></i></span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dash-main">
        {children}
      </main>

      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.3)',
            zIndex: 'var(--z-overlay, 40)',
            display: 'block',
          }}
        />
      )}
    </div>
  );
}

export default function DashboardLayout({ children }) {
  return (
    <AuthProvider>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </AuthProvider>
  );
}
