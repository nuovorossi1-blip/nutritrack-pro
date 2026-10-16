import { Trash2 } from 'lucide-react';
import { useRef, useState, type PointerEvent, type ReactNode } from 'react';

const ACTION = 84;
interface Props {
  id: string;
  name: string;
  open: boolean;
  onOpen: (open: boolean) => void;
  onRemove: () => void;
  children: ReactNode;
}

export function SwipeFoodRow({ id, name, open, onOpen, onRemove, children }: Props) {
  const [shift, setShift] = useState<number | null>(null);
  const drag = useRef<{ x: number; y: number; start: number; value: number; width: number; horizontal: boolean } | null>(null);
  const ignoreClick = useRef(false);
  const start = (e: PointerEvent<HTMLLIElement>) => {
    ignoreClick.current = false;
    // Keep the screen edges available for Android system Back gestures.
    if (!e.isPrimary || e.button !== 0 || e.clientX < 24 || e.clientX > window.innerWidth - 24) return;
    drag.current = { x: e.clientX, y: e.clientY, start: open ? -ACTION : 0, value: open ? -ACTION : 0,
      width: e.currentTarget.clientWidth, horizontal: false };
  };
  const move = (e: PointerEvent<HTMLLIElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x, dy = e.clientY - d.y;
    if (!d.horizontal) {
      if (Math.abs(dy) > 8 && Math.abs(dy) >= Math.abs(dx)) { drag.current = null; return; }
      if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
      d.horizontal = true;
      ignoreClick.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    d.value = Math.max(-d.width, Math.min(0, d.start + dx));
    setShift(d.value);
  };
  const finish = (cancelled: boolean) => {
    const d = drag.current;
    drag.current = null;
    setShift(null);
    if (!d?.horizontal || cancelled) return;
    if (-d.value >= Math.max(130, d.width * 0.6)) { onOpen(false); onRemove(); }
    else onOpen(d.value < -ACTION / 2);
  };

  return (
    <li data-swipe-row={id} className="relative overflow-hidden bg-red-600" style={{ touchAction: 'pan-y' }}
      onPointerDown={start} onPointerMove={move} onPointerUp={() => finish(false)} onPointerCancel={() => finish(true)}
      onKeyDown={(e) => e.key === 'Escape' && onOpen(false)}
      onClickCapture={(e) => { if (ignoreClick.current) { ignoreClick.current = false; e.preventDefault(); e.stopPropagation(); } }}>
      <button aria-label={`Elimina ${name}`} disabled={!open} tabIndex={open ? 0 : -1} aria-hidden={!open}
        onClick={onRemove} className="absolute inset-y-0 right-0 w-[84px] text-white flex flex-col items-center justify-center gap-1 text-[10px] font-bold">
        <Trash2 size={20} /> Elimina
      </button>
      <div className={`relative flex items-center gap-2 py-2.5 px-1 bg-white dark:bg-neutral-900 ${shift === null ? 'transition-transform duration-150 motion-reduce:transition-none' : ''}`}
        style={{ transform: `translateX(${shift ?? (open ? -ACTION : 0)}px)` }}>
        {children}
      </div>
    </li>
  );
}
