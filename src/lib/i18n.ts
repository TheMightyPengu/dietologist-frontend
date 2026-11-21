import elCommon from "@/locales/el/common.json";
import elHome from "@/locales/el/home.json";
import elUnsubscribe from "@/locales/el/unsubscribe.json";
import elErrors from "@/locales/el/errors.json";
import elServices from "@/locales/el/services.json";
import elSeminars from "@/locales/el/seminars.json";
import elRecipes from "@/locales/el/recipes.json";
import elEbook from "@/locales/el/ebook.json";
import elCeramics from "@/locales/el/ceramics.json";
import elContact from "@/locales/el/contact.json";
import elArticles from "@/locales/el/articles.json";
import enCommon from "@/locales/en/common.json";
import enHome from "@/locales/en/home.json";
import enUnsubscribe from "@/locales/en/unsubscribe.json";
import enErrors from "@/locales/en/errors.json";
import enServices from "@/locales/en/services.json";
import enSeminars from "@/locales/en/seminars.json";
import enRecipes from "@/locales/en/recipes.json";
import enEbook from "@/locales/en/ebook.json";
import enCeramics from "@/locales/en/ceramics.json";
import enContact from "@/locales/en/contact.json";
import enArticles from "@/locales/en/articles.json";

export type Locale = "el" | "en";

const translations = {
  el: {
    common: elCommon,
    home: elHome,
    unsubscribe: elUnsubscribe,
    errors: elErrors,
    services: elServices,
    seminars: elSeminars,
    recipes: elRecipes,
    ebook: elEbook,
    ceramics: elCeramics,
    contact: elContact,
    articles: elArticles,
  },

  en: {
    common: enCommon,
    home: enHome,
    unsubscribe: enUnsubscribe,
    errors: enErrors,
    services: enServices,
    seminars: enSeminars,
    recipes: enRecipes,
    ebook: enEbook,
    ceramics: enCeramics,
    contact: enContact,
    articles: enArticles,
  },
} as const;

export function getTranslations(locale: string | undefined) {
  const selectedLocale: Locale = locale === "en" ? "en" : "el";

  return translations[selectedLocale];
}
