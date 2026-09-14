import { Direction } from "../engine/puzzleTypes";

type InputHandlers = {
  /** Called when the user taps/clicks a point on the board. */
  onPointAt: (x: number, y: number) => void;
  /** Called on an arrow-key press. */
  onArrowKey: (direction: Direction) => void;
};

const ARROW_KEYS: Record<string, Direction> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
};

/**
 * Wires Pointer Events (covers touch, mouse, and pen with one code path)
 * and keyboard input for the puzzle board onto a single element. Pure DOM
 * glue — knows nothing about the engine or rendering.
 */
export class PuzzleInputController {
  private readonly element: HTMLElement;
  private readonly handlers: InputHandlers;
  private activePointerId: number | null = null;

  constructor(element: HTMLElement, handlers: InputHandlers) {
    this.element = element;
    this.handlers = handlers;

    element.addEventListener("pointerdown", this.handlePointerDown);
    element.addEventListener("pointerup", this.handlePointerUp);
    element.addEventListener("pointercancel", this.handlePointerCancel);
    element.addEventListener("keydown", this.handleKeyDown);
  }

  destroy(): void {
    this.element.removeEventListener("pointerdown", this.handlePointerDown);
    this.element.removeEventListener("pointerup", this.handlePointerUp);
    this.element.removeEventListener("pointercancel", this.handlePointerCancel);
    this.element.removeEventListener("keydown", this.handleKeyDown);
  }

  private handlePointerDown = (event: PointerEvent): void => {
    this.activePointerId = event.pointerId;
    // Only claim the gesture (and block scroll) once it's actually on the
    // board, so normal page scrolling elsewhere is never affected.
    this.element.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  };

  private handlePointerUp = (event: PointerEvent): void => {
    if (this.activePointerId !== event.pointerId) return;
    this.activePointerId = null;

    const rect = this.element.getBoundingClientRect();
    this.handlers.onPointAt(event.clientX - rect.left, event.clientY - rect.top);
  };

  private handlePointerCancel = (event: PointerEvent): void => {
    if (this.activePointerId === event.pointerId) {
      this.activePointerId = null;
    }
  };

  private handleKeyDown = (event: KeyboardEvent): void => {
    const direction = ARROW_KEYS[event.key];
    if (!direction) return;
    event.preventDefault();
    this.handlers.onArrowKey(direction);
  };
}
