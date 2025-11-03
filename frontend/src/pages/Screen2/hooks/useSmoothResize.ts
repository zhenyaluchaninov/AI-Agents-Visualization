import { useCallback, useEffect, useRef } from 'react';
import type { RefObject } from 'react';

type Options = {
  stiffness?: number;
  overflowHidden?: boolean;
  allowShrink?: boolean;
  active?: boolean;
};

type SmoothInfo = {
  h: number;
  k: number;
  min: number;
};

export function useSmoothResize(
  targetRef: RefObject<HTMLElement | null>,
  { stiffness = 0.18, overflowHidden = true, allowShrink = true, active = true }: Options = {},
) {
  const infoRef = useRef<SmoothInfo | null>(null);
  const frameRef = useRef<number | null>(null);
  const waitRef = useRef<number | null>(null);
  const nodeRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;

    const init = (node: HTMLElement) => {
      nodeRef.current = node;
      const measured = node.scrollHeight || node.getBoundingClientRect().height;
      if (overflowHidden) node.style.overflow = 'hidden';
      node.style.height = `${Math.max(0, measured)}px`;
      infoRef.current = { h: measured, k: stiffness, min: allowShrink ? 0 : measured };

      const tick = () => {
        const targetNode = nodeRef.current;
        const info = infoRef.current;
        if (!targetNode || !info) return;

        const target = Math.max(targetNode.scrollHeight, info.min);
        info.h += (target - info.h) * info.k;
        if (Math.abs(target - info.h) < 0.5) info.h = target;
        targetNode.style.height = `${info.h}px`;
        frameRef.current = requestAnimationFrame(tick);
      };

      frameRef.current = requestAnimationFrame(tick);
    };

    const ensureNode = () => {
      const node = targetRef.current;
      if (!node) {
        waitRef.current = requestAnimationFrame(ensureNode);
        return;
      }
      init(node);
    };

    ensureNode();

    return () => {
      if (waitRef.current != null) cancelAnimationFrame(waitRef.current);
      if (frameRef.current != null) cancelAnimationFrame(frameRef.current);
      if (overflowHidden && nodeRef.current) nodeRef.current.style.overflow = '';
    };
  }, [targetRef, stiffness, overflowHidden, allowShrink, active]);

  const release = useCallback(() => {
    const el = nodeRef.current;
    if (!el) return;
    if (frameRef.current != null) cancelAnimationFrame(frameRef.current);
    infoRef.current = null;
    if (overflowHidden) el.style.overflow = '';
    el.style.height = '';
  }, [targetRef, overflowHidden]);

  return { release };
}
