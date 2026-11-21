import { useCallback, useRef, useState } from "react";
import { findMissingContentLanguage } from "@/lib/bilingual-content";
import type { ContentLanguage } from "./ContentLanguageSwitch";

export function useBilingualSaveGuard(
  setLanguage: (language: ContentLanguage) => void,
) {
  const [missingLanguage, setMissingLanguage] = useState<ContentLanguage | null>(null);
  const pendingSave = useRef<(() => void | Promise<void>) | null>(null);

  const requestSave = useCallback((
    greekValues: unknown[],
    englishValues: unknown[],
    save: () => void | Promise<void>,
    shouldWarn = true,
  ) => {
    const missing = shouldWarn
      ? findMissingContentLanguage(greekValues, englishValues)
      : null;
    if (!missing) {
      void save();
      return;
    }
    pendingSave.current = save;
    setMissingLanguage(missing);
  }, []);

  const cancel = useCallback(() => {
    pendingSave.current = null;
    setMissingLanguage(null);
  }, []);

  const continueEditing = useCallback(() => {
    if (missingLanguage) setLanguage(missingLanguage);
    cancel();
    window.setTimeout(() => {
      document.querySelector<HTMLElement>("[data-bilingual-form]")?.focus();
    }, 0);
  }, [cancel, missingLanguage, setLanguage]);

  const saveAnyway = useCallback(async () => {
    const save = pendingSave.current;
    cancel();
    await save?.();
  }, [cancel]);

  return {
    requestSave,
    warningProps: {
      open: missingLanguage !== null,
      missingLanguage,
      onContinueEditing: continueEditing,
      onSaveAnyway: saveAnyway,
      onCancel: cancel,
    },
  };
}
