"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { CubeTextureLoader } from "three";
import texturepxAvif from "../../assets/textures/px.avif";
import texturepyAvif from "../../assets/textures/py.avif";
import texturepzAvif from "../../assets/textures/pz.avif";
import texturenxAvif from "../../assets/textures/nx.avif";
import texturenyAvif from "../../assets/textures/ny.avif";
import texturenzAvif from "../../assets/textures/nz.avif";
import texturepxJpg from "../../assets/textures/px.jpg";
import texturepyJpg from "../../assets/textures/py.jpg";
import texturepzJpg from "../../assets/textures/pz.jpg";
import texturenxJpg from "../../assets/textures/nx.jpg";
import texturenyJpg from "../../assets/textures/ny.jpg";
import texturenzJpg from "../../assets/textures/nz.jpg";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

function getIsWebGL2(): boolean {
  try {
    const canvas: HTMLCanvasElement = document.createElement("canvas");
    return !!(window.WebGL2RenderingContext && canvas.getContext("webgl2"));
  } catch (e) {
    return false;
  }
}

function checkAvifSupport(): boolean {
  if (typeof window === "undefined") return false;
  const canvas = document.createElement("canvas");
  return canvas.toDataURL("image/avif").indexOf("data:image/avif") === 0;
}

function SpheresGrid({ isMobile, mouseRef }: { isMobile: boolean; mouseRef: React.MutableRefObject<{ x: number; y: number }>; }) {
  const supportsAvif = useMemo(() => checkAvifSupport(), []);
  const urls = useMemo(
    () => [
      supportsAvif ? texturepxAvif.src : texturepxJpg.src,
      supportsAvif ? texturenxAvif.src : texturenxJpg.src,
      supportsAvif ? texturepyAvif.src : texturepyJpg.src,
      supportsAvif ? texturenyAvif.src : texturenyJpg.src,
      supportsAvif ? texturepzAvif.src : texturepzJpg.src,
      supportsAvif ? texturenzAvif.src : texturenzJpg.src,
    ],
    [supportsAvif]
  );

  const textureCube = useMemo(() => new CubeTextureLoader().load(urls), [urls]);
  const { camera, scene } = useThree();

  const GRID_SIZE = useMemo(() => ({ x: isMobile ? 6 : 10, y: isMobile ? 4 : 7, z: isMobile ? 6 : 10 }), [isMobile]);
  const SPHERE_DETAIL = useMemo(() => ({ segments: isMobile ? 8 : 16, rings: isMobile ? 4 : 8 }), [isMobile]);

  const count = GRID_SIZE.x * GRID_SIZE.y * GRID_SIZE.z;
  const geometry = useMemo(() => new THREE.SphereGeometry(1, SPHERE_DETAIL.segments, SPHERE_DETAIL.rings), [SPHERE_DETAIL.rings, SPHERE_DETAIL.segments]);
  const material = useMemo(() => new THREE.MeshBasicMaterial({ color: 0xff4900, envMap: textureCube, fog: false }), [textureCube]);
  const instanced = useMemo(() => new THREE.InstancedMesh(geometry, material, count), [geometry, material, count]);

  useLayoutEffect(() => {
    const s = 60;
    const matrix = new THREE.Matrix4();
    let index = 0;
    for (let i = 0; i < GRID_SIZE.x; i++) {
      for (let j = 0; j < GRID_SIZE.y; j++) {
        for (let k = 0; k < GRID_SIZE.z; k++) {
          const x = 200 * (i - GRID_SIZE.x / 2);
          const y = 200 * (j - GRID_SIZE.y / 2);
          const z = 200 * (k - GRID_SIZE.z / 2);
          matrix.makeTranslation(x, y, z);
          matrix.scale(new THREE.Vector3(s, s, s));
          instanced.setMatrixAt(index++, matrix);
        }
      }
    }
    instanced.instanceMatrix.needsUpdate = true;
  }, [GRID_SIZE.x, GRID_SIZE.y, GRID_SIZE.z, instanced]);

  useFrame(() => {
    const time = Date.now() * 0.00005;
    camera.position.x += (mouseRef.current.x - camera.position.x) * 0.036;
    camera.position.y += (-mouseRef.current.y - camera.position.y) * 0.036;
    camera.lookAt(0, 0, 0);
    const h = time % 1;
    material.color.setHSL(h, 1, 0.5);
    material.needsUpdate = true;
  });

  useEffect(() => {
    scene.add(instanced);
    return () => {
      scene.remove(instanced);
      instanced.dispose();
      geometry.dispose();
      material.dispose();
      textureCube.dispose();
    };
  }, [scene, geometry, material, instanced, textureCube]);

  return null;
}

export default function BackgroundController() {
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);
  const [isWebGL2, setIsWebGL2] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setShouldReduceMotion(mediaQuery.matches);
    const onMediaChange = (e: MediaQueryListEvent) => setShouldReduceMotion(e.matches);
    mediaQuery.addEventListener("change", onMediaChange);
    setIsWebGL2(getIsWebGL2());
    setIsMobile(/Android|iPhone|iPad/i.test(navigator.userAgent));
    return () => mediaQuery.removeEventListener("change", onMediaChange);
  }, []);

  useEffect(() => {
    if (!isMobile) return;
    const id = window.setInterval(() => {
      mouseRef.current.x = Math.random() * window.innerWidth - window.innerWidth / 2;
      mouseRef.current.y = Math.random() * window.innerHeight - window.innerHeight / 2;
    }, 1500);
    return () => window.clearInterval(id);
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) return;
    const onPointerMove = (e: PointerEvent) => {
      mouseRef.current.x = e.clientX - window.innerWidth / 2;
      mouseRef.current.y = e.clientY - window.innerHeight / 2;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, [isMobile]);

  if (shouldReduceMotion || !isWebGL2) return null;

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
        boxShadow: "inset 0 0 100px rgba(0, 0, 0, 0.5)",
        filter: isMobile ? "blur(20px)" : "blur(30px)",
        pointerEvents: isMobile ? "none" : "auto",
        touchAction: "none",
      }}
    >
      <Canvas
        camera={{ fov: 70, near: 1, far: 3000, position: [0, 0, 200] }}
        dpr={isMobile ? 1 : 0.5}
      >
        <SpheresGrid isMobile={isMobile} mouseRef={mouseRef} />
      </Canvas>
    </div>
  );
}