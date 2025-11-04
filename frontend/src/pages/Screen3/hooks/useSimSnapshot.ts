import { useEffect, useRef, useState } from 'react';
import type { SimSnapshot } from '../sim/simulation';

type Subscribable = {
  subscribe(listener: (snapshot: SimSnapshot) => void): () => void;
};

export function useSimSnapshot(sim: Subscribable | null, throttleMs = 32) {
  const [snapshot, setSnapshot] = useState<SimSnapshot | null>(null);
  const frameRef = useRef<number | null>(null);
  const latestRef = useRef<SimSnapshot | null>(null);
  const lastEmitRef = useRef(0);

  useEffect(() => {
    if (!sim) return;
    const unsubscribe = sim.subscribe((snap) => {
      latestRef.current = {
        t: snap.t,
        nodes: snap.nodes.map((node) => ({ ...node })),
      };
      const now = performance.now();
      if (throttleMs <= 0 || now - lastEmitRef.current >= throttleMs) {
        lastEmitRef.current = now;
        setSnapshot(latestRef.current);
        return;
      }
      if (frameRef.current == null) {
        frameRef.current = requestAnimationFrame(() => {
          frameRef.current = null;
          if (latestRef.current) {
            lastEmitRef.current = performance.now();
            setSnapshot(latestRef.current);
          }
        });
      }
    });
    return () => {
      unsubscribe();
      if (frameRef.current != null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [sim, throttleMs]);

  return snapshot;
}

