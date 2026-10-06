"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Globe, ILLUSTRATIVE_ARCS, LAND_CORRIDOR, Mode, facingQuaternion } from "../three/Globe";
import { latLonToVec3 } from "../three/materials";
import { OFFICES, OfficeId } from "@/content/site";

export default function NetworkGlobeScene({ selected, onSelect, modes, zoom }: { selected: OfficeId; onSelect: (id: OfficeId) => void; modes: Mode[]; zoom: number }) {
  const controls = useRef<OrbitControlsImpl>(null);
  const camera = useThree((s) => s.camera);
  const q = useMemo(() => facingQuaternion(4.2, 101.4), []);
  const fly = useRef<THREE.Vector3 | null>(null);
  const dist = useRef(2.4);

  const arcs = useMemo(() => [LAND_CORRIDOR, ...ILLUSTRATIVE_ARCS].filter((a) => modes.includes(a.mode)), [modes]);

  // fly toward the selected office
  useEffect(() => {
    const o = OFFICES.find((x) => x.id === selected);
    if (!o) return;
    fly.current = latLonToVec3(o.lat, o.lon, 1).applyQuaternion(q).normalize();
  }, [selected, q]);

  // zoom buttons: ease the camera distance, keep its direction
  useEffect(() => {
    dist.current = zoom;
    if (!fly.current) fly.current = camera.position.clone().normalize();
  }, [zoom, camera]);

  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    const stop = () => (fly.current = null);
    c.addEventListener("start", stop);
    return () => c.removeEventListener("start", stop);
  }, []);

  useFrame((_, dt) => {
    const target = fly.current;
    if (!target) return;
    const cur = camera.position.clone();
    const len = cur.length();
    const k = 1 - Math.exp(-3 * Math.min(dt, 0.1));
    const next = cur.normalize().lerp(target, k).normalize().multiplyScalar(THREE.MathUtils.lerp(len, dist.current, k));
    camera.position.copy(next);
    controls.current?.update();
    if (next.clone().normalize().angleTo(target) < 0.002 && Math.abs(next.length() - dist.current) < 0.005) fly.current = null;
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 2, 4]} intensity={1.2} color="#bfe6f2" />
      <group quaternion={q}>
        <Globe offices={OFFICES} arcs={arcs} selected={selected} onSelect={onSelect} showLabels />
      </group>
      <OrbitControls
        ref={controls}
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.5}
        enableZoom={false}
        minDistance={1.3}
        maxDistance={4.5}
      />
    </>
  );
}
