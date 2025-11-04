
import { motion, useReducedMotion } from 'framer-motion';
import styles from '../Screen2.module.css';
import type { Agent } from '../types';
import { getVariants } from '../animations';
import { EASE } from '../constants';

type Props = {
  agent: Agent;
  delaySec: number;
  durationSec: number;
};

export default function AgentCard({ agent, delaySec, durationSec }: Props) {
  const reduced = useReducedMotion() ?? false;
  const variants = getVariants(reduced);
  return (
    <motion.div
      className={styles.agentCard}
      variants={variants.agentCardIn}
      initial="hidden"
      animate="visible"
      transition={{ delay: delaySec, duration: durationSec, ease: EASE.OVERSHOOT }}
    >
      <div className={`${styles.agentIcon} ${styles[`personality-${agent.color}` as const]}`}>
        <svg viewBox="0 0 24 24" fill="none" className={styles.agentIconSvg}>
          <circle cx="12" cy="10" r="3" fill="#fff"/>
          <path d="M6 20c0-4 2.5-6 6-6s6 2 6 6" fill="#fff" opacity=".8"/>
        </svg>
      </div>
      <div className={styles.agentName}>{agent.role}</div>
      <div className={styles.agentStyle}>{agent.personality}</div>
    </motion.div>
  );
}
