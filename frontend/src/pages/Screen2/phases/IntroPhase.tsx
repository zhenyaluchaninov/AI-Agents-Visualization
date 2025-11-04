// IntroPhase.tsx
import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import styles from '../Screen2.module.css';
import Typewriter from '../ui/Typewriter';
import Avatar from '../ui/Avatar';
import OverlayConnector from '../ui/OverlayConnector';
import { useSmoothResize } from '../hooks/useSmoothResize';
import { EASE, MOTION, SEQ, TYPEWRITER } from '../constants';
import { getVariants } from '../animations';

type Props = {
  onContinue(): void;
};

export default function IntroPhase({ onContinue }: Props) {
  const reducedMotion = useReducedMotion() ?? false;
  const variants = getVariants(reducedMotion);
 
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

  // ÐœÐ¾Ð½Ñ‚Ð¸Ñ€ÑƒÐµÐ¼ ÐºÐ°Ñ€Ñ‚Ð¾Ñ‡ÐºÑƒ
  useEffect(() => {
    const id = window.setTimeout(() => setCardVisible(true), SEQ.INTRO.CARD_MOUNT_DELAY * 1000);
    return () => window.clearTimeout(id);
  }, []);

  // Ð¡Ñ‚Ð°Ñ€Ñ‚ Ð¿ÐµÑ‡Ð°Ñ‚Ð¸ Ñ€Ð¾Ð»Ð¸ â€” Ñ‚Ð¾Ð»ÑŒÐºÐ¾ ÐŸÐžÐ¡Ð›Ð• Ñ‚Ð¾Ð³Ð¾, ÐºÐ°Ðº Ð¿Ð°Ð½ÐµÐ»ÑŒ (fade+move) Ð·Ð°Ð²ÐµÑ€ÑˆÐ¸Ð»Ð°ÑÑŒ
  useEffect(() => {
    if (!cardVisible) return;
    // Ð³Ð°Ñ€Ð°Ð½Ñ‚Ð¸Ñ: Ð±ÐµÑ€ÐµÐ¼ max Ð¿Ð¾ Ð·Ð°Ð´ÐµÑ€Ð¶ÐºÐ°Ð¼ + Ð´Ð»Ð¸Ñ‚ÐµÐ»ÑŒÐ½Ð¾ÑÑ‚ÑŒ
    const panelFinishMs = (Math.max(MOTION.PANEL_FADE_DELAY, MOTION.PANEL_MOVE_DELAY) + MOTION.PANEL_IN) * 1000;
    const id = window.setTimeout(
      () => setRoleTyping(true),
      panelFinishMs + SEQ.INTRO.ROLE_TYPE_DELAY * 1000,
    );
    return () => window.clearTimeout(id);
  }, [cardVisible]);

  // ÐŸÐ¾ÑÐ»Ðµ Ð¿ÐµÑ‡Ð°Ñ‚Ð¸ Ñ€Ð¾Ð»Ð¸ â€” Ð»ÐµÐ²Ñ‹Ð¹ ÐºÐ¾Ð½Ð½ÐµÐºÑ‚Ð¾Ñ€
  useEffect(() => {
    if (!roleDone) return;
    const timers: number[] = [];
    setLeftCardDot(true);
    timers.push(window.setTimeout(() => setLeftLineActive(true), SEQ.INTRO.LEFT_LINE_ARM_DELAY * 1000));
    return () => { timers.forEach(window.clearTimeout); };
  }, [roleDone]);

  // ÐŸÐ¾ÑÐ»Ðµ Ð·Ð°Ð²ÐµÑ€ÑˆÐµÐ½Ð¸Ñ Ð»ÐµÐ²Ð¾Ð¹ Ð»Ð¸Ð½Ð¸Ð¸ â€” Ð¿Ð¾ÐºÐ°Ð· Ð¸ Ð¿ÐµÑ‡Ð°Ñ‚ÑŒ Ð»ÐµÐ²Ð¾Ð³Ð¾ ÐºÐ¾Ð»Ð»Ð°ÑƒÑ‚Ð°
  useEffect(() => {
    if (!leftLineDone) return;
    const timers: number[] = [];
    setLeftCalloutDot(true);
    timers.push(
      window.setTimeout(() => {
        setCallout1Visible(true);
        setCallout1Typing(true);
      }, SEQ.INTRO.CALLOUT1_SHOW_DELAY * 1000),
    );
    return () => { timers.forEach(window.clearTimeout); };
  }, [leftLineDone]);

  // ÐŸÐ¾ÑÐ»Ðµ Ð»ÐµÐ²Ð¾Ð³Ð¾ ÐºÐ¾Ð»Ð»Ð°ÑƒÑ‚Ð° â€” Ð¿ÐµÑ‡Ð°Ñ‚ÑŒ Ð²Ñ‚Ð¾Ñ€Ð¾Ð¹ ÑÑ‚Ñ€Ð¾ÐºÐ¸ (Critic)
  useEffect(() => {
    if (!callout1Done) return;
    const id = window.setTimeout(() => setCriticTyping(true), SEQ.INTRO.PERSONALITY_TYPE_DELAY * 1000);
    return () => window.clearTimeout(id);
  }, [callout1Done]);

  // ÐŸÐ¾ÑÐ»Ðµ Critic â€” Ð¿Ñ€Ð°Ð²Ñ‹Ð¹ ÐºÐ¾Ð½Ð½ÐµÐºÑ‚Ð¾Ñ€
  useEffect(() => {
    if (!criticDone) return;
    const timers: number[] = [];
    setRightCardDot(true);
    timers.push(window.setTimeout(() => setRightLineActive(true), SEQ.INTRO.RIGHT_LINE_ARM_DELAY * 1000));
    return () => { timers.forEach(window.clearTimeout); };
  }, [criticDone]);

  // ÐŸÐ¾ÑÐ»Ðµ Ð·Ð°Ð²ÐµÑ€ÑˆÐµÐ½Ð¸Ñ Ð¿Ñ€Ð°Ð²Ð¾Ð¹ Ð»Ð¸Ð½Ð¸Ð¸ â€” Ð¿Ñ€Ð°Ð²Ñ‹Ð¹ ÐºÐ¾Ð»Ð»Ð°ÑƒÑ‚
  useEffect(() => {
    if (!rightLineDone) return;
    const timers: number[] = [];
    setRightCalloutDot(true);
    timers.push(
      window.setTimeout(() => {
        setCallout2Visible(true);
        setCallout2Typing(true);
      }, SEQ.INTRO.CALLOUT2_SHOW_DELAY * 1000),
    );
    return () => { timers.forEach(window.clearTimeout); };
  }, [rightLineDone]);

  // ÐŸÐ¾ÑÐ»Ðµ Ð¿Ñ€Ð°Ð²Ð¾Ð³Ð¾ ÐºÐ¾Ð»Ð»Ð°ÑƒÑ‚Ð° â€” Ð¼Ð¾Ð½Ñ‚Ð¸Ñ€ÑƒÐµÐ¼ ÐºÐ½Ð¾Ð¿ÐºÑƒ Ð¸ Ð¾Ñ‚Ð¿ÑƒÑÐºÐ°ÐµÐ¼ Ñ€ÐµÐ·Ð°Ð¹Ð·ÐµÑ€Ñ‹
  useEffect(() => {
    if (!callout2Done) return;
    const timers: number[] = [];
    timers.push(window.setTimeout(() => setBtnVisible(true), SEQ.INTRO.BTN_MOUNT_DELAY * 1000));
    timers.push(
      window.setTimeout(() => {
        releaseCallout1();
        releaseCallout2();
      }, SEQ.INTRO.SMOOTH_RESIZE_RELEASE_DELAY * 1000),
    );
    return () => { timers.forEach(window.clearTimeout); };
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
            variants={variants.panelIn}
            initial="hidden"
            animate="visible"
            transition={{
              // ÑÐ¸Ð½Ñ…Ñ€Ð¾Ð½Ð½Ñ‹Ð¹ ÑÑ‚Ð°Ñ€Ñ‚ fade+move+scale Ñ‡ÐµÑ€ÐµÐ· Ð¾Ð´Ð¸Ð½Ð°ÐºÐ¾Ð²Ñ‹Ðµ Ð·Ð°Ð´ÐµÑ€Ð¶ÐºÐ¸
              opacity: { delay: MOTION.PANEL_FADE_DELAY, duration: MOTION.PANEL_IN, ease: EASE.DEFAULT },
              y: { delay: MOTION.PANEL_MOVE_DELAY, duration: MOTION.PANEL_IN, ease: EASE.DEFAULT },
              scale: { delay: MOTION.PANEL_MOVE_DELAY, duration: MOTION.PANEL_IN, ease: EASE.DEFAULT },
            }}
          >
            <motion.div
              className={styles.avatar}
              variants={variants.avatarIn}
              initial="hidden"
              animate="visible"
              transition={{
                // Ð°Ð²Ð°Ñ‚Ð°Ñ€ ÐµÐ´ÐµÑ‚ ÑÐ¸Ð½Ñ…Ñ€Ð¾Ð½Ð½Ð¾ Ñ Ð¿Ð°Ð½ÐµÐ»ÑŒÑŽ
                opacity: { delay: MOTION.PANEL_FADE_DELAY, duration: MOTION.AVATAR_IN, ease: EASE.DEFAULT },
                y: { delay: MOTION.PANEL_MOVE_DELAY, duration: MOTION.AVATAR_IN, ease: EASE.DEFAULT },
                scale: { delay: MOTION.PANEL_MOVE_DELAY, duration: MOTION.AVATAR_IN, ease: EASE.DEFAULT },
              }}
            >
              <Avatar />
            </motion.div>

            <div className={styles.titleWrap}>
              <Typewriter
                text="Finance"
                as="span"
                className={styles.role}
                speedMs={TYPEWRITER.INTRO.ROLE_MS}
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
                speedMs={TYPEWRITER.INTRO.PERSONALITY_MS}
                active={criticTyping}
                onTypingEnd={handleCriticDone}
              />
              <span ref={criticPinRef} className={`${styles.anchorPin} ${styles.pinCritic}`} aria-hidden="true"></span>
            </div>

            <motion.div
              ref={callout1Ref}
              className={`${styles.callout} ${styles.left}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: callout1Visible ? 1 : 0 }}
              transition={{ duration: (MOTION.FADE), ease: EASE.DEFAULT }}
            >
              <div ref={callout1BoxRef} className={styles.calloutBox}>
                <Typewriter
                  text="The system picks specialists most likely involved in solving this challenge."
                  speedMs={reducedMotion ? 0 : TYPEWRITER.INTRO.CALLOUT_MS}
                  active={callout1Typing}
                  onTypingEnd={handleCallout1Done}
                />
              </div>
            </motion.div>

            <motion.div
              ref={callout2Ref}
              className={`${styles.callout} ${styles.right}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: callout2Visible ? 1 : 0 }}
              transition={{ duration: (MOTION.FADE), ease: EASE.DEFAULT }}
            >
              <div ref={callout2BoxRef} className={styles.calloutBox}>
                <Typewriter
                  text="We add different mindsets to keep the team balanced."
                  speedMs={reducedMotion ? 0 : TYPEWRITER.INTRO.CALLOUT_MS}
                  active={callout2Typing}
                  onTypingEnd={handleCallout2Done}
                />
              </div>
            </motion.div>
          </motion.div>
        )}

        <div className={styles.cta}>
          {btnVisible && (
            <motion.button
              className={styles.btn}
              onClick={onContinue}
              variants={variants.btnIn}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: reducedMotion ? 0.1 : MOTION.CTA.INTRO_IN, ease: EASE.DEFAULT }}
              whileHover={reducedMotion ? undefined : { y: -4, boxShadow: '0 18px 48px rgba(139,125,240,.45)' }}
              whileTap={reducedMotion ? undefined : { scale: 0.97 }}
              style={{ willChange: 'transform, opacity' }}
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





