import { GameAction, GameState } from "./types";

/**
 * Pure, framework-free game-state reducer — no dependency on React or the
 * DOM, so it can be unit tested directly. Mirrors the "pure engine" pattern
 * already used by pages/SlidingPuzzle/engine/PuzzleEngine.ts in this repo.
 */
export function createInitialGameState(): GameState {
  return { discoveredClues: new Set() };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "DISCOVER_CLUE": {
      if (state.discoveredClues.has(action.clueId)) return state; // already known, no-op
      const discoveredClues = new Set(state.discoveredClues);
      discoveredClues.add(action.clueId);
      return { discoveredClues };
    }
    default:
      return state;
  }
}
