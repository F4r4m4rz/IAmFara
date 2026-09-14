import { useEffect, useId, useRef, useState } from "react";
import { CompletionDialog } from "./components/CompletionDialog";
import { ImagePicker } from "./components/ImagePicker";
import { PuzzleCanvas } from "./components/PuzzleCanvas";
import { PuzzleControls } from "./components/PuzzleControls";
import { PuzzleEngine } from "./engine/PuzzleEngine";
import { BuiltInImage, Direction, GridSize, PuzzleState } from "./engine/puzzleTypes";
import { targetPositionForDirection } from "./engine/puzzleUtils";
import { BUILT_IN_IMAGES } from "./images/builtInImages";
import { loadSquareImage, PuzzleImageError, SquareImage, validateUploadedFile } from "./images/imageLoading";

const IMAGE_TARGET_SIZE = 900;
const TIMER_TICK_MS = 250;

type ImageStatus = "loading" | "ready" | "error";

function closeIfBitmap(image: SquareImage | null): void {
  if (image && "close" in image) image.close();
}

// All user-facing content on this page is deliberately English-only, per
// this experiment's own spec, regardless of the site's selected language —
// so this page intentionally does not use the site-wide i18n system.
function SlidingPuzzle() {
  const engineRef = useRef<PuzzleEngine>(new PuzzleEngine(3));
  const [grid, setGrid] = useState<GridSize>(3);
  const [puzzleState, setPuzzleState] = useState<PuzzleState>(() => engineRef.current.getState());
  const [animateNext, setAnimateNext] = useState(false);

  const [imageStatus, setImageStatus] = useState<ImageStatus>("loading");
  const [imageError, setImageError] = useState<string | null>(null);
  const [squareImage, setSquareImage] = useState<SquareImage | null>(null);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const squareImageRef = useRef<SquareImage | null>(null);
  squareImageRef.current = squareImage;
  const loadTokenRef = useRef(0);

  const startTimeRef = useRef<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const finalElapsedRef = useRef(0);

  const [showCelebration, setShowCelebration] = useState(false);
  const celebrationTimeoutRef = useRef<number | null>(null);

  const instructionsId = useId();
  const imagePickerHeadingId = useId();
  const imagePickerRef = useRef<HTMLDivElement>(null);

  // Load the first built-in image on mount.
  useEffect(() => {
    void selectBuiltInImage(BUILT_IN_IMAGES[0], { skipConfirm: true });
    return () => {
      // Release whatever image bitmap is current when the page unmounts.
      closeIfBitmap(squareImageRef.current);
      if (celebrationTimeoutRef.current !== null) {
        window.clearTimeout(celebrationTimeoutRef.current);
      }
    };
  }, []);

  // Tick the visible timer a few times a second — never on every animation frame.
  useEffect(() => {
    if (!isRunning) return;
    const id = window.setInterval(() => {
      if (startTimeRef.current !== null) {
        setElapsedSeconds((performance.now() - startTimeRef.current) / 1000);
      }
    }, TIMER_TICK_MS);
    return () => window.clearInterval(id);
  }, [isRunning]);

  function startNewGame(nextGrid: GridSize, animate: boolean): void {
    engineRef.current = new PuzzleEngine(nextGrid);
    engineRef.current.shuffle();
    setPuzzleState(engineRef.current.getState());
    setAnimateNext(animate);
    startTimeRef.current = null;
    finalElapsedRef.current = 0;
    setIsRunning(false);
    setElapsedSeconds(0);

    setShowCelebration(false);
    if (celebrationTimeoutRef.current !== null) {
      window.clearTimeout(celebrationTimeoutRef.current);
      celebrationTimeoutRef.current = null;
    }
  }

  function hasUnsavedProgress(): boolean {
    return puzzleState.moveCount > 0 && !puzzleState.isSolved;
  }

  function confirmIfProgressWouldBeLost(message: string): boolean {
    if (!hasUnsavedProgress()) return true;
    return window.confirm(message);
  }

  function tryMove(position: number): void {
    if (puzzleState.isSolved) return;
    const moved = engineRef.current.move(position);
    if (!moved) return; // invalid input never starts the timer

    if (startTimeRef.current === null) {
      startTimeRef.current = performance.now();
      setIsRunning(true);
    }

    const nextState = engineRef.current.getState();
    setPuzzleState(nextState);
    setAnimateNext(true);

    if (nextState.isSolved) {
      finalElapsedRef.current =
        startTimeRef.current !== null ? (performance.now() - startTimeRef.current) / 1000 : 0;
      setElapsedSeconds(finalElapsedRef.current);
      setIsRunning(false);

      setShowCelebration(true);
      celebrationTimeoutRef.current = window.setTimeout(() => {
        setShowCelebration(false);
        celebrationTimeoutRef.current = null;
      }, 2200);
    }
  }

  function handleArrowKey(direction: Direction): void {
    const target = targetPositionForDirection(puzzleState.emptyPosition, puzzleState.grid, direction);
    if (target !== null) tryMove(target);
  }

  function handleGridChange(nextGrid: GridSize): void {
    if (nextGrid === grid) return;
    if (!confirmIfProgressWouldBeLost("Changing difficulty will reset your current progress. Continue?")) {
      return;
    }
    setGrid(nextGrid);
    startNewGame(nextGrid, false);
  }

  function handleRestart(): void {
    startNewGame(grid, false);
  }

  async function selectBuiltInImage(image: BuiltInImage, opts?: { skipConfirm?: boolean }): Promise<void> {
    if (
      !opts?.skipConfirm &&
      !confirmIfProgressWouldBeLost("Starting a new image will reset your current progress. Continue?")
    ) {
      return;
    }
    await loadAndApplyImage(image.src, image.id);
  }

  async function selectUploadedFile(file: File): Promise<void> {
    if (!confirmIfProgressWouldBeLost("Starting a new image will reset your current progress. Continue?")) {
      return;
    }

    try {
      validateUploadedFile(file);
    } catch (err) {
      setImageStatus("error");
      setImageError(err instanceof PuzzleImageError ? err.message : "That file couldn't be used.");
      return;
    }

    await loadAndApplyImage(file, "upload");
  }

  async function loadAndApplyImage(source: string | File, id: string): Promise<void> {
    const token = ++loadTokenRef.current;
    setImageStatus("loading");
    setImageError(null);

    try {
      const image = await loadSquareImage(source, IMAGE_TARGET_SIZE);

      if (token !== loadTokenRef.current) {
        // A newer selection started before this one finished — discard it.
        closeIfBitmap(image);
        return;
      }

      closeIfBitmap(squareImageRef.current);
      setSquareImage(image);
      setSelectedImageId(id);
      setImageStatus("ready");
      startNewGame(grid, false);
    } catch (err) {
      if (token !== loadTokenRef.current) return;
      setImageStatus("error");
      setImageError(
        err instanceof PuzzleImageError ? err.message : "Something went wrong loading that image."
      );
    }
  }

  function focusImagePicker(): void {
    imagePickerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return (
    <section className="rounded-lg border border-term-border bg-term-panel shadow-2xl overflow-hidden">
      <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-term-border bg-term-bg/60">
        <span className="w-3 h-3 rounded-full bg-term-pink" />
        <span className="w-3 h-3 rounded-full bg-term-orange" />
        <span className="w-3 h-3 rounded-full bg-term-green" />
        <span className="ml-2 text-xs text-term-muted">faramarz@iamfara: ~/projects/sliding-puzzle</span>
      </div>

      <div className="p-6 sm:p-10">
        <div className="flex items-center gap-2 text-term-muted text-sm sm:text-base">
          <span className="text-term-green">$</span>
          <span>./sliding-puzzle.sh</span>
        </div>
        <h1 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-term-text">
          Sliding Puzzle
        </h1>
        <p className="mt-3 max-w-xl text-term-muted leading-relaxed">
          A small experiment in TypeScript, React, and the Canvas API: a classic
          15-puzzle with a testable game engine kept separate from rendering
          and input. Pick an image, choose a difficulty, and reassemble it.
        </p>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          <div className="lg:col-span-3">
            <div className="relative">
              <PuzzleCanvas
                state={puzzleState}
                image={imageStatus === "ready" ? squareImage : null}
                animate={animateNext}
                disabled={puzzleState.isSolved || imageStatus !== "ready"}
                ariaLabel={`${grid} by ${grid} sliding puzzle board, ${puzzleState.moveCount} moves so far`}
                instructionsId={instructionsId}
                onActivate={tryMove}
                onArrowKey={handleArrowKey}
              />
              {imageStatus === "loading" && (
                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-term-bg/70 text-sm text-term-muted">
                  Loading image…
                </div>
              )}
              {showCelebration && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <span className="animate-pop-in rounded-full border border-term-green/50 bg-term-bg/90 px-6 py-2.5 text-xl font-bold text-term-green shadow-lg">
                    Good job!
                  </span>
                </div>
              )}
            </div>
            <p id={instructionsId} className="sr-only">
              Use the arrow keys, or tap or click a tile, to slide it into the
              empty space and reconstruct the image.
            </p>

            {imageStatus === "error" && imageError && (
              <p role="alert" className="mt-3 text-sm text-term-pink">
                {imageError}
              </p>
            )}

            {puzzleState.isSolved && (
              <CompletionDialog
                elapsedSeconds={finalElapsedRef.current}
                moveCount={puzzleState.moveCount}
                onPlayAgain={handleRestart}
                onChooseImage={focusImagePicker}
              />
            )}
          </div>

          <div className="lg:col-span-2 flex flex-col gap-8">
            <PuzzleControls
              grid={grid}
              onGridChange={handleGridChange}
              onRestart={handleRestart}
              elapsedSeconds={puzzleState.isSolved ? finalElapsedRef.current : elapsedSeconds}
              moveCount={puzzleState.moveCount}
            />

            <div ref={imagePickerRef}>
              <h2 id={imagePickerHeadingId} className="text-sm text-term-muted mb-2">
                Image
              </h2>
              <ImagePicker
                images={BUILT_IN_IMAGES}
                selectedId={selectedImageId}
                onSelectBuiltIn={(image) => void selectBuiltInImage(image)}
                onSelectFile={(file) => void selectUploadedFile(file)}
              />
              <p className="mt-2 text-xs text-term-muted">
                Uploaded images stay in your browser — they're never sent
                anywhere.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SlidingPuzzle;
