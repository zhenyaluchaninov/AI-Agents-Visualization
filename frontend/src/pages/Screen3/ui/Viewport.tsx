import { motion, type Transition } from 'framer-motion';
import type { PropsWithChildren, Ref } from 'react';
import styles from '../Screen3.module.css';
import type { Screen3Variants } from '../animations';

type ViewportProps = PropsWithChildren<{
  neonRef: Ref<HTMLCanvasElement>;
  edgesRef: Ref<HTMLCanvasElement>;
  vignetteRef: Ref<HTMLCanvasElement>;
  variants: Screen3Variants;
  animate: 'hidden' | 'visible';
  transition?: Transition;
  containerRef?: Ref<HTMLDivElement>;
}>;

export function Viewport({
  neonRef,
  edgesRef,
  vignetteRef,
  variants,
  animate,
  transition,
  containerRef,
  children,
}: ViewportProps) {
  return (
    <motion.div
      id="vp"
      className={`${styles.viewport} viewport`}
      initial="hidden"
      animate={animate}
      variants={variants.scaleIn}
      transition={transition}
      ref={containerRef}
    >
      <canvas id="layer-neon" ref={neonRef} />
      <canvas id="layer-edges" ref={edgesRef} />
      <canvas id="layer-vignette" ref={vignetteRef} />
      <div className={styles.viewportOverlay}>{children}</div>
    </motion.div>
  );
}
