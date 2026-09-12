import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Locale = "en" | "fa";

type Dictionary = Record<string, string>;

// Terminal/code tokens (prompts, filenames, JSON-like keys) are intentionally
// left untranslated in both locales — real shell filenames and command
// output don't get translated either.
const translations: Record<Locale, Dictionary> = {
  en: {
    "hero.tagline": "full-stack developer crafting things for the web",
    "hero.location": "Oslo, Norway",
    "hero.about":
      "I'm a self-taught full-stack developer based in Norway with a strong background in .NET and React. I care about clean, maintainable code and building products that feel great to use — lately I've been diving deep into AI-assisted tooling and modern web architecture.",
    "card.projects.description": "Explore what I've built and what I'm building",
    "card.projects.button": "view projects",
    "card.blogs.description": "Thoughts, guides, and dev explorations",
    "card.blogs.button": "read the blog",
    "card.contact.description": "Let's talk — I'm just one click away",
    "card.contact.button": "get in touch",
    "comingSoon.warning": "nothing here yet — under construction",
    "comingSoon.building": "building",
    "comingSoon.body":
      "Still writing this one. Check back soon — or ping me directly, I don't bite.",
    "nav.toggleMenu": "Toggle menu",
    "nav.siteNavigation": "Site navigation",
    "nav.switchToFa": "Switch to Persian",
    "nav.switchToEn": "Switch to English",
    "avatar.label": "Faramarz — web, AI, and software engineering",
  },
  fa: {
    "hero.tagline": "توسعه‌دهنده full-stack که برای وب چیز می‌سازه",
    "hero.location": "اسلو، نروژ",
    "hero.about":
      "من یه توسعه‌دهنده full-stack خودآموخته‌ام که توی نروژ زندگی می‌کنم و پیشینه‌ی قوی‌ای توی .NET و React دارم. برام مهمه که کد تمیز و قابل‌نگهداری بنویسم و محصولاتی بسازم که استفاده‌کردن باهاشون لذت‌بخش باشه — این روزها هم دارم عمیق‌تر وارد ابزارهای مبتنی‌بر هوش مصنوعی و معماری مدرن وب می‌شم.",
    "card.projects.description": "ببین چی ساختم و دارم چی می‌سازم",
    "card.projects.button": "دیدن پروژه‌ها",
    "card.blogs.description": "فکرها، راهنماها و کندوکاوهای برنامه‌نویسی",
    "card.blogs.button": "خواندن بلاگ",
    "card.contact.description": "بیا حرف بزنیم — فقط یه کلیک باهام فاصله داری",
    "card.contact.button": "در تماس باش",
    "comingSoon.warning": "هنوز چیزی اینجا نیست — در حال ساخته",
    "comingSoon.building": "در حال ساخت",
    "comingSoon.body":
      "هنوز دارم روش کار می‌کنم. یه‌کم دیگه سر بزن — یا مستقیم بهم پیام بده، گاز نمی‌گیرم.",
    "nav.toggleMenu": "باز و بسته کردن منو",
    "nav.siteNavigation": "منوی سایت",
    "nav.switchToFa": "تغییر زبان به فارسی",
    "nav.switchToEn": "تغییر زبان به انگلیسی",
    "avatar.label": "فرامرز — وب، هوش مصنوعی و مهندسی نرم‌افزار",
  },
};

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (key: string) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

const STORAGE_KEY = "iamfara:locale";

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === "undefined") return "en";
    return window.localStorage.getItem(STORAGE_KEY) === "fa" ? "fa" : "en";
  });

  useEffect(() => {
    document.documentElement.lang = locale;
    try {
      window.localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      // localStorage can be unavailable (e.g. private browsing) — losing
      // the saved preference isn't worth failing over.
    }
  }, [locale]);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale: setLocaleState,
      toggleLocale: () =>
        setLocaleState((prev) => (prev === "en" ? "fa" : "en")),
      t: (key: string) => translations[locale][key] ?? key,
    }),
    [locale]
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return ctx;
}

/** Renders a translated string with the right text direction for the current locale. */
export function T({ k, className }: { k: string; className?: string }) {
  const { t, locale } = useLocale();
  return (
    <span dir={locale === "fa" ? "rtl" : undefined} className={className}>
      {t(k)}
    </span>
  );
}
