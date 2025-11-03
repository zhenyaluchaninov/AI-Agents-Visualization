
import { motion } from 'framer-motion';
import styles from '../Screen2.module.css';
import { TEAM_DATA } from '../constants';
import AgentCard from '../ui/AgentCard';
import { variants } from '../animations';

type Props = {
  onStart(): void;
  exiting: boolean;
};

export default function TeamPhase({ onStart, exiting }: Props) {
  return (
    <div className={styles.phase + ' ' + styles.active}>
      <div className={styles.teamContainer}>
        <motion.h2 className={styles.teamTitle} variants={variants.fadeUp} initial="hidden" animate="visible">
          Your specialist team is ready
        </motion.h2>

        <div className={styles.teamGrid}>
          {TEAM_DATA.map((agent, i) => (
            <AgentCard key={agent.role + i} agent={agent} delaySec={i * 0.15} />
          ))}
        </div>

        <motion.button
          className={styles.btn}
          onClick={onStart}
          disabled={exiting}
          variants={variants.btnIn}
          initial="hidden"
          animate="visible"
        >
          Start Discussion
        </motion.button>
      </div>
    </div>
  );
}
