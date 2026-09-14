import { Check, Image as ImageIcon, RefreshCw } from "lucide-react";
import { dirFor, useLocale } from "../../../i18n";

type CompletionDialogProps = {
  elapsedSeconds: number;
  moveCount: number;
  onPlayAgain: () => void;
  onChooseImage: () => void;
};

function formatTime(totalSeconds: number): string {
  const safe = Number.isFinite(totalSeconds) ? Math.max(0, totalSeconds) : 0;
  const m = Math.floor(safe / 60);
  const s = Math.floor(safe % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Rendered inline (not a native alert() and not a focus-trapping modal) so
 * completion stays part of the page's normal flow and reading order —
 * simpler and, since nothing behind it is disabled, avoids the extra
 * complexity of a full modal-dialog implementation for a first version.
 */
export function CompletionDialog({
  elapsedSeconds,
  moveCount,
  onPlayAgain,
  onChooseImage,
}: CompletionDialogProps) {
  const { t, locale } = useLocale();
  const dir = dirFor(locale);

  return (
    <div role="status" dir={dir} className="mt-6 rounded-lg border border-term-green/40 bg-term-green/5 p-6 text-center">
      <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-term-green/15 text-term-green mb-3">
        <Check className="h-6 w-6" aria-hidden="true" />
      </div>
      <div className="text-lg font-semibold text-term-text">{t("puzzle.completion.solved")}</div>
      <p className="mt-1 text-sm text-term-muted">
        <span dir="ltr">{formatTime(elapsedSeconds)}</span> · {moveCount}{" "}
        {t(moveCount === 1 ? "puzzle.controls.move" : "puzzle.controls.moves")}
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onPlayAgain}
          className="inline-flex items-center gap-2 bg-term-green text-term-bg font-semibold px-5 py-2.5 rounded hover:bg-term-blue transition-colors focus:outline-none focus:ring-2 focus:ring-term-green"
        >
          <RefreshCw className="h-4 w-4" /> {t("puzzle.completion.playAgain")}
        </button>
        <button
          type="button"
          onClick={onChooseImage}
          className="inline-flex items-center gap-2 border border-term-border text-term-text font-semibold px-5 py-2.5 rounded hover:border-term-green hover:text-term-green transition-colors focus:outline-none focus:ring-2 focus:ring-term-green"
        >
          <ImageIcon className="h-4 w-4" /> {t("puzzle.completion.chooseImage")}
        </button>
      </div>
    </div>
  );
}
