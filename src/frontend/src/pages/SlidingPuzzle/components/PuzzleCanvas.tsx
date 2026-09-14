import { useEffect, useRef, useState } from "react";
import { dirFor, useLocale } from "../../../i18n";
import { Direction, PuzzleState } from "../engine/puzzleTypes";
import { SquareImage } from "../images/imageLoading";
import { PuzzleInputController } from "../input/PuzzleInputController";
import { CanvasPuzzleRenderer } from "../rendering/CanvasPuzzleRenderer";

type PuzzleCanvasProps = {
  state: PuzzleState;
  image: SquareImage | null;
  animate: boolean;
  disabled: boolean;
  hintPosition: number | null;
  ariaLabel: string;
  instructionsId: string;
  onActivate: (position: number) => void;
  onArrowKey: (direction: Direction) => void;
};

export function PuzzleCanvas({
  state,
  image,
  animate,
  disabled,
  hintPosition,
  ariaLabel,
  instructionsId,
  onActivate,
  onArrowKey,
}: PuzzleCanvasProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<CanvasPuzzleRenderer | null>(null);

  // Refs so the mount-only effect below always calls the latest callbacks
  // without needing to recreate the renderer/input controller every render.
  const onActivateRef = useRef(onActivate);
  const onArrowKeyRef = useRef(onArrowKey);
  const disabledRef = useRef(disabled);
  onActivateRef.current = onActivate;
  onArrowKeyRef.current = onArrowKey;
  disabledRef.current = disabled;

  const [hasCanvasError, setHasCanvasError] = useState(false);
  const { t, locale } = useLocale();

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    let renderer: CanvasPuzzleRenderer;
    try {
      renderer = new CanvasPuzzleRenderer(canvas);
    } catch {
      setHasCanvasError(true);
      return;
    }
    rendererRef.current = renderer;

    const input = new PuzzleInputController(canvas, {
      onPointAt: (x, y) => {
        if (disabledRef.current) return;
        const position = renderer.getPositionAtPoint(x, y);
        if (position !== null) onActivateRef.current(position);
      },
      onArrowKey: (direction) => {
        if (disabledRef.current) return;
        onArrowKeyRef.current(direction);
      },
    });

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const size = Math.floor(entry.contentRect.width);
      const dpr = window.devicePixelRatio || 1;
      renderer.resize(size, dpr);
    });
    observer.observe(wrapper);

    return () => {
      observer.disconnect();
      input.destroy();
      renderer.destroy();
      rendererRef.current = null;
    };
  }, []);

  useEffect(() => {
    rendererRef.current?.setImage(image);
  }, [image]);

  useEffect(() => {
    rendererRef.current?.setState(state, { animate });
  }, [state, animate]);

  useEffect(() => {
    rendererRef.current?.setHint(hintPosition);
  }, [hintPosition]);

  if (hasCanvasError) {
    return (
      <div
        dir={dirFor(locale)}
        className="w-full max-w-[520px] mx-auto rounded-lg border border-term-pink/40 bg-term-pink/5 p-6 text-center text-sm text-term-pink"
      >
        {t("puzzle.canvasUnsupported")}
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className="w-full max-w-[520px] aspect-square mx-auto">
      <canvas
        ref={canvasRef}
        tabIndex={0}
        aria-label={ariaLabel}
        aria-describedby={instructionsId}
        className={`w-full h-full rounded-lg border border-term-border bg-term-bg touch-none focus:outline-none focus:ring-2 focus:ring-term-green ${
          state.isSolved ? "animate-puzzle-flash" : ""
        }`}
      />
    </div>
  );
}
