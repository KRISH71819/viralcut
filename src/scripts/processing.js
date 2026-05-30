/**
 * ViralCut AI — Processing Simulation
 * Animates the 5-step processing pipeline
 */

const STEPS = [
  {
    id: 'step-1',
    barId: 'step1-bar',
    duration: 4000,
    label: 'Transcribing...',
    completedLabel: 'Transcription complete ✓',
  },
  {
    id: 'step-2',
    barId: 'step2-bar',
    duration: 3000,
    label: 'Analyzing hooks...',
    completedLabel: '5 hooks found ✓',
  },
  {
    id: 'step-3',
    barId: 'step3-bar',
    duration: 2500,
    label: 'Matching B-Roll...',
    completedLabel: '12 clips matched ✓',
  },
  {
    id: 'step-4',
    barId: 'step4-bar',
    duration: 2000,
    label: 'Generating captions...',
    completedLabel: 'Captions ready ✓',
  },
  {
    id: 'step-5',
    barId: 'step5-bar',
    duration: 3000,
    label: 'Rendering 5 clips...',
    completedLabel: 'Render complete ✓',
  },
];

const TRANSCRIPT_WORDS = [
  "Most", "investors", "do", "this", "wrong.", "They", "think", "diversification",
  "means", "buying", "ten", "different", "stocks.", "But", "here's", "the", "truth",
  "—", "if", "you", "hold", "Bitcoin", "and", "it", "hits", "$100K,", "your",
  "entire", "portfolio", "strategy", "changes.", "Let", "me", "explain", "why..."
];

const HOOK_DATA = [
  { score: 92, label: 'Clip #1', type: 'Counterintuitive' },
  { score: 87, label: 'Clip #2', type: 'Curiosity Gap' },
  { score: 81, label: 'Clip #3', type: 'Emotional Arc' },
  { score: 78, label: 'Clip #4', type: 'Concrete Stakes' },
  { score: 74, label: 'Clip #5', type: 'Universal Pain' },
];

const BROLL_ITEMS = [
  { icon: '📈', text: 'Stock Charts' },
  { icon: '₿', text: 'Bitcoin Logo' },
  { icon: '💰', text: 'Cash Stacks' },
  { icon: '📱', text: 'Trading App' },
  { icon: '🏦', text: 'Wall Street' },
];

const CAPTION_WORDS = [
  { text: 'The', em: false },
  { text: 'biggest', em: false },
  { text: 'mistake', em: true },
  { text: 'investors', em: false },
  { text: 'make', em: false },
];

let currentStep = 0;
let overallProgress = 0;

function updateOverallProgress(value) {
  overallProgress = value;
  const circle = document.getElementById('progress-circle');
  const text = document.getElementById('progress-text');
  if (!circle || !text) return;

  const circumference = 2 * Math.PI * 50;
  const offset = circumference - (value / 100) * circumference;
  circle.style.strokeDasharray = circumference;
  circle.style.strokeDashoffset = offset;
  text.textContent = Math.round(value) + '%';
}

function updateETA(remainingSteps) {
  const etaEl = document.getElementById('eta-value');
  if (!etaEl) return;

  const totalSec = remainingSteps * 30;
  if (totalSec <= 0) {
    etaEl.textContent = 'Done!';
  } else if (totalSec < 60) {
    etaEl.textContent = `~${totalSec} sec`;
  } else {
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    etaEl.textContent = `~${min} min ${sec} sec`;
  }
}

function animateProgressBar(barId, duration) {
  return new Promise(resolve => {
    const bar = document.getElementById(barId);
    if (!bar) { resolve(); return; }

    let progress = 0;
    const interval = 50;
    const increment = (interval / duration) * 100;

    const timer = setInterval(() => {
      progress = Math.min(progress + increment, 100);
      bar.style.width = progress + '%';

      // Update overall
      const stepProgress = (currentStep / STEPS.length) + (progress / 100) / STEPS.length;
      updateOverallProgress(stepProgress * 100);

      if (progress >= 100) {
        clearInterval(timer);
        resolve();
      }
    }, interval);
  });
}

function showTranscriptWords() {
  const container = document.getElementById('transcript-preview');
  if (!container) return;

  container.innerHTML = '';
  let i = 0;

  const interval = setInterval(() => {
    if (i >= TRANSCRIPT_WORDS.length) {
      clearInterval(interval);
      return;
    }

    const span = document.createElement('span');
    span.className = 'transcript-word';
    span.textContent = TRANSCRIPT_WORDS[i] + ' ';
    span.style.animation = 'fadeIn 0.2s ease forwards';
    container.appendChild(span);
    i++;
  }, 100);
}

function showHookCards() {
  const container = document.getElementById('hook-cards');
  if (!container) return;

  container.innerHTML = '';

  HOOK_DATA.forEach((hook, i) => {
    setTimeout(() => {
      const card = document.createElement('div');
      card.className = 'hook-mini-card';
      card.style.animationDelay = `${i * 0.1}s`;
      card.innerHTML = `
        <div class="hook-mini-score">🔥 ${hook.score}</div>
        <div class="hook-mini-label">${hook.label}</div>
        <div class="hook-mini-type">${hook.type}</div>
      `;
      container.appendChild(card);
    }, i * 400);
  });
}

function showBrollItems() {
  const container = document.getElementById('broll-timeline');
  if (!container) return;

  container.innerHTML = '';

  BROLL_ITEMS.forEach((item, i) => {
    setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'broll-timeline-item';
      el.style.animationDelay = `${i * 0.1}s`;
      el.innerHTML = `
        <span class="broll-timeline-icon">${item.icon}</span>
        <span class="broll-timeline-text">${item.text}</span>
      `;
      container.appendChild(el);
    }, i * 350);
  });
}

function showCaptionWords() {
  const container = document.getElementById('caption-gen');
  if (!container) return;

  container.innerHTML = '';

  CAPTION_WORDS.forEach((word, i) => {
    setTimeout(() => {
      const span = document.createElement('span');
      span.className = `caption-gen-word ${word.em ? 'em' : ''}`;
      span.style.animationDelay = `${i * 0.1}s`;
      span.textContent = word.text;
      container.appendChild(span);
    }, i * 300);
  });
}

async function runStep(stepIndex) {
  const step = STEPS[stepIndex];
  const el = document.getElementById(step.id);
  if (!el) return;

  currentStep = stepIndex;

  // Activate step
  el.classList.add('active');
  el.querySelector('.pipeline-step-status').textContent = step.label;
  updateETA(STEPS.length - stepIndex);

  // Run step-specific animations
  switch (stepIndex) {
    case 0: showTranscriptWords(); break;
    case 1: showHookCards(); break;
    case 2: showBrollItems(); break;
    case 3: showCaptionWords(); break;
  }

  // Animate progress bar
  await animateProgressBar(step.barId, step.duration);

  // Complete step
  el.classList.remove('active');
  el.classList.add('completed');
  el.querySelector('.pipeline-step-status').textContent = step.completedLabel;
}

async function runPipeline() {
  for (let i = 0; i < STEPS.length; i++) {
    await runStep(i);
    await new Promise(r => setTimeout(r, 500)); // Brief pause between steps
  }

  // Show completion
  updateOverallProgress(100);
  updateETA(0);

  setTimeout(() => {
    document.getElementById('pipeline-steps').style.display = 'none';
    document.querySelector('.processing-overall').style.display = 'none';
    document.getElementById('processing-complete').style.display = 'block';
  }, 800);
}

document.addEventListener('DOMContentLoaded', () => {
  // Start pipeline after a short delay
  setTimeout(runPipeline, 1000);
});
