import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import styles from '../Screen2.module.css';

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
  return `M ${p0.x},${p0.y} C ${c1.x},${c1.y} ${c2.x},${p1.x},${p1.y}`;
}

function safePathLength(path: SVGPathElement) {
  try {
    return path.getTotalLength();
  } catch {
    return 400;
  }
}

export default function OverlayConnector({
  fromRef,
  toRef,
  draw = false,
  showFromDot = false,
  showToDot = false,
  onDrawEnd,
}: OverlayConnectorProps) {
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
        if (!draw) {
          path.style.opacity = '0';
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [fromRef, toRef, draw]);

  useEffect(() => {
    const dot = dotFromRef.current;
    if (!dot) return;
    dot.classList.toggle(styles.show, showFromDot);
  }, [showFromDot]);

  useEffect(() => {
    const dot = dotToRef.current;
    if (!dot) return;
    dot.classList.toggle(styles.show, showToDot);
  }, [showToDot]);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;

    if (!draw) {
      path.style.transition = 'none';
      path.style.opacity = '0';
      path.style.strokeDasharray = '';
      path.style.strokeDashoffset = '';
      return;
    }

    let raf: number | null = null;
    let cleanup: (() => void) | null = null;

    const start = () => {
      const pathEl = pathRef.current;
      const pts = latestPointsRef.current;
      if (!pathEl || !pts) {
        raf = requestAnimationFrame(start);
        return;
      }

      pathEl.setAttribute('d', bezierPath(pts.from, pts.to));
      const length = safePathLength(pathEl);
      pathEl.style.transition = 'none';
      pathEl.style.strokeDasharray = `${length} ${length}`;
      pathEl.style.strokeDashoffset = `${length}`;
      void pathEl.getBoundingClientRect();
      pathEl.style.opacity = '1';
      pathEl.style.transition = `opacity var(--fade) var(--ease), stroke-dashoffset var(--line) var(--ease)`;
      pathEl.style.strokeDashoffset = '0';

      if (onDrawEnd) {
        let finished = false;
        const handle = () => {
          if (finished) return;
          finished = true;
          onDrawEnd();
        };
        pathEl.addEventListener('transitionend', handle, { once: true });
        cleanup = () => {
          finished = true;
          pathEl.removeEventListener('transitionend', handle);
        };
      }
    };

    raf = requestAnimationFrame(start);

    return () => {
      if (raf != null) cancelAnimationFrame(raf);
      if (cleanup) cleanup();
    };
  }, [draw, onDrawEnd]);

  return (
    <>
      <svg ref={svgRef} className={styles.overlay} width="100%" height="100%">
        <path ref={pathRef} className={styles.overlayPath} />
      </svg>
      <div ref={dotFromRef} className={styles.dot}></div>
      <div ref={dotToRef} className={styles.dot}></div>
    </>
  );
}
