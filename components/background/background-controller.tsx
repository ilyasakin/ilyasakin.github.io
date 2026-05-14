"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { setConsoleFunction } from "three";
import { useEffect, useMemo, useRef, useState } from "react";

// THREE r183 deprecated Clock in favor of Timer, but @react-three/fiber 9.6
// still instantiates Clock internally (events-*.esm.js). Register a console
// hook that swallows just that one deprecation and forwards everything else
// untouched. Idempotent under HMR — re-running just replaces the same function.
if (typeof window !== "undefined") {
  setConsoleFunction((type, message, ...params) => {
    if (
      type === "warn" &&
      typeof message === "string" &&
      message.startsWith("THREE.Clock: This module has been deprecated")
    ) {
      return;
    }
    if (type === "error") console.error(message, ...params);
    else if (type === "warn") console.warn(message, ...params);
    else console.log(message, ...params);
  });
}

function getIsWebGL2(): boolean {
  try {
    const canvas: HTMLCanvasElement = document.createElement("canvas");
    return !!(window.WebGL2RenderingContext && canvas.getContext("webgl2"));
  } catch (e) {
    return false;
  }
}

// 256×256 random noise texture, sampled with linear-filter wrap.
// Bilinear sampling gives "value noise" character for free; after 5-octave fBM
// + domain warp the origin texture grid is invisible. ~5–7× cheaper than snoise.
function makeNoiseTexture(): THREE.DataTexture {
  const size = 256;
  const data = new Uint8Array(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    data[i * 4 + 0] = Math.random() * 255;
    data[i * 4 + 1] = Math.random() * 255;
    data[i * 4 + 2] = Math.random() * 255;
    data[i * 4 + 3] = 255;
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return tex;
}

const VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  uniform float     uTime;
  uniform vec2      uResolution;
  uniform vec2      uMouse;
  uniform sampler2D uNoise;

  varying vec2 vUv;

  // Texture-baked value noise. One sample, bilinear-smoothed in hardware.
  // Replaces 30+ ALU procedural simplex noise — the big perf win.
  float noise(vec2 p) {
    return texture2D(uNoise, p * (1.0 / 256.0)).r * 2.0 - 1.0;
  }

  // 5-octave fBM with per-octave rotation (kills axis-aligned tiling)
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    const mat2 R = mat2(0.80, 0.60, -0.60, 0.80);
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = R * p * 2.0 + vec2(1.7, 9.2);
      a *= 0.5;
    }
    return v;
  }

  // Inigo Quilez "domain warp": fbm of fbm — the signature organic-flow look
  float pattern(in vec2 p, in float t) {
    vec2 q = vec2(
      fbm(p + vec2(0.0, 0.0) + 0.35 * t),
      fbm(p + vec2(5.2, 1.3) + 0.27 * t)
    );
    return fbm(p + 3.4 * q);
  }

  // IQ cosine palette — near-black baseline, warm-magenta amplitude,
  // channel-specific phase shifts for iridescence without rainbow cycling
  vec3 palette(float t) {
    vec3 a = vec3(0.04, 0.02, 0.06);
    vec3 b = vec3(0.85, 0.32, 0.55);
    vec3 c = vec3(0.85, 0.95, 0.55);
    vec3 d = vec3(0.00, 0.18, 0.55);
    return a + b * cos(6.28318 * (c * t + d));
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / max(uResolution.y, 1.0);

    vec2 p = uv - 0.5;
    p.x *= aspect;

    float t = uTime * 0.045;

    // Subtle mouse warp
    p += uMouse * 0.04;

    // Flowing field
    float n = pattern(p * 1.25 + vec2(t * 0.32, t * 0.11), t);

    // Chromatic aberration via per-channel palette phase offset (cheap)
    float v = n * 0.55 + 0.22;
    float ca = 0.014;
    vec3 color = vec3(
      palette(v + ca).r,
      palette(v).g,
      palette(v - ca).b
    );

    // Black-dominant reveal — only color the active regions of the field
    float reveal = smoothstep(-0.05, 0.85, n);
    color *= reveal;

    // Signature ember glow — bottom-center anchor
    vec2 emberC = vec2(0.0, -0.22);
    float emberD = length(p - emberC);
    float ember  = exp(-emberD * 1.65) * 0.50;
    color += vec3(1.0, 0.286, 0.0) * ember * (0.45 + 0.55 * smoothstep(-0.25, 0.6, n));

    // Cool indigo counterpoint
    vec2 coolC = vec2(0.42, 0.34);
    float coolD = length(p - coolC);
    float cool  = exp(-coolD * 2.0) * 0.32;
    color += vec3(0.15, 0.22, 0.62) * cool * (0.35 + 0.65 * smoothstep(-0.2, 0.65, n));

    // Soft vignette
    float vig = smoothstep(1.45, 0.25, length(p));
    color *= mix(0.18, 1.0, vig);

    // Film grain in shader space
    float grain = fract(sin(dot(uv * vec2(421.0, 711.0) + t * 23.0,
                                vec2(12.9898, 78.233))) * 43758.5453);
    color += (grain - 0.5) * 0.018;

    // Preserve true black; gentle contrast curve to darken midtones
    color = max(color, vec3(0.0));
    color = pow(color, vec3(1.18));

    gl_FragColor = vec4(color, 1.0);
  }
`;

function FlowField({
  mouseRef,
  reducedMotion,
}: {
  mouseRef: React.MutableRefObject<{ x: number; y: number }>;
  reducedMotion: boolean;
}) {
  const { size, invalidate } = useThree();

  const noiseTex = useMemo(() => makeNoiseTexture(), []);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uResolution: { value: new THREE.Vector2(1, 1) },
          uMouse: { value: new THREE.Vector2(0, 0) },
          uNoise: { value: noiseTex },
        },
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        depthTest: false,
        depthWrite: false,
      }),
    [noiseTex],
  );

  useEffect(() => {
    material.uniforms.uResolution.value.set(size.width, size.height);
    invalidate();
  }, [size.width, size.height, material, invalidate]);

  useFrame(({ clock }) => {
    if (reducedMotion) return;
    // Modulo time so float precision stays sharp forever — no drift after long sessions
    material.uniforms.uTime.value = clock.getElapsedTime() % 10000;
    const target = mouseRef.current;
    const m = material.uniforms.uMouse.value as THREE.Vector2;
    m.x += (target.x - m.x) * 0.04;
    m.y += (target.y - m.y) * 0.04;
  });

  useEffect(
    () => () => {
      material.dispose();
      noiseTex.dispose();
    },
    [material, noiseTex],
  );

  return (
    <mesh material={material} frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
}

export default function BackgroundController() {
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);
  const [isWebGL2, setIsWebGL2] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setShouldReduceMotion(mediaQuery.matches);
    const onMediaChange = (e: MediaQueryListEvent) =>
      setShouldReduceMotion(e.matches);
    mediaQuery.addEventListener("change", onMediaChange);
    setIsWebGL2(getIsWebGL2());
    setIsMobile(/Android|iPhone|iPad/i.test(navigator.userAgent));
    return () => mediaQuery.removeEventListener("change", onMediaChange);
  }, []);

  useEffect(() => {
    if (!isMobile) return;
    const target = { x: 0, y: 0 };
    const id = window.setInterval(() => {
      target.x = Math.random() * 2 - 1;
      target.y = Math.random() * 2 - 1;
    }, 2800);
    let raf = 0;
    const tick = () => {
      mouseRef.current.x += (target.x - mouseRef.current.x) * 0.02;
      mouseRef.current.y += (target.y - mouseRef.current.y) * 0.02;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      window.clearInterval(id);
      cancelAnimationFrame(raf);
    };
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) return;
    const onPointerMove = (e: PointerEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, [isMobile]);

  if (!isWebGL2) return null;

  return (
    <div
      id="fancy-background"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -1,
        pointerEvents: "none",
        touchAction: "none",
        backgroundColor: "#000000",
        overflow: "hidden",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 1] }}
        // dpr 1.0 desktop (was 1.5) — field is low-frequency, retina upscale is invisible
        dpr={1}
        frameloop={shouldReduceMotion ? "demand" : "always"}
        gl={{
          antialias: false,
          alpha: false,
          // Shader doesn't depth- or stencil-test → skip those framebuffer attachments.
          // Saves memory bandwidth and shrinks the framebuffer/viewport mismatch surface
          // that causes Firefox's "destination rect smaller than viewport" warning at first draw.
          depth: false,
          stencil: false,
          powerPreference: "high-performance",
          preserveDrawingBuffer: false,
        }}
        onCreated={({ gl, size }) => {
          gl.setClearColor(0x000000, 1);
          // R3F's first rAF render can fire before ResizeObserver settles — the renderer's
          // default 300×150 backing buffer then drives a draw with a viewport set for the
          // real size, and Firefox latches the "viewport > destination" warning permanently.
          // Force-sync size + pixel ratio here (runs before the first render) to close the gap.
          gl.setPixelRatio(1);
          gl.setSize(size.width, size.height, false);
        }}
      >
        <FlowField mouseRef={mouseRef} reducedMotion={shouldReduceMotion} />
      </Canvas>

      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 110% 80% at 50% 50%, transparent 35%, rgba(0, 0, 0, 0.55) 100%), linear-gradient(180deg, rgba(0, 0, 0, 0.5) 0%, transparent 18%, transparent 82%, rgba(0, 0, 0, 0.55) 100%)",
        }}
      />
    </div>
  );
}
