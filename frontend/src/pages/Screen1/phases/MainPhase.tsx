import { motion } from 'framer-motion';
import type { Screen1Animations } from '../animations';
import styles from '../Screen1.module.css';
import { AgentIcon } from '../ui/AgentIcon';
import { StepBullet } from '../ui/StepBullet';
import {
  INSIGHT_DEFINITIONS,
  PROBLEM_DEFINITIONS,
} from '../constants';
import type { InsightId, ProblemId } from '../types';

interface MainPhaseProps {
  animations: Screen1Animations;
  entryDelay: number;
  selectedProblem: ProblemId | null;
  onSelectProblem: (problem: ProblemId) => void;
  selectedInsights: Set<InsightId>;
  onToggleInsight: (insight: InsightId) => void;
  showContinue: boolean;
  onContinue: () => void;
}

export const MainPhase = ({
  animations,
  entryDelay,
  selectedProblem,
  onSelectProblem,
  selectedInsights,
  onToggleInsight,
  showContinue,
  onContinue,
}: MainPhaseProps) => (
  <motion.section
    className={`${styles.phase} ${styles.mainPhase}`}
    variants={animations.variants.phaseContainer}
    custom={{ delay: entryDelay }}
    initial="initial"
    animate="animate"
    exit="exit"
  >
    <motion.div
      className={styles.mainWrapper}
      variants={animations.variants.main.content}
      custom={{ delay: entryDelay }}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <motion.div className={styles.mainContainer} variants={animations.variants.main.section}>
        <motion.div variants={animations.variants.main.section}>
          <StepBullet
            className={styles.mainHeader}
            headingTag="h2"
            heading="Choose a challenge"
            headingClassName={styles.mainTitle}
            description="Select the scenario you want to explore with AI specialists"
            descriptionClassName={styles.mainSubtitle}
          />
        </motion.div>

        <motion.div
          className={styles.problemsGrid}
          variants={animations.variants.main.grid}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {PROBLEM_DEFINITIONS.map(({ id, title, description, gradient, glow, icon: Icon }) => {
            const isSelected = selectedProblem === id;
            return (
              <motion.div
                key={id}
                className={`${styles.problemCard} ${isSelected ? styles.problemCardSelected : ''}`}
                variants={animations.variants.main.card}
                onClick={() => onSelectProblem(id)}
              >
                <AgentIcon className={styles.problemIcon} gradient={gradient} glow={glow}>
                  <Icon className={styles.agentSvg} />
                </AgentIcon>
                <h3 className={styles.problemTitle}>{title}</h3>
                <p className={styles.problemDesc}>{description}</p>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div variants={animations.variants.main.section} className={styles.insightsSection}>
          <StepBullet
            className={styles.sectionHeader}
            heading="What should the team focus on?"
            headingClassName={styles.sectionTitle}
            description="Select one or more areas to explore"
            descriptionClassName={styles.sectionSubtitle}
          />

          <motion.div
            className={styles.insightsGrid}
            variants={animations.variants.main.grid}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {INSIGHT_DEFINITIONS.map(({ id, title, description, gradient, glow, icon: Icon }) => {
              const isSelected = selectedInsights.has(id);
              return (
                <motion.div
                  key={id}
                  className={`${styles.insightCard} ${isSelected ? styles.insightCardSelected : ''}`}
                  variants={animations.variants.main.card}
                  onClick={() => onToggleInsight(id)}
                >
                  <AgentIcon className={styles.insightIcon} gradient={gradient} glow={glow}>
                    <Icon className={styles.agentSvg} />
                  </AgentIcon>
                  <h4 className={styles.insightTitle}>{title}</h4>
                  <p className={styles.insightDesc}>{description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div className={styles.continueSection} variants={animations.variants.main.section}>
        <button
          className={`${styles.btn} ${styles.continueBtn} ${showContinue ? styles.continueBtnEnabled : ''}`}
          onClick={onContinue}
          disabled={!showContinue}
        >
          Continue
        </button>
      </motion.div>
    </motion.div>
  </motion.section>
);

export default MainPhase;
