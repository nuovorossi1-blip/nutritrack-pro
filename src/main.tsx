import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Root from './Root';
import './index.css';
import { AndroidTools } from './components/AndroidTools';
import { installAndroidNavigation } from './native/navigation';

installAndroidNavigation();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
    <AndroidTools />
  </StrictMode>,
);
