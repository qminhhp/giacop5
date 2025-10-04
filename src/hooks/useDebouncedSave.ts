import { useRef, useCallback } from 'react';

export function useDebouncedSave<T>(
  saveFunction: (data: T) => Promise<void>,
  delay: number = 500
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingSaveRef = useRef<T | null>(null);

  const debouncedSave = useCallback(
    (data: T) => {
      // Store the latest data
      pendingSaveRef.current = data;

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set a new timeout to save after delay
      timeoutRef.current = setTimeout(async () => {
        if (pendingSaveRef.current) {
          try {
            await saveFunction(pendingSaveRef.current);
            pendingSaveRef.current = null;
          } catch (error) {
            console.error('Debounced save error:', error);
          }
        }
      }, delay);
    },
    [saveFunction, delay]
  );

  // Immediate save (bypass debounce)
  const saveImmediately = useCallback(
    async (data: T) => {
      // Clear any pending debounced save
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      pendingSaveRef.current = null;

      try {
        await saveFunction(data);
      } catch (error) {
        console.error('Immediate save error:', error);
      }
    },
    [saveFunction]
  );

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return { debouncedSave, saveImmediately, cleanup };
}
