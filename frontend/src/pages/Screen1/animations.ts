import type { Variants } from 'framer-motion';
import { TEAM_ICONS } from './constants';
import type { Screen1Timings } from './types';

const toSeconds = (ms: number) => ms / 1000;

const EASINGS = {
  phase: [0.42, 0, 0.58, 1] as const,
  text: [0.42, 0, 0.58, 1] as const,
  overshoot: [0.42, 0, 0.58, 1] as const,
  button: [0.25, 0.1, 0.25, 1] as const,
};

interface DelayContext {
  delay?: number;
}

export interface Screen1AnimationMeta {
  intro: {
    startDelay: number;
    stagger: number;
    progressDuration: number;
  };
  main: {
    sectionStagger: number;
  };
  team: {
    textStagger: number;
    iconStagger: number;
    iconStartDelay: number;
    ctaDelay: number;
  };
  root: {
    exitDuration: number;
  };
}

export interface Screen1Animations {
  meta: Screen1AnimationMeta;
  variants: {
    root: Variants;
    phaseContainer: Variants;
    gate: {
      content: Variants;
      button: Variants;
    };
    intro: {
      content: Variants;
      text: Variants;
      progress: Variants;
    };
    main: {
      content: Variants;
      section: Variants;
      grid: Variants;
      card: Variants;
    };
    team: {
      content: Variants;
      textGroup: Variants;
      text: Variants;
      iconGroup: Variants;
      icon: Variants;
      cta: Variants;
    };
  };
}

export const createScreen1Animations = (timings: Screen1Timings): Screen1Animations => {
  const phaseDuration = toSeconds(timings.phaseFade);
  const fadeDuration = toSeconds(timings.fadeDuration);
  const readDelay = toSeconds(timings.readDelay);
  const iconDuration = toSeconds(timings.iconDuration);
  const iconsAfterText = toSeconds(timings.iconsAfterText);
  const iconStaggerStep = toSeconds(timings.iconStagger + timings.iconStaggerBuffer);

  const introStartDelay = 0.016;
  const introStagger = fadeDuration + readDelay;
  const introProgressDuration = 2 * (fadeDuration + readDelay);

  const sectionStagger = readDelay;
  const teamTextStagger = fadeDuration + readDelay;
  const teamIconStartDelay = teamTextStagger + (fadeDuration + readDelay + iconsAfterText);
  const iconSequenceDuration = Math.max(0, TEAM_ICONS.length - 1) * iconStaggerStep;
  const teamCtaDelay = teamIconStartDelay + iconSequenceDuration + iconDuration;

  const fadeUp: Variants = {
    initial: { opacity: 0, y: 24 },
    animate: ({ delay = 0 }: DelayContext = {}) => ({
      opacity: 1,
      y: 0,
      transition: { duration: fadeDuration, ease: EASINGS.text, delay },
    }),
    exit: {
      opacity: 0,
      y: -12,
      transition: { duration: fadeDuration, ease: EASINGS.text },
    },
  };

  const fadeIn: Variants = {
    initial: { opacity: 0 },
    animate: ({ delay = 0 }: DelayContext = {}) => ({
      opacity: 1,
      transition: { duration: fadeDuration, ease: EASINGS.text, delay },
    }),
    exit: {
      opacity: 0,
      transition: { duration: fadeDuration, ease: EASINGS.text },
    },
  };

  const phaseContainer: Variants = {
    initial: { opacity: 0 },
    animate: ({ delay = 0 }: DelayContext = {}) => ({
      opacity: 1,
      transition: { duration: phaseDuration, ease: EASINGS.phase, delay },
    }),
    exit: {
      opacity: 0,
      transition: { duration: phaseDuration, ease: EASINGS.phase },
    },
  };

  return {
    meta: {
      intro: {
        startDelay: introStartDelay,
        stagger: introStagger,
        progressDuration: introProgressDuration,
      },
      main: {
        sectionStagger,
      },
      team: {
        textStagger: teamTextStagger,
        iconStagger: iconStaggerStep,
        iconStartDelay: teamIconStartDelay,
        ctaDelay: teamCtaDelay,
      },
      root: {
        exitDuration: phaseDuration,
      },
    },
    variants: {
      root: {
        initial: { opacity: 0 },
        enter: {
          opacity: 1,
          transition: { duration: phaseDuration, ease: EASINGS.phase },
        },
        exit: {
          opacity: 0,
          transition: { duration: phaseDuration, ease: EASINGS.phase },
        },
      },
      phaseContainer,
      gate: {
        content: {
          initial: {},
          animate: ({ delay = 0 }: DelayContext = {}) => ({
            transition: {
              delayChildren: delay,
              staggerChildren: fadeDuration / 2,
            },
          }),
          exit: {
            transition: { staggerChildren: 0.06, staggerDirection: -1 },
          },
        },
        button: {
          initial: { opacity: 0, y: 24 },
          animate: ({ delay = 0 }: DelayContext = {}) => ({
            opacity: 1,
            y: 0,
            transition: { duration: fadeDuration * 1.1, ease: EASINGS.button, delay },
          }),
          exit: {
            opacity: 0,
            y: -12,
            transition: { duration: fadeDuration, ease: EASINGS.button },
          },
        },
      },
      intro: {
        content: {
          initial: {},
          animate: ({ delay = 0 }: DelayContext = {}) => ({
            transition: {
              delayChildren: delay,
              staggerChildren: introStagger,
            },
          }),
          exit: {
            transition: { staggerChildren: 0.08, staggerDirection: -1 },
          },
        },
        text: fadeUp,
        progress: {
          initial: { scaleX: 0 },
          animate: ({ delay = 0 }: DelayContext = {}) => ({
            scaleX: 1,
            transition: {
              delay,
              duration: introProgressDuration,
              ease: 'linear',
            },
          }),
          exit: {
            scaleX: 1,
          },
        },
      },
      main: {
        content: {
          initial: {},
          animate: ({ delay = 0 }: DelayContext = {}) => ({
            transition: {
              delayChildren: delay,
              staggerChildren: sectionStagger,
            },
          }),
          exit: {
            transition: { staggerChildren: 0.08, staggerDirection: -1 },
          },
        },
        section: fadeIn,
        grid: {
          initial: {},
          animate: {},
          exit: {},
        },
        card: {
          initial: { opacity: 1, y: 0 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 1, y: 0 },
        },
      },
      team: {
        content: {
          initial: {},
          animate: ({ delay = 0 }: DelayContext = {}) => ({
            transition: {
              delayChildren: delay,
              staggerChildren: teamTextStagger,
            },
          }),
          exit: {
            transition: { staggerChildren: 0.08, staggerDirection: -1 },
          },
        },
        textGroup: {
          initial: {},
          animate: {},
          exit: {},
        },
        text: fadeUp,
        iconGroup: {
          initial: {},
          animate: {},
          exit: {},
        },
        icon: {
          initial: { opacity: 0, y: 20, scale: 0.9 },
          animate: ({ delay = 0 }: DelayContext = {}) => ({
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { duration: iconDuration, ease: EASINGS.overshoot, delay },
          }),
          exit: {
            opacity: 0,
            y: -16,
            transition: { duration: iconDuration, ease: EASINGS.text },
          },
        },
        cta: {
          initial: { opacity: 0, y: 16 },
          animate: ({ delay = 0 }: DelayContext = {}) => ({
            opacity: 1,
            y: 0,
            transition: { duration: iconDuration, ease: EASINGS.button, delay },
          }),
          exit: {
            opacity: 0,
            y: 16,
            transition: { duration: iconDuration, ease: EASINGS.button },
          },
        },
      },
    },
  };
};
