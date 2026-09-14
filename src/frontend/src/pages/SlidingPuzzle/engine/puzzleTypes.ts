export type GridSize = 3 | 4 | 5 | 6;

/** Sentinel tile id marking the empty slot in a board. */
export const EMPTY_TILE = -1;

export type Direction = "up" | "down" | "left" | "right";

/**
 * An immutable snapshot of the puzzle's state. `tiles[position]` is the id
 * of the tile currently occupying that grid position (reading order, left
 * to right, top to bottom), or EMPTY_TILE for the empty slot. A tile's id
 * equals the position it belongs at when the puzzle is solved.
 */
export interface PuzzleState {
  readonly grid: GridSize;
  readonly tiles: readonly number[];
  readonly emptyPosition: number;
  readonly moveCount: number;
  readonly isSolved: boolean;
}

export interface BuiltInImage {
  readonly id: string;
  readonly label: string;
  readonly src: string;
}
