import styles from '../Screen1.module.css';
import { AgentIcon } from '../ui/AgentIcon';
import { TEAM_ICONS } from '../constants';
import type { TeamSequenceState } from '../types';

interface TeamPhaseProps {
  isActive: boolean;
  sequence: TeamSequenceState;
  onAssembleTeam: () => void;
  ctaDisabled: boolean;
}

export const TeamPhase = ({ isActive, sequence, onAssembleTeam, ctaDisabled }: TeamPhaseProps) => (
  <div className={`${styles.phase} ${styles.teamPhase} ${isActive ? styles.active : ''}`}>
    <div className={styles.assemblyContent}>
      <h2 className={`${styles.assemblyTitle} ${styles.fadeUp} ${sequence.headlineVisible ? styles.reveal : ''}`}>
        Let's examine this from different angles.
      </h2>
      <p className={`${styles.assemblySubtitle} ${styles.fadeUp} ${sequence.sublineVisible ? styles.reveal : ''}`}>
        We'll gather specialists with diverse perspectives.
      </p>

      <div className={styles.agentIcons}>
        {TEAM_ICONS.map(({ gradient, glow, icon: Icon }, index) => (
          <div
            key={`${glow}-${index}`}
            className={`${styles.iconBounce} ${index < sequence.visibleIcons ? styles.reveal : ''}`}
          >
            <AgentIcon className={styles.agentCircle} gradient={gradient} glow={glow}>
              <Icon className={styles.agentSvg} />
            </AgentIcon>
          </div>
        ))}
      </div>

      <button
        className={`${styles.btn} ${styles.assembleBtn} ${sequence.ctaVisible ? styles.show : ''}`}
        onClick={onAssembleTeam}
        disabled={ctaDisabled}
      >
        Assemble the Team
      </button>
    </div>
  </div>
);

export default TeamPhase;
