
import { useCallback, useState } from 'react';

export type Screen2Phase = 'intro' | 'team';

export function usePhaseMachine(initial: Screen2Phase = 'intro') {
  const [phase, setPhase] = useState<Screen2Phase>(initial);

  const goTeam = useCallback(() => setPhase('team'), []);

  return { phase, goTeam };
}
