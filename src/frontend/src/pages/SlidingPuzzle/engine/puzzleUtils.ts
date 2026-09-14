import { Direction, GridSize } from "./puzzleTypes";

export function positionToRowCol(position: number, grid: GridSize) {
  return { row: Math.floor(position / grid), col: position % grid };
}

export function isAdjacentPosition(a: number, b: number, grid: GridSize): boolean {
  const ra = Math.floor(a / grid);
  const ca = a % grid;
  const rb = Math.floor(b / grid);
  const cb = b % grid;
  return (ra === rb && Math.abs(ca - cb) === 1) || (ca === cb && Math.abs(ra - rb) === 1);
}

/** How many random valid moves to shuffle with, scaled so larger boards get a meaningfully scrambled result. */
export const SHUFFLE_LENGTH: Record<GridSize, number> = {
  3: 60,
  4: 120,
  5: 200,
  6: 320,
};

/**
 * Given the empty slot's position, which position holds the tile that an
 * arrow-key press in `direction` should slide into it — or null if the
 * empty slot is already at that edge of the board.
 *
 * Convention: the arrow key indicates which way the *empty slot* moves, so
 * ArrowUp slides the tile above the empty slot down into it.
 */
export function targetPositionForDirection(
  emptyPosition: number,
  grid: GridSize,
  direction: Direction
): number | null {
  const { row, col } = positionToRowCol(emptyPosition, grid);
  switch (direction) {
    case "up":
      return row === 0 ? null : emptyPosition - grid;
    case "down":
      return row === grid - 1 ? null : emptyPosition + grid;
    case "left":
      return col === 0 ? null : emptyPosition - 1;
    case "right":
      return col === grid - 1 ? null : emptyPosition + 1;
    default:
      return null;
  }
}
