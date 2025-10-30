import { useCallback, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Screen1.module.css';
import { GatePhase } from './phases/GatePhase';
import { IntroPhase } from './phases/IntroPhase';
import { MainPhase } from './phases/MainPhase';
import { TeamPhase } from './phases/TeamPhase';
import { usePhaseMachine } from './hooks/usePhaseMachine';
import { useTeamSequence } from './hooks/useTeamSequence';
import {
  MAIN_PHASE_DELAY_BEFORE_NEXT,
  readScreen1Timings,
} from './constants';
import type { InsightId, ProblemId, Screen1Timings } from './types';

export default function Screen1() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const exitTimerRef = useRef<number | null>(null);

  const [timings, setTimings] = useState<Screen1Timings>(() => readScreen1Timings());
  const [hasEntered, setHasEntered] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState<ProblemId | null>(null);
  const [selectedInsights, setSelectedInsights] = useState<Set<InsightId>>(() => new Set());

  useEffect(() => {
    if (containerRef.current) {
      setTimings(readScreen1Timings(containerRef.current));
    }
  }, []);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => setHasEntered(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  useEffect(
    () => () => {
      if (exitTimerRef.current != null) {
        window.clearTimeout(exitTimerRef.current);
      }
    },
    []
  );

  const { phase, transitionTo, isPhaseActive } = usePhaseMachine({ initialPhase: 'gate', timings });
  const teamSequence = useTeamSequence({ phase, timings });

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

  const handleAssembleTeam = useCallback(() => {
    if (isExiting) return;

    setIsExiting(true);
    const exitDelay = timings.phaseFade || timings.exitFallback;
    exitTimerRef.current = window.setTimeout(() => navigate('/screen2'), exitDelay);
  }, [isExiting, navigate, timings.phaseFade, timings.exitFallback]);

  return (
    <div
      ref={containerRef}
      className={`${styles.root} ${hasEntered ? styles.entered : ''} ${isExiting ? styles.exiting : ''}`}
    >
      <div className={`${styles.bgOrb} ${styles.orb1}`} />
      <div className={`${styles.bgOrb} ${styles.orb2}`} />
      <div className={`${styles.bgOrb} ${styles.orb3}`} />

      <GatePhase isActive={isPhaseActive('gate')} onStart={handleStart} />
      <IntroPhase
        isActive={isPhaseActive('intro')}
        timings={{ fadeDuration: timings.fadeDuration, readDelay: timings.readDelay }}
        onComplete={handleIntroComplete}
      />
      <MainPhase
        isActive={isPhaseActive('main')}
        selectedProblem={selectedProblem}
        onSelectProblem={handleSelectProblem}
        selectedInsights={selectedInsights}
        onToggleInsight={toggleInsight}
        showContinue={showContinue}
        onContinue={handleContinue}
      />
      <TeamPhase
        isActive={isPhaseActive('team')}
        sequence={teamSequence}
        onAssembleTeam={handleAssembleTeam}
        ctaDisabled={isExiting}
      />
    </div>
  );
}
