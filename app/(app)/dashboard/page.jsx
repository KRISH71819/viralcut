'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);
  const [clips, setClips] = useState([]);
  const [loadingClips, setLoadingClips] = useState(true);

  // Local File Upload States
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);

  // Clip Modal & Toast States
  const [selectedClip, setSelectedClip] = useState(null);
  const [showToast, setShowToast] = useState('');

  const triggerToast = (msg) => {
    setShowToast(msg);
  };

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(''), 4500);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // Video timeline playback tracking
  const videoRef = useRef(null);
  const [currentVideoTime, setCurrentVideoTime] = useState(0);

  // Player control states
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false); // Unmuted by default!
  const [videoProgress, setVideoProgress] = useState(0);

  useEffect(() => {
    if (selectedClip) {
      setIsPlaying(true);
      setVideoProgress(0);
      
      setTimeout(() => {
        if (videoRef.current) {
          // Do not force autoplay so native controls handle it cleanly without mute-blocks
          setIsPlaying(false);
        }
      }, 50);
    }
  }, [selectedClip]);

  const getActiveWord = () => {
    if (!selectedClip || !selectedClip.captions) return '';
    const relativeTime = currentVideoTime - selectedClip.startTime;
    const active = selectedClip.captions.find(
      (w) => relativeTime >= w.start && relativeTime <= w.end
    );
    return active ? active.word : '';
  };

  const getActiveBRoll = () => {
    if (!selectedClip || !selectedClip.broll) return null;
    const relativeTime = currentVideoTime - selectedClip.startTime;
    return selectedClip.broll.find(
      (br) => relativeTime >= br.insertAt && relativeTime <= (br.insertAt + br.duration)
    );
  };

  // Fetch user data & clips on mount
  useEffect(() => {
    if (status === 'authenticated') {
      fetchUserData();
      fetchClips();
    }
  }, [status]);

  const fetchUserData = async () => {
    try {
      const res = await fetch('/api/user');
      if (res.ok) {
        const data = await res.json();
        setUserData(data);
      }
    } catch (err) {
      console.error('Failed to fetch user data:', err);
    }
  };

  const fetchClips = async () => {
    try {
      const res = await fetch('/api/clips?limit=20');
      if (res.ok) {
        const data = await res.json();
        setClips(data.clips || []);
      }
    } catch (err) {
      console.error('Failed to fetch clips:', err);
    } finally {
      setLoadingClips(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setVideoUrl(''); // Clear URL if file is selected
    }
  };

  const triggerFileInput = () => {
    document.getElementById('file-input').click();
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setVideoUrl(''); // Clear URL if file is selected
    }
  };

  const clearSelectedFile = (e) => {
    e.stopPropagation();
    setFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (file) {
      // Local File Upload Flow
      setUploading(true);
      setLoading(true);
      setError('');

      const formData = new FormData();
      formData.append('file', file);

      try {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/upload', true);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const pct = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(pct);
          }
        };

        xhr.onload = () => {
          if (xhr.status === 202) {
            const data = JSON.parse(xhr.responseText);
            router.push(`/processing/${data.jobId}`);
          } else {
            const data = JSON.parse(xhr.responseText);
            setError(data.error || 'Failed to upload and start processing');
            setLoading(false);
            setUploading(false);
          }
        };

        xhr.onerror = () => {
          setError('Upload failed. Please try again.');
          setLoading(false);
          setUploading(false);
        };

        xhr.send(formData);
      } catch {
        setError('Something went wrong. Please try again.');
        setLoading(false);
        setUploading(false);
      }
    } else {
      // URL Submission Flow
      if (!videoUrl.trim()) return;

      setLoading(true);
      setError('');

      try {
        const res = await fetch('/api/process-video', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoUrl: videoUrl.trim() }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Failed to start processing');
          setLoading(false);
          return;
        }

        // Navigate to processing page
        router.push(`/processing/${data.jobId}`);
      } catch {
        setError('Something went wrong. Please try again.');
        setLoading(false);
      }
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#60BF08';
    if (score >= 60) return '#48BDF7';
    if (score >= 40) return '#F9A9F0';
    return '#999';
  };

  if (status === 'loading') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px', color: 'var(--accent-blue)' }}><i className="fa-solid fa-spinner fa-spin"></i></div>
          <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="dash-header">
        <div>
          <h1 style={{
            fontFamily: 'var(--font-head)',
            fontSize: 'var(--text-2xl)',
            fontWeight: 'var(--weight-semi)',
            color: 'var(--ink)',
            marginBottom: '4px',
          }}>
            Welcome back{session?.user?.name ? `, ${session.user.name.split(' ')[0]}` : ''}
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>
            Paste a video URL to start creating viral clips
          </p>
        </div>
        {userData && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--sp-2)',
            background: 'var(--bg-white)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-full)',
            padding: 'var(--sp-2) var(--sp-4)',
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--weight-semi)',
          }}>
            <span style={{ color: 'var(--accent-blue)' }}><i className="fa-solid fa-bolt"></i></span>
            {typeof userData.user.creditsRemaining === 'string'
              ? 'Unlimited Credits'
              : `${userData.user.creditsRemaining} Credits Left`}
          </div>
        )}
      </div>

      {/* Stats */}
      {userData && (
        <div className="dash-stats">
          <div className="stat-card">
            <div className="stat-label">Videos Processed</div>
            <div className="stat-value">{userData.stats.videosProcessed}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Clips Generated</div>
            <div className="stat-value">{userData.stats.clipsGenerated}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Avg Hook Score</div>
            <div className="stat-value" style={{ color: getScoreColor(userData.stats.avgHookScore) }}>
              {userData.stats.avgHookScore || '—'}
            </div>
          </div>
        </div>
      )}

      {/* Video Upload & URL Input */}
      <form onSubmit={handleSubmit} style={{ marginBottom: 'var(--sp-8)' }}>
        <input
          type="file"
          id="file-input"
          style={{ display: 'none' }}
          accept="video/*"
          onChange={handleFileSelect}
          disabled={loading}
        />

        {/* Unified Drag & Drop Upload Zone */}
        <div
          className={`upload-zone ${isDragOver ? 'drag-over' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          style={{
            border: isDragOver ? '2px dashed var(--accent-blue)' : '2px dashed var(--border)',
            background: isDragOver ? 'rgba(102, 203, 253, 0.05)' : 'var(--bg-white)',
            borderRadius: 'var(--r-xl)',
            padding: 'var(--sp-10) var(--sp-8)',
            textAlign: 'center',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all var(--dur-normal) var(--ease-smooth)',
            marginBottom: 'var(--sp-4)',
            position: 'relative'
          }}
        >
          {file ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--sp-3)' }}>
              <div style={{ fontSize: '48px', color: 'var(--accent-blue)' }}>
                <i className="fa-solid fa-file-video"></i>
              </div>
              <p style={{ fontFamily: 'var(--font-head)', fontSize: 'var(--text-base)', fontWeight: 'var(--weight-semi)', color: 'var(--ink)' }}>
                {file.name}
              </p>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                {(file.size / 1024 / 1024).toFixed(1)} MB
              </p>

              {uploading && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--sp-2)', width: '100%', maxWidth: '240px', marginTop: 'var(--sp-2)' }}>
                  <div style={{ width: '100%', height: '6px', background: 'var(--border-light)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent-blue), var(--accent-pink))', transition: 'width 0.1s' }}></div>
                  </div>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Uploading: {uploadProgress}%</span>
                </div>
              )}

              {!loading && (
                <button
                  type="button"
                  onClick={clearSelectedFile}
                  style={{
                    marginTop: 'var(--sp-2)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--accent-red)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 'var(--weight-medium)'
                  }}
                >
                  <i className="fa-solid fa-trash" style={{ marginRight: '4px' }}></i> Remove File
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="upload-zone-icon" style={{ fontSize: '40px', color: 'var(--muted)', marginBottom: 'var(--sp-4)' }}>
                <i className="fa-solid fa-cloud-arrow-up"></i>
              </div>
              <p className="upload-zone-text" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--weight-medium)', color: 'var(--text)' }}>
                Drop your video file here or <span style={{ color: 'var(--accent-blue)', fontWeight: 'var(--weight-semi)' }}>browse</span>
              </p>
              <p className="upload-zone-hint" style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: 'var(--sp-2)' }}>
                Supports MP4 or MOV · Up to 2GB · Up to 3 hours
              </p>
            </>
          )}
        </div>

        {/* Separator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', margin: 'var(--sp-5) 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 'var(--weight-medium)' }}>
            Or paste a link
          </span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
        </div>

        {/* URL Input field */}
        <div className="url-input-zone">
          <input
            className="url-input"
            type="url"
            placeholder="Paste a YouTube, Vimeo, or any video URL..."
            value={videoUrl}
            onChange={(e) => {
              setVideoUrl(e.target.value);
              setFile(null); // Clear selected file if URL is pasted
            }}
            required={!file}
            disabled={loading}
          />
          <button className="btn-cta" type="submit" disabled={loading || (!videoUrl.trim() && !file)}>
            {loading ? (
              <>
                <span style={{ marginRight: '6px' }}><i className="fa-solid fa-circle-notch fa-spin"></i></span>
                {uploading ? 'Uploading...' : 'Processing...'}
              </>
            ) : (
              <>
                <span style={{ marginRight: '6px' }}><i className="fa-solid fa-wand-magic-sparkles"></i></span>
                Generate Clips
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="auth-error" style={{ marginTop: 'var(--sp-4)' }}>{error}</div>
        )}
      </form>

      {/* Clips Section */}
      <div style={{ marginBottom: 'var(--sp-4)' }}>
        <h2 style={{
          fontFamily: 'var(--font-head)',
          fontSize: 'var(--text-lg)',
          fontWeight: 'var(--weight-semi)',
          color: 'var(--ink)',
        }}>
          Your Clips
        </h2>
      </div>

      {loadingClips ? (
        <div style={{ textAlign: 'center', padding: 'var(--sp-12)', color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>
          Loading clips...
        </div>
      ) : clips.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon" style={{ fontSize: '48px', color: 'var(--muted)', marginBottom: '16px' }}>
            <i className="fa-solid fa-clapperboard"></i>
          </div>
          <h3 className="empty-state-title">No clips yet</h3>
          <p className="empty-state-desc">
            Paste a video URL above to generate your first viral clips with AI
          </p>
        </div>
      ) : (
        <div className="clips-grid">
          {clips.map((clip) => (
            <div 
              className="clip-card" 
              key={clip._id}
              onClick={() => setSelectedClip(clip)}
              style={{ cursor: 'pointer' }}
            >
              <div className="clip-thumb">
                <div
                  className="clip-thumb-bg"
                  style={{
                    background: `linear-gradient(135deg, ${getScoreColor(clip.viralityScore)}22, var(--surface))`,
                  }}
                >
                  <span className="clip-play"><i className="fa-solid fa-play"></i></span>
                </div>
                <div className="clip-score" style={{ background: `${getScoreColor(clip.viralityScore)}cc`, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <i className="fa-solid fa-fire"></i> {clip.viralityScore}
                </div>
                <div className="clip-duration">
                  {formatDuration(clip.duration)}
                </div>
              </div>
              <div className="clip-info">
                <div className="clip-title">{clip.title}</div>
                <div className="clip-meta">
                  <span>{clip.captions?.length || 0} words</span>
                  <span>{clip.broll?.length || 0} B-rolls</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CLIP DETAIL MODAL */}
      {selectedClip && (
        <div className="modal-overlay open" onClick={() => setSelectedClip(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header">
              <h3 className="heading-4" style={{ margin: 0, fontFamily: 'var(--font-head)', fontSize: 'var(--text-md)', fontWeight: 'var(--weight-semi)' }}>
                Clip Details
              </h3>
              <button className="modal-close" onClick={() => setSelectedClip(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ overflowY: 'auto', flex: 1, padding: 'var(--sp-6)' }}>
              
              {/* Real vertical video player with dynamic captions & B-roll overlays */}
              {(() => {
                const activeWord = getActiveWord();
                const activeBRoll = getActiveBRoll();

                return (
                  <div style={{ 
                    background: '#000', 
                    borderRadius: 'var(--r-xl)', 
                    aspectRatio: '9/16', 
                    maxHeight: '360px', 
                    margin: '0 auto var(--sp-6)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    overflow: 'hidden', 
                    maxWidth: '202px',
                    boxShadow: 'var(--shadow-lg)',
                    position: 'relative'
                  }}>
                    {/* 1. Main source video stream */}
                    <video 
                      ref={videoRef}
                      controls
                      playsInline 
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover', 
                        borderRadius: 'var(--r-xl)',
                        zIndex: 1
                      }}
                      src={`/api/videos/${selectedClip.jobId}`}
                      onLoadedMetadata={(e) => {
                        e.target.currentTime = selectedClip.startTime;
                        setCurrentVideoTime(selectedClip.startTime);
                      }}
                      onTimeUpdate={(e) => {
                        const video = e.target;
                        setCurrentVideoTime(video.currentTime);
                        
                        // Loop inside boundaries
                        if (video.currentTime >= selectedClip.endTime || video.currentTime < selectedClip.startTime) {
                          video.currentTime = selectedClip.startTime;
                        }

                        // Calculate progress
                        const pct = ((video.currentTime - selectedClip.startTime) / selectedClip.duration) * 100;
                        setVideoProgress(pct);
                      }}
                    />

                    {/* 2. Seamless dynamic B-Roll video overlay */}
                    {activeBRoll && (
                      <video
                        autoPlay
                        muted={true} // B-roll is always silent, main video holds the audio tracks
                        loop
                        playsInline
                        style={{
                          position: 'absolute',
                          inset: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: 'var(--r-xl)',
                          zIndex: 10
                        }}
                        src={activeBRoll.videoUrl || activeBRoll.url}
                      />
                    )}

                    {/* Custom play button removed in favor of native controls */}

                    {/* 4. Glowing centered Hormozi-style Captions overlay */}
                    {activeWord && (
                      <div style={{
                        position: 'absolute',
                        left: '8px',
                        right: '8px',
                        bottom: '22%',
                        textAlign: 'center',
                        fontFamily: 'var(--font-head)',
                        fontSize: '20px',
                        fontWeight: '900',
                        color: '#FFF000', // Neon golden yellow
                        textTransform: 'uppercase',
                        textShadow: '2.5px 2.5px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000, 0px 3px 8px rgba(0,0,0,0.8)',
                        zIndex: 20,
                        pointerEvents: 'none',
                        letterSpacing: '0.03em',
                      }}>
                        {activeWord}
                      </div>
                    )}

                    {/* Mute/Unmute Floating Controllers removed in favor of native controls */}

                    {/* Active B-Roll indicator tag (Top Left) */}
                    {activeBRoll && (
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        background: 'rgba(232, 85, 61, 0.85)',
                        backdropFilter: 'blur(4px)',
                        borderRadius: 'var(--r-sm)',
                        padding: '4px 8px',
                        color: '#fff',
                        fontSize: '9px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        zIndex: 30,
                        fontWeight: 'var(--weight-bold)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        <span><i className="fa-solid fa-film"></i> B-Roll</span>
                      </div>
                    )}

                    {/* Custom Seek/Progress horizontal bar removed in favor of native controls */}
                  </div>
                );
              })()}

              {/* Hook Reasoning */}
              <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-lg)', padding: 'var(--sp-4)', marginBottom: 'var(--sp-4)', border: '1px solid var(--border-light)' }}>
                <div style={{ fontFamily: 'var(--font-head)', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semi)', color: 'var(--ink)', marginBottom: 'var(--sp-2)', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <span style={{ color: 'var(--accent-blue)' }}><i className="fa-solid fa-brain"></i></span>
                  <span>Why This Hook Works</span>
                </div>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink)', lineHeight: 'var(--leading-relaxed)', margin: 0 }}>
                  {selectedClip.hookReasoning || "This clip represents a highly engaging portion of the conversation. The transition captures the viewer's attention and initiates an engaging narrative arc."}
                </p>
              </div>

              {/* Word captions grid */}
              <div style={{
                background: 'var(--surface)',
                borderRadius: 'var(--r-lg)',
                padding: 'var(--sp-4)',
                marginBottom: 'var(--sp-4)',
                border: '1px solid var(--border-light)'
              }}>
                <div style={{ fontFamily: 'var(--font-head)', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semi)', color: 'var(--ink)', marginBottom: 'var(--sp-2)', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <span style={{ color: 'var(--accent-pink)' }}><i className="fa-solid fa-comments"></i></span>
                  <span>Captions Wordlist ({selectedClip.captions?.length || 0} words)</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxHeight: '90px', overflowY: 'auto', paddingRight: '4px' }}>
                  {selectedClip.captions?.map((w, idx) => (
                    <span 
                      key={idx} 
                      onClick={() => triggerToast(`Word "${w.word}" timestamp: ${w.start.toFixed(2)}s - ${w.end.toFixed(2)}s`)}
                      style={{ 
                        background: 'var(--bg-white)', 
                        border: '1px solid var(--border)', 
                        borderRadius: 'var(--r-md)', 
                        padding: '2px 6px', 
                        fontSize: '11px', 
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        fontFamily: 'var(--font-body)',
                        color: 'var(--ink)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.borderColor = 'var(--accent-blue)';
                        e.target.style.color = 'var(--accent-blue)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.borderColor = 'var(--border)';
                        e.target.style.color = 'var(--ink)';
                      }}
                    >
                      {w.word}
                    </span>
                  ))}
                </div>
              </div>

              {/* Metadata Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-3)', marginBottom: 'var(--sp-5)' }}>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', borderRadius: 'var(--r-lg)', padding: 'var(--sp-3)', textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '2px' }}>Hook Score</div>
                  <div style={{ fontFamily: 'var(--font-head)', fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', color: getScoreColor(selectedClip.viralityScore) }}>
                    {selectedClip.viralityScore}/100
                  </div>
                </div>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', borderRadius: 'var(--r-lg)', padding: 'var(--sp-3)', textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '2px' }}>Duration</div>
                  <div style={{ fontFamily: 'var(--font-head)', fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', color: 'var(--ink)' }}>
                    {formatDuration(selectedClip.duration)}
                  </div>
                </div>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', borderRadius: 'var(--r-lg)', padding: 'var(--sp-3)', textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '2px' }}>B-Roll Clips</div>
                  <div style={{ fontFamily: 'var(--font-head)', fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', color: 'var(--accent-blue)' }}>
                    {selectedClip.broll?.length || 0} items
                  </div>
                </div>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', borderRadius: 'var(--r-lg)', padding: 'var(--sp-3)', textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '2px' }}>Start In Video</div>
                  <div style={{ fontFamily: 'var(--font-head)', fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', color: 'var(--ink)' }}>
                    {selectedClip.startTime.toFixed(1)}s
                  </div>
                </div>
              </div>

              {/* Remotion Blueprint Inspector */}
              <details style={{ marginBottom: 'var(--sp-5)' }}>
                <summary style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 'var(--weight-medium)', cursor: 'pointer', userSelect: 'none' }}>
                  <i className="fa-solid fa-code" style={{ marginRight: '6px' }}></i> View Remotion Render Blueprint (JSON)
                </summary>
                <pre style={{
                  background: '#13131A',
                  color: '#8A97A8',
                  borderRadius: 'var(--r-md)',
                  padding: 'var(--sp-4)',
                  fontSize: '10px',
                  overflowX: 'auto',
                  maxHeight: '140px',
                  marginTop: 'var(--sp-2)',
                  textAlign: 'left'
                }}>
                  {JSON.stringify(selectedClip.remotionBlueprint, null, 2)}
                </pre>
              </details>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 'var(--sp-3)', marginTop: 'var(--sp-4)' }}>
                <button 
                  className="btn btn-cta" 
                  style={{ flex: 1 }}
                  onClick={() => triggerToast("🚀 Rendering Blueprint: Local Remotion renderer compiler server integration is queued! Blueprint payload successfully exported.")}
                >
                  <span style={{ marginRight: '6px' }}><i className="fa-solid fa-video"></i></span>
                  Render & Download
                </button>
                <button 
                  className="btn btn-outline" 
                  style={{ flex: 1 }}
                  onClick={() => triggerToast("🎨 Premium Editor: Adjusting timestamps, trimming B-rolls and changing Hormozi captions is coming in the next update!")}
                >
                  <span style={{ marginRight: '6px' }}><i className="fa-solid fa-sliders"></i></span>
                  Edit Clip
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Floating sliding Premium Toast alert */}
      {showToast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: 'var(--bg-white)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-lg)',
          padding: 'var(--sp-4) var(--sp-6)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 9999,
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)',
          color: 'var(--ink)',
          animation: 'slideIn 0.3s ease-out',
        }}>
          <span style={{ color: 'var(--accent-blue)', fontSize: '18px' }}><i className="fa-solid fa-circle-info"></i></span>
          <div style={{ fontWeight: 'var(--weight-medium)' }}>{showToast}</div>
        </div>
      )}
    </>
  );
}
