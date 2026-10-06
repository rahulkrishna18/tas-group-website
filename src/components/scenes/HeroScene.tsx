"use client";

import { MutableRefObject, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import type { Line2 } from "three-stdlib";
import { Atmosphere, DuskFog, DuskLights, Sky, Water } from "../three/Environment";
import {
  Aircraft,
  BrandedContainer,
  Crane,
  CraneRig,
  ContainerField,
  Quay,
  Truck,
  Tug,
  Vessel,
  Warehouse,
  heroSlotLocal,
  yardBlock,
} from "../three/primitives";
import { Globe, ILLUSTRATIVE_ARCS, LAND_CORRIDOR, facingQuaternion } from "../three/Globe";
import { CONTAINER, PALETTE } from "../three/materials";
import { OFFICES } from "@/content/site";
import { damp, easeInOut, easeOut, lerp, range } from "@/lib/math";

const BERTH = new THREE.Vector3(2.4, 0, -24.5);
const TRUCK_START_X = 1;
const LIFT_TOP = 22;
const CONTAINER_ON_TRUCK = new THREE.Vector3(0, 1.55 + CONTAINER.H / 2 + 0.05, 2);
const SPREADER_OFFSET = 0.3 + CONTAINER.H / 2;

const ROUTE_POINTS: [number, number, number][] = [
  [-10, 0.8, -26],
  [-160, 0.8, -52],
  [-420, 0.8, -120],
  [-760, 0.8, -230],
  [-1150, 0.8, -380],
  [-1700, 0.8, -600],
];

type Props = { progress: MutableRefObject<number>; mobile: boolean; staticFrame?: boolean };

export default function HeroScene({ progress, mobile, staticFrame }: Props) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const p = useRef(progress.current);
  const atmosphere = useRef<Atmosphere>({ dissolve: 0 });
  const rig = useRef<CraneRig>({ trolleyZ: 2, hoistY: LIFT_TOP });
  const rigB = useRef<CraneRig>({ trolleyZ: -14, hoistY: 18 });
  const rigC = useRef<CraneRig>({ trolleyZ: -30, hoistY: 26 });
  const vessel = useRef<THREE.Group>(null);
  const box = useRef<THREE.Mesh>(null);
  const truck = useRef<THREE.Group>(null);
  const tug = useRef<THREE.Group>(null);
  const plane = useRef<THREE.Group>(null);
  const port = useRef<THREE.Group>(null);
  const globe = useRef<THREE.Group>(null);
  const route = useRef<Line2>(null);
  const haulers = useRef<(THREE.Group | null)[]>([]);
  const globeFade = useRef(0);
  const globeDraw = useRef(0);

  const slotLocal = useMemo(() => heroSlotLocal(), []);
  const yard = useMemo(() => {
    const blocks = mobile
      ? [{ x: -120, z: 26, bays: 14, rows: 5, maxTier: 4, seed: 11 }, { x: 130, z: 26, bays: 12, rows: 5, maxTier: 4, seed: 12 }]
      : [
          { x: -245, z: 26, bays: 18, rows: 6, maxTier: 4, seed: 11 },
          { x: -120, z: 26, bays: 17, rows: 6, maxTier: 4, seed: 12 },
          { x: 125, z: 26, bays: 18, rows: 6, maxTier: 4, seed: 15 },
          { x: -245, z: 50, bays: 18, rows: 6, maxTier: 5, seed: 13 },
          { x: -120, z: 50, bays: 17, rows: 6, maxTier: 5, seed: 14 },
          { x: 125, z: 50, bays: 18, rows: 6, maxTier: 5, seed: 16 },
        ];
    return blocks.flatMap((b) => yardBlock(b));
  }, [mobile]);

  const routePts = useMemo(() => new THREE.CatmullRomCurve3(ROUTE_POINTS.map((v) => new THREE.Vector3(...v))).getPoints(160), []);
  const tmp = useMemo(
    () => ({
      v: new THREE.Vector3(),
      pos: new THREE.Vector3(),
      look: new THREE.Vector3(),
      a: new THREE.Vector3(),
      b: new THREE.Vector3(),
      fwd: new THREE.Vector3(),
      right: new THREE.Vector3(),
      q: new THREE.Quaternion(),
      planeA: new THREE.Vector3(-300, 48, -10),
      planeB: new THREE.Vector3(-40, 82, -330),
    }),
    []
  );
  const planeQuat = useMemo(() => {
    const d = tmp.planeB.clone().sub(tmp.planeA).normalize();
    return new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), d);
  }, [tmp]);

  useFrame(({ clock }, dt) => {
    const target = staticFrame ? 0.3 : progress.current;
    p.current = staticFrame ? target : damp(p.current, target, 4.5, Math.min(dt, 0.1));
    const P = p.current;
    const t = clock.elapsedTime;
    const aspect = camera.aspect;
    const zoom = aspect < 0.8 ? 1.75 : aspect < 1.2 ? 1.3 : 1;

    /* ---------- crane + container ---------- */
    const c = range(P, 0.03, 0.4);
    const lower = easeInOut(range(c, 0, 0.16));
    const raise = easeInOut(range(c, 0.2, 0.4));
    const travel = easeInOut(range(c, 0.42, 0.7));
    const settle = easeInOut(range(c, 0.72, 0.9));
    const back = easeInOut(range(P, 0.42, 0.52));
    const attached = c >= 0.16 && c < 0.9;
    const placed = c >= 0.9;

    const pickupHoist = CONTAINER_ON_TRUCK.y + SPREADER_OFFSET;
    const dropHoist = BERTH.y + slotLocal.y + SPREADER_OFFSET;
    let hoist = lerp(LIFT_TOP, pickupHoist, lower);
    if (c >= 0.2) hoist = lerp(pickupHoist, LIFT_TOP, raise);
    if (c >= 0.72) hoist = lerp(LIFT_TOP, dropHoist, settle);
    if (placed) hoist = lerp(dropHoist, LIFT_TOP, back);
    rig.current.trolleyZ = lerp(2, BERTH.z + slotLocal.z, travel) + (placed ? back * 18 : 0);
    rig.current.hoistY = hoist;
    rigB.current.hoistY = 18 + Math.sin(t * 0.35) * 6;
    rigC.current.trolleyZ = -24 + Math.sin(t * 0.22 + 1) * 14;

    /* ---------- vessel departure ---------- */
    const v = easeInOut(range(P, 0.44, 0.84));
    const vx = BERTH.x - v * 760;
    const vz = BERTH.z - Math.pow(v, 1.6) * 210;
    if (vessel.current) {
      vessel.current.position.set(vx, Math.sin(t * 0.6) * 0.12, vz);
      vessel.current.rotation.set(Math.sin(t * 0.45) * 0.004, -0.2 * easeOut(range(P, 0.48, 0.8)), Math.sin(t * 0.5) * 0.006);
    }
    if (tug.current) {
      const ta = range(P, 0.42, 0.6);
      tug.current.position.set(vx - 72 + ta * 8, Math.sin(t * 1.1) * 0.18, vz - 18 - ta * 6);
      tug.current.rotation.y = -0.15 - ta * 0.2;
    }

    /* container follows spreader, then rides the vessel */
    if (box.current && vessel.current) {
      if (placed) {
        vessel.current.updateMatrixWorld();
        tmp.v.copy(slotLocal);
        vessel.current.localToWorld(tmp.v);
        box.current.position.copy(tmp.v);
        box.current.quaternion.copy(vessel.current.quaternion);
      } else if (attached) {
        box.current.position.set(0, hoist - SPREADER_OFFSET, rig.current.trolleyZ);
        box.current.rotation.set(0, Math.sin(t * 1.4) * 0.01 * (1 - settle), Math.sin(t * 1.1) * 0.006);
      } else {
        box.current.position.copy(CONTAINER_ON_TRUCK);
        box.current.rotation.set(0, 0, 0);
      }
    }
    if (truck.current) {
      const drive = easeInOut(range(P, 0.16, 0.42));
      truck.current.position.x = TRUCK_START_X + drive * 280;
    }

    /* ---------- background haulers on the yard road ---------- */
    haulers.current.forEach((h, i) => {
      if (!h) return;
      const dir = i % 2 === 0 ? 1 : -1;
      const x = (((t * (9 + i * 2) + i * 140) % 520) - 260) * dir;
      h.position.set(x, 0, i % 2 === 0 ? 12 : 16);
      h.rotation.y = dir > 0 ? 0 : Math.PI;
    });

    /* ---------- route line + aircraft ---------- */
    const r = easeOut(range(P, 0.5, 0.74));
    if (route.current) {
      (route.current.geometry as THREE.InstancedBufferGeometry).instanceCount = Math.floor(160 * r);
      route.current.visible = r > 0;
    }
    const pa = range(P, 0.55, 0.8);
    if (plane.current) {
      plane.current.visible = pa > 0 && pa < 1;
      plane.current.position.lerpVectors(tmp.planeA, tmp.planeB, pa).add(tmp.v.set(vx, 0, vz));
      plane.current.quaternion.copy(planeQuat);
    }

    /* ---------- camera choreography ---------- */
    const keys: { at: number; pos: [number, number, number]; look: [number, number, number] }[] = [
      { at: 0.0, pos: [70, 19, 72], look: [-26, 15, -14] },
      { at: 0.16, pos: [44, 12, 42], look: [0, 6, -2] },
      { at: 0.34, pos: [52, 40, 34], look: [0, 16, -12] },
      { at: 0.46, pos: [92, 52, 38], look: [-20, 8, -28] },
      { at: 0.62, pos: [vx + 150, 70, vz + 110], look: [vx - 50, 6, vz - 10] },
      { at: 0.78, pos: [vx + 260, 300, vz + 330], look: [vx - 160, 0, vz - 120] },
      { at: 1.0, pos: [vx + 300, 520, vz + 420], look: [vx - 200, 0, vz - 160] },
    ];
    let k = 0;
    while (k < keys.length - 2 && P > keys[k + 1].at) k++;
    const ka = keys[k];
    const kb = keys[k + 1];
    const kt = easeInOut(range(P, ka.at, kb.at));
    tmp.a.set(...ka.pos).lerp(tmp.b.set(...kb.pos), kt);
    tmp.look.set(...ka.look).lerp(tmp.b.set(...kb.look), kt);
    // keep subjects framed on narrow screens by pulling back along the view ray
    tmp.pos.copy(tmp.a).sub(tmp.look).multiplyScalar(zoom).add(tmp.look);
    const sway = staticFrame ? 0 : 1 - range(P, 0, 0.1) * 0.6;
    tmp.pos.x += Math.sin(t * 0.18) * 1.6 * sway;
    tmp.pos.y += Math.sin(t * 0.23) * 0.8 * sway;
    camera.position.copy(tmp.pos);
    camera.lookAt(tmp.look);

    /* ---------- dissolve into the network ---------- */
    const dissolve = easeInOut(range(P, 0.74, 0.88));
    atmosphere.current.dissolve = dissolve;
    if (port.current) port.current.visible = dissolve < 0.995;
    globeFade.current = easeOut(range(P, 0.82, 0.94));
    globeDraw.current = easeOut(range(P, 0.86, 1));
    if (globe.current) {
      globe.current.visible = globeFade.current > 0.001;
      if (globe.current.visible) {
        const pull = easeInOut(range(P, 0.8, 1));
        const R = 60;
        const D = lerp(R * 1.7, R * 4.4 * Math.max(1, zoom * 0.8), pull);
        camera.getWorldDirection(tmp.fwd);
        tmp.right.set(1, 0, 0).applyQuaternion(camera.quaternion);
        const shift = aspect > 1.2 ? D * 0.22 * pull : 0;
        globe.current.position.copy(camera.position).addScaledVector(tmp.fwd, D).addScaledVector(tmp.right, shift);
        tmp.q.copy(camera.quaternion).multiply(facingQuaternion(9 - pull * 4, 100.4 - pull * 6));
        globe.current.quaternion.copy(tmp.q);
        globe.current.scale.setScalar(R);
      }
    }
  });

  return (
    <>
      <DuskLights />
      <Sky atmosphere={atmosphere} />
      <DuskFog near={180} far={1500} atmosphere={atmosphere} />
      <group ref={port}>
        <Water atmosphere={atmosphere} />
        <Quay />
        <Crane rig={rig} />
        <Crane rig={rigB} position={[-62, 0, 0]} light={!mobile} />
        {!mobile && <Crane rig={rigC} position={[64, 0, 0]} />}
        <ContainerField slots={yard} seed={21} />
        <Warehouse position={[-110, 0, 104]} />
        {!mobile && <Warehouse position={[-40, 0, 104]} size={[50, 12, 26]} />}
        <Vessel innerRef={vessel} position={[BERTH.x, 0, BERTH.z]} />
        <Tug innerRef={tug} position={[-70, 0, -46]} />
        <BrandedContainer innerRef={box} position={[CONTAINER_ON_TRUCK.x, CONTAINER_ON_TRUCK.y, CONTAINER_ON_TRUCK.z]} />
        <Truck innerRef={truck} position={[TRUCK_START_X, 0, 2]} cab={PALETTE.foam} />
        {[0, 1, 2, 3].slice(0, mobile ? 2 : 4).map((i) => (
          <Truck key={i} innerRef={(el) => { haulers.current[i] = el; }} container containerColor={["#1267a5", "#75838c", "#7d3a2c", "#f28c28"][i]} />
        ))}
        <Line ref={route} points={routePts} color={PALETTE.cargo} lineWidth={2.4} dashed dashSize={10} gapSize={8} transparent opacity={0.95} />
        <Aircraft innerRef={plane} />
        {/* Penang Island across the channel */}
        {[
          [-260, -900, 160, 120],
          [60, -980, 220, 170],
          [380, -940, 150, 90],
          [-620, -1020, 180, 110],
        ].map(([x, z, r, h], i) => (
          <mesh key={i} position={[x, -6, z]} scale={[r * 1.9, h, r * 0.8]}>
            <sphereGeometry args={[1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#0f2a3a" roughness={1} />
          </mesh>
        ))}
      </group>
      <group ref={globe} visible={false}>
        <Globe radius={1} offices={OFFICES} arcs={[LAND_CORRIDOR, ...ILLUSTRATIVE_ARCS]} fade={globeFade} draw={globeDraw} dotSize={mobile ? 0.85 : 1} />
      </group>
    </>
  );
}
