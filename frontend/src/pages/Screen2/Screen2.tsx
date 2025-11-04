
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Screen2.module.css';
import { usePhaseMachine } from './hooks/usePhaseMachine';
import IntroPhase from './phases/IntroPhase';
import TeamPhase from './phases/TeamPhase';
import { MOTION } from './constants';

export default function Screen2() {
  const { phase, goTeam } = usePhaseMachine('intro');
  const [hasEntered, setHasEntered] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const exitTimerRef = useRef<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const id = requestAnimationFrame(() => setHasEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const onStartDiscussion = () => {
    if (isExiting) return;
    setIsExiting(true);
    const ms = MOTION.PHASE_FADE * 1000;
    exitTimerRef.current = window.setTimeout(() => navigate('/screen3'), ms);
  };

  return (
    <div className={`${styles.root} ${hasEntered ? styles.entered : ''} ${isExiting ? styles.exiting : ''}`}>
      {phase === 'intro' && <IntroPhase onContinue={goTeam} />}
      {phase === 'team' && <TeamPhase onStart={onStartDiscussion} exiting={isExiting} />}
    </div>
  );
}
