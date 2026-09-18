import { useEffect, useRef, useState } from "react";

/** Must match the sheets' own `transition-transform duration-200` class. */
const CLOSE_TRANSITION_MS = 200;

/**
 * Shared open/close lifecycle for the app's bottom sheets (QuickAddSheet,
 * MarkAsPaidSheet).
 *
 * Previously, calling the parent's `onClose` directly flipped `open` to
 * false in the same tick the sheet's own `if (!open) return null` unmounted
 * it — tearing a still-focused input straight out of the DOM with no
 * transition and no blur. On iOS Safari (this is most visible in an
 * installed PWA's standalone mode), a focused form control auto-zooms the
 * page; that zoom is meant to reset on blur, but removing the focused
 * element instead of blurring it first is a known way to leave the page
 * stuck zoomed in after the keyboard closes.
 *
 * `requestClose` blurs whatever's focused *while it's still attached*,
 * starts the slide-down/fade-out transition, and only calls the real
 * `onClose` (which unmounts the sheet) once that transition has had time
 * to finish — fixing both the stuck-zoom bug and the fact that the closing
 * animation never actually played before.
 */
export function useSheetClose(open: boolean, onClose: () => void) {
  const [visible, setVisible] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!open) return;
    clearTimeout(closeTimeoutRef.current);
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, [open]);

  // Guards against calling onClose after the owning component has itself
  // unmounted for an unrelated reason while a close was still pending.
  useEffect(() => () => clearTimeout(closeTimeoutRef.current), []);

  const requestClose = () => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    setVisible(false);
    closeTimeoutRef.current = setTimeout(onClose, CLOSE_TRANSITION_MS);
  };

  return { visible, requestClose };
}
