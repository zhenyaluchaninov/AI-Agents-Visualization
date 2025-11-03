
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Screen2.module.css';
import { usePhaseMachine } from './hooks/usePhaseMachine';
import IntroPhase from './phases/IntroPhase';
import TeamPhase from './phases/TeamPhase';

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
    const root = document.documentElement;
    const computed = getComputedStyle(root);
    const fade = computed.getPropertyValue('--phase-fade') || '.6s';
    const ms = fade.trim().endsWith('ms')
      ? parseFloat(fade)
      : parseFloat(fade) * 1000;
    exitTimerRef.current = window.setTimeout(() => navigate('/screen3'), ms || 600);
  };

  return (
    <div className={`${styles.root} ${hasEntered ? styles.entered : ''} ${isExiting ? styles.exiting : ''}`}>
      {phase === 'intro' && <IntroPhase onContinue={goTeam} />}
      {phase === 'team' && <TeamPhase onStart={onStartDiscussion} exiting={isExiting} />}
    </div>
  );
}
