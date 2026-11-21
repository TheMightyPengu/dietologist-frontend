export function localizedContent(
  locale: string | undefined,
  greekValue?: string | null,
  englishValue?: string | null,
): string {
  if (locale === "en" && englishValue?.trim()) {
    return englishValue;
  }

  return greekValue ?? "";
}
