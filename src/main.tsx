import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Root from './Root';
import './index.css';
import { AndroidTools } from './components/AndroidTools';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
    <AndroidTools />
  </StrictMode>,
);
