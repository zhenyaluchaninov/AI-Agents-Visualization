import type { Agent } from './types';

// === Global Motion Primitives (seconds) ===
export const MOTION = {
  // Screen-level transitions
  PHASE_FADE: 0.6,
  FADE: 0.65,
  LINE: 1.2,
  //anim connector lines
  CONNECTOR_LINE: 0.3,

  // Shared element timings
  PANEL_IN: 0.9,
  PANEL_FADE_DELAY: 0.05,
  PANEL_MOVE_DELAY: 0.05,
  AVATAR_IN: 0.7,

  // CTA buttons
  CTA: {
    INTRO_IN: 0.7,
    TEAM_IN: 0.7,
  },

  // Team phase specifics
  TEAM: {
    TITLE_IN: 0.6,
  },

} as const;

// === Phase Sequences (seconds) ===
export const SEQ = {
  INTRO: {
    CARD_MOUNT_DELAY: 0,
    ROLE_TYPE_DELAY: 0.6,
    LEFT_LINE_ARM_DELAY: 0.22,
    CALLOUT1_SHOW_DELAY: 0.16,
    PERSONALITY_TYPE_DELAY: 0.42,
    RIGHT_LINE_ARM_DELAY: 0.22,
    CALLOUT2_SHOW_DELAY: 0.16,
    BTN_MOUNT_DELAY: 0.6,
    SMOOTH_RESIZE_RELEASE_DELAY: 0.45,
  },

  TEAM: {
    TITLE_DELAY: 0,
    CARDS_START_DELAY: 0.1,
    CARD_STAGGER: 0.1,
    CARD_IN_DURATION: 0.8,
    CTA_EXTRA_DELAY: 0.3,
  },
} as const;

// === Easings (Framer Motion cubic-beziers) ===
export const EASE = {
  DEFAULT: [.36,0,.6,.99] as [number, number, number, number],
  PHASE: [0.42, 0.0, 0.58, 1.0] as [number, number, number, number],
  OVERSHOOT: [0.34, 1.56, 0.64, 1.0] as [number, number, number, number],
} as const;

// === Typewriter speeds (ms per character) ===
export const TYPEWRITER = {
  DEFAULT_MS: 50,
  INTRO: {
    ROLE_MS: 50,
    PERSONALITY_MS: 56,
    CALLOUT_MS: 18,
  },
} as const;

export const TEAM_DATA: Agent[] = [
  { role: 'Policy',     personality: 'Visionary',  color: 'visionary' },
  { role: 'Operations', personality: 'Pragmatist', color: 'pragmatist' },
  { role: 'Risk',       personality: 'Cautious',   color: 'cautious' },
  { role: 'Finance',    personality: 'Critic',     color: 'critic' },
  { role: 'Data',       personality: 'Innovator',  color: 'innovator' },
  { role: 'Community',  personality: 'Mediator',   color: 'mediator' },
];
