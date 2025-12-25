import { useEffect, useRef, useCallback } from "react";

// Simple debounce implementation with cancel method
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debounced = (...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => func(...args), delay);
  };

  debounced.cancel = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  return debounced as any;
}

interface AutoSaveOptions {
  data: any;
  onSave: (data: any) => Promise<void>;
  delay?: number;
  enabled?: boolean;
}

export function useAutoSave({ 
  data, 
  onSave, 
  delay = 1000, 
  enabled = true 
}: AutoSaveOptions) {
  const previousDataRef = useRef(data);
  const isSavingRef = useRef(false);

  // Debounced save function
  const debouncedSave = useRef(
    debounce(async (dataToSave: any) => {
      if (isSavingRef.current) return;
      
      isSavingRef.current = true;
      try {
        await onSave(dataToSave);
      } catch (error) {
        console.error("Auto-save failed:", error);
      } finally {
        isSavingRef.current = false;
      }
    }, delay)
  ).current;

  useEffect(() => {
    if (!enabled) return;

    // Check if data has actually changed
    if (JSON.stringify(data) !== JSON.stringify(previousDataRef.current)) {
      previousDataRef.current = data;
      debouncedSave(data);
    }

    // Cleanup
    return () => {
      debouncedSave.cancel();
    };
  }, [data, enabled, debouncedSave]);

  // Force save function for immediate save
  const forceSave = async () => {
    debouncedSave.cancel();
    if (!isSavingRef.current) {
      isSavingRef.current = true;
      try {
        await onSave(data);
      } catch (error) {
        console.error("Force save failed:", error);
      } finally {
        isSavingRef.current = false;
      }
    }
  };

  return { isSaving: isSavingRef.current, forceSave };
}
