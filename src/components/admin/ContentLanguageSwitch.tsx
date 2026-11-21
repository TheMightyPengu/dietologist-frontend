export type ContentLanguage = "el" | "en";

type Props = {
  value: ContentLanguage;
  onChange: (language: ContentLanguage) => void;
};

export default function ContentLanguageSwitch({ value, onChange }: Props) {
  return (
    <div
      className="inline-flex rounded-full border border-slate-300 bg-slate-100 p-1"
      role="tablist"
      aria-label="Γλώσσα περιεχομένου"
    >
      {([
        ["el", "Ελληνικά"],
        ["en", "English"],
      ] as const).map(([language, label]) => (
        <button
          key={language}
          type="button"
          role="tab"
          aria-selected={value === language}
          onClick={() => onChange(language)}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            value === language
              ? "bg-[rgb(var(--primary))] text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
