export const animations = {
  duration: { fast: 140, normal: 220, slow: 360, celebration: 620 },
  scale: { pressed: 0.97, cardPressed: 0.985, entranceFrom: 0.96, entranceTo: 1 },
  spring: { damping: 16, stiffness: 180, mass: 0.8 },
  easing: { premium: 'cubic-bezier(0.2, 0.8, 0.2, 1)' },
} as const;
