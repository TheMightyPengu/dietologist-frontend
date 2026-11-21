import type { ContentLanguage } from "@/components/admin/ContentLanguageSwitch";

export function hasMeaningfulContent(value: unknown): boolean {
  if (typeof value !== "string") return false;
  const text = value
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&[a-z]+;|&#\d+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > 0;
}

export function findMissingContentLanguage(
  greekValues: unknown[],
  englishValues: unknown[],
): ContentLanguage | null {
  const hasGreek = greekValues.some(hasMeaningfulContent);
  const hasEnglish = englishValues.some(hasMeaningfulContent);
  if (hasGreek === hasEnglish) return null;
  return hasGreek ? "en" : "el";
}
