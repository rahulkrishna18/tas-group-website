"use client";

import { Component, ReactNode, Suspense } from "react";
import { Canvas, CanvasProps } from "@react-three/fiber";
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

export type CanvasInnerProps = Omit<CanvasProps, "children"> & { children: ReactNode; fallback: ReactNode; mobile: boolean };

/** The WebGL canvas itself: loaded on demand so three.js stays out of the initial bundle. */
export default function CanvasInner({ children, fallback, mobile, ...rest }: CanvasInnerProps) {
  return (
    <CanvasBoundary fallback={fallback}>
      <Canvas
        dpr={mobile ? [1, 1.5] : [1, 2]}
        gl={{ antialias: !mobile, powerPreference: "high-performance", alpha: false, stencil: false }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
          gl.setClearColor("#06141d");
        }}
        {...rest}
      >
        <Suspense fallback={null}>{children}</Suspense>
      </Canvas>
    </CanvasBoundary>
  );
}
