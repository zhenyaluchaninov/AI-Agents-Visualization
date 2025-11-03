import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import styles from '../Screen2.module.css';
import Typewriter from '../ui/Typewriter';
import Avatar from '../ui/Avatar';
import OverlayConnector from '../ui/OverlayConnector';
import { variants } from '../animations';
import { useSmoothResize } from '../hooks/useSmoothResize';

type Props = {
  onContinue(): void;
};

export default function IntroPhase({ onContinue }: Props) {
  // Timings (ms) — adjust as needed
  const CARD_MOUNT_DELAY_MS = 0;
  const PANEL_IN_DURATION_MS = 100;
  const PANEL_FADE_DELAY_MS = 50;
  const PANEL_MOVE_DELAY_MS = 50;
  const AVATAR_IN_DURATION_MS = 70;
  const ROLE_TYPE_DELAY_MS = 600;
  // Button timings (ms)
  const BTN_MOUNT_DELAY_MS = 0;
  const BTN_IN_DURATION_MS = 100;
  const BTN_FADE_DELAY_MS = 0;
  const BTN_MOVE_DELAY_MS = 0;
  const cardRef = useRef<HTMLDivElement>(null);
  const rolePinRef = useRef<HTMLSpanElement>(null);
  const criticPinRef = useRef<HTMLSpanElement>(null);
  const callout1Ref = useRef<HTMLDivElement>(null);
  const callout2Ref = useRef<HTMLDivElement>(null);
  const callout1BoxRef = useRef<HTMLDivElement>(null);
  const callout2BoxRef = useRef<HTMLDivElement>(null);

  const [cardVisible, setCardVisible] = useState(false);
  const [btnVisible, setBtnVisible] = useState(false);

  const [roleTyping, setRoleTyping] = useState(false);
  const [roleDone, setRoleDone] = useState(false);

  const [leftCardDot, setLeftCardDot] = useState(false);
  const [leftCalloutDot, setLeftCalloutDot] = useState(false);
  const [leftLineActive, setLeftLineActive] = useState(false);
  const [leftLineDone, setLeftLineDone] = useState(false);

  const [callout1Visible, setCallout1Visible] = useState(false);
  const [callout1Typing, setCallout1Typing] = useState(false);
  const [callout1Done, setCallout1Done] = useState(false);

  const [criticTyping, setCriticTyping] = useState(false);
  const [criticDone, setCriticDone] = useState(false);

  const [rightCardDot, setRightCardDot] = useState(false);
  const [rightCalloutDot, setRightCalloutDot] = useState(false);
  const [rightLineActive, setRightLineActive] = useState(false);
  const [rightLineDone, setRightLineDone] = useState(false);

  const [callout2Visible, setCallout2Visible] = useState(false);
  const [callout2Typing, setCallout2Typing] = useState(false);
  const [callout2Done, setCallout2Done] = useState(false);

  const { release: releaseCallout1 } = useSmoothResize(callout1BoxRef, {
    stiffness: 0.06,
    active: callout1Typing,
  });
  const { release: releaseCallout2 } = useSmoothResize(callout2BoxRef, {
    stiffness: 0.06,
    active: callout2Typing,
  });

  useEffect(() => {
    const id = window.setTimeout(() => setCardVisible(true), CARD_MOUNT_DELAY_MS);
    return () => window.clearTimeout(id);
  }, []);

  // Start typing only after panel animation (fade+move) has finished
  useEffect(() => {
    if (!cardVisible) return;
    const panelFinish = Math.max(PANEL_FADE_DELAY_MS, PANEL_MOVE_DELAY_MS) + PANEL_IN_DURATION_MS;
    const id = window.setTimeout(() => setRoleTyping(true), panelFinish + ROLE_TYPE_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [cardVisible]);

  useEffect(() => {
    if (!roleDone) return;
    const timers: number[] = [];
    setLeftCardDot(true);
    timers.push(window.setTimeout(() => setLeftLineActive(true), 220));
    return () => {
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [roleDone]);

  useEffect(() => {
    if (!leftLineDone) return;
    const timers: number[] = [];
    setLeftCalloutDot(true);
    timers.push(
      window.setTimeout(() => {
        setCallout1Visible(true);
        setCallout1Typing(true);
      }, 160),
    );
    return () => {
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [leftLineDone]);

  useEffect(() => {
    if (!callout1Done) return;
    const id = window.setTimeout(() => setCriticTyping(true), 420);
    return () => window.clearTimeout(id);
  }, [callout1Done]);

  useEffect(() => {
    if (!criticDone) return;
    const timers: number[] = [];
    setRightCardDot(true);
    timers.push(window.setTimeout(() => setRightLineActive(true), 220));
    return () => {
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [criticDone]);

  useEffect(() => {
    if (!rightLineDone) return;
    const timers: number[] = [];
    setRightCalloutDot(true);
    timers.push(
      window.setTimeout(() => {
        setCallout2Visible(true);
        setCallout2Typing(true);
      }, 160),
    );
    return () => {
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [rightLineDone]);

  useEffect(() => {
    if (!callout2Done) return;
    const timers: number[] = [];
    // Button timings (ms) — tune these like panel timings
    const BTN_MOUNT_DELAY_MS = 300;
    const BTN_IN_DURATION_MS = 800;
    const BTN_FADE_DELAY_MS = 0;
    const BTN_MOVE_DELAY_MS = 0;

    timers.push(window.setTimeout(() => setBtnVisible(true), BTN_MOUNT_DELAY_MS));
    timers.push(
      window.setTimeout(() => {
        releaseCallout1();
        releaseCallout2();
      }, 650),
    );
    return () => {
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [callout2Done, releaseCallout1, releaseCallout2]);

  const handleRoleDone = useCallback(() => setRoleDone(true), []);
  const handleCallout1Done = useCallback(() => setCallout1Done(true), []);
  const handleCriticDone = useCallback(() => setCriticDone(true), []);
  const handleCallout2Done = useCallback(() => setCallout2Done(true), []);
  const handleLeftLineEnd = useCallback(() => setLeftLineDone(true), []);
  const handleRightLineEnd = useCallback(() => setRightLineDone(true), []);

  return (
    <div className={`${styles.phase} ${styles.active}`}>
      <div className={styles.wrap}>
        {cardVisible && (
          <motion.div
            ref={cardRef}
            className={styles.card}
            initial={{ opacity: 0, y: 28, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              opacity: { delay: PANEL_FADE_DELAY_MS / 1000, duration: PANEL_IN_DURATION_MS / 1000, ease: 'easeInOut' },
              y: { delay: PANEL_MOVE_DELAY_MS / 1000, duration: PANEL_IN_DURATION_MS / 1000, ease: 'easeInOut' },
              scale: { delay: PANEL_MOVE_DELAY_MS / 1000, duration: PANEL_IN_DURATION_MS / 1000, ease: 'easeInOut' },
            }}
          >
            <motion.div
              className={styles.avatar}
              initial={{ opacity: 0, y: 12, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                opacity: { delay: PANEL_FADE_DELAY_MS / 1000, duration: AVATAR_IN_DURATION_MS / 1000, ease: 'easeInOut' },
                y: { delay: PANEL_MOVE_DELAY_MS / 1000, duration: AVATAR_IN_DURATION_MS / 1000, ease: 'easeInOut' },
                scale: { delay: PANEL_MOVE_DELAY_MS / 1000, duration: AVATAR_IN_DURATION_MS / 1000, ease: 'easeInOut' },
              }}
            >
              <Avatar />
            </motion.div>

            <div className={styles.titleWrap}>
              <Typewriter
                text="Finance"
                as="span"
                className={styles.role}
                active={roleTyping}
                onTypingEnd={handleRoleDone}
              />
              <span ref={rolePinRef} className={`${styles.anchorPin} ${styles.pinRole}`} aria-hidden="true"></span>
            </div>
            <div className={styles.titleWrap} style={{ marginTop: 8 }}>
              <Typewriter
                text="Critic"
                as="span"
                className={styles.personality}
                speedMs={56}
                active={criticTyping}
                onTypingEnd={handleCriticDone}
              />
              <span ref={criticPinRef} className={`${styles.anchorPin} ${styles.pinCritic}`} aria-hidden="true"></span>
            </div>

            <div
              ref={callout1Ref}
              className={`${styles.callout} ${styles.left} ${callout1Visible ? styles.show : ''}`}
            >
              <div ref={callout1BoxRef} className={styles.calloutBox}>
                <Typewriter
                  text="The system picks specialists most likely involved in solving this challenge."
                  speedMs={18}
                  active={callout1Typing}
                  onTypingEnd={handleCallout1Done}
                />
              </div>
            </div>
            <div
              ref={callout2Ref}
              className={`${styles.callout} ${styles.right} ${callout2Visible ? styles.show : ''}`}
            >
              <div ref={callout2BoxRef} className={styles.calloutBox}>
                <Typewriter
                  text="We add different mindsets to keep the team balanced."
                  speedMs={18}
                  active={callout2Typing}
                  onTypingEnd={handleCallout2Done}
                />
              </div>
            </div>
          </motion.div>
        )}

        <div className={styles.cta}>
          {btnVisible && (
            <motion.button
              className={styles.btn}
              onClick={onContinue}
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                opacity: { delay: BTN_FADE_DELAY_MS / 1000, duration: BTN_IN_DURATION_MS / 1000, ease: 'easeInOut' },
                y: { delay: BTN_MOVE_DELAY_MS / 1000, duration: BTN_IN_DURATION_MS / 1000, ease: 'easeInOut' },
                scale: { delay: BTN_MOVE_DELAY_MS / 1000, duration: BTN_IN_DURATION_MS / 1000, ease: 'easeInOut' },
              }}
            >
              Continue
            </motion.button>
          )}
        </div>
      </div>

      {cardVisible && (
        <>
          <OverlayConnector
            fromRef={rolePinRef}
            toRef={callout1BoxRef}
            draw={leftLineActive}
            showFromDot={leftCardDot}
            showToDot={leftCalloutDot}
            onDrawEnd={handleLeftLineEnd}
          />
          <OverlayConnector
            fromRef={criticPinRef}
            toRef={callout2BoxRef}
            draw={rightLineActive}
            showFromDot={rightCardDot}
            showToDot={rightCalloutDot}
            onDrawEnd={handleRightLineEnd}
          />
        </>
      )}
    </div>
  );
}
