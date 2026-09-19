import { useDebounce as useDebouncePackage } from 'use-debounce';

/**
 * A custom hook for debouncing values.
 * Wraps the use-debounce package for a cleaner interface.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue] = useDebouncePackage(value, delay);
  return debouncedValue;
}
