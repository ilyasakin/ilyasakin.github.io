import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass";
import { BokehPass } from "three/examples/jsm/postprocessing/BokehPass";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import texturepx from "../assets/textures/px.jpg";
import texturepy from "../assets/textures/py.jpg";
import texturepz from "../assets/textures/pz.jpg";
import texturenx from "../assets/textures/nx.jpg";
import textureny from "../assets/textures/ny.jpg";
import texturenz from "../assets/textures/nz.jpg";

let camera: THREE.PerspectiveCamera;
let scene: THREE.Scene;
let renderer: THREE.WebGLRenderer;
let singleMaterial: boolean;
let zmaterial: THREE.MeshBasicMaterial[];
let parameters: { color: number; envMap: THREE.CubeTexture };
let nobjects: number;
let cubeMaterial: THREE.MeshBasicMaterial;

let mouseX = 0;
let mouseY = 0;

const isMobile = /Android|iPhone|iPad/i.test(
  typeof navigator !== "undefined" ? navigator.userAgent : ""
);

if (typeof window !== "undefined" && !isMobile) {
  window.addEventListener("pointermove", onPointerMove);
}

if (isMobile) {
  setInterval(() => {
    mouseX = Math.random() * 200 - 100;
    mouseY = Math.random() * 200 - 100;
  }, 1000);
}

let windowHalfX = typeof window !== "undefined" ? innerWidth / 2 : 0;
let windowHalfY = typeof window !== "undefined" ? innerHeight / 2 : 0;

let width = typeof window !== "undefined" ? innerWidth : 0;
let height = typeof window !== "undefined" ? innerHeight : 0;

const materials: THREE.MeshBasicMaterial[] = [];
const objects: THREE.Mesh[] = [];

const postprocessing: {
  composer: EffectComposer | null;
  bokeh: BokehPass | null;
} = { composer: null, bokeh: null };

export function init() {
  const container = document.createElement("div");
  container.id = "fancy-background";
  container.style.position = "fixed";
  container.style.top = "0";
  container.style.left = "0";
  container.style.zIndex = "-1";
  // heavy inner shadow
  container.style.boxShadow = "inset 0 0 100px rgba(0, 0, 0, 0.5)";
  // inner blur
  container.style.filter = "blur(30px)";
  document.body.appendChild(container);

  camera = new THREE.PerspectiveCamera(70, width / height, 1, 3000);
  camera.position.z = 200;

  scene = new THREE.Scene();

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);
  container.appendChild(renderer.domElement);

  const urls = [
    texturepx.src,
    texturenx.src,
    texturepy.src,
    textureny.src,
    texturepz.src,
    texturenz.src,
  ];

  // Red colored cube
  const textureCube = new THREE.CubeTextureLoader().load(urls);

  parameters = { color: 0xff4900, envMap: textureCube };
  cubeMaterial = new THREE.MeshBasicMaterial(parameters);

  singleMaterial = false;

  if (singleMaterial) {
    zmaterial = [cubeMaterial];
  }

  const geo = new THREE.SphereGeometry(1, 20, 10);

  const xgrid = 14,
    ygrid = 9,
    zgrid = 14;

  nobjects = xgrid * ygrid * zgrid;

  const s = 60;
  let count = 0;

  for (let i = 0; i < xgrid; i++) {
    for (let j = 0; j < ygrid; j++) {
      for (let k = 0; k < zgrid; k++) {
        let mesh;

        if (singleMaterial) {
          mesh = new THREE.Mesh(geo, zmaterial);
        } else {
          mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial(parameters));
          materials[count] = mesh.material;
        }

        const x = 200 * (i - xgrid / 2);
        const y = 200 * (j - ygrid / 2);
        const z = 200 * (k - zgrid / 2);

        mesh.position.set(x, y, z);
        mesh.scale.set(s, s, s);

        mesh.matrixAutoUpdate = false;
        mesh.updateMatrix();

        scene.add(mesh);
        objects.push(mesh);

        count++;
      }
    }
  }

  initPostprocessing();

  renderer.autoClear = false;
  container.style.touchAction = "none";

  window.addEventListener("resize", onWindowResize);

  const effectController = {
    focus: 500.0,
    aperture: 5,
    maxblur: 0.01,
  };

  const matChanger = function () {
    if (!postprocessing.bokeh) return;

    const uniforms = postprocessing.bokeh.uniforms as {
      [key: string]: { value: number };
    };
    uniforms["focus"].value = effectController.focus;
    uniforms["aperture"].value = effectController.aperture * 0.00001;
    uniforms["maxblur"].value = effectController.maxblur;
  };

  // const gui = new GUI();
  // gui.add(effectController, 'focus', 10.0, 3000.0, 10).onChange(matChanger);
  // gui.add(effectController, 'aperture', 0, 10, 0.1).onChange(matChanger);
  // gui.add(effectController, 'maxblur', 0.0, 0.01, 0.001).onChange(matChanger);
  // gui.close();

  matChanger();
}

function onPointerMove(event: PointerEvent) {
  if (!event.isPrimary) return;

  mouseX = event.clientX - windowHalfX;
  mouseY = event.clientY - windowHalfY;
}

function onWindowResize() {
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;

  width = window.innerWidth;
  height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);

  if (postprocessing.composer) {
    postprocessing.composer.setSize(width, height);
  }
}

function initPostprocessing() {
  const renderPass = new RenderPass(scene, camera);

  const bokehPass = new BokehPass(scene, camera, {
    focus: 1.0,
    aperture: 0.025,
    maxblur: 0.01,
  });

  const outputPass = new OutputPass();

  const composer = new EffectComposer(renderer);

  composer.addPass(renderPass);
  composer.addPass(bokehPass);
  composer.addPass(outputPass);

  postprocessing.composer = composer;
  postprocessing.bokeh = bokehPass;
}

export function animate() {
  render();
  requestAnimationFrame(animate);
}

function render() {
  const time = Date.now() * 0.00005;

  camera.position.x += (mouseX - camera.position.x) * 0.036;
  camera.position.y += (-mouseY - camera.position.y) * 0.036;

  camera.lookAt(scene.position);

  if (!singleMaterial) {
    for (let i = 0; i < nobjects; i++) {
      const h = ((360 * (i / nobjects + time)) % 360) / 360;
      materials[i].color.setHSL(h, 1, 0.5);
    }
  }

  if (postprocessing.composer) {
    postprocessing.composer.render(0.1);
  }
}

export function destroy() {
  const container = document.getElementById("fancy-background");
  if (container) {
    container.remove();
  }
  window.removeEventListener("resize", onWindowResize);
  document.body.removeEventListener("pointermove", onPointerMove);
}
