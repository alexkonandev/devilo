import { useEffect, RefObject } from "react";

/**
 * Hook utilitaire pour détecter les clics en dehors d'un élément spécifique.
 * Indispensable pour fermer les dropdowns de recherche client et les menus de thèmes.
 */
export function useOnClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T | null>,
  handler: (event: MouseEvent | TouchEvent) => void
): void {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const el = ref?.current;

      // Ne rien faire si le clic est sur l'élément lui-même ou ses enfants
      if (!el || el.contains(event.target as Node)) {
        return;
      }

      handler(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}
