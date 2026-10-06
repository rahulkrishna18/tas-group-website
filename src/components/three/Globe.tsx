"use client";

import { MutableRefObject, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import { Html, Line } from "@react-three/drei";
import type { Line2 } from "three-stdlib";
import { LAND_DOTS_B64 } from "@/data/geo/landDots";
import { PALETTE, latLonToVec3 } from "./materials";
import type { Office, OfficeId } from "@/content/site";

export type Mode = "sea" | "air" | "land";
export type Arc = { id: string; mode: Mode; points: [number, number][]; verified?: boolean };

/* ------------------------------------------------------------------ */
/* Route data                                                         */
/* ------------------------------------------------------------------ */
const PEN: [number, number] = [5.4, 100.37];
const KUL: [number, number] = [2.745, 101.7];

/** Malaysia to Singapore land haulage corridor (service area published by TAS / Bexxbay Express). */
export const LAND_CORRIDOR: Arc = {
  id: "land-my-sg",
  mode: "land",
  verified: true,
  points: [PEN, [4.6, 101.08], [3.68, 101.52], [3.007, 101.44], [2.745, 101.7], [2.28, 102.27], [2.01, 103.06], [1.47, 103.76], [1.327, 103.7]],
};

/** Visual demonstration only: not TAS routes. */
export const ILLUSTRATIVE_ARCS: Arc[] = [
  { id: "sea-east", mode: "sea", points: [PEN, [3.4, 100.9], [1.25, 103.9], [3.5, 106.2], [10.5, 110.6], [18.5, 113.6], [22.1, 114.6]] },
  { id: "sea-west", mode: "sea", points: [PEN, [6.2, 95.2], [5.9, 87.5], [6.6, 81.2], [7.6, 77.3], [10.5, 70.0], [18.6, 66.0]] },
  { id: "sea-south", mode: "sea", points: [PEN, [3.4, 100.9], [1.25, 103.9], [-1.5, 106.8], [-5.8, 106.9]] },
  { id: "air-1", mode: "air", points: [KUL, [25.25, 55.36]] },
  { id: "air-2", mode: "air", points: [KUL, [35.55, 139.78]] },
  { id: "air-3", mode: "air", points: [KUL, [-33.94, 151.18]] },
  { id: "air-4", mode: "air", points: [KUL, [51.47, -0.45]] },
];

export const MODE_COLOR: Record<Mode, string> = { sea: PALETTE.cyan, air: PALETTE.cargo, land: "#edf3f5" };

function arcPositions(arc: Arc, r: number) {
  const out: THREE.Vector3[] = [];
  if (arc.mode === "air") {
    const a = latLonToVec3(arc.points[0][0], arc.points[0][1], 1);
    const b = latLonToVec3(arc.points[1][0], arc.points[1][1], 1);
    const angle = a.angleTo(b);
    const lift = 0.06 + angle * 0.16;
    const n = 96;
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const v = new THREE.Vector3().copy(a).lerp(b, t).normalize();
      // proper slerp for long arcs
      const s = Math.sin(angle);
      if (s > 1e-4) v.copy(a).multiplyScalar(Math.sin((1 - t) * angle) / s).add(b.clone().multiplyScalar(Math.sin(t * angle) / s));
      out.push(v.multiplyScalar(r * (1 + lift * Math.sin(Math.PI * t))));
    }
    return out;
  }
  const alt = arc.mode === "sea" ? 0.006 : 0.004;
  const ctrl = arc.points.map(([la, lo]) => latLonToVec3(la, lo, 1));
  const curve = new THREE.CatmullRomCurve3(ctrl, false, "centripetal");
  const n = Math.max(24, arc.points.length * 18);
  for (let i = 0; i <= n; i++) out.push(curve.getPoint(i / n).normalize().multiplyScalar(r * (1 + alt)));
  return out;
}

/* ------------------------------------------------------------------ */
/* Orientation helpers                                                 */
/* ------------------------------------------------------------------ */
const NORTH = new THREE.Vector3(0, 1, 0);
/** Quaternion that rotates the globe so (lat, lon) faces +Z with north up. */
export function facingQuaternion(lat: number, lon: number) {
  const z = latLonToVec3(lat, lon, 1);
  const y = NORTH.clone().sub(z.clone().multiplyScalar(NORTH.dot(z))).normalize();
  const x = new THREE.Vector3().crossVectors(y, z);
  const m = new THREE.Matrix4().makeBasis(x, y, z);
  return new THREE.Quaternion().setFromRotationMatrix(m).invert();
}

/* ------------------------------------------------------------------ */
/* Shaders                                                            */
/* ------------------------------------------------------------------ */
const dotVert = /* glsl */ `
  uniform float uSize;
  uniform float uProj;
  uniform vec3 uFocus;
  varying float vFacing;
  varying float vFocus;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vec4 mv = viewMatrix * wp;
    gl_Position = projectionMatrix * mv;
    float scale = length(modelMatrix[0].xyz);
    gl_PointSize = clamp(uSize * scale * uProj / -mv.z, 1.0, 7.0);
    vec3 n = normalize(wp.xyz - (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz);
    vFacing = dot(n, normalize(cameraPosition - wp.xyz));
    vFocus = smoothstep(0.9965, 0.9995, dot(normalize(position), uFocus));
  }
`;
const dotFrag = /* glsl */ `
  uniform float uOpacity;
  uniform vec3 uColor;
  uniform vec3 uFocusColor;
  varying float vFacing;
  varying float vFocus;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.32, d);
    float limb = smoothstep(-0.05, 0.35, vFacing);
    vec3 col = mix(uColor, uFocusColor, vFocus);
    gl_FragColor = vec4(col, a * uOpacity * limb * mix(0.55, 1.0, vFocus));
    #include <colorspace_fragment>
  }
`;
const atmoVert = /* glsl */ `
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;
const atmoFrag = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    float rim = pow(1.0 - abs(dot(vN, vV)), 3.2);
    gl_FragColor = vec4(uColor, rim * uOpacity);
    #include <colorspace_fragment>
  }
`;

function decodeDots(r: number) {
  const bin = atob(LAND_DOTS_B64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const pairs = new Int16Array(bytes.buffer);
  const pos = new Float32Array((pairs.length / 2) * 3);
  const v = new THREE.Vector3();
  for (let i = 0; i < pairs.length; i += 2) {
    latLonToVec3(pairs[i] / 100, pairs[i + 1] / 100, r, v);
    pos.set([v.x, v.y, v.z], (i / 2) * 3);
  }
  return pos;
}

/* ------------------------------------------------------------------ */
/* Globe                                                              */
/* ------------------------------------------------------------------ */
type GlobeProps = {
  radius?: number;
  offices?: Office[];
  arcs?: Arc[];
  selected?: OfficeId | null;
  onSelect?: (id: OfficeId) => void;
  showLabels?: boolean;
  /** 0 to 1: overall fade (hero uses this to materialise the globe) */
  fade?: MutableRefObject<number>;
  /** 0 to 1: how much of each arc is drawn */
  draw?: MutableRefObject<number>;
  dotSize?: number;
};

export function Globe({ radius = 1, offices = [], arcs = [], selected, onSelect, showLabels = false, fade, draw, dotSize = 1 }: GlobeProps) {
  const dotsGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(decodeDots(radius), 3));
    return g;
  }, [radius]);

  const dotMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: dotVert,
        fragmentShader: dotFrag,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uSize: { value: 0.0085 * dotSize * radius },
          uProj: { value: 800 },
          uOpacity: { value: 1 },
          uColor: { value: new THREE.Color("#8fa6b3") },
          uFocusColor: { value: new THREE.Color(PALETTE.cyan) },
          uFocus: { value: latLonToVec3(4.0, 101.6, 1) },
        },
      }),
    [radius, dotSize]
  );
  const atmoMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: atmoVert,
        fragmentShader: atmoFrag,
        transparent: true,
        depthWrite: false,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        uniforms: { uColor: { value: new THREE.Color(PALETTE.cyan) }, uOpacity: { value: 0.4 } },
      }),
    []
  );
  const baseMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#081c29", roughness: 0.9, metalness: 0.1, transparent: true, emissive: "#0b2233", emissiveIntensity: 0.6 }), []);
  const gratMat = useMemo(() => new THREE.LineBasicMaterial({ color: "#20b9d4", transparent: true, opacity: 0.07 }), []);

  const graticule = useMemo(() => {
    const pts: number[] = [];
    const v = new THREE.Vector3();
    const push = (la: number, lo: number) => {
      latLonToVec3(la, lo, radius * 1.001, v);
      pts.push(v.x, v.y, v.z);
    };
    for (let la = -60; la <= 75; la += 15) for (let lo = -180; lo < 180; lo += 3) { push(la, lo); push(la, lo + 3); }
    for (let lo = -180; lo < 180; lo += 15) for (let la = -80; la < 80; la += 3) { push(la, lo); push(la + 3, lo); }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, [radius]);

  useFrame(({ camera, gl }) => {
    const f = fade ? fade.current : 1;
    const fov = (camera as THREE.PerspectiveCamera).fov ?? 40;
    dotMat.uniforms.uProj.value = gl.domElement.height / (2 * Math.tan(THREE.MathUtils.degToRad(fov) / 2));
    dotMat.uniforms.uOpacity.value = f;
    atmoMat.uniforms.uOpacity.value = 0.4 * f;
    baseMat.opacity = 0.96 * f;
    baseMat.visible = f > 0.001;
    gratMat.opacity = 0.07 * f;
  });

  return (
    <group>
      <mesh material={baseMat} renderOrder={1}>
        <sphereGeometry args={[radius * 0.997, 64, 48]} />
      </mesh>
      <lineSegments geometry={graticule} material={gratMat} renderOrder={2} />
      <points geometry={dotsGeo} material={dotMat} renderOrder={3} />
      <mesh material={atmoMat} scale={1.07}>
        <sphereGeometry args={[radius, 48, 32]} />
      </mesh>
      {arcs.map((a) => (
        <RouteArc key={a.id} arc={a} radius={radius} draw={draw} fade={fade} />
      ))}
      {offices.map((o) => (
        <OfficeNode key={o.id} office={o} radius={radius} selected={selected === o.id} onSelect={onSelect} showLabel={showLabels} fade={fade} />
      ))}
    </group>
  );
}

function RouteArc({ arc, radius, draw, fade }: { arc: Arc; radius: number; draw?: MutableRefObject<number>; fade?: MutableRefObject<number> }) {
  const pts = useMemo(() => arcPositions(arc, radius), [arc, radius]);
  const line = useRef<Line2>(null);
  const runner = useRef<THREE.Mesh>(null);
  const offset = useMemo(() => (arc.id.length * 0.137) % 1, [arc.id]);
  const color = MODE_COLOR[arc.mode];
  const segs = pts.length - 1;

  useFrame(({ clock }) => {
    const d = draw ? draw.current : 1;
    const f = fade ? fade.current : 1;
    const l = line.current;
    if (l) {
      const g = l.geometry as THREE.InstancedBufferGeometry;
      g.instanceCount = Math.max(0, Math.floor(segs * d));
      const m = l.material as THREE.Material & { opacity: number };
      m.opacity = (arc.mode === "land" ? 0.95 : 0.8) * f;
    }
    if (runner.current) {
      const speed = arc.mode === "air" ? 0.11 : arc.mode === "sea" ? 0.05 : 0.07;
      const t = ((clock.elapsedTime * speed + offset) % 1) * Math.min(1, d);
      const i = t * segs;
      const i0 = Math.floor(i);
      const i1 = Math.min(segs, i0 + 1);
      runner.current.position.lerpVectors(pts[i0], pts[i1], i - i0);
      runner.current.visible = d > 0.98 && f > 0.2;
    }
  });

  return (
    <group>
      <Line
        ref={line}
        points={pts}
        color={color}
        lineWidth={arc.mode === "land" ? 2.2 : 1.6}
        transparent
        dashed={!arc.verified}
        dashSize={arc.mode === "air" ? 0.025 : 0.012}
        gapSize={arc.mode === "air" ? 0.018 : 0.01}
        depthWrite={false}
        renderOrder={4}
      />
      <mesh ref={runner} renderOrder={5}>
        <sphereGeometry args={[radius * (arc.mode === "air" ? 0.0075 : 0.006), 10, 8]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
    </group>
  );
}

function OfficeNode({ office, radius, selected, onSelect, showLabel, fade }: { office: Office; radius: number; selected: boolean; onSelect?: (id: OfficeId) => void; showLabel: boolean; fade?: MutableRefObject<number> }) {
  const pos = useMemo(() => latLonToVec3(office.lat, office.lon, radius * 1.002), [office, radius]);
  const ring = useRef<THREE.Mesh>(null);
  const group = useRef<THREE.Group>(null);
  const [facing, setFacing] = useState(true);
  const [hover, setHover] = useState(false);
  const isHQ = office.id === "penang";
  const color = isHQ ? PALETTE.cargo : PALETTE.cyan;
  const ringMat = useMemo(() => new THREE.MeshBasicMaterial({ color, transparent: true, side: THREE.DoubleSide, depthWrite: false, toneMapped: false }), [color]);
  const coreMat = useMemo(() => new THREE.MeshBasicMaterial({ color, transparent: true, toneMapped: false }), [color]);

  useEffect(() => {
    group.current?.lookAt(pos.clone().multiplyScalar(2));
  }, [pos]);
  useEffect(() => {
    document.body.style.cursor = hover ? "pointer" : "";
    return () => {
      document.body.style.cursor = "";
    };
  }, [hover]);

  const wp = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ clock, camera }) => {
    const f = fade ? fade.current : 1;
    const t = (clock.elapsedTime * 0.6 + (isHQ ? 0 : office.lat * 0.1)) % 1;
    if (ring.current) {
      const s = 1 + t * (selected ? 3.2 : 2.4);
      ring.current.scale.set(s, s, s);
      ringMat.opacity = (1 - t) * 0.85 * f;
    }
    coreMat.opacity = f;
    if (group.current && showLabel) {
      group.current.getWorldPosition(wp);
      const n = wp.clone().normalize();
      const toCam = camera.position.clone().sub(wp).normalize();
      const vis = n.dot(toCam) > 0.15;
      if (vis !== facing) setFacing(vis);
    }
  });

  const r = radius * (selected ? 0.0085 : 0.0062);
  return (
    <group ref={group} position={pos}>
      <mesh material={coreMat} renderOrder={6}>
        <circleGeometry args={[r, 20]} />
      </mesh>
      <mesh ref={ring} material={ringMat} renderOrder={6}>
        <ringGeometry args={[r * 1.3, r * 1.6, 28]} />
      </mesh>
      {onSelect && (
        <mesh
          visible={false}
          onClick={(e: ThreeEvent<MouseEvent>) => {
            e.stopPropagation();
            onSelect(office.id);
          }}
          onPointerOver={(e: ThreeEvent<PointerEvent>) => {
            e.stopPropagation();
            setHover(true);
          }}
          onPointerOut={() => setHover(false)}
        >
          <sphereGeometry args={[radius * 0.022, 8, 8]} />
        </mesh>
      )}
      {showLabel && facing && (
        <Html position={[0, 0, 0]} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
          <div
            className={`label -translate-y-1/2 whitespace-nowrap pl-3 transition-colors ${selected || hover ? "text-foam" : "text-mist/70"}`}
            style={{ transform: `translate(${labelOffset[office.id][0]}px, ${labelOffset[office.id][1]}px)` }}
          >
            <span style={{ color }}>{office.code}</span> {office.name}
          </div>
        </Html>
      )}
    </group>
  );
}

/** Screen-space nudges so close-together node labels don't overlap. */
const labelOffset: Record<OfficeId, [number, number]> = {
  penang: [6, -4],
  langkawi: [6, -14],
  portklang: [-120, -6],
  klia: [6, 6],
  singapore: [6, 6],
};
