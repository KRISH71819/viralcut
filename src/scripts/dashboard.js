/* ============================================
   DASHBOARD SCRIPT v2
   Handles: sidebar toggle, upload zone,
   clip card modals, tab navigation
   ============================================ */

// ==========================================
// SIDEBAR TOGGLE (Mobile)
// ==========================================
const sidebarToggle = document.getElementById('sidebar-toggle');
const sidebar = document.getElementById('sidebar');

if (sidebarToggle && sidebar) {
  sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    sidebarToggle.classList.toggle('active');
  });
}

// ==========================================
// SIDEBAR NAV — Active State
// ==========================================
document.querySelectorAll('.sidebar-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
    link.classList.add('active');

    // Close sidebar on mobile
    if (window.innerWidth <= 1024 && sidebar) {
      sidebar.classList.remove('open');
      sidebarToggle?.classList.remove('active');
    }
  });
});

// ==========================================
// UPLOAD ZONE — Drag & Drop simulation
// ==========================================
const uploadZone = document.getElementById('upload-zone');
const uploadTrigger = document.getElementById('upload-trigger');

if (uploadZone) {
  uploadZone.addEventListener('dragover', e => {
    e.preventDefault();
    uploadZone.classList.add('drag-over');
  });

  uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('drag-over');
  });

  uploadZone.addEventListener('drop', e => {
    e.preventDefault();
    uploadZone.classList.remove('drag-over');
    simulateUpload();
  });

  uploadZone.addEventListener('click', simulateUpload);
}

if (uploadTrigger) {
  uploadTrigger.addEventListener('click', () => {
    document.getElementById('upload-zone')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => {
      uploadZone?.classList.add('drag-over');
      setTimeout(() => uploadZone?.classList.remove('drag-over'), 1500);
    }, 400);
  });
}

function simulateUpload() {
  const zone = document.getElementById('upload-zone');
  if (!zone) return;

  const originalContent = zone.innerHTML;
  zone.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;gap:var(--sp-4);">
      <div style="width:200px;height:6px;background:var(--border-light);border-radius:var(--r-full);overflow:hidden;">
        <div id="upload-progress" style="width:0%;height:100%;background:linear-gradient(90deg,var(--coral),var(--amber));border-radius:var(--r-full);transition:width 0.3s;"></div>
      </div>
      <p style="font-size:var(--text-sm);color:var(--text-secondary);">Uploading video...</p>
    </div>
  `;

  const bar = document.getElementById('upload-progress');
  let pct = 0;
  const interval = setInterval(() => {
    pct += Math.random() * 15 + 5;
    if (pct >= 100) {
      pct = 100;
      clearInterval(interval);
      setTimeout(() => {
        zone.innerHTML = `
          <div style="display:flex;flex-direction:column;align-items:center;gap:var(--sp-3);">
            <div style="width:48px;height:48px;border-radius:50%;background:var(--coral-50);display:flex;align-items:center;justify-content:center;font-size:24px;color:var(--coral);">✓</div>
            <p style="font-family:var(--font-head);font-size:var(--text-lg);font-weight:var(--weight-semi);color:var(--ink);">Upload Complete!</p>
            <p style="font-size:var(--text-sm);color:var(--text-secondary);">AI is analyzing your video...</p>
          </div>
        `;
        setTimeout(() => { zone.innerHTML = originalContent; }, 3000);
      }, 500);
    }
    if (bar) bar.style.width = pct + '%';
  }, 200);
}

// ==========================================
// CLIP CARD MODAL
// ==========================================
const modal = document.getElementById('clip-modal');
const modalClose = document.getElementById('modal-close');
const modalTitle = document.getElementById('modal-title');

document.querySelectorAll('.clip-card').forEach(card => {
  card.addEventListener('click', () => {
    const title = card.querySelector('.clip-title')?.textContent || 'Clip Details';
    if (modalTitle) modalTitle.textContent = title;
    if (modal) modal.classList.add('active');
  });
});

if (modalClose) {
  modalClose.addEventListener('click', () => {
    modal?.classList.remove('active');
  });
}

if (modal) {
  modal.addEventListener('click', e => {
    if (e.target === modal) modal.classList.remove('active');
  });
}

// Close modal on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modal?.classList.contains('active')) {
    modal.classList.remove('active');
  }
});
