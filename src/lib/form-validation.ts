import type { ApiFieldErrors } from "@/api/_axios-client";

export function isBlank(value?: string | null): boolean {
  return !value || value.trim().length === 0;
}

export function htmlToPlainText(
  value?: string | null
): string {
  if (!value) {
    return "";
  }

  return value
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

export function isRichTextBlank(
  value?: string | null
): boolean {
  return htmlToPlainText(value).length === 0;
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    value.trim()
  );
}

export function isValidPhone(value: string): boolean {
  return /^\+?\d{10,15}$/.test(value.trim());
}

export function addValidationError(
  errors: ApiFieldErrors,
  field: string,
  message: string
): void {
  errors[field] = [
    ...(errors[field] ?? []),
    message,
  ];
}

export function validateImageFile(
  file: File | null | undefined,
  field: string,
  errors: ApiFieldErrors
): void {
  if (!file) {
    return;
  }

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (!allowedTypes.includes(file.type)) {
    addValidationError(
      errors,
      field,
      "Επιτρέπονται μόνο εικόνες JPG, PNG ή WEBP."
    );
  }

  if (file.size <= 0) {
    addValidationError(
      errors,
      field,
      "Το αρχείο εικόνας είναι κενό."
    );
  }
}

export function validatePdfFile(
  file: File | null | undefined,
  field: string,
  errors: ApiFieldErrors
): void {
  if (!file) {
    return;
  }

  if (file.type !== "application/pdf") {
    addValidationError(
      errors,
      field,
      "Επιτρέπονται μόνο αρχεία PDF."
    );
  }

  if (file.size <= 0) {
    addValidationError(
      errors,
      field,
      "Το αρχείο PDF είναι κενό."
    );
  }
}

export function errorInputClass(
  hasError: boolean,
  normalClassName: string
): string {
  if (!hasError) {
    return normalClassName;
  }

  return `${normalClassName} border-rose-500 focus:border-rose-500 focus:ring-rose-100`;
}