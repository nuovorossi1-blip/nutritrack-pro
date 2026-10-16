import { useState } from 'react';

interface Props {
  value: number | undefined;
  onChange: (n: number | undefined) => void;
  className?: string;
  decimals?: boolean;
  placeholder?: string;
  ariaLabel?: string;
}

const fmt = (n: number | undefined) => (n === undefined ? '' : String(n));
const parse = (t: string) => (t.trim() === '' ? undefined : parseFloat(t.replace(',', '.')));

// Campo numerico che si puo' svuotare: con <input type="number"> e valore 0
// forzato, scrivendo "100" su un campo vuoto usciva "0100". Il testo resta
// quello digitato, a ogni tocco si seleziona tutto, la virgola vale come punto.
export function NumberInput({ value, onChange, className, decimals = true, placeholder, ariaLabel }: Props) {
  const [text, setText] = useState(fmt(value));
  const [seen, setSeen] = useState(value);
  // Valore cambiato da fuori (pulsanti +/-, obiettivo scelto): testo aggiornato nello
  // stesso render, senza un passaggio in ritardo come con useEffect.
  if (value !== seen) {
    setSeen(value);
    if (parse(text) !== value) setText(fmt(value));
  }
  return (
    <input
      type="text"
      aria-label={ariaLabel}
      inputMode={decimals ? 'decimal' : 'numeric'}
      value={text}
      placeholder={placeholder}
      onFocus={(e) => e.target.select()}
      // Anche al tocco su un campo gia' attivo (sul telefono il focus non riparte): si riscrive il numero da capo.
      onPointerUp={(e) => e.currentTarget.select()}
      onBlur={() => setText(fmt(value))}
      onChange={(e) => {
        const t = e.target.value;
        if (!(decimals ? /^\d*([.,]\d*)?$/ : /^\d*$/).test(t)) return;
        setText(t);
        onChange(parse(t));
      }}
      className={className}
    />
  );
}
