import { dirFor, T, useLocale } from "../../../i18n";

/** Placeholder — full history/filtering lands in a later phase. */
export default function TransactionHistory() {
  const { locale } = useLocale();
  return (
    <div dir={dirFor(locale)} className="mx-auto max-w-lg px-4 py-6">
      <h1 className="text-lg font-semibold">
        <T k="finance.transactions.heading" />
      </h1>
    </div>
  );
}
