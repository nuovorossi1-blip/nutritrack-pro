import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cameraErrorMessage, mediaSupported } from '../lib/permissions';

interface Props {
  onDetected: (code: string) => void;
  onClose: () => void;
}

// Lettura del codice a barre con la fotocamera posteriore (libreria ZXing,
// scaricata solo quando si apre lo scanner).
export function BarcodeScanner({ onDetected, onClose }: Props) {
  const video = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState('');
  const done = useRef(false);
  // Callback in un ref: la fotocamera non deve ripartire a ogni nuovo render del genitore.
  const detected = useRef(onDetected);
  detected.current = onDetected;

  useEffect(() => {
    if (!mediaSupported()) {
      setError('Questo browser non permette di usare la fotocamera. Scrivi il numero a mano.');
      return;
    }
    let stop: (() => void) | undefined;
    let cancelled = false;
    (async () => {
      try {
        const [{ BrowserMultiFormatReader }, { BarcodeFormat, DecodeHintType }] = await Promise.all([import('@zxing/browser'), import('@zxing/library')]);
        const hints = new Map();
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.EAN_13, BarcodeFormat.EAN_8, BarcodeFormat.UPC_A, BarcodeFormat.UPC_E, BarcodeFormat.CODE_128]);
        const reader = new BrowserMultiFormatReader(hints, { delayBetweenScanAttempts: 150 });
        const controls = await reader.decodeFromConstraints({ video: { facingMode: { ideal: 'environment' } } }, video.current!, (result, _err, ctrl) => {
          if (result && !done.current) {
            done.current = true;
            navigator.vibrate?.(80);
            ctrl.stop();
            detected.current(result.getText());
          }
        });
        if (cancelled) controls.stop();
        else stop = () => controls.stop();
      } catch (e) {
        if (!cancelled) setError(cameraErrorMessage(e));
      }
    })();
    return () => {
      cancelled = true;
      stop?.();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[55] bg-black flex flex-col">
      <div className="flex items-center justify-between p-4 text-white">
        <span className="font-bold">Inquadra il codice a barre</span>
        <button aria-label="Chiudi" onClick={onClose} className="p-1">
          <X size={24} />
        </button>
      </div>
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        <video ref={video} className="w-full h-full object-cover" muted playsInline />
        {!error && <div className="absolute w-3/4 max-w-sm h-32 border-2 border-white/80 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]" />}
        {error && <p className="absolute mx-6 bg-white text-slate-800 text-sm font-semibold rounded-2xl p-4 text-center">{error}</p>}
      </div>
      <p className="text-center text-xs text-slate-300 p-4">Tieni il telefono fermo a 10-20 cm dalla confezione, con buona luce.</p>
    </div>
  );
}
