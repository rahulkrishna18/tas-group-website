"use client";

import { ReactNode, Suspense, lazy, useEffect, useRef, useState } from "react";
import type { CanvasProps } from "@react-three/fiber";
import { useInView } from "@/hooks/useInView";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { loadCanvas, preload3D, whenIdle } from "./scenes";

const CanvasInner = lazy(loadCanvas);

/** Scenes warm up one after another: each `eager` order waits for the previous one to be ready. */
const readyOrders = new Set<number>();
const READY_EVENT = "tas:3d-ready";
function markReady(order: number) {
  readyOrders.add(order);
  window.dispatchEvent(new Event(READY_EVENT));
}

let webglCache: boolean | undefined;
function webglAvailable() {
  if (webglCache !== undefined) return webglCache;
  try {
    const c = document.createElement("canvas");
    webglCache = !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    webglCache = false;
  }
  return webglCache;
}

type Props = Omit<CanvasProps, "children"> & {
  children: ReactNode;
  className?: string;
  /** Shown if WebGL is unavailable or the scene throws. */
  fallback?: ReactNode;
  /** How far outside the viewport to start mounting the scene. */
  mountMargin?: string;
  /** Render frames only while visible (default true). */
  pauseOffscreen?: boolean;
  /**
   * Mount in the background in this order (0 = first, i.e. the hero), each scene starting once the
   * previous one is ready, so it is compiled and its first frame rendered before the visitor arrives.
   */
  eager?: number;
  /** Show a loading overlay until the scene is warmed up (default true). */
  loader?: boolean;
};

/**
 * Lazily-mounted R3F canvas. Mounts ahead of the viewport (or in the background on desktop),
 * warms up off-screen, stops rendering when off-screen, caps DPR on small screens, and falls
 * back gracefully without WebGL.
 */
export default function SceneCanvas({ children, className, fallback = null, mountMargin = "200% 0px", pauseOffscreen = true, eager, loader = true, ...rest }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const near = useInView(host, mountMargin);
  const visible = useInView(host, "0px");
  const [mounted, setMounted] = useState(false);
  const [supported, setSupported] = useState(true);
  const [ready, setReady] = useState(false);
  const mobile = useIsMobile();

  useEffect(() => {
    setSupported(webglAvailable());
    // Any 3D section on the page kicks off a background fetch of all 3D code.
    return whenIdle(preload3D);
  }, []);

  useEffect(() => {
    if (near) setMounted(true);
  }, [near]);

  // Background mount, chained: wait for the previous scene to be ready, then use idle time.
  useEffect(() => {
    if (eager === undefined || mounted) return;
    let cancelIdle = () => {};
    let scheduled = false;
    const tryMount = () => {
      if (scheduled || (eager > 0 && !readyOrders.has(eager - 1))) return;
      scheduled = true;
      cancelIdle = whenIdle(() => setMounted(true), 1000);
    };
    tryMount();
    window.addEventListener(READY_EVENT, tryMount);
    // safety net if an earlier scene never mounts (e.g. the globe hidden behind the region map)
    const fallback = setTimeout(() => setMounted(true), 5000 + eager * 1500);
    return () => {
      window.removeEventListener(READY_EVENT, tryMount);
      clearTimeout(fallback);
      cancelIdle();
    };
  }, [eager, mounted]);

  return (
    <div ref={host} className={className} aria-hidden="true">
      {!supported ? (
        fallback
      ) : mounted ? (
        <Suspense fallback={null}>
          <CanvasInner
            fallback={fallback}
            mobile={mobile}
            onReady={() => {
              setReady(true);
              if (eager !== undefined) markReady(eager);
            }}
            frameloop={pauseOffscreen && !visible ? "never" : "always"}
            {...rest}
          >
            {children}
          </CanvasInner>
        </Suspense>
      ) : null}
      {loader && supported && (
        <div className={`pointer-events-none absolute inset-0 grid place-items-center bg-abyss/40 transition-opacity duration-500 ${ready ? "opacity-0" : "opacity-100"}`}>
          <div className="flex flex-col items-center gap-4">
            <span className="relative block h-10 w-10">
              <span className="absolute inset-0 animate-ping rounded-full border border-cyan/50" />
              <span className="absolute inset-3 rotate-45 bg-cargo" />
            </span>
            <span className="label text-mist">Loading 3D scene</span>
          </div>
        </div>
      )}
    </div>
  );
}
