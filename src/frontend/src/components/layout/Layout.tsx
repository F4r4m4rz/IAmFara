import { SquareTerminal, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { Link, useLocation } from "react-router-dom";
import { EnglandFlag } from "../icons/EnglandFlag";
import { IranLionSunFlag } from "../icons/IranLionSunFlag";
import { useLocale } from "../../i18n";

type Props = {
  children: React.ReactNode;
};

const navItems = [
  { label: "home", path: "/" },
  { label: "projects", path: "/projects" },
  { label: "blogs", path: "/blogs" },
  { label: "contact", path: "/contact" },
];

export default function Layout({ children }: Props) {
  const collapseNav = useMediaQuery({
    query: "(max-width: 800px)",
  });

  return (
    <div className="min-h-screen bg-term-bg text-term-text font-mono">
      {/* Titlebar */}
      <nav className="min-h-14 bg-term-panel/95 backdrop-blur-sm border-b border-term-border flex items-center justify-between px-4 sm:px-6 pt-[env(safe-area-inset-top)] sticky top-0 z-20">
        {/* Left (traffic lights + path) */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="hidden sm:flex items-center gap-1.5 shrink-0">
            <span className="w-3 h-3 rounded-full bg-term-pink" />
            <span className="w-3 h-3 rounded-full bg-term-orange" />
            <span className="w-3 h-3 rounded-full bg-term-green" />
          </div>
          <Link
            to="/"
            className="text-sm sm:text-base font-semibold tracking-tight text-term-text truncate"
          >
            <span className="text-term-green">faramarz</span>
            <span className="text-term-muted">@</span>
            <span className="text-term-blue">iamfara</span>
            <span className="text-term-muted">:~$</span>
          </Link>
        </div>
        {/* NavBar */}
        <div className="flex items-center gap-3">
          <LanguageToggle />
          {collapseNav ? <CollapsedNavBar /> : <ListNavBar />}
        </div>
      </nav>
      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 py-10">{children}</main>
    </div>
  );
}

function LanguageToggle() {
  const { locale, toggleLocale, t } = useLocale();

  return (
    <button
      onClick={toggleLocale}
      aria-label={locale === "en" ? t("nav.switchToFa") : t("nav.switchToEn")}
      className="flex items-center justify-center w-9 h-9 rounded border border-term-border bg-term-bg hover:border-term-green transition-colors overflow-hidden"
    >
      {locale === "en" ? (
        <IranLionSunFlag className="w-5 h-3.5 rounded-[1px]" />
      ) : (
        <EnglandFlag className="w-5 h-3.5 rounded-[1px]" />
      )}
    </button>
  );
}

function ListNavBar() {
  const location = useLocation();
  return (
    <ul className="flex gap-6 text-sm">
      {navItems.map((item) => (
        <li key={item.path}>
          <Link
            to={item.path}
            className={`transition-colors duration-200 hover:text-term-green ${
              location.pathname === item.path
                ? "text-term-green font-semibold"
                : "text-term-muted"
            }`}
          >
            <span className="text-term-border">./</span>
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

const menuId = "mobile-nav-menu";

function CollapsedNavBar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { t } = useLocale();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onPointerDown = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <div className="flex items-center gap-4 relative" ref={containerRef}>
      <button
        ref={buttonRef}
        className="flex items-center justify-center w-9 h-9 rounded border border-term-border bg-term-bg text-term-text hover:border-term-green hover:text-term-green transition-colors focus:outline-none"
        onClick={() => setOpen((o) => !o)}
        aria-label={t("nav.toggleMenu")}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={menuId}
      >
        {open ? (
          <X className="w-5 h-5" />
        ) : (
          <SquareTerminal className="w-5 h-5" />
        )}
      </button>
      <div
        id={menuId}
        role="menu"
        aria-label={t("nav.siteNavigation")}
        aria-hidden={!open}
        className={`absolute right-0 top-12 w-56 max-w-[calc(100vw-2rem)] grid z-10 ${
          open ? "" : "pointer-events-none"
        }`}
        style={{
          gridTemplateRows: open ? "1fr" : "0fr",
          opacity: open ? 1 : 0,
          transition:
            "grid-template-rows 500ms ease-in-out, opacity 400ms ease-in-out",
        }}
      >
        <div className="overflow-hidden bg-term-panel border border-term-border rounded-md shadow-xl">
          <div
            key={open ? "open" : "closed"}
            className="min-h-0 overflow-hidden"
          >
            <div className="flex items-center gap-1.5 px-4 py-2 border-b border-term-border bg-term-bg/60">
              <span className="w-2.5 h-2.5 rounded-full bg-term-pink" />
              <span className="w-2.5 h-2.5 rounded-full bg-term-orange" />
              <span className="w-2.5 h-2.5 rounded-full bg-term-green" />
            </div>
            <div className="px-4 py-3">
              <div className="flex items-center gap-1.5 text-sm text-term-muted">
                <span className="text-term-green">$</span>
                <span className="inline-block overflow-hidden whitespace-nowrap animate-typing">
                  ls
                </span>
                <span className="inline-block w-1.5 h-4 bg-term-green animate-caret" />
              </div>
              <ul className="mt-2 space-y-1">
                {navItems.map((item, i) => (
                  <li key={item.path} role="none">
                    <Link
                      to={item.path}
                      role="menuitem"
                      tabIndex={open ? 0 : -1}
                      onClick={() => setOpen(false)}
                      style={{ animationDelay: `${500 + i * 60}ms` }}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-transparent text-sm opacity-0 animate-fade-slide-in transition-colors hover:border-term-green hover:text-term-green hover:bg-term-bg ${
                        location.pathname === item.path
                          ? "text-term-green font-semibold border-term-border bg-term-bg"
                          : "text-term-muted"
                      }`}
                    >
                      ./{item.label}.sh
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
