import { Capacitor, registerPlugin, type PluginListenerHandle } from '@capacitor/core';

export const isAndroidApp = () => Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
export const SpeechInput = registerPlugin<{
  getCapabilities(): Promise<{ inline: boolean; available: boolean }>;
  start(): Promise<{ text: string }>;
  stop(): Promise<void>;
  cancel(): Promise<void>;
  addListener(event: 'text', listener: (event: { text: string }) => void): Promise<PluginListenerHandle>;
  addListener(event: 'state', listener: (event: { listening: boolean }) => void): Promise<PluginListenerHandle>;
}>('SpeechInput');
export const ApkUpdater = registerPlugin<{
  getCurrentVersion(): Promise<{ version: string; versionCode: number }>;
  canInstallPackages(): Promise<{ allowed: boolean }>;
  openInstallSettings(): Promise<void>;
  downloadAndInstall(options: { url: string; fileName: string }): Promise<{ started: boolean }>;
}>('ApkUpdater');

export interface AndroidVersion { version: string; versionCode: number; apkUrl: string; notes: string; mandatory?: boolean }
export async function remoteAndroidVersion(): Promise<AndroidVersion> {
  const res = await fetch(`/version.json?t=${Date.now()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Versione non disponibile');
  const value = await res.json() as AndroidVersion;
  const apk = new URL(value.apkUrl);
  if (!Number.isInteger(value.versionCode) || value.versionCode < 1 || apk.protocol !== 'https:' || apk.hostname !== 'nutritrack-pro-zeta.vercel.app') {
    throw new Error('Versione Android non valida');
  }
  return value;
}
