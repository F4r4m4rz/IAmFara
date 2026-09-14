import { ReactNode } from "react";
import { dirFor, useLocale } from "../../i18n";

type CardProps = {
  icon: ReactNode;
  title: string;
  description: ReactNode;
  button: ReactNode;
};

export function Card({ icon, title, description, button }: CardProps) {
  const { locale } = useLocale();

  return (
    <div className="group flex flex-col items-center text-center bg-term-panel rounded-lg w-full max-w-xs border border-term-border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-term-green/60 overflow-hidden">
      <div className="w-full flex items-center gap-1.5 px-4 py-2 border-b border-term-border bg-term-bg/60">
        <span className="w-2.5 h-2.5 rounded-full bg-term-pink" />
        <span className="w-2.5 h-2.5 rounded-full bg-term-orange" />
        <span className="w-2.5 h-2.5 rounded-full bg-term-green" />
        <span className="ml-2 text-xs text-term-muted truncate">
          ./{title.toLowerCase().replace(/\s+/g, "-")}.sh
        </span>
      </div>
      <div className="flex flex-col items-center p-8">
        <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-term-bg border border-term-border text-term-green mb-5 transition-colors duration-300 group-hover:border-term-green">
          {icon}
        </div>
        <div className="text-xl font-semibold text-term-text">{title}</div>
        <p
          dir={dirFor(locale)}
          className="text-sm text-term-muted mt-2 leading-relaxed"
        >
          {description}
        </p>
        <div className="mt-6">{button}</div>
      </div>
    </div>
  );
}
