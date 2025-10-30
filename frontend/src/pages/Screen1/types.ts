export type Phase = 'gate' | 'intro' | 'main' | 'team';

export type ProblemId = 'ER' | 'Bus';

export type InsightId = 'perspectives' | 'tensions' | 'opportunities' | 'blindspots';

export type GlowTone = 'glowGold' | 'glowPink' | 'glowGreen' | 'glowPurple' | 'glowBlue';

export type PhaseVisibilityMap = Record<Phase, boolean>;

export interface PhaseTransitionOptions {
  overlapStartMs?: number;
  delayBeforeNext?: number;
  onShown?: () => void;
}

export interface Screen1Timings {
  fadeDuration: number;
  iconDuration: number;
  readDelay: number;
  iconsAfterText: number;
  iconStagger: number;
  phaseFade: number;
  introOverlap: number;
  exitFallback: number;
  iconStaggerBuffer: number;
}

export interface TeamSequenceState {
  headlineVisible: boolean;
  sublineVisible: boolean;
  visibleIcons: number;
  ctaVisible: boolean;
}
