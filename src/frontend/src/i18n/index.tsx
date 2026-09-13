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
      "I'm a full-stack web developer with over 10 years of experience in software development. I work with ASP.NET Core and C# on the backend, and React and TypeScript on the frontend.",
    "hero.about2":
      "I'm curious by nature: I enjoy exploring new technologies and understanding how things work under the hood. I learn best by building, experimenting, and learning from mistakes. When I commit to something, I stick with it and see it through.",
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
    "contact.heading": "Let's build something together.",
    "contact.intro":
      "Got a project, a question, or just want to say hi? Send me a message — I read every one.",
    "contact.form.name.placeholder": "Ada Lovelace",
    "contact.form.email.placeholder": "you@example.com",
    "contact.form.message.placeholder": "What's on your mind?",
    "contact.form.submit": "Send message",
    "contact.form.sending": "Sending",
    "contact.form.success": "Message sent. I'll get back to you soon.",
    "contact.form.error":
      "Something went wrong. Please try again, or email me directly.",
    "contact.form.error.rateLimit":
      "Too many messages for now — please try again in a bit.",
    "contact.form.validation.name": "Please enter your name.",
    "contact.form.validation.email": "Please enter a valid email address.",
    "contact.form.validation.message":
      "Tell me a bit more — at least 10 characters.",
    "contact.alt": "Prefer another way? Find me here too:",
  },
  fa: {
    "hero.tagline": "توسعه‌دهنده full-stack که برای وب چیز می‌سازه",
    "hero.location": "اسلو، نروژ",
    "hero.about":
      "من یه توسعه‌دهنده وب full-stack هستم با بیش از ۱۰ سال تجربه توی توسعه نرم‌افزار. توی بک‌اند با ASP.NET Core و C# کار می‌کنم و توی فرانت‌اند با React و TypeScript.",
    "hero.about2":
      "کنجکاوی جزو ذاتمه: از کشف تکنولوژی‌های جدید و فهمیدن اینکه زیر پوستشون چه خبره لذت می‌برم. بهترین یادگیریم از طریق ساختن، آزمایش‌کردن و یادگرفتن از اشتباهاته. وقتی به چیزی متعهد می‌شم، تا آخرش پیش می‌رم.",
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
    "contact.heading": "بیا با هم یه چیزی بسازیم.",
    "contact.intro":
      "پروژه‌ای داری، سوالی داری، یا فقط می‌خوای سلام کنی؟ برام پیام بذار — همه‌شونو می‌خونم.",
    "contact.form.name.placeholder": "مثلاً: سارا محمدی",
    "contact.form.email.placeholder": "you@example.com",
    "contact.form.message.placeholder": "چی تو ذهنته؟",
    "contact.form.submit": "ارسال پیام",
    "contact.form.sending": "در حال ارسال",
    "contact.form.success": "پیام ارسال شد. به‌زودی جواب می‌دم.",
    "contact.form.error":
      "یه مشکلی پیش اومد. دوباره امتحان کن یا مستقیم برام ایمیل بزن.",
    "contact.form.error.rateLimit":
      "فعلاً پیام زیاد فرستادی — یه‌کم دیگه دوباره امتحان کن.",
    "contact.form.validation.name": "لطفاً اسمت رو بنویس.",
    "contact.form.validation.email": "لطفاً یه ایمیل معتبر بنویس.",
    "contact.form.validation.message": "یه‌کم بیشتر بنویس — حداقل ۱۰ کاراکتر.",
    "contact.alt": "یه راه دیگه رو ترجیح می‌دی؟ اینجاها هم پیدام می‌کنی:",
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

/**
 * The `dir` to set on a block-level element (paragraph, button, etc.) that
 * holds translated prose, so it's actually right-aligned and reads in the
 * correct order for Persian — an inline dir on a nested span isn't enough
 * once the text wraps across multiple lines.
 */
export function dirFor(locale: Locale) {
  return locale === "fa" ? "rtl" : "ltr";
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
