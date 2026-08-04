// hooks index

import { useState, useEffect } from 'react';
import { useApp } from './useApp';

export { useApp };

// typed hook for accessing the app context
export function useAppContext() {
  return useApp();
}

/**
 * Animated count-up hook for dashboard metric cards.
 * Eases from 0 to target value over duration ms.
 */
export function useCountUp(
  target: number,
  duration = 1200,
  enabled = true
): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!enabled || typeof target !== 'number' || isNaN(target)) {
      setValue(target);
      return;
    }

    const start = Date.now();

    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [target, duration, enabled]);

  return value;
}

/**
 * Debounced value hook.
 */
export function useDebounce<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(handler);
  }, [value, delayMs]);

  return debounced;
}

/**
 * Click-outside detection hook.
 */
export function useClickOutside(
  ref: React.RefObject<HTMLElement | null>,
  handler: () => void
): void {
  useEffect(() => {
    const listener = (event: MouseEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) return;
      handler();
    };

    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, [ref, handler]);
}

/**
 * Auto-dismiss toast message hook.
 */
export function useToastTimer<T>(
  value: T | null,
  setter: (v: T | null) => void,
  duration = 4000
): void {
  useEffect(() => {
    if (value) {
      const timer = setTimeout(() => setter(null), duration);
      return () => clearTimeout(timer);
    }
  }, [value, setter, duration]);
}

/**
 * Scroll lock hook for modals.
 */
export function useScrollLock(isLocked: boolean): void {
  useEffect(() => {
    if (isLocked) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isLocked]);
}
