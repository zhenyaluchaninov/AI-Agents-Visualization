import { useEffect, useRef, useState } from 'react';
import type { Phase, Screen1Timings, TeamSequenceState } from '../types';
import { TEAM_ICON_COUNT } from '../constants';

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const initialSequenceState: TeamSequenceState = {
  headlineVisible: false,
  sublineVisible: false,
  visibleIcons: 0,
  ctaVisible: false,
};

interface UseTeamSequenceArgs {
  phase: Phase;
  timings: Screen1Timings;
  iconCount?: number;
}

export const useTeamSequence = ({ phase, timings, iconCount = TEAM_ICON_COUNT }: UseTeamSequenceArgs): TeamSequenceState => {
  const [state, setState] = useState<TeamSequenceState>(initialSequenceState);
  const sequenceRunRef = useRef(0);

  useEffect(() => {
    if (phase !== 'team') {
      sequenceRunRef.current += 1;
      setState(initialSequenceState);
      return;
    }

    const runId = ++sequenceRunRef.current;

    const run = async () => {
      setState({
        headlineVisible: true,
        sublineVisible: false,
        visibleIcons: 0,
        ctaVisible: false,
      });

      await wait(timings.fadeDuration);
      if (sequenceRunRef.current !== runId) return;

      await wait(timings.readDelay);
      if (sequenceRunRef.current !== runId) return;

      setState((prev) => ({
        ...prev,
        sublineVisible: true,
      }));

      await wait(timings.fadeDuration);
      if (sequenceRunRef.current !== runId) return;

      await wait(timings.readDelay);
      if (sequenceRunRef.current !== runId) return;

      await wait(timings.iconsAfterText);
      if (sequenceRunRef.current !== runId) return;

      for (let i = 1; i <= iconCount; i += 1) {
        setState((prev) => ({
          ...prev,
          visibleIcons: i,
        }));
        await wait(timings.iconStagger + timings.iconStaggerBuffer);
        if (sequenceRunRef.current !== runId) return;
      }

      await wait(timings.iconDuration);
      if (sequenceRunRef.current !== runId) return;

      setState((prev) => ({
        ...prev,
        ctaVisible: true,
      }));
    };

    run();

    return () => {
      sequenceRunRef.current += 1;
    };
  }, [phase, timings, iconCount]);

  return state;
};
