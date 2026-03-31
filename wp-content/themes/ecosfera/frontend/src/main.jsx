import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './app.css';

const container = document.getElementById('ecosfera-app');

if (container) {
  createRoot(container).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

