"use client";

import { lazy } from "react";

/**
 * Single place that knows how to load the WebGL code. Scenes are React.lazy (not next/dynamic)
 * so they suspend into the canvas's own Suspense boundary, which lets the canvas warm up
 * (compile shaders + render a first frame) only once the scene graph actually exists.
 */
export const loadCanvas = () => import("./CanvasInner");

const loaders = {
  hero: () => import("../scenes/HeroScene"),
  port: () => import("../scenes/PortScene"),
  marine: () => import("../scenes/MarineScene"),
  globe: () => import("../scenes/NetworkGlobeScene"),
};

export const HeroScene = lazy(loaders.hero);
export const PortScene = lazy(loaders.port);
export const MarineScene = lazy(loaders.marine);
export const NetworkGlobeScene = lazy(loaders.globe);

let preloading = false;
/** Fetch every 3D chunk in the background so no scene waits on the network when reached. */
export function preload3D() {
  if (preloading) return;
  preloading = true;
  loadCanvas();
  Object.values(loaders).forEach((load) => load());
}

/** Run work when the main thread is idle (falls back to a timeout in Safari). */
export function whenIdle(fn: () => void, timeout = 1500) {
  if (typeof window === "undefined") return () => {};
  if ("requestIdleCallback" in window) {
    const id = window.requestIdleCallback(fn, { timeout });
    return () => window.cancelIdleCallback(id);
  }
  const id = setTimeout(fn, 200);
  return () => clearTimeout(id);
}
