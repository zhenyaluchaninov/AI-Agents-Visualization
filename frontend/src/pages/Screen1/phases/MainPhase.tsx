import styles from '../Screen1.module.css';
import { AgentIcon } from '../ui/AgentIcon';
import { StepBullet } from '../ui/StepBullet';
import {
  INSIGHT_DEFINITIONS,
  PROBLEM_DEFINITIONS,
} from '../constants';
import type { InsightId, ProblemId } from '../types';

interface MainPhaseProps {
  isActive: boolean;
  selectedProblem: ProblemId | null;
  onSelectProblem: (problem: ProblemId) => void;
  selectedInsights: Set<InsightId>;
  onToggleInsight: (insight: InsightId) => void;
  showContinue: boolean;
  onContinue: () => void;
}

export const MainPhase = ({
  isActive,
  selectedProblem,
  onSelectProblem,
  selectedInsights,
  onToggleInsight,
  showContinue,
  onContinue,
}: MainPhaseProps) => (
  <div className={`${styles.phase} ${styles.mainPhase} ${isActive ? styles.active : ''}`}>
    <div className={styles.mainWrapper}>
      <div className={styles.mainContainer}>
        <StepBullet
          className={styles.mainHeader}
          headingTag="h2"
          heading="Choose a challenge"
          headingClassName={styles.mainTitle}
          description="Select the scenario you want to explore with AI specialists"
          descriptionClassName={styles.mainSubtitle}
        />

        <div className={styles.problemsGrid}>
          {PROBLEM_DEFINITIONS.map(({ id, title, description, gradient, glow, icon: Icon }) => {
            const isSelected = selectedProblem === id;
            return (
              <div
                key={id}
                className={`${styles.problemCard} ${isSelected ? styles.problemCardSelected : ''}`}
                onClick={() => onSelectProblem(id)}
              >
                <AgentIcon className={styles.problemIcon} gradient={gradient} glow={glow}>
                  <Icon className={styles.agentSvg} />
                </AgentIcon>
                <h3 className={styles.problemTitle}>{title}</h3>
                <p className={styles.problemDesc}>{description}</p>
              </div>
            );
          })}
        </div>

        <div className={styles.insightsSection}>
          <StepBullet
            className={styles.sectionHeader}
            heading="What should the team focus on?"
            headingClassName={styles.sectionTitle}
            description="Select one or more areas to explore"
            descriptionClassName={styles.sectionSubtitle}
          />

          <div className={styles.insightsGrid}>
            {INSIGHT_DEFINITIONS.map(({ id, title, description, gradient, glow, icon: Icon }) => {
              const isSelected = selectedInsights.has(id);
              return (
                <div
                  key={id}
                  className={`${styles.insightCard} ${isSelected ? styles.insightCardSelected : ''}`}
                  onClick={() => onToggleInsight(id)}
                >
                  <AgentIcon className={`${styles.insightIcon}`} gradient={gradient} glow={glow}>
                    <Icon className={styles.agentSvg} />
                  </AgentIcon>
                  <h4 className={styles.insightTitle}>{title}</h4>
                  <p className={styles.insightDesc}>{description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className={styles.continueSection}>
        <button
          className={`${styles.btn} ${styles.continueBtn} ${showContinue ? styles.continueBtnEnabled : ''}`}
          onClick={onContinue}
          disabled={!showContinue}
        >
          Continue
        </button>
      </div>
    </div>
  </div>
);

export default MainPhase;
