import React from 'react';
import { createRoot } from 'react-dom/client';
import BackgroundAnimation from '../components/BackgroundAnimation.jsx';

const rootElement = document.getElementById('react-background-root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<BackgroundAnimation />);
}
