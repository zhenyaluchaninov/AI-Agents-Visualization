export type Variants = ReturnType<typeof getVariants>;

export function getVariants(reducedMotion: boolean) {
  return {
    panelIn: {
      hidden: { opacity: 0, y: reducedMotion ? 0 : 28, scale: reducedMotion ? 1 : 0.94 },
      visible: { opacity: 1, y: 0, scale: 1 },
    },
    avatarIn: {
      hidden: { opacity: 0, y: reducedMotion ? 0 : 12, scale: reducedMotion ? 1 : 0.92 },
      visible: { opacity: 1, y: 0, scale: 1 },
    },
    btnIn: {
      hidden: { opacity: 0, y: reducedMotion ? 0 : 16, scale: reducedMotion ? 1 : 0.98 },
      visible: { opacity: 1, y: 0, scale: 1 },
      exit: { opacity: 0, y: reducedMotion ? 0 : 8, scale: reducedMotion ? 1 : 0.98 },
    },
    fadeUp: {
      hidden: { opacity: 0, y: reducedMotion ? 0 : 20 },
      visible: { opacity: 1, y: 0 },
    },
    calloutIn: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
      exit: { opacity: 0 },
    },
    agentCardIn: {
      hidden: { opacity: 0, y: reducedMotion ? 0 : 20, scale: reducedMotion ? 1 : 0.95 },
      visible: { opacity: 1, y: 0, scale: 1 },
    },
  } as const;
}
