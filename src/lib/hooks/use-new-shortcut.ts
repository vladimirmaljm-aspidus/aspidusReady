"use client";

import * as React from "react";

/**
 * Bind the global "n" keyboard shortcut (dispatched as the "aspidus:new"
 * CustomEvent by KeyboardShortcuts) to a view-local "create" handler.
 * Handler runs only while the component is mounted.
 */
export function useNewShortcut(onNew: () => void) {
  const ref = React.useRef(onNew);
  ref.current = onNew;
  React.useEffect(() => {
    function handle() { ref.current(); }
    window.addEventListener("aspidus:new", handle);
    return () => window.removeEventListener("aspidus:new", handle);
  }, []);
}
