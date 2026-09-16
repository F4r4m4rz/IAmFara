import { describe, expect, it } from "vitest";
import { createInitialGameState, gameReducer } from "../engine/gameReducer";

describe("gameReducer", () => {
  it("starts with no discovered clues", () => {
    const state = createInitialGameState();
    expect(state.discoveredClues.size).toBe(0);
  });

  it("adds a clue on DISCOVER_CLUE", () => {
    const state = gameReducer(createInitialGameState(), {
      type: "DISCOVER_CLUE",
      clueId: "found-northstar",
    });
    expect(state.discoveredClues.has("found-northstar")).toBe(true);
  });

  it("discovering the same clue twice is a no-op (same state reference)", () => {
    const once = gameReducer(createInitialGameState(), {
      type: "DISCOVER_CLUE",
      clueId: "found-northstar",
    });
    const twice = gameReducer(once, { type: "DISCOVER_CLUE", clueId: "found-northstar" });
    expect(twice).toBe(once);
    expect(twice.discoveredClues.size).toBe(1);
  });

  it("accumulates multiple distinct clues", () => {
    let state = createInitialGameState();
    state = gameReducer(state, { type: "DISCOVER_CLUE", clueId: "screenshot-url-fragment" });
    state = gameReducer(state, { type: "DISCOVER_CLUE", clueId: "found-northstar" });
    state = gameReducer(state, { type: "DISCOVER_CLUE", clueId: "photo-2003-leo" });
    expect(state.discoveredClues.size).toBe(3);
  });

  it("does not mutate the previous state's clue set", () => {
    const before = createInitialGameState();
    gameReducer(before, { type: "DISCOVER_CLUE", clueId: "found-northstar" });
    expect(before.discoveredClues.size).toBe(0);
  });
});
