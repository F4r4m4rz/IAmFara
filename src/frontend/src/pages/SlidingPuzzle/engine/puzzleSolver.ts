import { EMPTY_TILE, GridSize } from "./puzzleTypes";

const MAX_NODES = 8_000_000;
const TIME_BUDGET_MS = 8000;

function manhattanDistance(tiles: readonly number[], grid: GridSize): number {
  let total = 0;
  for (let pos = 0; pos < tiles.length; pos++) {
    const tileId = tiles[pos];
    if (tileId === EMPTY_TILE) continue;
    const curRow = Math.floor(pos / grid);
    const curCol = pos % grid;
    const targetRow = Math.floor(tileId / grid);
    const targetCol = tileId % grid;
    total += Math.abs(curRow - targetRow) + Math.abs(curCol - targetCol);
  }
  return total;
}

/**
 * Linear Conflict: for each row/column, two tiles that both belong there
 * but sit in the wrong relative order can't pass each other without one
 * stepping out and back in, costing 2 extra moves beyond raw Manhattan
 * distance. Counting these (an admissible addition to the heuristic) is
 * what makes IDA* actually tractable on anything bigger than a trivial
 * board — plain Manhattan distance alone is a well-known weak heuristic
 * for the sliding puzzle that blows up the search space on 4x4+.
 */
function linearConflict(tiles: readonly number[], grid: GridSize): number {
  let conflicts = 0;

  for (let row = 0; row < grid; row++) {
    const inRow: number[] = []; // target columns, in current left-to-right order
    for (let col = 0; col < grid; col++) {
      const tileId = tiles[row * grid + col];
      if (tileId === EMPTY_TILE) continue;
      if (Math.floor(tileId / grid) === row) inRow.push(tileId % grid);
    }
    for (let i = 0; i < inRow.length; i++) {
      for (let j = i + 1; j < inRow.length; j++) {
        if (inRow[i] > inRow[j]) conflicts++;
      }
    }
  }

  for (let col = 0; col < grid; col++) {
    const inCol: number[] = []; // target rows, in current top-to-bottom order
    for (let row = 0; row < grid; row++) {
      const tileId = tiles[row * grid + col];
      if (tileId === EMPTY_TILE) continue;
      if (tileId % grid === col) inCol.push(Math.floor(tileId / grid));
    }
    for (let i = 0; i < inCol.length; i++) {
      for (let j = i + 1; j < inCol.length; j++) {
        if (inCol[i] > inCol[j]) conflicts++;
      }
    }
  }

  return conflicts * 2;
}

function heuristic(tiles: readonly number[], grid: GridSize): number {
  return manhattanDistance(tiles, grid) + linearConflict(tiles, grid);
}

function emptyNeighbors(emptyPos: number, grid: GridSize): number[] {
  const row = Math.floor(emptyPos / grid);
  const col = emptyPos % grid;
  const result: number[] = [];
  if (row > 0) result.push(emptyPos - grid);
  if (row < grid - 1) result.push(emptyPos + grid);
  if (col > 0) result.push(emptyPos - 1);
  if (col < grid - 1) result.push(emptyPos + 1);
  return result;
}

/**
 * IDA* search (Manhattan distance + Linear Conflict heuristic) for a
 * sequence of moves from `tiles` to the solved board. Each returned entry
 * is a board position, in
 * the same sense as PuzzleEngine.move(position) — the tile occupying that
 * position slides into the empty slot.
 *
 * Bounded by both a node and a wall-clock budget: for very deep/large
 * boards this can legitimately fail to finish in time, in which case it
 * returns null rather than blocking the page indefinitely.
 */
export function solvePuzzle(tiles: readonly number[], grid: GridSize): number[] | null {
  const board = [...tiles];
  let emptyPos = board.indexOf(EMPTY_TILE);
  const path: number[] = [];
  let nodes = 0;
  const deadline = performance.now() + TIME_BUDGET_MS;

  function timeUp(): boolean {
    if (nodes > MAX_NODES) return true;
    return (nodes & 1023) === 0 && performance.now() > deadline;
  }

  function search(g: number, bound: number, lastMovedPos: number): number | "FOUND" {
    nodes++;
    if (timeUp()) return Infinity;

    const h = heuristic(board, grid);
    const f = g + h;
    if (f > bound) return f;
    if (h === 0) return "FOUND";

    let min = Infinity;
    for (const pos of emptyNeighbors(emptyPos, grid)) {
      if (pos === lastMovedPos) continue; // never immediately undo the previous move

      const movedTile = board[pos];
      const prevEmpty = emptyPos;
      board[prevEmpty] = movedTile;
      board[pos] = EMPTY_TILE;
      emptyPos = pos;
      path.push(pos);

      const result = search(g + 1, bound, prevEmpty);
      if (result === "FOUND") return "FOUND";
      if (result < min) min = result;

      path.pop();
      board[prevEmpty] = EMPTY_TILE;
      board[pos] = movedTile;
      emptyPos = prevEmpty;

      if (timeUp()) return Infinity;
    }

    return min;
  }

  let bound = heuristic(board, grid);
  if (bound === 0) return [];

  while (true) {
    const result = search(0, bound, -1);
    if (result === "FOUND") return [...path];
    if (result === Infinity) return null;
    bound = result;
  }
}

/** The next move toward a solution, or null if none was found within the search budget. */
export function findHintMove(tiles: readonly number[], grid: GridSize): number | null {
  const path = solvePuzzle(tiles, grid);
  return path && path.length > 0 ? path[0] : null;
}
