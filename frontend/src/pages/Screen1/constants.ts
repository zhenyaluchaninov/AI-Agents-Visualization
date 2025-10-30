import type { InsightId, ProblemId, Screen1Timings, GlowTone } from './types';
import type { ComponentType, SVGProps } from 'react';
import {
  ProblemIconBus,
  ProblemIconER,
  InsightIconBlindspots,
  InsightIconOpportunities,
  InsightIconPerspectives,
  InsightIconTensions,
  TeamIconBlue,
  TeamIconGold,
  TeamIconGreen,
  TeamIconPink,
  TeamIconPurple,
} from './ui/IconGraphics';

export const CSS_TIMING_VARS = {
  fadeDuration: '--fade-duration',
  iconDuration: '--icon-duration',
  readDelay: '--read-delay',
  iconsAfterText: '--icons-after-text',
  iconStagger: '--icon-stagger',
  phaseFade: '--phase-fade',
  introOverlap: '--intro-overlap',
};

const DEFAULT_TIMINGS: Screen1Timings = {
  fadeDuration: 600,
  iconDuration: 450,
  readDelay: 1300,
  iconsAfterText: 500,
  iconStagger: 100,
  phaseFade: 600,
  introOverlap: 150,
  exitFallback: 600,
  iconStaggerBuffer: 80,
};

const toMilliseconds = (value?: string | null) => {
  if (!value) return 0;
  const trimmed = value.toString().trim();
  if (trimmed.endsWith('ms')) return Number.parseFloat(trimmed);
  if (trimmed.endsWith('s')) return Number.parseFloat(trimmed) * 1000;
  const numeric = Number.parseFloat(trimmed);
  return Number.isNaN(numeric) ? 0 : numeric;
};

const cachedTimings: { current: Screen1Timings | null } = { current: null };

export const readScreen1Timings = (root?: HTMLElement | null): Screen1Timings => {
  const source = root ?? document.documentElement;
  const styles = getComputedStyle(source);

  const timings: Screen1Timings = {
    fadeDuration: toMilliseconds(styles.getPropertyValue(CSS_TIMING_VARS.fadeDuration)) || DEFAULT_TIMINGS.fadeDuration,
    iconDuration: toMilliseconds(styles.getPropertyValue(CSS_TIMING_VARS.iconDuration)) || DEFAULT_TIMINGS.iconDuration,
    readDelay: toMilliseconds(styles.getPropertyValue(CSS_TIMING_VARS.readDelay)) || DEFAULT_TIMINGS.readDelay,
    iconsAfterText: toMilliseconds(styles.getPropertyValue(CSS_TIMING_VARS.iconsAfterText)) || DEFAULT_TIMINGS.iconsAfterText,
    iconStagger: toMilliseconds(styles.getPropertyValue(CSS_TIMING_VARS.iconStagger)) || DEFAULT_TIMINGS.iconStagger,
    phaseFade: toMilliseconds(styles.getPropertyValue(CSS_TIMING_VARS.phaseFade)) || DEFAULT_TIMINGS.phaseFade,
    introOverlap: toMilliseconds(styles.getPropertyValue(CSS_TIMING_VARS.introOverlap)) || DEFAULT_TIMINGS.introOverlap,
    exitFallback: DEFAULT_TIMINGS.exitFallback,
    iconStaggerBuffer: DEFAULT_TIMINGS.iconStaggerBuffer,
  };

  cachedTimings.current = timings;
  return timings;
};

export const MAIN_PHASE_DELAY_BEFORE_NEXT = 300;

export const TEAM_ICON_COUNT = 5;

export interface ProblemDefinition {
  id: ProblemId;
  title: string;
  description: string;
  gradient: string;
  glow: GlowTone;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

export const PROBLEM_DEFINITIONS: ProblemDefinition[] = [
  {
    id: 'ER',
    title: 'Emergency Room overload',
    description:
      "Urban hospital faces peak-time bottlenecks. Patients wait too long, staff rotate poorly, beds don't free fast enough. We want near-term changes we can pilot without new budget.",
    gradient: 'linear-gradient(135deg,#d8c9ff,#e8deff)',
    glow: 'glowPurple',
    icon: ProblemIconER,
  },
  {
    id: 'Bus',
    title: 'Winter bus delays',
    description:
      'Mid-size bus network struggles with cold starts, plowing and bunching. We need street-level fixes -- depots, routing and rider comms -- under existing constraints.',
    gradient: 'linear-gradient(135deg,#b3d9ff,#c8e5ff)',
    glow: 'glowBlue',
    icon: ProblemIconBus,
  },
];

export interface InsightDefinition {
  id: InsightId;
  title: string;
  description: string;
  gradient: string;
  glow: GlowTone;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

export const INSIGHT_DEFINITIONS: InsightDefinition[] = [
  {
    id: 'perspectives',
    title: 'Perspectives',
    description: 'Different lenses that reframe what to pay attention to',
    gradient: 'linear-gradient(135deg,#ffe4a3,#ffecb8)',
    glow: 'glowGold',
    icon: InsightIconPerspectives,
  },
  {
    id: 'tensions',
    title: 'Tensions',
    description: 'Productive trade-offs the team will explore together',
    gradient: 'linear-gradient(135deg,#ffb5cc,#ffc8db)',
    glow: 'glowPink',
    icon: InsightIconTensions,
  },
  {
    id: 'opportunities',
    title: 'Opportunities',
    description: 'Near-term ideas for low-cost pilots (no new budget)',
    gradient: 'linear-gradient(135deg,#b5e4d3,#c8f0e3)',
    glow: 'glowGreen',
    icon: InsightIconOpportunities,
  },
  {
    id: 'blindspots',
    title: 'Blind Spots',
    description: 'Key questions to guide your next conversation',
    gradient: 'linear-gradient(135deg,#d8c9ff,#e8deff)',
    glow: 'glowPurple',
    icon: InsightIconBlindspots,
  },
];

export interface TeamIconDefinition {
  gradient: string;
  glow: GlowTone;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

export const TEAM_ICONS: TeamIconDefinition[] = [
  {
    gradient: 'linear-gradient(135deg,#ffe4a3,#ffecb8)',
    glow: 'glowGold',
    icon: TeamIconGold,
  },
  {
    gradient: 'linear-gradient(135deg,#ffb5cc,#ffc8db)',
    glow: 'glowPink',
    icon: TeamIconPink,
  },
  {
    gradient: 'linear-gradient(135deg,#b5e4d3,#c8f0e3)',
    glow: 'glowGreen',
    icon: TeamIconGreen,
  },
  {
    gradient: 'linear-gradient(135deg,#d8c9ff,#e8deff)',
    glow: 'glowPurple',
    icon: TeamIconPurple,
  },
  {
    gradient: 'linear-gradient(135deg,#b3d9ff,#c8e5ff)',
    glow: 'glowBlue',
    icon: TeamIconBlue,
  },
];
