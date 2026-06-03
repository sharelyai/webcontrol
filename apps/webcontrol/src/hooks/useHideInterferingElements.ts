import { useEffect } from "react";

/**
 * Some host pages render fixed elements (footers, third-party chat launchers)
 * that overlap the widget on mobile. While the widget is mounted this hides
 * them, polling for 5 minutes to catch late-injected nodes, and restores them
 * on unmount. Extracted verbatim from WebControl — behavior unchanged.
 *
 * Note: `isMobile` is intentionally captured once on mount (empty deps), matching
 * the original effect.
 */
export const useHideInterferingElements = (isMobile: boolean) => {
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const elementsToHide = [
      "bsf-footer",
      "#INDshadowRootWrap",
      "#launcher-frame",
    ];

    const hideElements = () => {
      if (isMobile) {
        elementsToHide.forEach((selector) => {
          const element = document.querySelector(selector);
          if (element && element instanceof HTMLElement) {
            element.style.display = "none";
          }
        });
      }
    };

    const showElements = () => {
      elementsToHide.forEach((selector) => {
        const element = document.querySelector(selector);
        if (element && element instanceof HTMLElement) {
          element.style.display = "";
        }
      });
    };

    hideElements();
    intervalId = setInterval(hideElements, 500);
    timeoutId = setTimeout(() => {
      if (intervalId) clearInterval(intervalId);
    }, 5 * 60 * 1000);

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
      showElements();
    };
  }, []);
};
