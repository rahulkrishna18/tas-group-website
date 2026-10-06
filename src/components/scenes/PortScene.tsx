"use client";

import { MutableRefObject, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import type { Line2 } from "three-stdlib";
import { DuskFog, DuskLights, Sky, Water } from "../three/Environment";
import { BrandedContainer, ContainerField, Crane, CraneRig, Quay, Truck, Tug, Vessel, Warehouse, heroSlotLocal, yardBlock } from "../three/primitives";
import { CONTAINER, PALETTE, mats } from "../three/materials";
import { damp, easeInOut, easeOut, lerp, range } from "@/lib/math";

const BERTH = new THREE.Vector3(2.4, 0, -24.5);
const LANE_Z = 2;
const GATE_X = 92;
const WAREHOUSE = new THREE.Vector3(170, 0, 2);
const DOCK_X = WAREHOUSE.x - 28;
const DEST = new THREE.Vector3(420, 0, 120);
const SPREADER_OFFSET = 0.3 + CONTAINER.H / 2;
const ON_TRUCK_Y = 1.55 + CONTAINER.H / 2 + 0.05;

/** Delivery road from the warehouse to the customer. */
const ROAD: [number, number, number][] = [
  [WAREHOUSE.x - 10, 0.3, 26],
  [WAREHOUSE.x + 60, 0.3, 30],
  [WAREHOUSE.x + 140, 0.3, 60],
  [WAREHOUSE.x + 200, 0.3, 100],
  [DEST.x, 0.3, DEST.z],
];

function CustomsGate({ light, arm }: { light: MutableRefObject<THREE.MeshStandardMaterial | null>; arm: MutableRefObject<THREE.Group | null> }) {
  return (
    <group position={[GATE_X, 0, LANE_Z]}>
      {/* canopy */}
      {[-6, 6].map((z) => (
        <mesh key={z} position={[0, 4.5, z]} material={mats.steel()}>
          <boxGeometry args={[0.8, 9, 0.8]} />
        </mesh>
      ))}
      <mesh position={[0, 9.4, 0]} material={mats.marine()}>
        <boxGeometry args={[6, 1, 14]} />
      </mesh>
      <mesh position={[0, 8.7, 0]}>
        <boxGeometry args={[6.2, 0.35, 12]} />
        <meshStandardMaterial ref={light} color={PALETTE.cargo} emissive={PALETTE.cargo} emissiveIntensity={2} />
      </mesh>
      {/* booth */}
      <mesh position={[2, 1.6, -5]} material={mats.white()}>
        <boxGeometry args={[3, 3.2, 2.4]} />
      </mesh>
      <mesh position={[2, 2.2, -3.75]} material={mats.glass()}>
        <boxGeometry args={[2.6, 1.1, 0.1]} />
      </mesh>
      {/* barrier arm pivots at the booth */}
      <group ref={arm} position={[-3, 1.4, -4.6]}>
        <mesh position={[0, 0, 4.4]} material={mats.white()}>
          <boxGeometry args={[0.25, 0.25, 8.8]} />
        </mesh>
        {[1.2, 3.4, 5.6, 7.8].map((z) => (
          <mesh key={z} position={[0, 0, z]} material={mats.orange()}>
            <boxGeometry args={[0.27, 0.27, 0.8]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Destination({ beacon }: { beacon: MutableRefObject<THREE.Mesh | null> }) {
  return (
    <group position={[DEST.x, 0, DEST.z]}>
      <mesh position={[0, -1.5, 0]} material={mats.concrete()}>
        <boxGeometry args={[70, 3, 50]} />
      </mesh>
      <mesh position={[0, 6, -6]} material={mats.white()}>
        <boxGeometry args={[30, 12, 18]} />
      </mesh>
      <mesh position={[-12, 9, 8]} material={mats.marine()}>
        <boxGeometry args={[10, 18, 10]} />
      </mesh>
      <mesh ref={beacon} position={[0, 0.2, 14]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[4, 5, 40]} />
        <meshBasicMaterial color={PALETTE.cargo} transparent toneMapped={false} />
      </mesh>
    </group>
  );
}

export default function PortScene({ progress, mobile, staticStep }: { progress: MutableRefObject<number>; mobile: boolean; staticStep?: number }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const p = useRef(0);
  const rig = useRef<CraneRig>({ trolleyZ: BERTH.z + heroSlotLocal().z, hoistY: 24 });
  const rigB = useRef<CraneRig>({ trolleyZ: -20, hoistY: 20 });
  const vessel = useRef<THREE.Group>(null);
  const tug = useRef<THREE.Group>(null);
  const box = useRef<THREE.Mesh>(null);
  const truck = useRef<THREE.Group>(null);
  const van = useRef<THREE.Group>(null);
  const gateLight = useRef<THREE.MeshStandardMaterial>(null);
  const arm = useRef<THREE.Group>(null);
  const beacon = useRef<THREE.Mesh>(null);
  const road = useRef<Line2>(null);
  const slot = useMemo(() => heroSlotLocal(), []);
  const roadCurve = useMemo(() => new THREE.CatmullRomCurve3(ROAD.map((v) => new THREE.Vector3(...v))), []);
  const roadPts = useMemo(() => roadCurve.getPoints(120), [roadCurve]);
  const yard = useMemo(
    () =>
      [
        { x: -160, z: 26, bays: 16, rows: 5, maxTier: 4, seed: 31 },
        { x: -160, z: 48, bays: 16, rows: 5, maxTier: 4, seed: 32 },
        { x: 10, z: 34, bays: mobile ? 8 : 12, rows: 5, maxTier: 3, seed: 33 },
      ].flatMap((b) => yardBlock(b)),
    [mobile]
  );
  const v = useMemo(() => ({ a: new THREE.Vector3(), b: new THREE.Vector3(), look: new THREE.Vector3(), tan: new THREE.Vector3() }), []);
  const cyan = useMemo(() => new THREE.Color(PALETTE.cyan), []);
  const orange = useMemo(() => new THREE.Color(PALETTE.cargo), []);

  useFrame(({ clock }, dt) => {
    const target = staticStep !== undefined ? (staticStep + 0.75) / 6 : progress.current;
    p.current = staticStep !== undefined ? target : damp(p.current, target, 4, Math.min(dt, 0.1));
    const P = p.current;
    const t = clock.elapsedTime;
    const s = (i: number) => range(P, i / 6, (i + 1) / 6); // per-step progress

    /* 1: vessel arrives */
    const arrive = easeOut(range(s(0), 0, 0.85));
    const vx = lerp(-360, BERTH.x, arrive);
    const vz = lerp(-70, BERTH.z, easeInOut(range(s(0), 0.3, 1)));
    if (vessel.current) {
      vessel.current.position.set(vx, Math.sin(t * 0.6) * 0.12, vz);
      vessel.current.rotation.y = lerp(0.12, 0, arrive);
    }
    if (tug.current) {
      tug.current.position.set(vx - 66, Math.sin(t * 1.2) * 0.2, vz - 20 + (1 - arrive) * 6);
      tug.current.rotation.y = lerp(0.3, -0.4, arrive);
    }

    /* 2: discharge: crane lifts the container off the vessel onto a truck */
    const d = s(1);
    const slotWorld = v.a.set(BERTH.x + slot.x, slot.y, BERTH.z + slot.z);
    const lower1 = easeInOut(range(d, 0.0, 0.18));
    const raise = easeInOut(range(d, 0.24, 0.42));
    const travel = easeInOut(range(d, 0.42, 0.7));
    const lower2 = easeInOut(range(d, 0.72, 0.9));
    const top = 24;
    const pick = slotWorld.y + SPREADER_OFFSET;
    const drop = ON_TRUCK_Y + SPREADER_OFFSET;
    let hoist = lerp(top, pick, lower1);
    if (d >= 0.24) hoist = lerp(pick, top, raise);
    if (d >= 0.72) hoist = lerp(top, drop, lower2);
    if (d >= 0.9) hoist = lerp(drop, top, easeInOut(range(d, 0.92, 1)));
    rig.current.hoistY = hoist;
    rig.current.trolleyZ = lerp(slotWorld.z, LANE_Z, travel);
    rigB.current.hoistY = 20 + Math.sin(t * 0.4) * 6;

    /* 3: customs: truck to the gate, hold, clear */
    const c = s(2);
    const toGate = easeInOut(range(c, 0, 0.4));
    const cleared = c > 0.6;
    const pass = easeInOut(range(c, 0.72, 1));
    /* 4: warehouse */
    const w = s(3);
    const toDock = easeInOut(range(w, 0, 0.45));
    const intoShed = easeInOut(range(w, 0.5, 0.9));
    let truckX = lerp(1, GATE_X - 12, toGate);
    if (c >= 0.72) truckX = lerp(GATE_X - 12, GATE_X + 18, pass);
    if (w > 0) truckX = lerp(GATE_X + 18, DOCK_X - 6, toDock);
    if (truck.current) truck.current.position.set(truckX, 0, LANE_Z);

    if (gateLight.current) {
      const col = cleared ? cyan : orange;
      gateLight.current.color.copy(col);
      gateLight.current.emissive.copy(col);
      gateLight.current.emissiveIntensity = cleared ? 2.2 : 1.4 + Math.sin(t * 6) * 0.6 * (c > 0.35 ? 1 : 0);
    }
    if (arm.current) arm.current.rotation.x = -easeInOut(range(c, 0.62, 0.72)) * 1.35 * (w < 0.05 ? 1 : 1 - range(w, 0.05, 0.2));

    if (box.current) {
      if (d < 0.18) {
        box.current.position.copy(slotWorld);
      } else if (d < 0.9) {
        box.current.position.set(0, hoist - SPREADER_OFFSET, rig.current.trolleyZ);
      } else if (w < 0.5) {
        box.current.position.set(truckX - 1, ON_TRUCK_Y, LANE_Z);
      } else {
        box.current.position.set(lerp(DOCK_X - 7, WAREHOUSE.x - 4, intoShed), ON_TRUCK_Y, LANE_Z);
      }
      box.current.visible = !(w >= 0.5 && intoShed > 0.97);
    }

    /* 5: dispatch + 6: final delivery along the road */
    const go = easeInOut(range(P, 4 / 6 + 0.02, 1 - 0.03));
    roadCurve.getPointAt(go, v.b);
    roadCurve.getTangentAt(go, v.tan);
    if (van.current) {
      van.current.visible = P > 4 / 6 - 0.02;
      van.current.position.set(v.b.x, 0, v.b.z);
      van.current.rotation.y = Math.atan2(-v.tan.z, v.tan.x);
    }
    if (road.current) (road.current.geometry as THREE.InstancedBufferGeometry).instanceCount = Math.floor(119 * easeOut(range(P, 4 / 6 - 0.04, 4 / 6 + 0.05)));
    if (beacon.current) {
      const k = (t * 0.8) % 1;
      const on = range(P, 5 / 6, 0.97);
      beacon.current.scale.setScalar(1 + k * 1.6);
      (beacon.current.material as THREE.MeshBasicMaterial).opacity = (1 - k) * on;
    }

    /* camera per step */
    const zoom = camera.aspect < 0.8 ? 1.7 : camera.aspect < 1.2 ? 1.3 : 1;
    const keys: [number, [number, number, number], [number, number, number]][] = [
      [0.0, [-150, 80, 130], [-90, 4, -40]],
      [0.12, [-70, 50, 100], [-30, 6, -30]],
      [0.24, [46, 34, 62], [0, 12, -10]],
      [0.32, [46, 32, 60], [2, 9, -4]],
      [0.42, [126, 26, 48], [GATE_X - 6, 3, LANE_Z]],
      [0.56, [112, 36, 66], [150, 4, 2]],
      [0.7, [205, 58, 110], [175, 2, 30]],
      [0.86, [v.b.x + 60, 60, v.b.z + 80], [v.b.x, 2, v.b.z]],
      [1.0, [DEST.x + 80, 200, DEST.z + 240], [DEST.x - 100, 0, DEST.z - 30]],
    ];
    let k = 0;
    while (k < keys.length - 2 && P > keys[k + 1][0]) k++;
    const kt = easeInOut(range(P, keys[k][0], keys[k + 1][0]));
    v.a.set(...keys[k][1]).lerp(v.b.set(...keys[k + 1][1]), kt);
    v.look.set(...keys[k][2]).lerp(v.b.set(...keys[k + 1][2]), kt);
    camera.position.copy(v.a).sub(v.look).multiplyScalar(zoom).add(v.look);
    camera.lookAt(v.look);
  });

  return (
    <>
      <DuskLights intensity={1.05} />
      <Sky />
      <DuskFog near={260} far={1300} />
      <Water />
      <Quay width={760} />
      {/* land behind the quay extends to the warehouse district */}
      <mesh position={[420, -1.51, 240]} material={mats.concrete()}>
        <boxGeometry args={[740, 3, 500]} />
      </mesh>
      <mesh position={[120, 0.03, LANE_Z]} material={mats.asphalt()}>
        <boxGeometry args={[240, 0.05, 8]} />
      </mesh>
      <Crane rig={rig} />
      <Crane rig={rigB} position={[-62, 0, 0]} light={false} />
      <ContainerField slots={yard} seed={41} />
      <Vessel innerRef={vessel} position={[-360, 0, -70]} />
      <Tug innerRef={tug} />
      <BrandedContainer innerRef={box} />
      <Truck innerRef={truck} position={[1, 0, LANE_Z]} />
      <CustomsGate light={gateLight} arm={arm} />
      <Warehouse position={[WAREHOUSE.x, 0, WAREHOUSE.z]} rotationY={-Math.PI / 2} size={[46, 12, 30]} doors={4} />
      <Truck innerRef={van} container containerColor="#e8eef1" cab={PALETTE.cyan} />
      <Line ref={road} points={roadPts} color={PALETTE.cargo} lineWidth={3} dashed dashSize={6} gapSize={5} />
      <Destination beacon={beacon} />
    </>
  );
}
