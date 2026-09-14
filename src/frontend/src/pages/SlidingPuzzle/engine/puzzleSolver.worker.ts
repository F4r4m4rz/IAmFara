/// <reference lib="webworker" />
import { findHintMove } from "./puzzleSolver";
import { GridSize } from "./puzzleTypes";

export type HintRequest = {
  requestId: number;
  tiles: readonly number[];
  grid: GridSize;
};

export type HintResponse = {
  requestId: number;
  move: number | null;
};

self.onmessage = (event: MessageEvent<HintRequest>) => {
  const { requestId, tiles, grid } = event.data;
  const move = findHintMove(tiles, grid);
  const response: HintResponse = { requestId, move };
  self.postMessage(response);
};
