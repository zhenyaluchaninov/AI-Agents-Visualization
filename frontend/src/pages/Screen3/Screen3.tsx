import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import styles from './Screen3.module.css';
import { DevControls, initDevControls } from './DevControls';
import { ChatPanel, initChatPanel } from './ui/ChatPanel';
import { Viewport } from './ui/Viewport';
import { AgentsView } from './ui/AgentsView';
import { getVariants } from './animations';
import { S3, S3_AGENTS } from './constants';
import { createSimulation } from './sim/simulation';
import { useSimSnapshot } from './hooks/useSimSnapshot';

type Screen3Props = { devControlsEnabled?: boolean };

export default function Screen3({ devControlsEnabled = false }: Screen3Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const neonRef = useRef<HTMLCanvasElement>(null);
  const edgesRef = useRef<HTMLCanvasElement>(null);
  const vignetteRef = useRef<HTMLCanvasElement>(null);

  const simulationRef = useRef<ReturnType<typeof createSimulation> | null>(null);
  const chatRef = useRef<ReturnType<typeof initChatPanel> | null>(null);
  const edgeTimerRef = useRef<number | null>(null);
  const pendingDevControlsRef = useRef<(() => boolean) | null>(null);

  const [sim, setSim] = useState<ReturnType<typeof createSimulation> | null>(null);
  const [hasEntered, setHasEntered] = useState(false);
  const [pinsInteractive, setPinsInteractive] = useState(false);
  const [ctaUnlocked, setCtaUnlocked] = useState(false);

  const reducedMotion = useReducedMotion() ?? false;
  const variants = useMemo(() => getVariants(reducedMotion), [reducedMotion]);

  const snapshot = useSimSnapshot(sim, reducedMotion ? 64 : 32);

  const agentTimingStart = reducedMotion ? 0 : S3.TIMING.AGENTS.START;
  const agentStagger = reducedMotion ? 0.04 : S3.TIMING.AGENTS.STAGGER;
  const lastAgentDelay = agentTimingStart + (S3_AGENTS.length - 1) * agentStagger;
  const ctaDelay = reducedMotion ? 0 : lastAgentDelay + S3.TIMING.CTA.AFTER_LAST_PIN;
  const animateState = hasEntered ? 'visible' : 'hidden';

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflowY;
    const prevBodyOverflow = body.style.overflowY;
    html.style.overflowY = 'hidden';
    body.style.overflowY = 'hidden';
    return () => {
      html.style.overflowY = prevHtmlOverflow;
      body.style.overflowY = prevBodyOverflow;
    };
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => setHasEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      setPinsInteractive(true);
    }
  }, [reducedMotion]);

  const wireDevControls = useCallback(() => {
    if (!devControlsEnabled) return false;
    const root = rootRef.current;
    const simInstance = simulationRef.current;
    if (!root || !simInstance) return false;
    return initDevControls(root, simInstance.getParams(), {
      reseedParticles: simInstance.reseed,
      randomizeNodeSpacings: simInstance.randomizeNodeSpacings,
    });
  }, [devControlsEnabled]);

  const scheduleEdgeSweep = useCallback(() => {
    const simInstance = simulationRef.current;
    if (!simInstance) return;
    if (edgeTimerRef.current != null) {
      clearTimeout(edgeTimerRef.current);
    }
    const delaySec = reducedMotion ? 0 : lastAgentDelay + S3.TIMING.EDGE_SWEEP_AFTER_PINS;
    edgeTimerRef.current = window.setTimeout(() => {
      edgeTimerRef.current = null;
      simInstance
        .runIntroEdges()
        .catch(() => {})
        .finally(() => setPinsInteractive(true));
    }, delaySec * 1000);
  }, [lastAgentDelay, reducedMotion]);

  const measureViewport = useCallback((el: HTMLElement | null) => {
    if (!el) return { width: 0, height: 0 };
    const width = el.clientWidth || el.offsetWidth || el.getBoundingClientRect().width || 0;
    const height = el.clientHeight || el.offsetHeight || el.getBoundingClientRect().height || 0;
    return { width, height };
  }, []);

  useLayoutEffect(() => {
    if (simulationRef.current) return;
    const root = rootRef.current;
    const viewportEl = viewportRef.current;
    const neon = neonRef.current;
    const edges = edgesRef.current;
    const vignette = vignetteRef.current;
    if (!root || !viewportEl || !neon || !edges || !vignette) return;

    const { width: viewportWidth, height: viewportHeight } = measureViewport(viewportEl);
    if (!viewportWidth || !viewportHeight) return;
    const simInstance = createSimulation(
      { canvas: [neon, edges, vignette], width: viewportWidth, height: viewportHeight },
      {},
    );
    simulationRef.current = simInstance;
    setSim(simInstance);
    simInstance.start();
    simInstance.resize({ width: viewportWidth, height: viewportHeight, keepSeed: true });

    const chat = initChatPanel(root, {
      onOpenChange: () => {},
      onActivateEdge: (edgeId) => simInstance.setActiveEdge(edgeId),
      onUnlockCTA: () => setCtaUnlocked(true),
    });
    chatRef.current = chat;

    if (devControlsEnabled) {
      if (!wireDevControls()) {
        pendingDevControlsRef.current = wireDevControls;
      }
    }

    scheduleEdgeSweep();

    const handleResize = () => {
      const { width, height } = measureViewport(viewportRef.current);
      if (!width || !height) return;
      simInstance.resize({ width, height });
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (edgeTimerRef.current != null) {
        clearTimeout(edgeTimerRef.current);
        edgeTimerRef.current = null;
      }
      window.removeEventListener('resize', handleResize);
      chat.destroy?.();
      simInstance.stop();
      simulationRef.current = null;
      setSim(null);
      setPinsInteractive(false);
    };
  }, [devControlsEnabled, measureViewport, scheduleEdgeSweep, wireDevControls]);

  useEffect(() => {
    const pending = pendingDevControlsRef.current;
    if (pending && simulationRef.current) {
      if (pending()) {
        pendingDevControlsRef.current = null;
      }
    }
  }, [sim, wireDevControls]);

  const handleDevControlsReady = useCallback(() => {
    if (!devControlsEnabled) return;
    if (!wireDevControls()) {
      pendingDevControlsRef.current = wireDevControls;
    }
  }, [devControlsEnabled, wireDevControls]);

  const handleAgentSelect = useCallback((agentId: string) => {
    const simInstance = simulationRef.current;
    const chat = chatRef.current;
    if (!simInstance || !chat) return;
    const edge = simInstance.getEdges().find((e) => e.from === agentId || e.to === agentId);
    if (!edge) return;
    const snap = simInstance.getSnapshot();
    const nodeMap = new Map(snap.nodes.map((node) => [node.id, node]));
    const fromNode = nodeMap.get(edge.from);
    const toNode = nodeMap.get(edge.to);
    if (!fromNode || !toNode) return;
    chat.openChat({
      id: edge.id,
      from: { x: fromNode.x, y: fromNode.y, name: agentName(edge.from) },
      to: { x: toNode.x, y: toNode.y, name: agentName(edge.to) },
    });
  }, []);

  const titleTransition = useMemo(
    () => ({
      delay: reducedMotion ? 0 : S3.TIMING.TITLE.DELAY,
      duration: reducedMotion ? 0.18 : S3.TIMING.TITLE.DURATION,
      ease: S3.EASE.SOFT,
    }),
    [reducedMotion],
  );

  const subtitleTransition = useMemo(
    () => ({
      delay: reducedMotion
        ? 0.05
        : S3.TIMING.TITLE.DELAY + S3.TIMING.SUBTITLE.OFFSET_FROM_TITLE,
      duration: reducedMotion ? 0.18 : S3.TIMING.SUBTITLE.DURATION,
      ease: S3.EASE.SOFT,
    }),
    [reducedMotion],
  );

  const viewportTransition = useMemo(
    () => ({
      delay: reducedMotion ? 0 : S3.TIMING.VIEWPORT.DELAY,
      duration: reducedMotion ? 0.22 : S3.TIMING.VIEWPORT.DURATION,
      ease: S3.EASE.SOFT,
    }),
    [reducedMotion],
  );

  const ctaTransition = useMemo(
    () => ({
      delay: ctaDelay,
      duration: reducedMotion ? 0.18 : S3.TIMING.CTA.DURATION,
      ease: S3.EASE.DEFAULT,
    }),
    [ctaDelay, reducedMotion],
  );

  return (
    <div ref={rootRef} className={`${styles.root} ${hasEntered ? styles.entered : ''}`}>
      <div className={`${styles.bgOrb} ${styles.orb1}`} />
      <div className={`${styles.bgOrb} ${styles.orb2}`} />
      <div className={`${styles.bgOrb} ${styles.orb3}`} />

      <div className={styles.content}>
        <motion.div
          className={styles.title}
          variants={variants.fadeUp}
          initial="hidden"
          animate={animateState}
          transition={titleTransition}
        >
          Agents are discussing
        </motion.div>

        <motion.div
          className={styles.subtitle}
          variants={variants.fadeUp}
          initial="hidden"
          animate={animateState}
          transition={subtitleTransition}
        >
          Tap a chat icon to peek inside.
        </motion.div>

        <DevControls enabled={devControlsEnabled} onReady={handleDevControlsReady} />

        <Viewport
          neonRef={neonRef}
          edgesRef={edgesRef}
          vignetteRef={vignetteRef}
          variants={variants}
          animate={animateState}
          transition={viewportTransition}
          containerRef={viewportRef}
        >
          <AgentsView
            agents={S3_AGENTS}
            snapshot={snapshot}
            variants={variants}
            animate={animateState}
            onAgentSelect={handleAgentSelect}
            pinsInteractive={pinsInteractive}
            reducedMotion={reducedMotion}
            timingStart={agentTimingStart}
            timingStagger={agentStagger}
          />
          <ChatPanel />
        </Viewport>

        <motion.div
          className={styles.cta}
          variants={variants.fadeUp}
          initial="hidden"
          animate={animateState}
          transition={ctaTransition}
        >
          <motion.button
            id="continueBtn"
            className={`${styles.btn} ${ctaUnlocked ? styles.btnEnabled : styles.btnLocked}`}
            type="button"
            disabled={!ctaUnlocked}
            variants={variants.btnIn}
            initial="hidden"
            animate={animateState}
            transition={ctaTransition}
          >
            Continue
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}

function agentName(id: string) {
  return S3_AGENTS.find((agent) => agent.id === id)?.name ?? id;
}
