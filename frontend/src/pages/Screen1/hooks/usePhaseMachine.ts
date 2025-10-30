import { useCallback, useMemo, useRef, useState } from 'react';
import type { Phase, PhaseTransitionOptions, PhaseVisibilityMap, Screen1Timings } from '../types';

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const createVisibility = (initial: Phase): PhaseVisibilityMap => ({
  gate: initial === 'gate',
  intro: initial === 'intro',
  main: initial === 'main',
  team: initial === 'team',
});

interface UsePhaseMachineArgs {
  initialPhase?: Phase;
  timings: Screen1Timings;
}

interface UsePhaseMachineResult {
  phase: Phase;
  visibility: PhaseVisibilityMap;
  isTransitioning: boolean;
  transitionTo: (next: Phase, options?: PhaseTransitionOptions) => Promise<void>;
  isPhaseActive: (candidate: Phase) => boolean;
}

export const usePhaseMachine = ({ initialPhase = 'gate', timings }: UsePhaseMachineArgs): UsePhaseMachineResult => {
  const [phase, setPhase] = useState<Phase>(initialPhase);
  const [visibility, setVisibility] = useState<PhaseVisibilityMap>(() => createVisibility(initialPhase));
  const [isTransitioning, setIsTransitioning] = useState(false);

  const activePhaseRef = useRef<Phase>(initialPhase);
  const phaseRef = useRef<Phase>(initialPhase);
  const transitionRunRef = useRef(0);

  const hidePhase = useCallback((name: Phase) => {
    setVisibility((prev) => (prev[name] ? { ...prev, [name]: false } : prev));
  }, []);

  const showPhase = useCallback((name: Phase) => {
    setVisibility((prev) => (prev[name] ? prev : { ...prev, [name]: true }));
    activePhaseRef.current = name;
  }, []);

  const transitionTo = useCallback(
    async (next: Phase, options?: PhaseTransitionOptions) => {
      const current = activePhaseRef.current;
      if (current === next) return;

      const runId = transitionRunRef.current + 1;
      transitionRunRef.current = runId;
      setIsTransitioning(true);

      hidePhase(current);

      const conclude = () => {
        if (transitionRunRef.current === runId) {
          setIsTransitioning(false);
          phaseRef.current = next;
          setPhase(next);
        }
      };

      const abortIfStale = () => transitionRunRef.current !== runId;

      if (options?.overlapStartMs != null) {
        showPhase(next);
        await wait(Math.max(0, options.overlapStartMs));
        if (abortIfStale()) return;
        options.onShown?.();
        await wait(timings.phaseFade);
        if (abortIfStale()) return;
        conclude();
        return;
      }

      await wait(timings.phaseFade);
      if (abortIfStale()) return;

      const delay = options?.delayBeforeNext ?? 0;
      if (delay > 0) {
        await wait(delay);
        if (abortIfStale()) return;
      }

      showPhase(next);
      await wait(timings.phaseFade);
      if (abortIfStale()) return;
      options?.onShown?.();
      conclude();
    },
    [hidePhase, showPhase, timings.phaseFade]
  );

  const isPhaseActive = useCallback((candidate: Phase) => visibility[candidate], [visibility]);

  return useMemo(
    () => ({
      phase,
      visibility,
      isTransitioning,
      transitionTo,
      isPhaseActive,
    }),
    [phase, visibility, isTransitioning, transitionTo, isPhaseActive]
  );
};
