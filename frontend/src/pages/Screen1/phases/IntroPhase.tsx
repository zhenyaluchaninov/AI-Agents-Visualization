import { useEffect, useRef, useState } from 'react';
import styles from '../Screen1.module.css';
import type { Screen1Timings } from '../types';

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

interface IntroPhaseProps {
  isActive: boolean;
  timings: Pick<Screen1Timings, 'fadeDuration' | 'readDelay'>;
  onComplete: () => Promise<void> | void;
}

export const IntroPhase = ({ isActive, timings, onComplete }: IntroPhaseProps) => {
  const [titleVisible, setTitleVisible] = useState(false);
  const [subtitleVisible, setSubtitleVisible] = useState(false);
  const [titleExiting, setTitleExiting] = useState(false);
  const [subtitleExiting, setSubtitleExiting] = useState(false);
  const runRef = useRef(0);
  const exitRunRef = useRef(0);

  useEffect(() => {
    if (!isActive) return;

    exitRunRef.current += 1;

    const runId = ++runRef.current;
    setTitleExiting(false);
    setSubtitleExiting(false);

    const run = async () => {
      setTitleVisible(false);
      setSubtitleVisible(false);

      await wait(16);
      if (runRef.current !== runId) return;

      setTitleVisible(true);
      await wait(timings.fadeDuration);
      if (runRef.current !== runId) return;

      await wait(timings.readDelay);
      if (runRef.current !== runId) return;

      setSubtitleVisible(true);
      await wait(timings.fadeDuration);
      if (runRef.current !== runId) return;

      await wait(timings.readDelay);
      if (runRef.current !== runId) return;

      await onComplete();
    };

    run();

    return () => {
      runRef.current += 1;
    };
  }, [isActive, timings.fadeDuration, timings.readDelay, onComplete]);

  useEffect(() => {
    if (isActive) return;

    runRef.current += 1;
    const shouldExit = titleVisible || subtitleVisible;
    if (!shouldExit) return;

    const exitId = ++exitRunRef.current;
    setTitleExiting(true);
    setSubtitleExiting(true);

    const handle = window.setTimeout(() => {
      if (exitRunRef.current !== exitId) return;
      setTitleVisible(false);
      setSubtitleVisible(false);
      setTitleExiting(false);
      setSubtitleExiting(false);
    }, timings.fadeDuration);

    return () => {
      exitRunRef.current += 1;
      window.clearTimeout(handle);
    };
  }, [isActive, timings.fadeDuration, titleVisible, subtitleVisible]);

  return (
    <div className={`${styles.phase} ${isActive ? styles.active : ''}`}>
      <div className={styles.introContent}>
        <h1
          className={`${styles.introTitle} ${styles.fadeUp} ${titleVisible ? styles.reveal : ''} ${
            titleExiting ? styles.fadeExit : ''
          }`}
        >
          Collective intelligence, on your terms.
        </h1>
        <p
          className={`${styles.introSubtitle} ${styles.fadeUp} ${subtitleVisible ? styles.reveal : ''} ${
            subtitleExiting ? styles.fadeExit : ''
          }`}
        >
          Different minds. One challenge.
        </p>
      </div>
    </div>
  );
};

export default IntroPhase;
