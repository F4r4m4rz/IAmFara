/**
 * An atomic discoverable fact. Case content declares these; the player's
 * progress is just the set of clue ids they've found. Deliberately a plain
 * string union rather than a generic `string` so a typo'd clue id anywhere
 * (a puzzle referencing a clue that doesn't exist) is a compile error, not a
 * silent runtime no-op.
 */
export type ClueId =
  | "screenshot-url-fragment"
  | "found-northstar"
  | "photo-2003-leo";

export interface GameState {
  readonly discoveredClues: ReadonlySet<ClueId>;
}

export type GameAction = { type: "DISCOVER_CLUE"; clueId: ClueId };
