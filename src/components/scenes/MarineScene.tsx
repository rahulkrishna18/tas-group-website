"use client";

import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import { DuskFog, DuskLights, Sky, Water } from "../three/Environment";
import { Barge, Crane, CraneRig, CrewBoat, Quay, Tug, Vessel } from "../three/primitives";
import { damp } from "@/lib/math";
import { PALETTE } from "../three/materials";

export type MarineFocus = "agency" | "tugbarge" | "crew" | "port";

const FOCUS: Record<MarineFocus, { target: [number, number, number]; offset: [number, number, number] }> = {
  agency: { target: [-20, 10, -150], offset: [150, 60, 170] },
  tugbarge: { target: [70, 2, -40], offset: [-60, 30, 80] },
  crew: { target: [-60, 2, 30], offset: [40, 16, 50] },
  port: { target: [0, 18, 160], offset: [90, 30, -120] },
};

export default function MarineScene({ focus, onFocus, still }: { focus: MarineFocus; onFocus: (f: MarineFocus) => void; still?: boolean }) {
  const camera = useThree((s) => s.camera);
  const look = useRef(new THREE.Vector3(...FOCUS.agency.target));
  const pos = useRef(new THREE.Vector3(...FOCUS.agency.target).add(new THREE.Vector3(...FOCUS.agency.offset)));
  const ship = useRef<THREE.Group>(null);
  const tug = useRef<THREE.Group>(null);
  const barge = useRef<THREE.Group>(null);
  const crew = useRef<THREE.Group>(null);
  const tow = useRef<THREE.Group>(null);
  const rig = useRef<CraneRig>({ trolleyZ: -20, hoistY: 20 });
  const [hover, setHover] = useState<MarineFocus | null>(null);
  const tmp = useMemo(() => ({ t: new THREE.Vector3(), p: new THREE.Vector3() }), []);

  useFrame(({ clock }, dt) => {
    const t = still ? 0 : clock.elapsedTime;
    const f = FOCUS[focus];
    const orbit = still ? 0 : Math.sin(t * 0.08) * 0.18;
    tmp.t.set(...f.target);
    const [ox, oy, oz] = f.offset;
    tmp.p.set(ox * Math.cos(orbit) - oz * Math.sin(orbit), oy, ox * Math.sin(orbit) + oz * Math.cos(orbit)).add(tmp.t);
    const k = Math.min(dt, 0.1);
    look.current.set(damp(look.current.x, tmp.t.x, 2.2, k), damp(look.current.y, tmp.t.y, 2.2, k), damp(look.current.z, tmp.t.z, 2.2, k));
    pos.current.set(damp(pos.current.x, tmp.p.x, 1.8, k), damp(pos.current.y, tmp.p.y, 1.8, k), damp(pos.current.z, tmp.p.z, 1.8, k));
    camera.position.copy(pos.current);
    camera.lookAt(look.current);

    if (ship.current) {
      ship.current.position.y = Math.sin(t * 0.5) * 0.15;
      ship.current.rotation.z = Math.sin(t * 0.4) * 0.006;
    }
    // tug tows the barge in a slow arc
    const a = t * 0.025;
    if (tow.current) {
      tow.current.position.set(70 + Math.sin(a) * 30, 0, -40 + Math.cos(a) * 12);
      tow.current.rotation.y = -0.4 + Math.sin(a) * 0.1;
    }
    if (tug.current) tug.current.position.y = Math.sin(t * 1.3) * 0.25;
    if (barge.current) barge.current.position.y = Math.sin(t * 0.9 + 1) * 0.15;
    if (crew.current) {
      const c = t * 0.12;
      crew.current.position.set(-60 + Math.cos(c) * 22, Math.sin(t * 1.6) * 0.2, 30 + Math.sin(c) * 14);
      crew.current.rotation.y = Math.PI / 2 - c;
    }
  });

  const interact = (id: MarineFocus) => ({
    onClick: (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      onFocus(id);
    },
    onPointerOver: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      setHover(id);
      document.body.style.cursor = "pointer";
    },
    onPointerOut: () => {
      setHover(null);
      document.body.style.cursor = "";
    },
  });

  return (
    <>
      <DuskLights intensity={1.1} />
      <Sky />
      <DuskFog near={300} far={1600} />
      <Water calm={0.4} />
      {/* quay across the anchorage */}
      <group position={[0, 0, 190]}>
        <Quay width={600} depth={120} />
        <group {...interact("port")}>
          <Crane rig={rig} />
        </group>
        <Crane rig={rig} position={[70, 0, 0]} light={false} />
      </group>

      <group {...interact("agency")}>
        <Vessel innerRef={ship} position={[-20, 0, -150]} rotationY={0.35} seed={9} fillHeroSlot />
      </group>

      <group ref={tow} {...interact("tugbarge")}>
        <Barge innerRef={barge} position={[-32, 0, 0]} />
        <Tug innerRef={tug} position={[30, 0, 0]} rotationY={Math.PI} />
        <Line points={[[-14, 1.4, 0], [8, 1.2, 0], [22, 1.6, 0]]} color={PALETTE.foam} lineWidth={1.2} transparent opacity={0.7} />
      </group>

      <group {...interact("crew")}>
        <CrewBoat innerRef={crew} />
      </group>

      {/* hover halo */}
      {hover && hover !== focus && (
        <mesh position={[FOCUS[hover].target[0], 0.3, FOCUS[hover].target[2]]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[hover === "agency" ? 90 : hover === "port" ? 30 : 28, hover === "agency" ? 92 : hover === "port" ? 31 : 29.5, 64]} />
          <meshBasicMaterial color={PALETTE.cyan} transparent opacity={0.6} toneMapped={false} />
        </mesh>
      )}
    </>
  );
}
