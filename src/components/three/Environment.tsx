"use client";

import { MutableRefObject, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";

export type Atmosphere = {
  /** 0 = dusk port, 1 = fully dissolved into deep navy (used for the hero → globe transition) */
  dissolve: number;
};

const SUN_DIR = new THREE.Vector3(-0.55, 0.16, -0.82).normalize();

/* ------------------------------------------------------------------ */
/* Water: analytic wave normals, fresnel sky reflection, low sun glint */
/* ------------------------------------------------------------------ */
const waterVert = /* glsl */ `
  varying vec3 vWorld;
  #include <fog_pars_vertex>
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorld = wp.xyz;
    vec4 mvPosition = viewMatrix * wp;
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`;

const waterFrag = /* glsl */ `
  uniform float uTime;
  uniform vec3 uDeep;
  uniform vec3 uSky;
  uniform vec3 uSunColor;
  uniform vec3 uSunDir;
  uniform float uCalm;
  varying vec3 vWorld;
  #include <fog_pars_fragment>

  vec2 wave(vec2 p, vec2 d, float f, float a, float s) {
    float ph = dot(p, d) * f + uTime * s;
    return d * (a * f * cos(ph));
  }
  void main() {
    vec2 p = vWorld.xz;
    float dist = length(cameraPosition - vWorld);
    float fade = 1.0 / (1.0 + dist * 0.0035);
    vec2 g = vec2(0.0);
    g += wave(p, normalize(vec2(1.0, 0.35)), 0.045, 1.4, 0.9);
    g += wave(p, normalize(vec2(-0.6, 1.0)), 0.09, 0.55, 1.4);
    g += wave(p, normalize(vec2(0.2, -1.0)), 0.21, 0.22, 2.1);
    g += wave(p, normalize(vec2(-1.0, -0.4)), 0.47, 0.08, 2.9);
    g += wave(p, normalize(vec2(0.7, 0.7)), 1.1, 0.025, 3.7) * fade;
    g *= mix(1.0, 0.35, uCalm) * mix(0.35, 1.0, fade);
    vec3 n = normalize(vec3(-g.x, 1.0, -g.y));
    vec3 V = normalize(cameraPosition - vWorld);
    float fres = pow(1.0 - max(dot(n, V), 0.0), 3.0);
    vec3 col = mix(uDeep, uSky, clamp(fres * 0.95 + 0.04, 0.0, 1.0));
    vec3 H = normalize(uSunDir + V);
    float spec = pow(max(dot(n, H), 0.0), 220.0) * 3.0 + pow(max(dot(n, H), 0.0), 24.0) * 0.12;
    col += uSunColor * spec;
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    #include <fog_fragment>
  }
`;

export function Water({ size = 6000, calm = 0, atmosphere }: { size?: number; calm?: number; atmosphere?: MutableRefObject<Atmosphere> }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: waterVert,
        fragmentShader: waterFrag,
        fog: true,
        uniforms: THREE.UniformsUtils.merge([
          THREE.UniformsLib.fog,
          {
            uTime: { value: 0 },
            uDeep: { value: new THREE.Color("#04121c") },
            uSky: { value: new THREE.Color("#3a6380") },
            uSunColor: { value: new THREE.Color("#ffb468") },
            uSunDir: { value: SUN_DIR.clone() },
            uCalm: { value: calm },
          },
        ]),
      }),
    [calm]
  );
  useFrame((_, dt) => {
    material.uniforms.uTime.value += Math.min(dt, 0.05);
    if (atmosphere) material.uniforms.uSunColor.value.setRGB(1, 0.705, 0.408).multiplyScalar(1 - atmosphere.current.dissolve);
  });
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} material={material} frustumCulled={false}>
      <planeGeometry args={[size, size, 1, 1]} />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/* Dusk sky dome                                                      */
/* ------------------------------------------------------------------ */
const skyVert = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_Position = p.xyww;
  }
`;
const skyFrag = /* glsl */ `
  uniform vec3 uZenith;
  uniform vec3 uHorizon;
  uniform vec3 uGlow;
  uniform vec3 uSunDir;
  uniform float uDissolve;
  uniform vec3 uAbyss;
  varying vec3 vDir;
  void main() {
    vec3 d = normalize(vDir);
    float h = clamp(d.y, -0.2, 1.0);
    vec3 col = mix(uHorizon, uZenith, smoothstep(-0.02, 0.45, h));
    float sun = max(dot(d, uSunDir), 0.0);
    col += uGlow * (pow(sun, 6.0) * 0.55 + pow(sun, 64.0) * 0.9) * smoothstep(-0.1, 0.12, h + 0.08);
    col = mix(col, uAbyss, uDissolve);
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export const HORIZON = new THREE.Color("#2b4a60");
const ABYSS = new THREE.Color("#06141d");

export function Sky({ atmosphere }: { atmosphere?: MutableRefObject<Atmosphere> }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: skyVert,
        fragmentShader: skyFrag,
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: {
          uZenith: { value: new THREE.Color("#071a27") },
          uHorizon: { value: HORIZON.clone() },
          uGlow: { value: new THREE.Color("#f2994a") },
          uSunDir: { value: SUN_DIR.clone() },
          uDissolve: { value: 0 },
          uAbyss: { value: ABYSS.clone() },
        },
      }),
    []
  );
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ camera }) => {
    ref.current?.position.copy(camera.position);
    if (atmosphere) material.uniforms.uDissolve.value = atmosphere.current.dissolve;
  });
  return (
    <mesh ref={ref} material={material} renderOrder={-10} frustumCulled={false}>
      <sphereGeometry args={[1, 32, 16]} />
    </mesh>
  );
}

/** Fog that tracks the horizon colour and can dissolve the scene into deep navy. */
export function DuskFog({ near = 220, far = 1400, atmosphere }: { near?: number; far?: number; atmosphere?: MutableRefObject<Atmosphere> }) {
  const scene = useThree((s) => s.scene);
  const fog = useMemo(() => new THREE.Fog(HORIZON.clone(), near, far), [near, far]);
  useLayoutEffect(() => {
    scene.fog = fog;
    return () => {
      scene.fog = null;
    };
  }, [scene, fog]);
  useFrame(() => {
    if (!atmosphere) return;
    const d = atmosphere.current.dissolve;
    fog.color.copy(HORIZON).lerp(ABYSS, d);
    fog.near = THREE.MathUtils.lerp(near, 1, d);
    fog.far = THREE.MathUtils.lerp(far, 60, Math.pow(d, 0.6));
  });
  return null;
}

export function DuskLights({ intensity = 1 }: { intensity?: number }) {
  return (
    <>
      <hemisphereLight args={["#7fa3bb", "#132c3c", 1.1 * intensity]} />
      <directionalLight position={[-320, 110, -460]} color="#ffbe85" intensity={2.2 * intensity} />
      <directionalLight position={[260, 200, 300]} color="#a9cde3" intensity={0.9 * intensity} />
      <ambientLight color="#20b9d4" intensity={0.08 * intensity} />
    </>
  );
}
