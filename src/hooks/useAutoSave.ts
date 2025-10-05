import React from "react";
import { useEffect, useRef, useCallback, useState } from "react";
import { toast } from "sonner";
import { useDebounce } from "./useDebounce";

interface UseAutoSaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<void>;
  delay?: number;
  enabled?: boolean;
}

export function useAutoSave<T>({
  data,
  onSave,
  delay = 1000,
  enabled = true,
}: UseAutoSaveOptions<T>) {
  const debouncedData = useDebounce(data, delay);
  const isMounted = useRef(true);
  const lastSavedData = useRef<T>(data);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!enabled || !isMounted.current) return;

    const save = async () => {
      // Skip if data hasn't changed
      if (JSON.stringify(debouncedData) === JSON.stringify(lastSavedData.current)) {
        return;
      }

      setIsSaving(true);
      try {
        await onSave(debouncedData);
        lastSavedData.current = debouncedData;
        toast.success("Auto-saved successfully", {
          duration: 2000,
          position: "top-right",
        });
      } catch (error) {
        console.error("Auto-save failed:", error);
        toast.error("Auto-save failed", {
          duration: 3000,
          position: "top-right",
        });
      } finally {
        if (isMounted.current) {
          setIsSaving(false);
        }
      }
    };

    save();
  }, [debouncedData, enabled, onSave]);

  const forceSave = useCallback(async () => {
    if (!enabled) return;

    setIsSaving(true);
    try {
      await onSave(data);
      lastSavedData.current = data;
      toast.success("Saved successfully");
    } catch (error) {
      console.error("Save failed:", error);
      toast.error("Save failed");
    } finally {
      setIsSaving(false);
    }
  }, [data, enabled, onSave]);

  return { isSaving, forceSave };
}

