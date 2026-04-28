import type { Dictionary } from "./types";
import en from "./locales/en";
import ptBR from "./locales/pt-BR";
import de from "./locales/de";
import es from "./locales/es";
import zh from "./locales/zh";
import fr from "./locales/fr";
import it from "./locales/it";

export const locales = {
  en: { name: "English", dict: en },
  "pt-BR": { name: "Português (Brasil)", dict: ptBR },
  de: { name: "Deutsch", dict: de },
  es: { name: "Español", dict: es },
  zh: { name: "中文", dict: zh },
  fr: { name: "Français", dict: fr },
  it: { name: "Italiano", dict: it },
} as const;

export type LocaleId = keyof typeof locales;

const STORAGE_KEY = "glazewm-editor.locale";

const LOCALE_IDS: LocaleId[] = ["en", "pt-BR", "de", "es", "zh", "fr", "it"];

function isLocaleId(v: string): v is LocaleId {
  return (LOCALE_IDS as string[]).includes(v);
}

/** Best-effort match of a `navigator.language` tag against our locales. */
function detectLocale(): LocaleId {
  if (typeof navigator === "undefined") return "en";
  const tag = (navigator.language ?? "en").toLowerCase();
  if (tag.startsWith("pt")) return "pt-BR";
  if (tag.startsWith("de")) return "de";
  if (tag.startsWith("es")) return "es";
  if (tag.startsWith("fr")) return "fr";
  if (tag.startsWith("it")) return "it";
  if (tag.startsWith("zh")) return "zh";
  return "en";
}

function loadInitial(): LocaleId {
  if (typeof window === "undefined") return "en";
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved && isLocaleId(saved)) return saved;
  } catch {
    // localStorage unavailable — fall through
  }
  return detectLocale();
}

class I18nStore {
  current = $state<LocaleId>(loadInitial());
  t: Dictionary = $derived(locales[this.current].dict);

  setLocale(id: LocaleId) {
    this.current = id;
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(STORAGE_KEY, id);
      } catch {
        // Ignore storage failures (private mode, quota, etc.)
      }
    }
  }
}

export const i18n = new I18nStore();
