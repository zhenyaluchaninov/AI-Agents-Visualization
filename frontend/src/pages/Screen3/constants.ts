export const S3 = {
  TIMING: {
    TITLE: { DELAY: 0.2, DURATION: 0.32 },
    SUBTITLE: { OFFSET_FROM_TITLE: 0.08, DURATION: 0.32 },
    VIEWPORT: { DELAY: 0.28, DURATION: 0.6 },
    AGENTS: {
      START: 0.9,
    STAGGER: 0.15,
    LABEL_DURATION: 0.32,
    PIN_DELAY_OFFSET: 0.04,
    PIN_DURATION: 0.28,
  },
  CTA: { AFTER_LAST_PIN: 0.7, DURATION: 0.6 },
  EDGE_SWEEP_AFTER_PINS: 1.5,
  },
  CHAT: {
    ICON_TO_TYPING_MS: 200,
    TYPING_DURATION_MS: 640,
    POST_MESSAGE_DELAY_MS: 220,
  },
  PIN: {
    SIZE: 36,
    ICON: 29,
  },
  EASE: {
    DEFAULT: [0.22, 1, 0.36, 1] as [number, number, number, number],
    SOFT: [0.36, 0, 0.6, 0.99] as [number, number, number, number],
  },
} as const;

export type AgentMeta = {
  id: string;
  name: string;
  color: string;
};

export const S3_AGENTS: AgentMeta[] = [
  { id: 'A1', name: 'Research', color: '#9d8ed4' },
  { id: 'A2', name: 'Strategy', color: '#6ab59d' },
  { id: 'A3', name: 'Design', color: '#ff9d5c' },
  { id: 'A4', name: 'Product', color: '#7dd3c0' },
  { id: 'A5', name: 'Engineer', color: '#6ba3d4' },
  { id: 'A6', name: 'Ops', color: '#ff6b6b' },
] as const;

export type AgentEdge = {
  id: string;
  from: string;
  to: string;
};

export const S3_EDGES = [
  { id: 'E1', from: 'A1', to: 'A3' },
  { id: 'E2', from: 'A1', to: 'A4' },
  { id: 'E3', from: 'A2', to: 'A5' },
  { id: 'E4', from: 'A2', to: 'A6' },
  { id: 'E5', from: 'A3', to: 'A5' },
  { id: 'E6', from: 'A4', to: 'A6' },
  { id: 'E7', from: 'A5', to: 'A6' },
] as const;
