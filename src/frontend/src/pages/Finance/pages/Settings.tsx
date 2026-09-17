import { dirFor, T, useLocale } from "../../../i18n";
import DemoModeBadge from "../components/DemoModeBadge";

/** Placeholder — demo utilities (sample data, reset) land in a later phase. */
export default function Settings() {
  const { locale } = useLocale();
  return (
    <div dir={dirFor(locale)} className="mx-auto max-w-lg px-4 py-6">
      <h1 className="mb-4 text-lg font-semibold">
        <T k="finance.settings.heading" />
      </h1>
      <DemoModeBadge />
    </div>
  );
}
