import { Clock, Shuffle } from "lucide-react";
import { GridSize } from "../engine/puzzleTypes";

type PuzzleControlsProps = {
  grid: GridSize;
  onGridChange: (grid: GridSize) => void;
  onRestart: () => void;
  elapsedSeconds: number;
  moveCount: number;
};

const DIFFICULTIES: { grid: GridSize; label: string }[] = [
  { grid: 3, label: "3×3 · Easy" },
  { grid: 4, label: "4×4 · Medium" },
  { grid: 5, label: "5×5 · Hard" },
];

function formatTime(totalSeconds: number): string {
  const safe = Number.isFinite(totalSeconds) ? Math.max(0, totalSeconds) : 0;
  const m = Math.floor(safe / 60);
  const s = Math.floor(safe % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function PuzzleControls({
  grid,
  onGridChange,
  onRestart,
  elapsedSeconds,
  moveCount,
}: PuzzleControlsProps) {
  return (
    <div className="flex flex-col gap-4">
      <div role="group" aria-label="Difficulty" className="flex flex-wrap items-center gap-2">
        {DIFFICULTIES.map((d) => (
          <button
            key={d.grid}
            type="button"
            onClick={() => onGridChange(d.grid)}
            aria-pressed={grid === d.grid}
            className={`px-3 py-1.5 rounded border text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-term-green ${
              grid === d.grid
                ? "border-term-green text-term-green bg-term-green/10"
                : "border-term-border text-term-muted hover:border-term-green hover:text-term-green"
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-sm text-term-muted">
          <span className="inline-flex items-center gap-1.5" aria-label={`Elapsed time ${formatTime(elapsedSeconds)}`}>
            <Clock className="h-4 w-4" aria-hidden="true" />
            {formatTime(elapsedSeconds)}
          </span>
          <span aria-label={`${moveCount} ${moveCount === 1 ? "move" : "moves"}`}>
            {moveCount} {moveCount === 1 ? "move" : "moves"}
          </span>
        </div>
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-term-green hover:text-term-blue transition-colors focus:outline-none focus:ring-2 focus:ring-term-green rounded"
        >
          <Shuffle className="h-4 w-4" /> Shuffle
        </button>
      </div>
    </div>
  );
}
