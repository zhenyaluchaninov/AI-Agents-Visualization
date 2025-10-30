import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import styles from './Screen1.module.css';
import { GatePhase } from './phases/GatePhase';
import { IntroPhase } from './phases/IntroPhase';
import { MainPhase } from './phases/MainPhase';
import { TeamPhase } from './phases/TeamPhase';
import { usePhaseMachine } from './hooks/usePhaseMachine';
import { createScreen1Animations } from './animations';
import {
  MAIN_PHASE_DELAY_BEFORE_NEXT,
  readScreen1Timings,
} from './constants';
import type { InsightId, ProblemId, Screen1Timings } from './types';

export default function Screen1() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const exitFallbackRef = useRef<number | null>(null);
  const hasNavigatedRef = useRef(false);

  const [timings, setTimings] = useState<Screen1Timings>(() => readScreen1Timings());
  const [isExiting, setIsExiting] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState<ProblemId | null>(null);
  const [selectedInsights, setSelectedInsights] = useState<Set<InsightId>>(() => new Set());

  useEffect(() => {
    if (containerRef.current) {
      setTimings(readScreen1Timings(containerRef.current));
    }
  }, []);

  useEffect(
    () => () => {
      if (exitFallbackRef.current != null) {
        window.clearTimeout(exitFallbackRef.current);
      }
    },
    []
  );

  const animations = useMemo(() => createScreen1Animations(timings), [timings]);
  const { phase, entryDelay, transitionTo } = usePhaseMachine({ initialPhase: 'gate' });

  const showContinue = selectedProblem !== null && selectedInsights.size > 0;

  const handleSelectProblem = useCallback((problem: ProblemId) => {
    setSelectedProblem(problem);
  }, []);

  const toggleInsight = useCallback((insight: InsightId) => {
    setSelectedInsights((prev) => {
      const next = new Set(prev);
      if (next.has(insight)) {
        next.delete(insight);
      } else {
        next.add(insight);
      }
      return next;
    });
  }, []);

  const handleStart = useCallback(
    () => transitionTo('intro', { overlapStartMs: timings.introOverlap }),
    [transitionTo, timings.introOverlap]
  );

  const handleIntroComplete = useCallback(
    () => transitionTo('main', { delayBeforeNext: MAIN_PHASE_DELAY_BEFORE_NEXT }),
    [transitionTo]
  );

  const handleContinue = useCallback(() => transitionTo('team'), [transitionTo]);

  const navigateToNext = useCallback(() => {
    if (hasNavigatedRef.current) return;
    hasNavigatedRef.current = true;

    if (exitFallbackRef.current != null) {
      window.clearTimeout(exitFallbackRef.current);
      exitFallbackRef.current = null;
    }
    navigate('/screen2');
  }, [navigate]);

  const handleAssembleTeam = useCallback(() => {
    if (isExiting) return;

    setIsExiting(true);
    exitFallbackRef.current = window.setTimeout(navigateToNext, timings.exitFallback);
  }, [isExiting, navigateToNext, timings.exitFallback]);

  const handleRootAnimationComplete = useCallback(
    (definition: string) => {
      if (definition === 'exit' && isExiting) {
        navigateToNext();
      }
    },
    [isExiting, navigateToNext]
  );

  return (
    <motion.div
      ref={containerRef}
      className={styles.root}
      variants={animations.variants.root}
      initial="initial"
      animate={isExiting ? 'exit' : 'enter'}
      onAnimationComplete={handleRootAnimationComplete}
    >
      <div className={`${styles.bgOrb} ${styles.orb1}`} />
      <div className={`${styles.bgOrb} ${styles.orb2}`} />
      <div className={`${styles.bgOrb} ${styles.orb3}`} />

      <AnimatePresence mode="wait">
        {phase === 'gate' && (
          <GatePhase
            key="gate"
            animations={animations}
            entryDelay={entryDelay}
            onStart={handleStart}
          />
        )}
        {phase === 'intro' && (
          <IntroPhase
            key="intro"
            animations={animations}
            entryDelay={entryDelay}
            onComplete={handleIntroComplete}
          />
        )}
        {phase === 'main' && (
          <MainPhase
            key="main"
            animations={animations}
            entryDelay={entryDelay}
            selectedProblem={selectedProblem}
            onSelectProblem={handleSelectProblem}
            selectedInsights={selectedInsights}
            onToggleInsight={toggleInsight}
            showContinue={showContinue}
            onContinue={handleContinue}
          />
        )}
        {phase === 'team' && (
          <TeamPhase
            key="team"
            animations={animations}
            entryDelay={entryDelay}
            onAssembleTeam={handleAssembleTeam}
            ctaDisabled={isExiting}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
