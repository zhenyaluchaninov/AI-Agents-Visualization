
import { motion, useReducedMotion } from 'framer-motion';
import styles from '../Screen2.module.css';
import { TEAM_DATA, SEQ, MOTION, EASE } from '../constants';
import AgentCard from '../ui/AgentCard';
import { getVariants } from '../animations';

type Props = {
  onStart(): void;
  exiting: boolean;
};

export default function TeamPhase({ onStart, exiting }: Props) {
  const reduced = useReducedMotion() ?? false;
  const variants = getVariants(reduced);
  const adjustDelay = (seconds: number) => (reduced ? seconds * 0.25 : seconds);
  const adjustDuration = (seconds: number) => (reduced ? Math.min(0.1, seconds * 0.35) : seconds);

  const titleDelay = adjustDelay(SEQ.TEAM.TITLE_DELAY);
  const titleDuration = adjustDuration(MOTION.TEAM.TITLE_IN);

  const cardDuration = adjustDuration(SEQ.TEAM.CARD_IN_DURATION);
  const cardDelays = TEAM_DATA.map((_, index) =>
    adjustDelay(SEQ.TEAM.CARDS_START_DELAY + index * SEQ.TEAM.CARD_STAGGER),
  );

  const lastCardDelay = cardDelays[cardDelays.length - 1] ?? 0;
  const ctaDelay = lastCardDelay + cardDuration + adjustDelay(SEQ.TEAM.CTA_EXTRA_DELAY);
  const ctaDuration = adjustDuration(MOTION.CTA.TEAM_IN);

  return (
    <div className={styles.phase + ' ' + styles.active}>
      <div className={styles.teamContainer}>
        <motion.h2
          className={styles.teamTitle}
          variants={variants.fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: titleDelay, duration: titleDuration, ease: EASE.DEFAULT }}
        >
          Your specialist team is ready
        </motion.h2>

        <div className={styles.teamGrid}>
          {TEAM_DATA.map((agent, i) => (
            <AgentCard
              key={agent.role + i}
              agent={agent}
              delaySec={cardDelays[i]}
              durationSec={cardDuration}
            />
          ))}
        </div>

        <motion.button
          className={styles.btn}
          onClick={onStart}
          disabled={exiting}
          variants={variants.btnIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: ctaDelay, duration: ctaDuration, ease: EASE.DEFAULT }}
          whileHover={reduced ? undefined : { y: -4, boxShadow: '0 18px 48px rgba(139,125,240,.45)' }}
          whileTap={reduced ? undefined : { scale: 0.97 }}
        >
          Start Discussion
        </motion.button>
      </div>
    </div>
  );
}
