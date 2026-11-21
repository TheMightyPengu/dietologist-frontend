import { useRouter } from "next/router";
import { getTranslations } from "@/lib/i18n";

export function useTranslations() {
  const router = useRouter();

  return getTranslations(router.locale);
}