import { useCallback, useMemo, useRef, useState } from 'react';
import type { Phase, PhaseTransitionOptions } from '../types';

interface UsePhaseMachineArgs {
  initialPhase?: Phase;
}

export interface PhaseState {
  phase: Phase;
  entryDelay: number;
}

interface UsePhaseMachineResult extends PhaseState {
  transitionTo: (next: Phase, options?: PhaseTransitionOptions) => Promise<void>;
}

const toSeconds = (ms: number) => ms / 1000;

export const usePhaseMachine = ({ initialPhase = 'gate' }: UsePhaseMachineArgs = {}): UsePhaseMachineResult => {
  const defaultEntryDelay = 0;

  const phaseRef = useRef<Phase>(initialPhase);
  const [state, setState] = useState<PhaseState>({
    phase: initialPhase,
    entryDelay: 0,
  });

  const computeEntryDelay = useCallback((options?: PhaseTransitionOptions) => {
    if (!options) return defaultEntryDelay;
    const overlap = options.overlapStartMs ?? 0;
    const delay = options.delayBeforeNext ?? 0;
    const effective = Math.max(0, delay - overlap);
    return toSeconds(effective);
  }, []);

  const transitionTo = useCallback(
    async (next: Phase, options?: PhaseTransitionOptions) => {
      if (phaseRef.current === next) return;

      phaseRef.current = next;
      setState({
        phase: next,
        entryDelay: options ? computeEntryDelay(options) : defaultEntryDelay,
      });
    },
    [computeEntryDelay, defaultEntryDelay]
  );

  return useMemo(
    () => ({
      phase: state.phase,
      entryDelay: state.entryDelay,
      transitionTo,
    }),
    [state.phase, state.entryDelay, transitionTo]
  );
};
