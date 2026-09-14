import { EMPTY_TILE, GridSize, PuzzleState } from "../engine/puzzleTypes";
import { positionToRowCol } from "../engine/puzzleUtils";

type TileImageSource = CanvasImageSource & { width: number; height: number };

type Animation = {
  fromRow: number;
  fromCol: number;
  toRow: number;
  toCol: number;
  start: number;
  duration: number;
};

const TILE_GAP_RATIO = 0.018;
const MOVE_ANIMATION_MS = 150;

/**
 * Draws the puzzle board on a <canvas>. Animation runs on
 * requestAnimationFrame and is entirely decoupled from React re-renders —
 * `setState` just records the new logical state and (if it changed) a short
 * tween per moved tile; the frame loop interpolates and redraws itself.
 */
export class CanvasPuzzleRenderer {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly canvas: HTMLCanvasElement;
  private readonly reducedMotion: boolean;

  private image: TileImageSource | null = null;
  private grid: GridSize = 3;
  private tiles: readonly number[] = [];
  private cssSize = 0;
  private dpr = 1;
  private rafId: number | null = null;

  /** Keyed by tile id -> its current animation, if it's mid-move. */
  private animations = new Map<number, Animation>();
  /** Keyed by tile id -> the position it was drawn at last frame. */
  private lastPositions = new Map<number, number>();

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("2D canvas context is unavailable in this browser.");
    }
    this.canvas = canvas;
    this.ctx = ctx;
    this.reducedMotion =
      typeof window !== "undefined" && typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
        : false;
  }

  setImage(image: TileImageSource | null): void {
    this.image = image;
    this.scheduleDraw();
  }

  resize(cssSize: number, dpr: number): void {
    if (cssSize === this.cssSize && dpr === this.dpr) return;
    this.cssSize = cssSize;
    this.dpr = dpr;
    const pixelSize = Math.max(1, Math.round(cssSize * dpr));
    this.canvas.width = pixelSize;
    this.canvas.height = pixelSize;
    this.canvas.style.width = `${cssSize}px`;
    this.canvas.style.height = `${cssSize}px`;
    this.scheduleDraw();
  }

  /** Feed a new logical state. Pass animate:false for resets/shuffles/new images. */
  setState(state: PuzzleState, options: { animate: boolean } = { animate: true }): void {
    const grid = state.grid;
    const animate = options.animate && !this.reducedMotion && grid === this.grid;

    const newPositions = new Map<number, number>();
    for (let pos = 0; pos < state.tiles.length; pos++) {
      const tileId = state.tiles[pos];
      if (tileId !== EMPTY_TILE) newPositions.set(tileId, pos);
    }

    if (animate) {
      const now = performance.now();
      for (const [tileId, newPos] of newPositions) {
        const oldPos = this.lastPositions.get(tileId);
        if (oldPos !== undefined && oldPos !== newPos) {
          const from = positionToRowCol(oldPos, grid);
          const to = positionToRowCol(newPos, grid);
          this.animations.set(tileId, {
            fromRow: from.row,
            fromCol: from.col,
            toRow: to.row,
            toCol: to.col,
            start: now,
            duration: MOVE_ANIMATION_MS,
          });
        }
      }
    } else {
      this.animations.clear();
    }

    this.lastPositions = newPositions;
    this.grid = grid;
    this.tiles = state.tiles;
    this.scheduleDraw();
  }

  /** Converts a canvas-local CSS-pixel point to the board position under it, or null if outside the board. */
  getPositionAtPoint(x: number, y: number): number | null {
    if (this.cssSize === 0) return null;
    const cell = this.cssSize / this.grid;
    const col = Math.floor(x / cell);
    const row = Math.floor(y / cell);
    if (row < 0 || row >= this.grid || col < 0 || col >= this.grid) return null;
    return row * this.grid + col;
  }

  destroy(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private scheduleDraw(): void {
    if (this.rafId !== null) return;
    this.rafId = requestAnimationFrame(this.drawFrame);
  }

  private drawFrame = (): void => {
    this.rafId = null;
    this.draw();
    if (this.animations.size > 0) {
      this.scheduleDraw();
    }
  };

  private draw(): void {
    const { ctx, grid, cssSize, dpr } = this;
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssSize, cssSize);

    if (!this.image || cssSize === 0) {
      ctx.restore();
      return;
    }

    const cell = cssSize / grid;
    const gap = Math.max(1, cell * TILE_GAP_RATIO);
    const now = performance.now();
    const srcSize = this.image.width / grid;

    for (let pos = 0; pos < this.tiles.length; pos++) {
      const tileId = this.tiles[pos];
      if (tileId === EMPTY_TILE) continue;

      let { row, col } = positionToRowCol(pos, grid);

      const anim = this.animations.get(tileId);
      if (anim) {
        const t = Math.min(1, (now - anim.start) / anim.duration);
        const eased = 1 - Math.pow(1 - t, 3);
        row = anim.fromRow + (anim.toRow - anim.fromRow) * eased;
        col = anim.fromCol + (anim.toCol - anim.fromCol) * eased;
        if (t >= 1) this.animations.delete(tileId);
      }

      const srcRow = Math.floor(tileId / grid);
      const srcCol = tileId % grid;

      ctx.drawImage(
        this.image,
        srcCol * srcSize,
        srcRow * srcSize,
        srcSize,
        srcSize,
        col * cell + gap / 2,
        row * cell + gap / 2,
        cell - gap,
        cell - gap
      );
    }

    ctx.restore();
  }
}
