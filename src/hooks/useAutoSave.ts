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
        // Subtle auto-save notification
        toast.success("Draft saved", {
          duration: 1500,
          position: "bottom-right",
          className: "text-xs"
        });
      } catch (error) {
        console.error("Auto-save failed:", error);
        toast.error("Draft save failed", {
          description: "Your changes are still in the form",
          duration: 3000,
          position: "bottom-right",
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

