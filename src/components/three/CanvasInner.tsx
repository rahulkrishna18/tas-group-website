"use client";

import { Component, ReactNode, Suspense, useEffect } from "react";
import { Canvas, CanvasProps, RootState, useThree } from "@react-three/fiber";
import * as THREE from "three";

class CanvasBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(err: unknown) {
    console.warn("[3D] scene disabled:", err);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/**
 * Mounted after the scene graph (same Suspense boundary): compiles every shader program and
 * renders one frame while the canvas may still be off-screen, so the first visible frame is instant.
 */
function Warmup({ onReady }: { onReady?: () => void }) {
  const { gl, scene, camera, advance } = useThree();
  useEffect(() => {
    let cancelled = false;
    const raf = requestAnimationFrame(async () => {
      try {
        // parallel compile where supported; otherwise compile synchronously (still off-screen)
        if (gl.extensions.has("KHR_parallel_shader_compile")) await gl.compileAsync(scene, camera);
        else gl.compile(scene, camera);
      } catch {
        // compileAsync is an optimisation only; the frame below compiles anything left over
      }
      if (cancelled) return;
      // Draw every object once (not just what the opening camera sees): some GPU backends
      // (e.g. ANGLE on Metal) finish pipeline creation on first draw, which would otherwise
      // cause a hitch when the visitor first sees a part of the scene.
      const culled: THREE.Object3D[] = [];
      scene.traverse((o) => {
        if (o.frustumCulled) {
          culled.push(o);
          o.frustumCulled = false;
        }
      });
      advance(performance.now());
      culled.forEach((o) => (o.frustumCulled = true));
      advance(performance.now());
      onReady?.();
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
    // runs once per mounted scene
  }, []);
  return null;
}

export type CanvasInnerProps = Omit<CanvasProps, "children"> & {
  children: ReactNode;
  fallback: ReactNode;
  mobile: boolean;
  onReady?: () => void;
};

/** The WebGL canvas itself — loaded on demand so three.js stays out of the initial bundle. */
export default function CanvasInner({ children, fallback, mobile, onReady, onCreated, ...rest }: CanvasInnerProps) {
  return (
    <CanvasBoundary fallback={fallback}>
      <Canvas
        dpr={mobile ? [1, 1.5] : [1, 2]}
        gl={{ antialias: !mobile, powerPreference: "high-performance", alpha: false, stencil: false }}
        onCreated={(state: RootState) => {
          state.gl.toneMapping = THREE.ACESFilmicToneMapping;
          state.gl.toneMappingExposure = 1.05;
          state.gl.setClearColor("#06141d");
          onCreated?.(state);
        }}
        {...rest}
      >
        <Suspense fallback={null}>
          {children}
          <Warmup onReady={onReady} />
        </Suspense>
      </Canvas>
    </CanvasBoundary>
  );
}
