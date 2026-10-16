// Permessi di fotocamera e microfono nel browser (nell'APK, fase 4, si aggiungono quelli Android).
// I browser li chiedono solo su HTTPS (o 127.0.0.1) e solo dopo un tocco dell'utente.

export type Device = 'camera' | 'microphone';
export type PermState = 'granted' | 'denied' | 'prompt' | 'unknown' | 'unsupported';

export function mediaSupported(): boolean {
  return !!navigator.mediaDevices?.getUserMedia;
}

export async function permissionState(d: Device): Promise<PermState> {
  if (!mediaSupported()) return 'unsupported';
  try {
    const s = await navigator.permissions.query({ name: d as PermissionName });
    return s.state;
  } catch {
    return 'unknown'; // es. Safari/Firefox non dicono lo stato: si scopre chiedendo
  }
}

/** Fa comparire la richiesta del browser; torna lo stato dopo la risposta. */
export async function requestPermission(d: Device): Promise<PermState> {
  if (!mediaSupported()) return 'unsupported';
  try {
    const stream = await navigator.mediaDevices.getUserMedia(d === 'camera' ? { video: { facingMode: 'environment' } } : { audio: true });
    stream.getTracks().forEach((t) => t.stop());
    return 'granted';
  } catch (e) {
    const name = (e as DOMException).name;
    return name === 'NotAllowedError' || name === 'SecurityError' ? 'denied' : 'unknown';
  }
}

import { isAndroidApp } from '../native/android';

export const DENIED_HELP = isAndroidApp()
  ? 'Apri Impostazioni Android → App → NutriTrack PRO → Autorizzazioni e consenti Fotocamera e Microfono.'
  :
  "Il permesso è bloccato. Tocca il lucchetto (o i tre puntini) accanto all'indirizzo → Autorizzazioni / Impostazioni sito → consenti Fotocamera e Microfono, poi ricarica la pagina.";

export function cameraErrorMessage(e: unknown): string {
  const name = (e as DOMException)?.name;
  if (name === 'NotAllowedError' || name === 'SecurityError') return DENIED_HELP;
  if (name === 'NotFoundError' || name === 'OverconstrainedError') return 'Nessuna fotocamera trovata su questo dispositivo.';
  if (name === 'NotReadableError') return "La fotocamera è usata da un'altra app: chiudila e riprova.";
  return 'Impossibile avviare la fotocamera.';
}
