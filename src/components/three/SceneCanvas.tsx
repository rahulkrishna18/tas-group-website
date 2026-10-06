"use client";

import dynamic from "next/dynamic";
import { ReactNode, useEffect, useRef, useState } from "react";
import type { CanvasProps } from "@react-three/fiber";
import { useInView } from "@/hooks/useInView";
import { useIsMobile } from "@/hooks/useMediaQuery";

const CanvasInner = dynamic(() => import("./CanvasInner"), { ssr: false });

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
  /** Imports the scene module in parallel with the canvas chunk (avoids a load waterfall). */
  preload?: () => Promise<unknown>;
  /** Show a loading overlay until the scene is ready (default true). */
  loader?: boolean;
};

/**
 * Lazily-mounted R3F canvas: mounts when approaching the viewport, stops rendering when
 * off-screen, caps pixel ratio on small screens, and falls back gracefully without WebGL.
 */
export default function SceneCanvas({ children, className, fallback = null, mountMargin = "60% 0px", pauseOffscreen = true, preload, loader = true, onCreated, ...rest }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const near = useInView(host, mountMargin);
  const visible = useInView(host, "0px");
  const [mounted, setMounted] = useState(false);
  const [supported, setSupported] = useState(true);
  const [sceneLoaded, setSceneLoaded] = useState(!preload);
  const [created, setCreated] = useState(false);
  const mobile = useIsMobile();

  useEffect(() => {
    setSupported(webglAvailable());
  }, []);
  useEffect(() => {
    if (!near || mounted) return;
    setMounted(true);
    preload?.().then(() => setSceneLoaded(true), () => setSceneLoaded(true));
  }, [near, mounted, preload]);

  const ready = sceneLoaded && created;

  return (
    <div ref={host} className={className} aria-hidden="true">
      {!supported ? (
        fallback
      ) : mounted ? (
        <CanvasInner
          fallback={fallback}
          mobile={mobile}
          frameloop={pauseOffscreen && !visible ? "never" : "always"}
          onCreated={(state) => {
            setCreated(true);
            onCreated?.(state);
          }}
          {...rest}
        >
          {children}
        </CanvasInner>
      ) : null}
      {loader && supported && (
        <div className={`pointer-events-none absolute inset-0 grid place-items-center bg-abyss/40 transition-opacity duration-700 ${ready ? "opacity-0" : "opacity-100"}`}>
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
