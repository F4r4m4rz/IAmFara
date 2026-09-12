import { dirFor, T, useLocale } from "../../i18n";

type ComingSoonProps = {
  path: string;
  command: string;
};

export function ComingSoon({ path, command }: ComingSoonProps) {
  const { locale } = useLocale();

  return (
    <div className="rounded-lg border border-term-border bg-term-panel shadow-2xl overflow-hidden font-mono">
      <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-term-border bg-term-bg/60">
        <span className="w-3 h-3 rounded-full bg-term-pink" />
        <span className="w-3 h-3 rounded-full bg-term-orange" />
        <span className="w-3 h-3 rounded-full bg-term-green" />
        <span className="ml-2 text-xs text-term-muted">
          faramarz@iamfara: {path}
        </span>
      </div>

      <div className="p-8 sm:p-12">
        <div className="flex items-center gap-2 text-sm sm:text-base text-term-muted">
          <span className="text-term-green">$</span>
          <span>{command}</span>
        </div>
        <div
          dir={dirFor(locale)}
          className="mt-3 flex items-center gap-2 text-sm sm:text-base text-term-orange"
        >
          <span dir="ltr">[warning]</span>
          <T k="comingSoon.warning" />
        </div>

        <div className="mt-8 flex items-center gap-2 text-sm sm:text-base text-term-muted">
          <span className="text-term-green">$</span>
          <span>./build-status.sh</span>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <div className="flex-1 max-w-xs h-2 rounded-full bg-term-bg border border-term-border overflow-hidden">
            <div className="h-full w-[47%] rounded-full bg-term-purple animate-pulse" />
          </div>
          <span
            dir={dirFor(locale)}
            className="text-xs text-term-muted whitespace-nowrap"
          >
            <span dir="ltr">47%</span> · <T k="comingSoon.building" />
          </span>
        </div>

        <p
          dir={dirFor(locale)}
          className="mt-6 max-w-md text-sm sm:text-base text-term-muted leading-relaxed"
        >
          <T k="comingSoon.body" />
        </p>
      </div>
    </div>
  );
}
