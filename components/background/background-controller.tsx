"use client";
import { useEffect, useRef } from "react";
import { FancyBackground } from "../../assets/fancy-background";

export default function BackgroundController() {
  const backgroundRef = useRef<FancyBackground | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    // Only create a new instance if one doesn't exist
    if (!backgroundRef.current) {
      backgroundRef.current = new FancyBackground();
    }

    const fancyBackground = backgroundRef.current;

    const onMediaChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        fancyBackground.destroy();
      } else {
        fancyBackground.init();
      }
    };

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    mediaQuery.addEventListener("change", onMediaChange);

    if (!mediaQuery.matches) {
      fancyBackground.init();
    }

    return () => {
      mediaQuery.removeEventListener("change", onMediaChange);
      fancyBackground.destroy();
      // Clear the ref on cleanup
      backgroundRef.current = null;
    };
  }, []);

  return null;
} 