import { motion } from 'framer-motion';
import type { Screen1Animations } from '../animations';
import styles from '../Screen1.module.css';

interface GatePhaseProps {
  animations: Screen1Animations;
  entryDelay: number;
  onStart: () => void;
}

export const GatePhase = ({ animations, entryDelay, onStart }: GatePhaseProps) => (
  <motion.section
    className={styles.phase}
    variants={animations.variants.phaseContainer}
    custom={{ delay: entryDelay }}
    initial="initial"
    animate="animate"
    exit="exit"
  >
    <motion.div
      className={styles.gateContent}
      variants={animations.variants.gate.content}
      custom={{ delay: entryDelay }}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <motion.button
        type="button"
        className={styles.btn}
        variants={animations.variants.gate.button}
        custom={{ delay: entryDelay }}
        onClick={onStart}
      >
        Start Presentation
      </motion.button>
    </motion.div>
  </motion.section>
);

export default GatePhase;
