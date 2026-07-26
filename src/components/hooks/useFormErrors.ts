import { useCallback, useState } from "react";
import {
  removeFieldError,
  toApiError,
  type ApiError,
  type ApiFieldErrors,
} from "@/api/_axios-client";

type GeneralErrorState = {
  title: string;
  message: string;
} | null;

export function useFormErrors() {
  const [fieldErrors, setFieldErrors] =
    useState<ApiFieldErrors>({});

  const [generalError, setGeneralError] =
    useState<GeneralErrorState>(null);

  const clearAllErrors = useCallback(() => {
    setFieldErrors({});
    setGeneralError(null);
  }, []);

  const clearFieldError = useCallback(
    (fieldName: string) => {
      setFieldErrors((current) =>
        removeFieldError(current, fieldName)
      );
    },
    []
  );

  const addFieldError = useCallback(
    (fieldName: string, message: string) => {
      setFieldErrors((current) => ({
        ...current,
        [fieldName]: [message],
      }));
    },
    []
  );

  const applyFrontendErrors = useCallback(
    (errors: ApiFieldErrors) => {
      setFieldErrors(errors);
      setGeneralError(null);

      return Object.keys(errors).length === 0;
    },
    []
  );

  const applyApiError = useCallback(
    (
      error: unknown,
      fallbackMessage =
        "Δεν ήταν δυνατή η ολοκλήρωση της ενέργειας."
    ): ApiError => {
      const parsed = toApiError(error);

      setFieldErrors(parsed.fieldErrors);

      const hasFieldErrors =
        Object.keys(parsed.fieldErrors).length > 0;

      /*
       * Validation errors appear under the fields.
       * A popup is only shown when there is also a useful general error,
       * or when no field-specific errors exist.
       */
      if (!hasFieldErrors || parsed.status !== 400) {
        setGeneralError({
          title: parsed.title,
          message: parsed.message || fallbackMessage,
        });
      } else {
        setGeneralError(null);
      }

      return parsed;
    },
    []
  );

  const showGeneralError = useCallback(
    (
      message: string,
      title = "Παρουσιάστηκε πρόβλημα"
    ) => {
      setGeneralError({
        title,
        message,
      });
    },
    []
  );

  const closeGeneralError = useCallback(() => {
    setGeneralError(null);
  }, []);

  return {
    fieldErrors,
    setFieldErrors,
    generalError,
    clearAllErrors,
    clearFieldError,
    addFieldError,
    applyFrontendErrors,
    applyApiError,
    showGeneralError,
    closeGeneralError,
  };
}