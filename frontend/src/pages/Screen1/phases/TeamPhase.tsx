import { motion } from 'framer-motion';
import type { Screen1Animations } from '../animations';
import styles from '../Screen1.module.css';
import { AgentIcon } from '../ui/AgentIcon';
import { TEAM_ICONS } from '../constants';

interface TeamPhaseProps {
  animations: Screen1Animations;
  entryDelay: number;
  onAssembleTeam: () => void;
  ctaDisabled: boolean;
}

export const TeamPhase = ({ animations, entryDelay, onAssembleTeam, ctaDisabled }: TeamPhaseProps) => {
  const iconDelay = entryDelay + animations.meta.team.iconStartDelay;
  const ctaDelay = entryDelay + animations.meta.team.ctaDelay;
  const subtitleDelay = entryDelay + animations.meta.team.textStagger;

  return (
    <motion.section
      className={`${styles.phase} ${styles.teamPhase}`}
      variants={animations.variants.phaseContainer}
      custom={{ delay: entryDelay }}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <motion.div
        className={styles.assemblyContent}
        variants={animations.variants.team.content}
        custom={{ delay: entryDelay }}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <motion.div variants={animations.variants.team.textGroup} initial="initial" animate="animate" exit="exit">
          <motion.h2
            className={styles.assemblyTitle}
            variants={animations.variants.team.text}
            custom={{ delay: entryDelay }}
          >
            Let's examine this from different angles.
          </motion.h2>
          <motion.p
            className={styles.assemblySubtitle}
            variants={animations.variants.team.text}
            custom={{ delay: subtitleDelay }}
          >
            We'll gather specialists with diverse perspectives.
          </motion.p>
        </motion.div>

        <motion.div
          className={styles.agentIcons}
          variants={animations.variants.team.iconGroup}
          custom={{ delay: iconDelay }}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {TEAM_ICONS.map(({ gradient, glow, icon: Icon }, index) => (
            <motion.div
              key={`${glow}-${index}`}
              className={styles.iconBounce}
              variants={animations.variants.team.icon}
              custom={{ delay: iconDelay + index * animations.meta.team.iconStagger }}
            >
              <AgentIcon className={styles.agentCircle} gradient={gradient} glow={glow}>
                <Icon className={styles.agentSvg} />
              </AgentIcon>
            </motion.div>
          ))}
        </motion.div>

        <motion.button
          type="button"
          className={`${styles.btn} ${styles.assembleBtn}`}
          variants={animations.variants.team.cta}
          custom={{ delay: ctaDelay }}
          initial="initial"
          animate="animate"
          exit="exit"
          onClick={onAssembleTeam}
          disabled={ctaDisabled}
        >
          Assemble the Team
        </motion.button>
      </motion.div>
    </motion.section>
  );
};

export default TeamPhase;
