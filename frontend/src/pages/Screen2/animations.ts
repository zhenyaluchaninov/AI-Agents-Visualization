
export const variants = {
  panelIn: {
    hidden: { opacity: 0, y: 28, scale: 0.94 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.9, ease: 'easeInOut' } },
  },
  avatarIn: {
    hidden: { opacity: 0, y: 12, scale: 0.92 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: 'easeInOut' } },
  },
  btnIn: {
    hidden: { opacity: 0, y: 16, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeInOut' } },
  },
  fadeUp: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeInOut' } },
  }
} as const;
