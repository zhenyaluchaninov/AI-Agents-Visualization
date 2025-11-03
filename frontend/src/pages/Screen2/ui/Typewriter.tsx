import { useEffect, useMemo, useRef, useState } from 'react';
import type { JSX } from 'react';

type Props = {
  text: string;
  speedMs?: number;
  delayMs?: number;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  active?: boolean;
  onTypingEnd?(): void;
  onUpdate?(value: string): void;
};

export default function Typewriter({
  text,
  speedMs = 50,
  delayMs = 0,
  as = 'span',
  className,
  active = true,
  onTypingEnd,
  onUpdate,
}: Props) {
  const [value, setValue] = useState('');
  const intervalRef = useRef<number | null>(null);
  const delayRef = useRef<number | null>(null);
  const indexRef = useRef(0);

  const Comp = useMemo(() => as, [as]) as any;

  useEffect(() => {
    setValue('');
    onUpdate?.('');
    indexRef.current = 0;

    if (!active) return () => undefined;

    delayRef.current = window.setTimeout(() => {
      intervalRef.current = window.setInterval(() => {
        indexRef.current += 1;
        const nextValue = text.slice(0, indexRef.current);
        setValue(nextValue);
        onUpdate?.(nextValue);

        if (indexRef.current >= text.length) {
          if (intervalRef.current != null) {
            window.clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          onTypingEnd?.();
        }
      }, speedMs);
    }, Math.max(0, delayMs));

    return () => {
      if (delayRef.current != null) window.clearTimeout(delayRef.current);
      if (intervalRef.current != null) window.clearInterval(intervalRef.current);
      delayRef.current = null;
      intervalRef.current = null;
    };
  }, [text, speedMs, delayMs, active, onTypingEnd, onUpdate]);

  return <Comp className={className}>{value}</Comp>;
}
