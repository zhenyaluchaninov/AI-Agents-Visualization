import { motion } from 'framer-motion';
import type { Screen1Animations } from '../animations';
import styles from '../Screen1.module.css';

interface IntroPhaseProps {
  animations: Screen1Animations;
  entryDelay: number;
  onComplete: () => Promise<void> | void;
}

export const IntroPhase = ({ animations, entryDelay, onComplete }: IntroPhaseProps) => {
  const contentDelay = entryDelay + animations.meta.intro.startDelay;

  return (
    <motion.section
      className={styles.phase}
      variants={animations.variants.phaseContainer}
      custom={{ delay: entryDelay }}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <motion.div
        className={styles.introContent}
        variants={animations.variants.intro.content}
        custom={{ delay: contentDelay }}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <motion.h1
          className={styles.introTitle}
          variants={animations.variants.intro.text}
          custom={{ delay: contentDelay }}
        >
          Collective intelligence, on your terms.
        </motion.h1>
        <motion.p
          className={styles.introSubtitle}
          variants={animations.variants.intro.text}
          custom={{ delay: contentDelay + animations.meta.intro.stagger }}
        >
          Different minds. One challenge.
        </motion.p>
      </motion.div>

      <motion.span
        aria-hidden
        style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
        variants={animations.variants.intro.progress}
        custom={{ delay: contentDelay }}
        initial="initial"
        animate="animate"
        exit="exit"
        onAnimationComplete={(definition) => {
          if (definition === 'animate') {
            onComplete();
          }
        }}
      />
    </motion.section>
  );
};

export default IntroPhase;
