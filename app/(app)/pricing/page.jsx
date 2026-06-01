'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import AuthProvider from '@/app/providers';

function PricingPageInner() {
  const { data: session } = useSession();

  const plans = [
    {
      name: 'Free',
      price: '0',
      desc: 'Try ViralCut with 1 free video processing credit.',
      features: [
        '1 video processing credit',
        'Up to 5 clip outputs',
        'AI hook detection',
        'Word-level captions',
        'B-Roll suggestions',
      ],
      cta: session ? 'Current Plan' : 'Get Started Free',
      href: session ? '/dashboard' : '/signup',
      dark: false,
      disabled: !!session,
    },
    {
      name: 'Starter',
      price: '19',
      desc: 'For creators getting started with consistent short-form content.',
      features: [
        '15 videos/month',
        'Up to 5 clips per video',
        'Advanced hook analysis',
        'B-Roll auto-matching',
        'Remotion blueprints',
        'Email support',
      ],
      cta: 'Start Creating',
      href: '/signup',
      dark: false,
      badge: null,
    },
    {
      name: 'Pro',
      price: '49',
      desc: 'For brands and creators serious about scaling content.',
      features: [
        'Unlimited videos',
        'Up to 10 clips per video',
        'Priority AI processing',
        'Custom caption styles',
        'API access',
        'Priority support',
        'Team collaboration',
      ],
      cta: 'Go Pro',
      href: '/signup',
      dark: true,
      badge: <i className="fa-solid fa-heart" style={{ color: 'var(--accent-red)' }}></i>,
    },
    {
      name: 'Pay Per Use',
      price: '3',
      desc: 'For occasional users. Pay only when you need it.',
      features: [
        'Pay $3 per video',
        'No monthly commitment',
        'Full feature access',
        'Same AI quality',
        'Credits never expire',
      ],
      cta: 'Buy Credits',
      href: '/signup',
      dark: false,
      priceLabel: '/ per video',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: 'var(--sp-4) var(--sp-8)',
        maxWidth: '1200px', margin: '0 auto',
      }}>
        <Link href="/" className="nav-logo" style={{ fontSize: '18px' }}>
          <svg className="nav-logo-icon" width="24" height="24" viewBox="0 0 32 32" fill="none" style={{ flexShrink: 0 }}>
            <rect width="32" height="32" rx="8" fill="#000" />
            <path d="M8 22L12 10L16 18L20 12L24 22" stroke="white" stroke-width="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="10" r="2" fill="#66CBFD" />
          </svg>
          ViralCut
        </Link>
        <div style={{ display: 'flex', gap: 'var(--sp-3)' }}>
          {session ? (
            <Link href="/dashboard" className="btn-cta" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              Dashboard <i className="fa-solid fa-arrow-right"></i>
            </Link>
          ) : (
            <>
              <Link href="/login" style={{
                padding: 'var(--sp-2) var(--sp-5)', borderRadius: 'var(--r-md)',
                fontSize: 'var(--text-sm)', color: 'var(--text)', textDecoration: 'none',
                fontWeight: 'var(--weight-medium)',
              }}>Log In</Link>
              <Link href="/signup" className="btn-cta">Get Started</Link>
            </>
          )}
        </div>
      </nav>

      {/* Header */}
      <div style={{ textAlign: 'center', padding: 'var(--sp-16) var(--sp-6) var(--sp-10)' }}>
        <div style={{
          display: 'inline-block', padding: 'var(--sp-1) var(--sp-4)',
          background: 'var(--bg-white)', border: '1px solid var(--border)',
          borderRadius: 'var(--r-full)', fontSize: 'var(--text-xs)',
          fontWeight: 'var(--weight-semi)', color: 'var(--muted)',
          letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase',
          marginBottom: 'var(--sp-6)',
        }}>
          Pricing
        </div>
        <h1 style={{
          fontFamily: 'var(--font-head)', fontSize: 'clamp(var(--text-3xl), 5vw, var(--text-5xl))',
          fontWeight: 'var(--weight-semi)', color: 'var(--ink)', lineHeight: 'var(--leading-tight)',
          marginBottom: 'var(--sp-4)',
        }}>
          Simple pricing<br />built to scale
        </h1>
        <p style={{ fontSize: 'var(--text-base)', color: 'var(--muted)', maxWidth: '480px', margin: '0 auto' }}>
          Start free with 1 credit. Upgrade when you need more power.
        </p>
      </div>

      {/* Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: 'var(--sp-5)',
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '0 var(--sp-6) var(--sp-16)',
      }}>
        {plans.map((plan) => (
          <div key={plan.name} style={{
            background: plan.dark ? 'var(--ink)' : 'var(--bg-white)',
            color: plan.dark ? 'var(--white)' : 'var(--ink)',
            border: plan.dark ? 'none' : '1px solid var(--border)',
            borderRadius: 'var(--r-2xl)',
            padding: 'var(--sp-8)',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            transition: 'transform var(--dur-normal) var(--ease-smooth), box-shadow var(--dur-normal)',
          }}>
            {plan.badge && (
              <div style={{
                position: 'absolute', top: 'var(--sp-4)', right: 'var(--sp-4)',
                background: plan.dark ? 'rgba(255,255,255,0.1)' : 'var(--surface)',
                width: '32px', height: '32px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '14px',
              }}>
                {plan.badge}
              </div>
            )}
            <h3 style={{
              fontFamily: 'var(--font-head)', fontSize: 'var(--text-lg)',
              fontWeight: 'var(--weight-semi)', marginBottom: 'var(--sp-2)',
            }}>
              {plan.name}
            </h3>
            <p style={{
              fontSize: 'var(--text-sm)',
              color: plan.dark ? 'rgba(255,255,255,0.6)' : 'var(--muted)',
              marginBottom: 'var(--sp-6)', lineHeight: 'var(--leading-normal)',
            }}>
              {plan.desc}
            </p>
            <div style={{
              display: 'flex', alignItems: 'baseline', gap: '2px',
              marginBottom: 'var(--sp-6)',
            }}>
              <span style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semi)' }}>$</span>
              <span style={{
                fontFamily: 'var(--font-head)', fontSize: 'var(--text-4xl)',
                fontWeight: 'var(--weight-bold)', lineHeight: 1,
              }}>
                {plan.price}
              </span>
              <span style={{
                fontSize: 'var(--text-sm)',
                color: plan.dark ? 'rgba(255,255,255,0.5)' : 'var(--muted)',
                marginLeft: '4px',
              }}>
                {plan.priceLabel || '/ month'}
              </span>
            </div>
            <div style={{
              height: '1px',
              background: plan.dark ? 'rgba(255,255,255,0.1)' : 'var(--border)',
              marginBottom: 'var(--sp-6)',
            }} />
            <ul style={{
              listStyle: 'none', padding: 0, margin: 0,
              display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)',
              marginBottom: 'var(--sp-8)', flex: 1,
            }}>
              {plan.features.map((f) => (
                <li key={f} style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--sp-3)',
                  fontSize: 'var(--text-sm)',
                  color: plan.dark ? 'rgba(255,255,255,0.8)' : 'var(--text)',
                }}>
                  <span style={{ color: plan.dark ? 'var(--accent-blue)' : 'var(--accent-green-dark)', flexShrink: 0 }}>
                    <i className="fa-solid fa-check"></i>
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <Link href={plan.href} style={{
              display: 'block', textAlign: 'center',
              padding: 'var(--sp-3) var(--sp-6)',
              borderRadius: 'var(--r-md)',
              fontFamily: 'var(--font-head)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--weight-semi)',
              textDecoration: 'none',
              transition: 'all var(--dur-normal)',
              background: plan.dark ? 'var(--white)' : 'var(--ink)',
              color: plan.dark ? 'var(--ink)' : 'var(--white)',
              opacity: plan.disabled ? 0.5 : 1,
              pointerEvents: plan.disabled ? 'none' : 'auto',
            }}>
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <AuthProvider>
      <PricingPageInner />
    </AuthProvider>
  );
}
