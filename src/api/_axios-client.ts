import axios, { AxiosError } from "axios";
import { clearAdminToken, getAdminToken } from "@/lib/admin-auth";

// To test if it is connected, visit:
// http://localhost:3000/dev/api-smoke

const baseURL = (() => {
  if (typeof window === "undefined") {
    return (
      process.env.API_URL_INTERNAL ||
      "http://host.docker.internal:8088/api"
    );
  }

  return (
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8088/api"
  );
})();

export const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  const token = getAdminToken();

  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      typeof window !== "undefined" &&
      window.location.pathname.startsWith("/dashboard") &&
      window.location.pathname !== "/dashboard/login"
    ) {
      clearAdminToken();

      const next =
        `${window.location.pathname}${window.location.search}`;

      window.location.href =
        `/dashboard/login?next=${encodeURIComponent(next)}`;
    }

    return Promise.reject(error);
  }
);

export type ApiFieldErrors = Record<string, string[]>;

export type ApiErrorResponse = {
  status?: number;
  code?: string;
  error?: string;
  message?: string;
  fieldErrors?: ApiFieldErrors;
};

export type ApiError = {
  status: number;
  code: string | null;
  title: string;
  message: string;
  fieldErrors: ApiFieldErrors;
  details?: unknown;
};

const DEFAULT_ERROR_MESSAGE =
  "Παρουσιάστηκε κάποιο πρόβλημα. Παρακαλώ δοκιμάστε ξανά.";

const NETWORK_ERROR_MESSAGE =
  "Δεν ήταν δυνατή η σύνδεση με τον διακομιστή. Ελέγξτε τη σύνδεσή σας και δοκιμάστε ξανά.";

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function normalizeFieldName(field: string): string {
  const cleanField = field.includes(".")
    ? field.split(".").at(-1) ?? field
    : field;

  if (!cleanField) {
    return "form";
  }

  return (
    cleanField.charAt(0).toLowerCase() +
    cleanField.slice(1)
  );
}

function normalizeMessages(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter(
        (item): item is string =>
          typeof item === "string" &&
          item.trim().length > 0
      )
      .map((item) => item.trim());
  }

  if (
    typeof value === "string" &&
    value.trim().length > 0
  ) {
    return [value.trim()];
  }

  return [];
}

function normalizeFieldErrors(
  value: unknown
): ApiFieldErrors {
  if (!isRecord(value)) {
    return {};
  }

  const result: ApiFieldErrors = {};

  for (const [field, messages] of Object.entries(value)) {
    const normalizedMessages =
      normalizeMessages(messages);

    if (normalizedMessages.length === 0) {
      continue;
    }

    const normalizedField =
      normalizeFieldName(field);

    result[normalizedField] = [
      ...(result[normalizedField] ?? []),
      ...normalizedMessages,
    ];
  }

  return result;
}

/**
 * Supports the new backend format:
 *
 * {
 *   status: 400,
 *   code: "validation_error",
 *   error: "Validation failed",
 *   message: "...",
 *   fieldErrors: {
 *     title: ["Title is required."]
 *   }
 * }
 *
 * It also temporarily supports older ASP.NET validation responses:
 *
 * {
 *   title: "One or more validation errors occurred.",
 *   errors: {
 *     Title: ["Title is required."]
 *   }
 * }
 */
function parseResponseData(
  data: unknown
): Partial<ApiError> {
  if (!isRecord(data)) {
    return {};
  }

  const status =
    typeof data.status === "number"
      ? data.status
      : undefined;

  const code =
    typeof data.code === "string"
      ? data.code
      : null;

  const title =
    typeof data.error === "string"
      ? data.error
      : typeof data.title === "string"
        ? data.title
        : undefined;

  const message =
    typeof data.message === "string"
      ? data.message
      : typeof data.title === "string"
        ? data.title
        : undefined;

  const newFieldErrors =
    normalizeFieldErrors(data.fieldErrors);

  const legacyFieldErrors =
    normalizeFieldErrors(data.errors);

  return {
    status,
    code,
    title,
    message,
    fieldErrors: {
      ...legacyFieldErrors,
      ...newFieldErrors,
    },
  };
}

function getStatusMessage(status: number): string {
  switch (status) {
    case 400:
      return "Τα στοιχεία που δώσατε δεν είναι έγκυρα.";
    case 401:
      return "Η σύνδεσή σας έχει λήξει. Παρακαλώ συνδεθείτε ξανά.";
    case 403:
      return "Δεν έχετε δικαίωμα να εκτελέσετε αυτή την ενέργεια.";
    case 404:
      return "Το στοιχείο που ζητήσατε δεν βρέθηκε.";
    case 409:
      return "Η ενέργεια δεν μπορεί να ολοκληρωθεί λόγω σύγκρουσης με τα υπάρχοντα δεδομένα.";
    case 413:
      return "Το αρχείο που επιλέξατε είναι πολύ μεγάλο.";
    case 415:
      return "Ο τύπος του αρχείου δεν υποστηρίζεται.";
    case 500:
      return "Παρουσιάστηκε πρόβλημα στον διακομιστή. Παρακαλώ δοκιμάστε ξανά αργότερα.";
    default:
      return DEFAULT_ERROR_MESSAGE;
  }
}

export const toApiError = (
  error: unknown
): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError =
      error as AxiosError<unknown>;

    const status =
      axiosError.response?.status ?? 0;

    const parsed =
      parseResponseData(
        axiosError.response?.data
      );

    const hasResponse =
      axiosError.response !== undefined;

    return {
      status,
      code: parsed.code ?? null,
      title:
        parsed.title ??
        (status === 0
          ? "Αδυναμία σύνδεσης"
          : "Παρουσιάστηκε πρόβλημα"),
      message:
        parsed.message ??
        (hasResponse
          ? getStatusMessage(status)
          : NETWORK_ERROR_MESSAGE),
      fieldErrors:
        parsed.fieldErrors ?? {},
      details:
        axiosError.response?.data,
    };
  }

  if (error instanceof Error) {
    return {
      status: 0,
      code: null,
      title: "Παρουσιάστηκε πρόβλημα",
      message:
        error.message ||
        DEFAULT_ERROR_MESSAGE,
      fieldErrors: {},
      details: error,
    };
  }

  return {
    status: 0,
    code: null,
    title: "Παρουσιάστηκε πρόβλημα",
    message: DEFAULT_ERROR_MESSAGE,
    fieldErrors: {},
    details: error,
  };
};

export function getFieldErrors(
  error: unknown
): ApiFieldErrors {
  return toApiError(error).fieldErrors;
}

export function getFirstFieldError(
  fieldErrors: ApiFieldErrors,
  fieldName: string
): string | null {
  return fieldErrors[fieldName]?.[0] ?? null;
}

export function hasFieldError(
  fieldErrors: ApiFieldErrors,
  fieldName: string
): boolean {
  return (
    (fieldErrors[fieldName]?.length ?? 0) > 0
  );
}

export function removeFieldError(
  fieldErrors: ApiFieldErrors,
  fieldName: string
): ApiFieldErrors {
  if (!fieldErrors[fieldName]) {
    return fieldErrors;
  }

  const nextErrors = {
    ...fieldErrors,
  };

  delete nextErrors[fieldName];

  return nextErrors;
}

export function toMediaUrl(
  path?: string | null
): string {
  if (!path) {
    return "";
  }

  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:") ||
    path.startsWith("blob:")
  ) {
    return path;
  }

  const mediaBaseUrl =
    process.env.NEXT_PUBLIC_MEDIA_URL ||
    "http://localhost:8088";

  return `${mediaBaseUrl.replace(/\/$/, "")}/${path.replace(
    /^\//,
    ""
  )}`;
}