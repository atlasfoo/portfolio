/**
 * Ports the design mock's fallback-timer duration (2600ms) that covers the
 * "observer never fires" sad path (HOME-001): a defensive timer that still
 * reveals content even in an environment that reports observer support but
 * whose observer callback never runs.
 */
export const FALLBACK_REVEAL_MS = 2600;

/**
 * Ports the mock's `observeReveal()` support check
 * (`if (!('IntersectionObserver' in window))`), extended with a
 * reduced-motion preference: 'immediate' when IntersectionObserver is
 * unsupported OR reduced motion is preferred; 'observe' only when both an
 * observer is supported and there is no reduced-motion preference.
 */
export function resolveRevealStrategy(
  hasIntersectionObserver: boolean,
  prefersReducedMotion: boolean,
): 'immediate' | 'observe' {
  if (!hasIntersectionObserver || prefersReducedMotion) return 'immediate';
  return 'observe';
}
