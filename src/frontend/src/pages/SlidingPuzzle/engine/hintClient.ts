import { GridSize } from "./puzzleTypes";
import type { HintRequest, HintResponse } from "./puzzleSolver.worker";

/**
 * Runs the hint solver in a Web Worker so a slow search (see
 * puzzleSolver.ts's own notes on why this can occasionally take seconds,
 * especially on Hard) never freezes the page. Only one search runs at a
 * time — requesting a new hint while one is in flight terminates and
 * restarts the worker rather than trying to run two searches at once.
 */
export class HintClient {
  private worker: Worker | null = null;
  private nextRequestId = 0;
  private pending: { requestId: number; resolve: (move: number | null) => void } | null = null;

  private ensureWorker(): Worker {
    if (this.worker) return this.worker;

    const worker = new Worker(new URL("./puzzleSolver.worker.ts", import.meta.url), {
      type: "module",
    });
    worker.onmessage = (event: MessageEvent<HintResponse>) => {
      if (this.pending && this.pending.requestId === event.data.requestId) {
        this.pending.resolve(event.data.move);
        this.pending = null;
      }
    };
    worker.onerror = () => {
      if (this.pending) {
        this.pending.resolve(null);
        this.pending = null;
      }
    };
    this.worker = worker;
    return worker;
  }

  requestHint(tiles: readonly number[], grid: GridSize): Promise<number | null> {
    if (this.pending) {
      // A worker can only run one search at a time anyway — cancel outright
      // rather than queue, so a fresh request always reflects the latest board.
      this.pending.resolve(null);
      this.pending = null;
      this.worker?.terminate();
      this.worker = null;
    }

    const worker = this.ensureWorker();
    const requestId = ++this.nextRequestId;

    return new Promise((resolve) => {
      this.pending = { requestId, resolve };
      const request: HintRequest = { requestId, tiles, grid };
      worker.postMessage(request);
    });
  }

  destroy(): void {
    this.worker?.terminate();
    this.worker = null;
    this.pending = null;
  }
}
