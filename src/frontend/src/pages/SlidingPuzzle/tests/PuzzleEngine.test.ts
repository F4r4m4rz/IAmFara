import { describe, expect, it } from "vitest";
import { PuzzleEngine } from "../engine/PuzzleEngine";
import { EMPTY_TILE, GridSize } from "../engine/puzzleTypes";

/**
 * Independent 15-puzzle solvability check (classic inversion-parity rule),
 * used only here to verify shuffle() by construction rather than by
 * re-deriving the same logic the engine already uses. See e.g.
 * https://www.cs.bham.ac.uk/~mdr/teaching/modules04/java2/TilesSolvability.html
 */
function isSolvableByParity(tiles: readonly number[], grid: GridSize): boolean {
  const sequence = tiles.filter((t) => t !== EMPTY_TILE);
  let inversions = 0;
  for (let i = 0; i < sequence.length; i++) {
    for (let j = i + 1; j < sequence.length; j++) {
      if (sequence[i] > sequence[j]) inversions++;
    }
  }

  if (grid % 2 === 1) {
    return inversions % 2 === 0;
  }

  const emptyIndex = tiles.indexOf(EMPTY_TILE);
  const emptyRowFromTop = Math.floor(emptyIndex / grid);
  const emptyRowFromBottom = grid - emptyRowFromTop; // 1-indexed
  if (emptyRowFromBottom % 2 === 0) {
    return inversions % 2 === 1;
  }
  return inversions % 2 === 0;
}

function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

describe("PuzzleEngine", () => {
  it("starts solved", () => {
    const engine = new PuzzleEngine(3);
    expect(engine.isSolved()).toBe(true);
    expect(engine.getState().moveCount).toBe(0);
  });

  it("detects a solved board correctly for different grid sizes", () => {
    for (const grid of [3, 4, 5, 6] as GridSize[]) {
      const engine = new PuzzleEngine(grid);
      expect(engine.isSolved()).toBe(true);
    }
  });

  it("allows only legal adjacent moves", () => {
    const engine = new PuzzleEngine(3);
    // Solved 3x3: empty is at position 8 (bottom-right).
    // Adjacent positions are 5 (above) and 7 (left).
    expect(engine.canMove(5)).toBe(true);
    expect(engine.canMove(7)).toBe(true);
    expect(engine.canMove(0)).toBe(false); // far corner, not adjacent
    expect(engine.canMove(4)).toBe(false); // diagonal neighbor, not adjacent
    expect(engine.canMove(8)).toBe(false); // the empty slot itself
  });

  it("rejects out-of-range positions", () => {
    const engine = new PuzzleEngine(3);
    expect(engine.canMove(-1)).toBe(false);
    expect(engine.canMove(9)).toBe(false);
    expect(engine.move(-1)).toBe(false);
    expect(engine.move(100)).toBe(false);
  });

  it("moves a tile into the empty slot and updates state", () => {
    const engine = new PuzzleEngine(3);
    const moved = engine.move(5);
    expect(moved).toBe(true);
    const state = engine.getState();
    expect(state.emptyPosition).toBe(5);
    expect(state.tiles[8]).toBe(5); // tile 5 slid down into the old empty slot
    expect(state.tiles[5]).toBe(-1);
    expect(state.isSolved).toBe(false);
  });

  it("refuses illegal moves and leaves state unchanged", () => {
    const engine = new PuzzleEngine(3);
    const before = engine.getState();
    const moved = engine.move(0); // not adjacent to empty (position 8)
    expect(moved).toBe(false);
    const after = engine.getState();
    expect(after.tiles).toEqual(before.tiles);
    expect(after.moveCount).toBe(before.moveCount);
  });

  it("increments move count only for successful moves", () => {
    const engine = new PuzzleEngine(3);
    engine.move(5); // legal
    engine.move(0); // illegal, not adjacent
    engine.move(4); // legal (now adjacent to empty at 5)
    expect(engine.getState().moveCount).toBe(2);
  });

  it("getMovableTiles returns exactly the tiles adjacent to the empty slot", () => {
    const engine = new PuzzleEngine(3); // empty at 8 (corner): 2 neighbors
    expect(engine.getMovableTiles().sort()).toEqual([5, 7]);

    engine.move(5); // empty now at 5 (edge): 3 neighbors
    expect(engine.getMovableTiles().sort()).toEqual([2, 4, 8]);
  });

  it("reset restores the solved board and zeroes the move count", () => {
    const engine = new PuzzleEngine(4);
    engine.move(engine.getMovableTiles()[0]);
    engine.move(engine.getMovableTiles()[0]);
    expect(engine.getState().moveCount).toBeGreaterThan(0);

    engine.reset();
    const state = engine.getState();
    expect(state.isSolved).toBe(true);
    expect(state.moveCount).toBe(0);
    expect(state.emptyPosition).toBe(state.tiles.length - 1);
  });

  it("shuffle never returns the solved board, for every supported grid size", () => {
    for (const grid of [3, 4, 5, 6] as GridSize[]) {
      const engine = new PuzzleEngine(grid);
      engine.shuffle(seededRandom(grid * 7919 + 1));
      expect(engine.isSolved()).toBe(false);
    }
  });

  it("shuffle does not count as player moves", () => {
    const engine = new PuzzleEngine(4);
    engine.shuffle(seededRandom(42));
    expect(engine.getState().moveCount).toBe(0);
  });

  it("shuffled boards are always solvable (verified independently by inversion parity)", () => {
    for (const grid of [3, 4, 5, 6] as GridSize[]) {
      for (let seed = 0; seed < 5; seed++) {
        const engine = new PuzzleEngine(grid);
        engine.shuffle(seededRandom(seed * 101 + grid));
        const state = engine.getState();
        expect(isSolvableByParity(state.tiles, grid)).toBe(true);
      }
    }
  });

  it("a shuffled board can be fully undone move-by-move back to solved", () => {
    // Record each move's "emptyBefore" position by shuffling manually with
    // an engine we control, then replay the recorded positions in reverse —
    // this directly demonstrates the shuffled board is reachable from (and
    // therefore can reach back to) the solved state.
    const engine = new PuzzleEngine(4);
    const random = seededRandom(7);
    const emptyHistory: number[] = [];
    for (let i = 0; i < 40; i++) {
      const movable = engine.getMovableTiles();
      const pick = movable[Math.floor(random() * movable.length)];
      emptyHistory.push(engine.getState().emptyPosition);
      engine.move(pick);
    }
    expect(engine.isSolved()).toBe(false);

    for (let i = emptyHistory.length - 1; i >= 0; i--) {
      engine.move(emptyHistory[i]);
    }
    expect(engine.isSolved()).toBe(true);
  });

  it("getState returns a frozen snapshot that cannot mutate engine internals", () => {
    const engine = new PuzzleEngine(3);
    const state = engine.getState();
    expect(Object.isFrozen(state)).toBe(true);
    expect(Object.isFrozen(state.tiles)).toBe(true);

    expect(() => {
      // @ts-expect-error intentionally attempting to mutate a readonly array
      state.tiles[0] = 999;
    }).toThrow();

    // Internal state is unaffected regardless.
    expect(engine.getState().tiles[0]).toBe(0);
  });

  it("supports every documented grid size independently", () => {
    for (const grid of [3, 4, 5, 6] as GridSize[]) {
      const engine = new PuzzleEngine(grid);
      expect(engine.getGrid()).toBe(grid);
      expect(engine.getState().tiles.length).toBe(grid * grid);
    }
  });
});
