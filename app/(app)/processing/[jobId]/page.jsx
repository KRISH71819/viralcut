'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthProvider from '@/app/providers';

const PIPELINE_STEPS = [
  { key: 'downloading', label: 'Video Ingestion', desc: 'Downloading video and extracting audio', range: [0, 20] },
  { key: 'transcribing', label: 'AI Transcription', desc: 'Transcribing with Whisper AI', range: [20, 40] },
  { key: 'analyzing', label: 'Hook Finding', desc: 'Finding viral hooks with AI analysis', range: [40, 60] },
  { key: 'b-rolling', label: 'B-Roll Matching', desc: 'Searching for B-Roll footage', range: [60, 80] },
  { key: 'blueprinting', label: 'Blueprint Generation', desc: 'Building Remotion rendering blueprints', range: [80, 100] },
];

function getStepIndex(status) {
  return PIPELINE_STEPS.findIndex((s) => s.key === status);
}

function ProcessingPageInner() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId;

  const [job, setJob] = useState(null);
  const [error, setError] = useState('');
  const [elapsed, setElapsed] = useState(0);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/job-status/${jobId}`);
      if (!res.ok) {
        setError('Failed to fetch job status');
        return;
      }
      const data = await res.json();
      setJob(data);

      if (data.status === 'failed') {
        setError(data.error || 'Pipeline failed');
      }
    } catch {
      setError('Connection error');
    }
  }, [jobId]);

  // Poll for status updates
  useEffect(() => {
    fetchStatus();

    const interval = setInterval(() => {
      fetchStatus();
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [fetchStatus]);

  // Track elapsed time
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed((e) => e + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentStepIndex = job ? getStepIndex(job.status) : -1;
  const progress = job?.progress || 0;
  const isComplete = job?.status === 'completed';
  const isFailed = job?.status === 'failed';

  // Progress ring calculation
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="processing-page">
      {/* Header */}
      <div className="processing-header">
        <Link href="/dashboard" style={{
          display: 'flex', alignItems: 'center',
          color: 'var(--muted)', fontSize: 'var(--text-sm)', textDecoration: 'none',
          fontWeight: 'var(--weight-medium)',
        }}>
          <i className="fa-solid fa-arrow-left" style={{ marginRight: '6px' }}></i> Back to Dashboard
        </Link>
        <Link href="/" className="nav-logo" style={{ fontSize: '16px' }}>
          <svg className="nav-logo-icon" width="22" height="22" viewBox="0 0 32 32" fill="none" style={{ flexShrink: 0 }}>
            <rect width="32" height="32" rx="8" fill="#000" />
            <path d="M8 22L12 10L16 18L20 12L24 22" stroke="white" stroke-width="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="10" r="2" fill="#66CBFD" />
          </svg>
          ViralCut
        </Link>
      </div>

      <div className="processing-container">
        {/* Completion state */}
        {isComplete ? (
          <div className="processing-complete">
            <div className="complete-icon" style={{ color: 'var(--accent-green-dark)', fontSize: '48px', marginBottom: '16px' }}>
              <i className="fa-solid fa-circle-check"></i>
            </div>
            <h2 style={{
              fontFamily: 'var(--font-head)',
              fontSize: 'var(--text-3xl)',
              fontWeight: 'var(--weight-bold)',
              color: 'var(--ink)',
              marginBottom: 'var(--sp-3)',
            }}>
              Clips Ready!
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: 'var(--text-base)', marginBottom: 'var(--sp-8)' }}>
              {job.clipCount ? `${job.clipCount} viral clips` : 'Your clips'} have been generated successfully
            </p>
            <button className="btn-cta" onClick={() => router.push('/dashboard')}>
              View Your Clips <i className="fa-solid fa-arrow-right" style={{ marginLeft: '6px' }}></i>
            </button>
          </div>
        ) : isFailed ? (
          <div className="processing-complete">
            <div className="complete-icon" style={{ color: 'var(--accent-red)', fontSize: '48px', marginBottom: '16px' }}>
              <i className="fa-solid fa-circle-xmark"></i>
            </div>
            <h2 style={{
              fontFamily: 'var(--font-head)',
              fontSize: 'var(--text-2xl)',
              fontWeight: 'var(--weight-bold)',
              color: 'var(--accent-red)',
              marginBottom: 'var(--sp-3)',
            }}>
              Processing Failed
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--sp-6)', maxWidth: '400px', margin: '0 auto var(--sp-6)' }}>
              {error || 'An unexpected error occurred during processing.'}
            </p>
            <button className="btn-cta" onClick={() => router.push('/dashboard')}>
              <i className="fa-solid fa-arrow-left" style={{ marginRight: '6px' }}></i> Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Title */}
            <div className="processing-title">
              <h1 style={{
                fontFamily: 'var(--font-head)',
                fontSize: 'var(--text-2xl)',
                fontWeight: 'var(--weight-bold)',
                color: 'var(--ink)',
                marginBottom: 'var(--sp-2)',
              }}>
                Processing Your Video
              </h1>
              {job?.metadata?.title && (
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>
                  {job.metadata.title}
                </p>
              )}
            </div>

            {/* Progress Ring */}
            <div className="processing-overall">
              <div className="progress-ring">
                <svg width="120" height="120" viewBox="0 0 120 120">
                  <circle className="progress-ring-bg" cx="60" cy="60" r={radius} />
                  <circle
                    className="progress-ring-fill"
                    cx="60" cy="60" r={radius}
                    style={{ strokeDasharray: circumference, strokeDashoffset: offset }}
                  />
                </svg>
                <div className="progress-ring-text">{progress}%</div>
              </div>
              <div className="processing-eta">
                <div className="processing-eta-label">Time Elapsed</div>
                <div className="processing-eta-value">{formatTime(elapsed)}</div>
                <div className="processing-eta-label" style={{ marginTop: 'var(--sp-2)' }}>Current Step</div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text)', fontWeight: 'var(--weight-medium)' }}>
                  {job?.currentStep || 'Initializing...'}
                </div>
              </div>
            </div>

            {/* Pipeline Steps */}
            <div className="pipeline-steps">
              {PIPELINE_STEPS.map((step, i) => {
                const isActive = i === currentStepIndex;
                const isCompleted = i < currentStepIndex;
                const stepProgress = isActive
                  ? Math.min(100, ((progress - step.range[0]) / (step.range[1] - step.range[0])) * 100)
                  : isCompleted ? 100 : 0;

                return (
                  <div
                    key={step.key}
                    className={`pipeline-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                  >
                    <div className="pipeline-step-header">
                      <div className="pipeline-step-dot" />
                      <div className="pipeline-step-title">
                        <h3>{step.label}</h3>
                        <div className="pipeline-step-status" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {isCompleted ? <><i className="fa-solid fa-circle-check" style={{ color: 'var(--accent-green-dark)' }}></i> Complete</> : isActive ? step.desc : 'Pending'}
                        </div>
                      </div>
                      {(isActive || isCompleted) && (
                        <div className="pipeline-step-time">
                          {isCompleted ? <i className="fa-solid fa-check" style={{ color: 'var(--accent-green-dark)' }}></i> : `${Math.round(stepProgress)}%`}
                        </div>
                      )}
                    </div>
                    {isActive && (
                      <div className="pipeline-step-progress">
                        <div className="pipeline-progress-bar" style={{ width: `${stepProgress}%` }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function ProcessingPage() {
  return (
    <AuthProvider>
      <ProcessingPageInner />
    </AuthProvider>
  );
}
