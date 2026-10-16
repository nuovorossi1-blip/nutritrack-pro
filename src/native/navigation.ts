import { useEffect, useRef } from 'react';
import { App } from '@capacitor/app';
import { isAndroidApp } from './android';
import { createBackNavigation } from '../lib/backNavigation';

const navigation = createBackNavigation();

export function useAndroidBack(action: () => void, priority = 50, enabled = true) {
  const latest = useRef(action);
  latest.current = action;
  useEffect(() => {
    if (!enabled) return;
    return navigation.register(() => latest.current(), priority);
  }, [priority, enabled]);
}

export function installAndroidNavigation() {
  if (!isAndroidApp()) return;
  void App.addListener('backButton', () => {
    if (!navigation.back()) void App.minimizeApp();
  });
}
