"use client";

import * as THREE from "three";
import { mulberry32 } from "@/lib/math";

export const PALETTE = {
  abyss: "#06141d",
  midnight: "#0b2233",
  hull: "#0f2c40",
  marine: "#1267a5",
  cyan: "#20b9d4",
  cargo: "#f28c28",
  foam: "#edf3f5",
  steel: "#75838c",
} as const;

/** Container liveries: mostly muted industrial tones, with TAS orange as the accent. */
export const CONTAINER_COLORS = [
  "#f28c28",
  "#1267a5",
  "#2e5f7a",
  "#75838c",
  "#b9c5cb",
  "#7d3a2c",
  "#123f5e",
  "#9aa7ad",
  "#5b6b74",
  "#d9dfe2",
  "#1d4b66",
  "#8c4a2f",
];

export const CONTAINER = { L: 6.06, H: 2.59, W: 2.44 } as const;

const cache = new Map<string, unknown>();
function memo<T>(key: string, make: () => T): T {
  if (!cache.has(key)) cache.set(key, make());
  return cache.get(key) as T;
}

/** Corrugated steel ribs as a greyscale map: multiplied by per-instance colour. */
export function ribTexture() {
  return memo("ribs", () => {
    const c = document.createElement("canvas");
    c.width = 128;
    c.height = 16;
    const g = c.getContext("2d")!;
    g.fillStyle = "#e9e9e9";
    g.fillRect(0, 0, 128, 16);
    for (let x = 0; x < 128; x += 8) {
      g.fillStyle = "#ffffff";
      g.fillRect(x, 0, 2, 16);
      g.fillStyle = "#bdbdbd";
      g.fillRect(x + 4, 0, 2, 16);
    }
    g.fillStyle = "#8f8f8f";
    g.fillRect(0, 0, 128, 1);
    g.fillRect(0, 15, 128, 1);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(3, 1);
    t.anisotropy = 4;
    return t;
  });
}

/** The TAS container: orange, corrugated, branded on its long sides. */
export function brandedContainerMaterials() {
  return memo("brand-mats", () => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 220;
    const g = c.getContext("2d")!;
    g.fillStyle = PALETTE.cargo;
    g.fillRect(0, 0, 512, 220);
    for (let x = 0; x < 512; x += 16) {
      g.fillStyle = "rgba(255,255,255,0.14)";
      g.fillRect(x, 0, 4, 220);
      g.fillStyle = "rgba(0,0,0,0.12)";
      g.fillRect(x + 8, 0, 4, 220);
    }
    g.fillStyle = "rgba(0,0,0,0.35)";
    g.fillRect(0, 0, 512, 6);
    g.fillRect(0, 214, 512, 6);
    g.fillStyle = "#ffffff";
    g.font = "800 112px Arial, Helvetica, sans-serif";
    g.textBaseline = "middle";
    g.fillText("TAS", 34, 104);
    g.font = "600 22px Arial, Helvetica, sans-serif";
    g.fillText("GROUP OF COMPANIES", 38, 176);
    g.fillStyle = "rgba(6,20,29,0.85)";
    g.font = "600 18px monospace";
    g.fillText("PENANG · 1978", 360, 30);
    const side = new THREE.CanvasTexture(c);
    side.colorSpace = THREE.SRGBColorSpace;
    side.anisotropy = 4;
    const sideMat = new THREE.MeshStandardMaterial({ map: side, roughness: 0.55, metalness: 0.05 });
    const endMat = new THREE.MeshStandardMaterial({ color: PALETTE.cargo, map: ribTexture(), roughness: 0.6, metalness: 0.05 });
    // BoxGeometry face order: +x, -x, +y, -y, +z, -z (long sides are ±z)
    return [endMat, endMat, endMat, endMat, sideMat, sideMat];
  });
}

export const mats = {
  steel: () => memo("m-steel", () => new THREE.MeshStandardMaterial({ color: "#d4dde2", roughness: 0.55, metalness: 0.08 })),
  marine: () => memo("m-marine", () => new THREE.MeshStandardMaterial({ color: PALETTE.marine, roughness: 0.5, metalness: 0.08 })),
  dark: () => memo("m-dark", () => new THREE.MeshStandardMaterial({ color: "#1a2f3b", roughness: 0.75, metalness: 0.05 })),
  hull: () => memo("m-hull", () => new THREE.MeshStandardMaterial({ color: "#1a4460", roughness: 0.6, metalness: 0.05 })),
  antifoul: () => memo("m-antifoul", () => new THREE.MeshStandardMaterial({ color: "#8a2f22", roughness: 0.7 })),
  white: () => memo("m-white", () => new THREE.MeshStandardMaterial({ color: "#e8eef1", roughness: 0.55, metalness: 0.1 })),
  concrete: () => memo("m-concrete", () => new THREE.MeshStandardMaterial({ color: "#3b4a53", roughness: 0.95 })),
  asphalt: () => memo("m-asphalt", () => new THREE.MeshStandardMaterial({ color: "#1b2a33", roughness: 1 })),
  rubber: () => memo("m-rubber", () => new THREE.MeshStandardMaterial({ color: "#0b1216", roughness: 0.9 })),
  glass: () => memo("m-glass", () => new THREE.MeshStandardMaterial({ color: "#16384d", roughness: 0.2, metalness: 0.1, emissive: "#20b9d4", emissiveIntensity: 0.12 })),
  roof: () => memo("m-roof", () => new THREE.MeshStandardMaterial({ color: "#6b7b84", roughness: 0.6, metalness: 0.1 })),
  cargoGlow: () => memo("m-cargo-glow", () => new THREE.MeshStandardMaterial({ color: PALETTE.cargo, emissive: PALETTE.cargo, emissiveIntensity: 2.2 })),
  cyanGlow: () => memo("m-cyan-glow", () => new THREE.MeshStandardMaterial({ color: PALETTE.cyan, emissive: PALETTE.cyan, emissiveIntensity: 2 })),
  lamp: () => memo("m-lamp", () => new THREE.MeshStandardMaterial({ color: "#ffd6a0", emissive: "#ffc27a", emissiveIntensity: 3 })),
  bulk: () => memo("m-bulk", () => new THREE.MeshStandardMaterial({ color: "#8d8173", roughness: 1, flatShading: true })),
  orange: () => memo("m-orange", () => new THREE.MeshStandardMaterial({ color: PALETTE.cargo, roughness: 0.5, metalness: 0.2 })),
};

export const containerGeometry = () =>
  memo("g-container", () => new THREE.BoxGeometry(CONTAINER.L, CONTAINER.H, CONTAINER.W));

export const containerInstanceMaterial = () =>
  memo("m-container-inst", () => new THREE.MeshStandardMaterial({ map: ribTexture(), roughness: 0.65, metalness: 0.05 }));

export function seededColors(seed: number, count: number, orangeBias = 0.12) {
  const rnd = mulberry32(seed);
  const out: THREE.Color[] = [];
  for (let i = 0; i < count; i++) {
    const hex = rnd() < orangeBias ? PALETTE.cargo : CONTAINER_COLORS[1 + Math.floor(rnd() * (CONTAINER_COLORS.length - 1))];
    out.push(new THREE.Color(hex).multiplyScalar(0.85 + rnd() * 0.25));
  }
  return out;
}

export function latLonToVec3(lat: number, lon: number, r = 1, target = new THREE.Vector3()) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;
  return target.set(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
}
