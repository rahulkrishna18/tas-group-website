"use client";

import { MutableRefObject, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import {
  CONTAINER,
  brandedContainerMaterials,
  containerGeometry,
  containerInstanceMaterial,
  mats,
  seededColors,
} from "./materials";
import { mulberry32 } from "@/lib/math";

type V3 = [number, number, number];

/* ------------------------------------------------------------------ */
/* Struts: a box stretched between two points (crane members, stays)  */
/* ------------------------------------------------------------------ */
const UP = new THREE.Vector3(0, 1, 0);
export function Strut({ from, to, t = 0.6, material }: { from: V3; to: V3; t?: number; material: THREE.Material }) {
  const { pos, quat, len } = useMemo(() => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const dir = b.clone().sub(a);
    const len = dir.length();
    const quat = new THREE.Quaternion().setFromUnitVectors(UP, dir.normalize());
    return { pos: a.add(b).multiplyScalar(0.5), quat, len };
  }, [from, to]);
  return (
    <mesh position={pos} quaternion={quat} material={material}>
      <boxGeometry args={[t, len, t]} />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/* Containers                                                         */
/* ------------------------------------------------------------------ */
export type Slot = { x: number; y: number; z: number; rotY?: number };

export function ContainerField({ slots, seed = 7, orangeBias = 0.1 }: { slots: Slot[]; seed?: number; orangeBias?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const colors = seededColors(seed, slots.length, orangeBias);
    const m = new THREE.Object3D();
    slots.forEach((s, i) => {
      m.position.set(s.x, s.y, s.z);
      m.rotation.set(0, s.rotY ?? 0, 0);
      m.updateMatrix();
      mesh.setMatrixAt(i, m.matrix);
      mesh.setColorAt(i, colors[i]);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [slots, seed, orangeBias]);
  if (!slots.length) return null;
  return <instancedMesh ref={ref} args={[containerGeometry(), containerInstanceMaterial(), slots.length]} />;
}

/** A yard block of stacked containers, long axis along X. */
export function yardBlock(o: { x: number; z: number; bays: number; rows: number; maxTier: number; seed: number; y?: number; gapX?: number }) {
  const rnd = mulberry32(o.seed);
  const out: Slot[] = [];
  const pitchX = CONTAINER.L + (o.gapX ?? 0.4);
  const pitchZ = CONTAINER.W + 0.25;
  for (let b = 0; b < o.bays; b++) {
    for (let r = 0; r < o.rows; r++) {
      const tiers = 1 + Math.floor(rnd() * o.maxTier);
      for (let t = 0; t < tiers; t++) {
        out.push({ x: o.x + b * pitchX, y: (o.y ?? 0) + CONTAINER.H * (t + 0.5), z: o.z + r * pitchZ });
      }
    }
  }
  return out;
}

export function BrandedContainer({ innerRef, position }: { innerRef?: React.Ref<THREE.Mesh>; position?: V3 }) {
  return <mesh ref={innerRef} position={position} geometry={containerGeometry()} material={brandedContainerMaterials()} />;
}

/* ------------------------------------------------------------------ */
/* Ship to shore gantry crane                                         */
/* ------------------------------------------------------------------ */
export type CraneRig = { trolleyZ: number; hoistY: number };
export const CRANE = { boomY: 34, trolleyY: 32.2, landZ: 24, seaZ: -50, legZ: 8, legX: 7 } as const;

export function Crane({ rig, position = [0, 0, 0], light = true }: { rig: MutableRefObject<CraneRig>; position?: V3; light?: boolean }) {
  const trolley = useRef<THREE.Group>(null);
  const spreader = useRef<THREE.Group>(null);
  const cables = useRef<THREE.Group>(null);
  const steel = mats.steel();
  const marine = mats.marine();
  const { legX, legZ, boomY, landZ, seaZ } = CRANE;
  const boomLen = landZ - seaZ;
  const boomMid = (landZ + seaZ) / 2;

  useFrame(() => {
    const { trolleyZ, hoistY } = rig.current;
    if (trolley.current) trolley.current.position.z = trolleyZ;
    if (spreader.current) spreader.current.position.set(0, hoistY, trolleyZ);
    if (cables.current) {
      const top = CRANE.trolleyY - 1;
      const len = Math.max(0.1, top - (hoistY + 0.3));
      cables.current.position.set(0, (top + hoistY + 0.3) / 2, trolleyZ);
      cables.current.scale.y = len;
    }
  });

  return (
    <group position={position}>
      {/* legs */}
      {[-legX, legX].map((x) =>
        [-legZ, legZ].map((z) => (
          <mesh key={`${x}${z}`} position={[x, 15, z]} material={steel}>
            <boxGeometry args={[1.4, 30, 1.4]} />
          </mesh>
        ))
      )}
      {/* sill + portal beams */}
      {[-legX, legX].map((x) => (
        <group key={`p${x}`}>
          <mesh position={[x, 30.5, 0]} material={marine}>
            <boxGeometry args={[1.8, 1.8, legZ * 2 + 1.4]} />
          </mesh>
          <mesh position={[x, 9, 0]} material={steel}>
            <boxGeometry args={[0.9, 0.9, legZ * 2]} />
          </mesh>
          <mesh position={[x, 0.6, 0]} material={mats.dark()}>
            <boxGeometry args={[2.2, 1.2, legZ * 2 + 4]} />
          </mesh>
        </group>
      ))}
      {[-legZ, legZ].map((z) => (
        <mesh key={`c${z}`} position={[0, 31.6, z]} material={marine}>
          <boxGeometry args={[legX * 2 + 1.4, 1.6, 1.6]} />
        </mesh>
      ))}
      {/* boom girders */}
      {[-3, 3].map((x) => (
        <mesh key={`b${x}`} position={[x, boomY, boomMid]} material={steel}>
          <boxGeometry args={[1.2, 2.4, boomLen]} />
        </mesh>
      ))}
      {Array.from({ length: 10 }, (_, i) => seaZ + 2 + i * (boomLen / 10)).map((z) => (
        <mesh key={`x${z}`} position={[0, boomY + 1, z]} material={steel}>
          <boxGeometry args={[7, 0.4, 0.4]} />
        </mesh>
      ))}
      {/* A-frame and stays */}
      {[-5, 5].map((x) => (
        <group key={`a${x}`}>
          <Strut from={[x * 1.2, 31, legZ]} to={[x, 54, 0]} t={1.1} material={steel} />
          <Strut from={[x * 1.2, 31, -legZ]} to={[x, 54, 0]} t={1.1} material={steel} />
          <Strut from={[x, 54, 0]} to={[x * 0.6, boomY + 1.2, seaZ + 1]} t={0.35} material={steel} />
          <Strut from={[x, 54, 0]} to={[x * 0.6, boomY + 1.2, seaZ / 2]} t={0.3} material={steel} />
          <Strut from={[x, 54, 0]} to={[x * 0.6, boomY + 1.2, landZ - 1]} t={0.35} material={steel} />
        </group>
      ))}
      <mesh position={[0, 54.4, 0]} material={marine}>
        <boxGeometry args={[11.5, 1.2, 1.6]} />
      </mesh>
      {/* machinery house */}
      <mesh position={[0, boomY + 3.6, landZ - 7]} material={marine}>
        <boxGeometry args={[9, 4.8, 9]} />
      </mesh>
      {/* operator cab */}
      <mesh position={[3.6, CRANE.trolleyY - 1.6, -11]} material={mats.glass()}>
        <boxGeometry args={[2.4, 2.4, 3]} />
      </mesh>
      {/* warning + flood lights */}
      {light && (
        <>
          <mesh position={[0, boomY + 1.8, seaZ + 0.5]} material={mats.cargoGlow()}>
            <sphereGeometry args={[0.55, 10, 10]} />
          </mesh>
          <mesh position={[0, 55.4, 0]} material={mats.cargoGlow()}>
            <sphereGeometry args={[0.5, 10, 10]} />
          </mesh>
          {[-30, -12, 6].map((z) => (
            <mesh key={`l${z}`} position={[0, boomY - 1.4, z]} material={mats.lamp()}>
              <boxGeometry args={[2.2, 0.3, 0.8]} />
            </mesh>
          ))}
        </>
      )}
      {/* trolley */}
      <group ref={trolley} position={[0, CRANE.trolleyY, rig.current.trolleyZ]}>
        <mesh material={mats.dark()}>
          <boxGeometry args={[6.4, 1.6, 4.6]} />
        </mesh>
      </group>
      {/* hoist cables (unit height, scaled per frame) */}
      <group ref={cables}>
        {[-2.6, 2.6].map((x) =>
          [-1, 1].map((z) => (
            <mesh key={`k${x}${z}`} position={[x, 0, z]} material={mats.dark()}>
              <boxGeometry args={[0.12, 1, 0.12]} />
            </mesh>
          ))
        )}
      </group>
      {/* spreader */}
      <group ref={spreader}>
        <mesh material={mats.orange()}>
          <boxGeometry args={[CONTAINER.L + 0.3, 0.55, CONTAINER.W + 0.3]} />
        </mesh>
        <mesh position={[0, 0.55, 0]} material={mats.dark()}>
          <boxGeometry args={[2.2, 0.6, 1.4]} />
        </mesh>
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Container vessel                                                   */
/* ------------------------------------------------------------------ */
export const VESSEL = { L: 150, B: 22, deckY: 7, keelY: -5, bays: 16, rows: 8, bayStart: -56, bayPitch: 6.7 } as const;
const rowZ = (r: number) => (r - (VESSEL.rows - 1) / 2) * (CONTAINER.W + 0.06);
const bayX = (b: number) => VESSEL.bayStart + b * VESSEL.bayPitch;
const tierY = (t: number) => VESSEL.deckY + 0.45 + CONTAINER.H * (t + 0.5);

/** Local position of the empty slot the hero container is loaded into. */
export const HERO_SLOT = { bay: 8, row: 5, tier: 2 } as const;
export const heroSlotLocal = () => new THREE.Vector3(bayX(HERO_SLOT.bay), tierY(HERO_SLOT.tier), rowZ(HERO_SLOT.row));

function hullShape(L: number, B: number, bowFrac = 0.24) {
  const s = new THREE.Shape();
  const h = B / 2;
  const bowStart = -L / 2 + L * bowFrac;
  s.moveTo(L / 2, -h * 0.92);
  s.quadraticCurveTo(L / 2 + 1.2, 0, L / 2, h * 0.92);
  s.lineTo(L / 2 - 2, h);
  s.lineTo(bowStart, h);
  s.quadraticCurveTo(-L / 2 + L * 0.04, h * 0.95, -L / 2, 0);
  s.quadraticCurveTo(-L / 2 + L * 0.04, -h * 0.95, bowStart, -h);
  s.lineTo(L / 2 - 2, -h);
  s.closePath();
  return s;
}

function useHullGeometry(L: number, B: number, top: number, bottom: number, bowFrac?: number) {
  return useMemo(() => {
    const g = new THREE.ExtrudeGeometry(hullShape(L, B, bowFrac), { depth: top - bottom, bevelEnabled: false, curveSegments: 10 });
    g.rotateX(-Math.PI / 2);
    g.translate(0, bottom, 0);
    g.computeVertexNormals();
    return g;
  }, [L, B, top, bottom, bowFrac]);
}

export function Vessel({ seed = 3, fillHeroSlot = false, innerRef, position, rotationY = 0 }: { seed?: number; fillHeroSlot?: boolean; innerRef?: React.Ref<THREE.Group>; position?: V3; rotationY?: number }) {
  const hull = useHullGeometry(VESSEL.L, VESSEL.B, VESSEL.deckY, VESSEL.keelY);
  const band = useHullGeometry(VESSEL.L + 0.5, VESSEL.B + 0.3, 0.7, VESSEL.keelY + 0.5);
  const sheer = useHullGeometry(VESSEL.L + 0.3, VESSEL.B + 0.2, VESSEL.deckY + 0.6, VESSEL.deckY - 0.2);

  const slots = useMemo(() => {
    const rnd = mulberry32(seed);
    const out: Slot[] = [];
    for (let b = 0; b < VESSEL.bays; b++) {
      const taper = b < 2 ? 0.55 : b < 3 ? 0.8 : 1;
      const rows = b < 2 ? [1, 2, 3, 4, 5, 6] : Array.from({ length: VESSEL.rows }, (_, i) => i);
      for (const r of rows) {
        let tiers = Math.max(1, Math.round((2 + rnd() * 3) * taper));
        if (b === HERO_SLOT.bay) tiers = r === HERO_SLOT.row ? HERO_SLOT.tier + (fillHeroSlot ? 1 : 0) : 3;
        for (let t = 0; t < tiers; t++) out.push({ x: bayX(b), y: tierY(t), z: rowZ(r) });
      }
    }
    return out;
  }, [seed, fillHeroSlot]);

  const sx = VESSEL.L / 2 - 19;
  return (
    <group ref={innerRef} position={position} rotation={[0, rotationY, 0]}>
      <mesh geometry={hull} material={mats.hull()} />
      <mesh geometry={band} material={mats.antifoul()} />
      <mesh geometry={sheer} material={mats.white()} />
      {/* hatch covers */}
      <mesh position={[(bayX(0) + bayX(VESSEL.bays - 1)) / 2, VESSEL.deckY + 0.22, 0]} material={mats.dark()}>
        <boxGeometry args={[bayX(VESSEL.bays - 1) - bayX(0) + 7, 0.45, VESSEL.B - 2]} />
      </mesh>
      <ContainerField slots={slots} seed={seed * 13} orangeBias={0.08} />
      {/* accommodation block + bridge */}
      <mesh position={[sx, VESSEL.deckY + 8, 0]} material={mats.white()}>
        <boxGeometry args={[9, 16, 17]} />
      </mesh>
      <mesh position={[sx - 0.2, VESSEL.deckY + 16.9, 0]} material={mats.white()}>
        <boxGeometry args={[9.6, 1.8, VESSEL.B + 1]} />
      </mesh>
      <mesh position={[sx - 4.65, VESSEL.deckY + 16.2, 0]} material={mats.glass()}>
        <boxGeometry args={[0.3, 1.1, VESSEL.B]} />
      </mesh>
      {[4, 8, 12].map((y) => (
        <mesh key={y} position={[sx - 4.55, VESSEL.deckY + y, 0]} material={mats.glass()}>
          <boxGeometry args={[0.2, 0.7, 15]} />
        </mesh>
      ))}
      <mesh position={[sx + 2, VESSEL.deckY + 19.2, 0]} material={mats.dark()}>
        <boxGeometry args={[1, 3, 1]} />
      </mesh>
      <mesh position={[sx + 2, VESSEL.deckY + 21, 0]} material={mats.lamp()}>
        <sphereGeometry args={[0.35, 8, 8]} />
      </mesh>
      {/* funnel */}
      <mesh position={[sx + 8.5, VESSEL.deckY + 7, 0]} material={mats.dark()}>
        <boxGeometry args={[5, 14, 6]} />
      </mesh>
      {/* forecastle */}
      <mesh position={[-VESSEL.L / 2 + 9, VESSEL.deckY + 1.2, 0]} material={mats.white()}>
        <boxGeometry args={[10, 2.4, 9]} />
      </mesh>
      {/* nav lights */}
      <mesh position={[sx - 4.7, VESSEL.deckY + 17, VESSEL.B / 2 + 0.6]} material={mats.cyanGlow()}>
        <sphereGeometry args={[0.35, 8, 8]} />
      </mesh>
      <mesh position={[sx - 4.7, VESSEL.deckY + 17, -VESSEL.B / 2 - 0.6]} material={mats.cargoGlow()}>
        <sphereGeometry args={[0.35, 8, 8]} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Haulage truck (cab faces +X)                                       */
/* ------------------------------------------------------------------ */
export function Truck({ innerRef, position, rotationY = 0, container = false, cab = "#e8eef1", containerColor = "#1267a5", lowLoader = false, load }: { innerRef?: React.Ref<THREE.Group>; position?: V3; rotationY?: number; container?: boolean; cab?: string; containerColor?: string; lowLoader?: boolean; load?: React.ReactNode }) {
  const cabMat = useMemo(() => new THREE.MeshStandardMaterial({ color: cab, roughness: 0.5, metalness: 0.05 }), [cab]);
  const boxMat = useMemo(() => new THREE.MeshStandardMaterial({ color: containerColor, roughness: 0.6, metalness: 0.05 }), [containerColor]);
  const deckY = lowLoader ? 0.9 : 1.55;
  const wheels: [number, number][] = [];
  for (const x of lowLoader ? [5.8, 3.6, -4.2, -5.4, -6.6] : [5.8, 3.6, -3.4, -4.6]) for (const z of [-1.05, 1.05]) wheels.push([x, z]);
  return (
    <group ref={innerRef} position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[5.6, 2.1, 0]} material={cabMat}>
        <boxGeometry args={[2.6, 2.9, 2.5]} />
      </mesh>
      <mesh position={[6.92, 2.6, 0]} material={mats.glass()}>
        <boxGeometry args={[0.05, 1.1, 2.2]} />
      </mesh>
      <mesh position={[6.95, 1.05, 0]} material={mats.lamp()}>
        <boxGeometry args={[0.05, 0.25, 2.1]} />
      </mesh>
      <mesh position={[0, deckY - 0.3, 0]} material={mats.dark()}>
        <boxGeometry args={[lowLoader ? 15 : 12.6, 0.4, 2.4]} />
      </mesh>
      {wheels.map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, 0.55, z]} rotation={[Math.PI / 2, 0, 0]} material={mats.rubber()}>
          <cylinderGeometry args={[0.55, 0.55, 0.45, 12]} />
        </mesh>
      ))}
      {container && (
        <mesh position={[-1, deckY + CONTAINER.H / 2 + 0.05, 0]} material={boxMat}>
          <boxGeometry args={[CONTAINER.L, CONTAINER.H, CONTAINER.W]} />
        </mesh>
      )}
      {load}
    </group>
  );
}
export const TRUCK_DECK_Y = 1.55;

/* ------------------------------------------------------------------ */
/* Warehouse                                                          */
/* ------------------------------------------------------------------ */
export function Warehouse({ position, size = [44, 11, 26], doors = 5, rotationY = 0 }: { position?: V3; size?: V3; doors?: number; rotationY?: number }) {
  const [w, h, d] = size;
  const roof = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-d / 2 - 0.6, 0);
    s.lineTo(0, 3.4);
    s.lineTo(d / 2 + 0.6, 0);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: w + 1.2, bevelEnabled: false });
    g.rotateY(Math.PI / 2);
    g.translate(-(w + 1.2) / 2, h, 0);
    return g;
  }, [w, h, d]);
  const wall = useMemo(() => new THREE.MeshStandardMaterial({ color: "#a9b6bd", roughness: 0.8, metalness: 0.05 }), []);
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, h / 2, 0]} material={wall}>
        <boxGeometry args={[w, h, d]} />
      </mesh>
      <mesh geometry={roof} material={mats.roof()} />
      {Array.from({ length: doors }, (_, i) => -w / 2 + (w / (doors + 1)) * (i + 1)).map((x) => (
        <group key={x}>
          <mesh position={[x, 2.6, d / 2 + 0.05]} material={mats.dark()}>
            <boxGeometry args={[4.2, 5, 0.2]} />
          </mesh>
          <mesh position={[x, 5.6, d / 2 + 0.5]} material={mats.lamp()}>
            <boxGeometry args={[1.2, 0.2, 0.5]} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, h - 1.4, d / 2 + 0.06]} material={mats.marine()}>
        <boxGeometry args={[w, 1.1, 0.1]} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Small craft: tug, barge, crew boat                                 */
/* ------------------------------------------------------------------ */
export function Tug({ innerRef, position, rotationY = 0 }: { innerRef?: React.Ref<THREE.Group>; position?: V3; rotationY?: number }) {
  const hull = useHullGeometry(16, 6.4, 2.4, -1.4, 0.35);
  const fender = useHullGeometry(16.6, 7, 1.6, 0.6, 0.35);
  return (
    <group ref={innerRef} position={position} rotation={[0, rotationY, 0]}>
      <mesh geometry={hull} material={mats.hull()} />
      <mesh geometry={fender} material={mats.rubber()} />
      <mesh position={[0.5, 3.6, 0]} material={mats.white()}>
        <boxGeometry args={[6, 2.4, 4.6]} />
      </mesh>
      <mesh position={[-0.3, 5.6, 0]} material={mats.white()}>
        <boxGeometry args={[3.4, 1.8, 4]} />
      </mesh>
      <mesh position={[-0.3, 5.7, 0]} material={mats.glass()}>
        <boxGeometry args={[3.5, 0.7, 4.1]} />
      </mesh>
      <mesh position={[2.2, 6.4, 0]} material={mats.orange()}>
        <boxGeometry args={[1.4, 3.2, 2.6]} />
      </mesh>
      <mesh position={[-0.6, 8, 0]} material={mats.dark()}>
        <boxGeometry args={[0.25, 3, 0.25]} />
      </mesh>
      <mesh position={[-0.6, 9.6, 0]} material={mats.cargoGlow()}>
        <sphereGeometry args={[0.28, 8, 8]} />
      </mesh>
    </group>
  );
}

export function Barge({ innerRef, position, rotationY = 0 }: { innerRef?: React.Ref<THREE.Group>; position?: V3; rotationY?: number }) {
  const rust = useMemo(() => new THREE.MeshStandardMaterial({ color: "#5a463b", roughness: 0.85, metalness: 0.05 }), []);
  return (
    <group ref={innerRef} position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.4, 0]} material={rust}>
        <boxGeometry args={[36, 3, 10]} />
      </mesh>
      <mesh position={[0, 2, 0]} material={mats.dark()}>
        <boxGeometry args={[34, 0.3, 8.4]} />
      </mesh>
      <mesh position={[0, 3.2, 0]} scale={[3.6, 1, 1]} material={mats.bulk()}>
        <coneGeometry args={[4, 3.2, 7]} />
      </mesh>
    </group>
  );
}

export function CrewBoat({ innerRef, position, rotationY = 0 }: { innerRef?: React.Ref<THREE.Group>; position?: V3; rotationY?: number }) {
  const hull = useHullGeometry(18, 5, 1.8, -0.8, 0.4);
  return (
    <group ref={innerRef} position={position} rotation={[0, rotationY, 0]}>
      <mesh geometry={hull} material={mats.white()} />
      <mesh position={[0, 1.2, 0]} scale={[1, 1, 1]} material={mats.cyanGlow()}>
        <boxGeometry args={[14, 0.18, 5.05]} />
      </mesh>
      <mesh position={[1, 2.9, 0]} material={mats.white()}>
        <boxGeometry args={[7.5, 2.2, 3.8]} />
      </mesh>
      <mesh position={[1, 3.1, 0]} material={mats.glass()}>
        <boxGeometry args={[7.6, 0.9, 3.9]} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Cargo aircraft (nose faces +X)                                     */
/* ------------------------------------------------------------------ */
export function Aircraft({ innerRef, position, rotation }: { innerRef?: React.Ref<THREE.Group>; position?: V3; rotation?: V3 }) {
  const w = mats.white();
  return (
    <group ref={innerRef} position={position} rotation={rotation}>
      <mesh rotation={[0, 0, Math.PI / 2]} material={w}>
        <cylinderGeometry args={[2, 2, 34, 16]} />
      </mesh>
      <mesh position={[17, 0, 0]} scale={[2.4, 1, 1]} material={w}>
        <sphereGeometry args={[2, 16, 12]} />
      </mesh>
      <mesh position={[-20.5, 0.6, 0]} rotation={[0, 0, Math.PI / 2]} material={w}>
        <coneGeometry args={[2, 7, 16]} />
      </mesh>
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[-1.5, -0.6, s * 10]} rotation={[0, s * 0.45, 0]} material={w}>
            <boxGeometry args={[6, 0.35, 19]} />
          </mesh>
          <mesh position={[1.5, -2, s * 7]} rotation={[0, 0, Math.PI / 2]} material={mats.marine()}>
            <cylinderGeometry args={[1, 1, 4.4, 12]} />
          </mesh>
          <mesh position={[-21, 1.2, s * 4]} rotation={[0, s * 0.4, 0]} material={w}>
            <boxGeometry args={[3.2, 0.25, 7]} />
          </mesh>
        </group>
      ))}
      <mesh position={[-20, 4.4, 0]} rotation={[0, 0, 0.5]} material={mats.marine()}>
        <boxGeometry args={[5.5, 6.5, 0.35]} />
      </mesh>
      <mesh position={[-1.5, -0.8, 19]} material={mats.cyanGlow()}>
        <sphereGeometry args={[0.35, 8, 8]} />
      </mesh>
      <mesh position={[-1.5, -0.8, -19]} material={mats.cargoGlow()}>
        <sphereGeometry args={[0.35, 8, 8]} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Quay, yard surfaces, lamp posts                                    */
/* ------------------------------------------------------------------ */
export function Quay({ width = 520, depth = 140, edgeZ = -12 }: { width?: number; depth?: number; edgeZ?: number }) {
  const lamps = useMemo(() => Array.from({ length: 12 }, (_, i) => -width / 2 + 30 + i * ((width - 60) / 11)), [width]);
  return (
    <group>
      <mesh position={[0, -1.5, edgeZ + depth / 2]} material={mats.concrete()}>
        <boxGeometry args={[width, 3, depth]} />
      </mesh>
      {/* quay edge cope + fenders */}
      <mesh position={[0, 0.1, edgeZ + 0.6]} material={mats.white()}>
        <boxGeometry args={[width, 0.3, 1.2]} />
      </mesh>
      {Array.from({ length: Math.floor(width / 12) }, (_, i) => -width / 2 + 6 + i * 12).map((x) => (
        <mesh key={x} position={[x, -1.4, edgeZ - 0.3]} material={mats.rubber()}>
          <boxGeometry args={[1.6, 2.4, 0.8]} />
        </mesh>
      ))}
      {/* crane rails */}
      {[-8, 8].map((z) => (
        <mesh key={z} position={[0, 0.02, z]} material={mats.steel()}>
          <boxGeometry args={[width, 0.08, 0.5]} />
        </mesh>
      ))}
      {/* haul road */}
      <mesh position={[0, 0.02, 14]} material={mats.asphalt()}>
        <boxGeometry args={[width, 0.05, 9]} />
      </mesh>
      {Array.from({ length: Math.floor(width / 10) }, (_, i) => -width / 2 + 5 + i * 10).map((x) => (
        <mesh key={`d${x}`} position={[x, 0.06, 14]} material={mats.white()}>
          <boxGeometry args={[4, 0.02, 0.2]} />
        </mesh>
      ))}
      {lamps.map((x) => (
        <group key={`lp${x}`} position={[x, 0, 20]}>
          <mesh position={[0, 9, 0]} material={mats.dark()}>
            <cylinderGeometry args={[0.25, 0.35, 18, 6]} />
          </mesh>
          <mesh position={[0, 18.2, 0]} material={mats.lamp()}>
            <boxGeometry args={[2.2, 0.5, 1.2]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
