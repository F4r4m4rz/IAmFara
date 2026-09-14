import { EMPTY_TILE, GridSize, PuzzleState } from "./puzzleTypes";
import { isAdjacentPosition, SHUFFLE_LENGTH } from "./puzzleUtils";

/**
 * Pure sliding-puzzle game logic. Has no dependency on React, the DOM,
 * Canvas, or image loading, so it can be unit tested directly and reused
 * by any renderer/input layer.
 */
export class PuzzleEngine {
  private readonly grid: GridSize;
  private tiles: number[];
  private emptyPosition: number;
  private moveCount: number;

  constructor(grid: GridSize) {
    this.grid = grid;
    this.tiles = PuzzleEngine.solvedTiles(grid);
    this.emptyPosition = this.tiles.length - 1;
    this.moveCount = 0;
  }

  private static solvedTiles(grid: GridSize): number[] {
    const total = grid * grid;
    const tiles = Array.from({ length: total }, (_, i) => i);
    tiles[total - 1] = EMPTY_TILE;
    return tiles;
  }

  getGrid(): GridSize {
    return this.grid;
  }

  /** A frozen snapshot — callers cannot mutate the engine's internal state through it. */
  getState(): PuzzleState {
    return Object.freeze({
      grid: this.grid,
      tiles: Object.freeze([...this.tiles]),
      emptyPosition: this.emptyPosition,
      moveCount: this.moveCount,
      isSolved: this.isSolved(),
    });
  }

  isSolved(): boolean {
    for (let i = 0; i < this.tiles.length - 1; i++) {
      if (this.tiles[i] !== i) return false;
    }
    return true;
  }

  canMove(position: number): boolean {
    if (!Number.isInteger(position) || position < 0 || position >= this.tiles.length) {
      return false;
    }
    if (position === this.emptyPosition) return false;
    return isAdjacentPosition(position, this.emptyPosition, this.grid);
  }

  getMovableTiles(): number[] {
    const movable: number[] = [];
    for (let i = 0; i < this.tiles.length; i++) {
      if (this.canMove(i)) movable.push(i);
    }
    return movable;
  }

  /** Moves the tile at `position` into the empty slot, if legal. Returns whether it moved. */
  move(position: number): boolean {
    if (!this.canMove(position)) return false;
    this.tiles[this.emptyPosition] = this.tiles[position];
    this.tiles[position] = EMPTY_TILE;
    this.emptyPosition = position;
    this.moveCount += 1;
    return true;
  }

  reset(): void {
    this.tiles = PuzzleEngine.solvedTiles(this.grid);
    this.emptyPosition = this.tiles.length - 1;
    this.moveCount = 0;
  }

  /**
   * Shuffles by replaying many random legal moves from the solved board —
   * this guarantees the result is always reachable (and thus solvable)
   * without needing a separate solvability check. Shuffle moves never
   * count toward the player's move count.
   */
  shuffle(random: () => number = Math.random): void {
    this.reset();
    const target = SHUFFLE_LENGTH[this.grid];
    let forbidden = -1; // avoid immediately undoing the previous shuffle move

    for (let i = 0; i < target; i++) {
      const movable = this.getMovableTiles();
      const candidates = movable.filter((p) => p !== forbidden);
      const pool = candidates.length > 0 ? candidates : movable;
      const pick = pool[Math.floor(random() * pool.length)];
      const emptyBefore = this.emptyPosition;
      this.move(pick);
      forbidden = emptyBefore;
    }

    this.moveCount = 0;

    // Vanishingly unlikely for these shuffle lengths, but stay correct.
    if (this.isSolved()) {
      const movable = this.getMovableTiles();
      this.move(movable[0]);
      this.moveCount = 0;
    }
  }
}
