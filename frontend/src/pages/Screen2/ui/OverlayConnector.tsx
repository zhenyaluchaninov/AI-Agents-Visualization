import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { RefObject } from 'react';
import styles from '../Screen2.module.css';
import { EASE, MOTION } from '../constants';

type ConnectorPoint = { x: number; y: number };

type OverlayConnectorProps = {
  fromRef: RefObject<HTMLElement | null>;
  toRef: RefObject<HTMLElement | null>;
  draw?: boolean;
  showFromDot?: boolean;
  showToDot?: boolean;
  onDrawEnd?(): void;
};

function rectCenter(r: DOMRect): ConnectorPoint {
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

function edgeAnchor(fromRect: DOMRect, toRect: DOMRect): ConnectorPoint {
  const toRight = toRect.left >= fromRect.left + fromRect.width / 2;
  const x = toRight ? toRect.left : toRect.right;
  const y = toRect.top + toRect.height / 2;
  return { x, y };
}

function bezierPath(p0: ConnectorPoint, p1: ConnectorPoint) {
  const dx = p1.x - p0.x;
  const dy = p1.y - p0.y;
  const c1 = { x: p0.x + dx * 0.35, y: p0.y + dy * 0.1 };
  const c2 = { x: p1.x - dx * 0.35, y: p1.y - dy * 0.1 };
  return `M ${p0.x},${p0.y} C ${c1.x},${c1.y} ${c2.x},${c2.y} ${p1.x},${p1.y}`;
}

export default function OverlayConnector({
  fromRef,
  toRef,
  draw = false,
  showFromDot = false,
  showToDot = false,
  onDrawEnd,
}: OverlayConnectorProps) {
  const reduced = useReducedMotion();
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const dotFromRef = useRef<HTMLDivElement>(null);
  const dotToRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const latestPointsRef = useRef<{ from: ConnectorPoint; to: ConnectorPoint } | null>(null);

  useEffect(() => {
    const tick = () => {
      const svg = svgRef.current;
      const path = pathRef.current;
      const dotFrom = dotFromRef.current;
      const dotTo = dotToRef.current;
      const fromEl = fromRef.current;
      const toEl = toRef.current;

      if (!svg) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      svg.setAttribute('width', String(window.innerWidth));
      svg.setAttribute('height', String(window.innerHeight));
      svg.setAttribute('viewBox', `0 0 ${window.innerWidth} ${window.innerHeight}`);

      if (!fromEl || !toEl) {
        latestPointsRef.current = null;
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const fromRect = fromEl.getBoundingClientRect();
      const toRect = toEl.getBoundingClientRect();
      const fromPoint = rectCenter(fromRect);
      const toPoint = edgeAnchor(fromRect, toRect);

      latestPointsRef.current = { from: fromPoint, to: toPoint };

      if (dotFrom) {
        dotFrom.style.left = `${fromPoint.x}px`;
        dotFrom.style.top = `${fromPoint.y}px`;
      }
      if (dotTo) {
        dotTo.style.left = `${toPoint.x}px`;
        dotTo.style.top = `${toPoint.y}px`;
      }

      if (path) {
        path.setAttribute('d', bezierPath(fromPoint, toPoint));
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [fromRef, toRef, draw]);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;

    const d = path.getAttribute('d');
    if (draw && (!d || !d.trim())) {
      return;
    }

    const handleTransitionEnd = (event: TransitionEvent) => {
      if (event.propertyName !== 'stroke-dashoffset') return;
      path.removeEventListener('transitionend', handleTransitionEnd);
      if (onDrawEnd) onDrawEnd();
    };

    if (draw) {
      let length = 1;
      try {
        length = path.getTotalLength();
        if (!Number.isFinite(length) || length <= 0) length = 1;
      } catch {
        length = 1;
      }
      const lineDuration = reduced ? '0.1s' : `var(--line, ${MOTION.CONNECTOR_LINE}s)`;
      const fadeDuration = reduced ? '0.1s' : 'var(--fade, 0.6s)';
      const ease = 'var(--ease, cubic-bezier(.36,0,.6,.99))';

      path.style.transition = 'none';
      path.style.strokeDasharray = `${length}`;
      path.style.strokeDashoffset = `${length}`;
      path.style.opacity = '1';

      void path.getBoundingClientRect();

      path.style.transition = `opacity ${fadeDuration} ${ease}, stroke-dashoffset ${lineDuration} ${ease}`;
      path.style.strokeDashoffset = '0';

      path.addEventListener('transitionend', handleTransitionEnd);
    } else {
      path.style.transition = 'none';
      path.style.opacity = '0';
      path.style.strokeDasharray = '';
      path.style.strokeDashoffset = '';
    }

    return () => {
      path.removeEventListener('transitionend', handleTransitionEnd);
    };
  }, [draw, onDrawEnd, reduced]);

  return (
    <>
      <svg ref={svgRef} className={styles.overlay} width="100%" height="100%">
        <path ref={pathRef} className={styles.overlayPath} />
      </svg>
      <motion.div
        ref={dotFromRef}
        className={styles.dot}
        initial={{ opacity: 0 }}
        animate={{ opacity: showFromDot ? 1 : 0 }}
        transition={{ duration: reduced ? 0.1 : MOTION.FADE, ease: EASE.DEFAULT }}
      />
      <motion.div
        ref={dotToRef}
        className={styles.dot}
        initial={{ opacity: 0 }}
        animate={{ opacity: showToDot ? 1 : 0 }}
        transition={{ duration: reduced ? 0.1 : MOTION.FADE, ease: EASE.DEFAULT }}
      />
    </>
  );
}
