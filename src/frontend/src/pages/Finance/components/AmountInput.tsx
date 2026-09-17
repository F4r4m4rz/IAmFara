import { forwardRef } from "react";
import { useLocale } from "../../../i18n";
import { CURRENCY } from "../domain/money";

/**
 * type="text" + inputMode="decimal" (not type="number") — more reliable
 * mobile numeric-keyboard behavior across browsers, and avoids browser-
 * specific spinner UI and locale-dependent decimal-separator quirks that
 * type="number" brings.
 */
const AmountInput = forwardRef<HTMLInputElement, {
  value: string;
  onChange: (value: string) => void;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}>(function AmountInput({ value, onChange, ...aria }, ref) {
  const { t } = useLocale();
  return (
    <div dir="ltr" className="flex items-center justify-center gap-2">
      <span className="text-2xl font-medium text-finance-muted">{CURRENCY}</span>
      <input
        ref={ref}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="0"
        aria-label={t("finance.quickAdd.amountLabel")}
        className="w-40 bg-transparent text-center text-5xl font-bold tabular-nums text-finance-text outline-none placeholder:text-finance-muted/40"
        {...aria}
      />
    </div>
  );
});

export default AmountInput;
