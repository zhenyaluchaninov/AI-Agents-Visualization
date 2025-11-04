export type Screen3Variants = ReturnType<typeof getVariants>;

export const getVariants = (reducedMotion: boolean) => ({
  fadeUp: {
    hidden: { opacity: 0, y: reducedMotion ? 0 : 12 },
    visible: { opacity: 1, y: 0 },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: reducedMotion ? 1 : 0.96 },
    visible: { opacity: 1, scale: 1 },
  },
  pinIn: {
    hidden: { opacity: 0, y: reducedMotion ? 0 : 8, scale: reducedMotion ? 1 : 0.98 },
    visible: { opacity: 1, y: 0, scale: 1 },
  },
  btnIn: {
    hidden: { opacity: 0, y: reducedMotion ? 0 : 12, scale: reducedMotion ? 1 : 0.98 },
    visible: { opacity: 1, y: 0, scale: 1 },
  },
} as const);

