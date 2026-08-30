"use client";

import { useRef } from "react";

/**
 * Keeps a closing dropdown from leaving its focus border on the trigger.
 *
 * Radix hands focus back to the trigger when the menu closes, and a programmatic `focus()`
 * counts as `:focus-visible` in Chrome - so after every click the trigger kept a focus
 * border until something else was clicked. Suppressed for the pointer only: a keyboard user
 * who closes with Escape would otherwise land on the body and lose their place.
 */
export function useMenuFocusReturn() {
  const usedPointer = useRef(false);

  return {
    triggerProps: {
      onPointerDown: () => {
        usedPointer.current = true;
      },
      onKeyDown: () => {
        usedPointer.current = false;
      },
    },
    contentProps: {
      onCloseAutoFocus: (event: Event) => {
        if (usedPointer.current) event.preventDefault();
      },
    },
  };
}
