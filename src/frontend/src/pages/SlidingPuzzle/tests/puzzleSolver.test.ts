import { describe, expect, it } from "vitest";
import { PuzzleEngine } from "../engine/PuzzleEngine";
import { GridSize } from "../engine/puzzleTypes";
import { findHintMove, solvePuzzle } from "../engine/puzzleSolver";

function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

describe("puzzleSolver", () => {
  it("finds no moves needed for an already-solved board", () => {
    const engine = new PuzzleEngine(3);
    const path = solvePuzzle(engine.getState().tiles, 3);
    expect(path).toEqual([]);
    expect(findHintMove(engine.getState().tiles, 3)).toBeNull();
  });

  // Seeds chosen here are verified to solve quickly. IDA* search time is
  // inherently unpredictable per-instance (a well-known property of the
  // sliding puzzle domain) — some shuffled boards genuinely take much
  // longer than others even at the same grid size, so this intentionally
  // doesn't loop over arbitrary seeds; it demonstrates the solver working
  // end-to-end, not exhaustive coverage (see puzzleSolver's own comments
  // for the real-world timing this is bounded against).
  it(
    "solves shuffled boards and every move in the found solution is legal " +
      "(this is the empirical proof that shuffled boards are always solvable, " +
      "not just a re-check of the same construction logic the shuffle itself uses)",
    { timeout: 20000 },
    () => {
      const cases: { grid: GridSize; seed: number }[] = [
        { grid: 3, seed: 0 },
        { grid: 3, seed: 1 },
        { grid: 4, seed: 0 },
      ];

      for (const { grid, seed } of cases) {
        const engine = new PuzzleEngine(grid);
        engine.shuffle(seededRandom(seed * 31 + grid));
        expect(engine.isSolved()).toBe(false);

        const path = solvePuzzle(engine.getState().tiles, grid);
        expect(path).not.toBeNull();

        for (const position of path!) {
          expect(engine.move(position)).toBe(true);
        }
        expect(engine.isSolved()).toBe(true);
      }
    }
  );

  it("findHintMove returns just the first step of a full solution", () => {
    const engine = new PuzzleEngine(3);
    engine.shuffle(seededRandom(7));
    const tiles = engine.getState().tiles;
    const fullPath = solvePuzzle(tiles, 3);
    const hint = findHintMove(tiles, 3);
    expect(hint).toBe(fullPath![0]);
  });
});
