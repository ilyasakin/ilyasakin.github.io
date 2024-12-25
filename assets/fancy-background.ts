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
import { setInterval } from "worker-timers";

export class FancyBackground {
  private camera!: THREE.PerspectiveCamera;
  private scene!: THREE.Scene;
  private renderer!: THREE.WebGLRenderer;
  private materials: THREE.MeshBasicMaterial[] = [];
  private objects: THREE.Mesh[] = [];
  private mouseX = 0;
  private mouseY = 0;
  private windowHalfX: number;
  private windowHalfY: number;
  private width: number;
  private height: number;
  private nobjects: number = 0;
  private singleMaterial: boolean = false;
  private postprocessing: {
    composer: EffectComposer | null;
    bokeh: BokehPass | null;
  } = { composer: null, bokeh: null };
  
  private readonly isMobile = /Android|iPhone|iPad/i.test(
    typeof navigator !== "undefined" ? navigator.userAgent : "",
  );
  
  private readonly isWebGL2: boolean;

  constructor() {
    this.isWebGL2 = this.getIsWebGL2();
    this.windowHalfX = typeof window !== "undefined" ? window.innerWidth / 2 : 0;
    this.windowHalfY = typeof window !== "undefined" ? window.innerHeight / 2 : 0;
    this.width = typeof window !== "undefined" ? window.innerWidth : 0;
    this.height = typeof window !== "undefined" ? window.innerHeight : 0;
  }

  private getIsWebGL2(): boolean {
    try {
      const canvas = document.createElement("canvas");
      return !!(window.WebGL2RenderingContext && canvas.getContext("webgl2"));
    } catch (e) {
      return false;
    }
  }

  public init(): void {
    if (!this.isWebGL2) return;

    // Initialize scene, camera, and renderer in constructor
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(70, this.width / this.height, 1, 3000);
    this.renderer = new THREE.WebGLRenderer();
    
    // Bind methods
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);
    this.animate = this.animate.bind(this);

    const container = document.createElement("div");
    container.id = "fancy-background";
    container.style.position = "fixed";
    container.style.top = "0";
    container.style.left = "0";
    container.style.zIndex = "-1";
    container.style.boxShadow = "inset 0 0 100px rgba(0, 0, 0, 0.5)";

    if (this.isMobile) {
      container.style.pointerEvents = "none";
      container.style.filter = "blur(20px)";
    } else {
      container.style.filter = "blur(30px)";
    }

    document.body.appendChild(container);

    this.camera.position.z = 200;
    this.renderer.setPixelRatio(window.devicePixelRatio / 20);
    this.renderer.setSize(this.width, this.height);
    container.appendChild(this.renderer.domElement);

    this.setupScene();
    this.initPostprocessing();
    this.setupEventListeners();

    this.renderer.autoClear = false;
    container.style.touchAction = "none";

    // Start animation
    this.animate();
  }

  private setupScene(): void {
    const urls = [
      texturepx.src,
      texturenx.src,
      texturepy.src,
      textureny.src,
      texturepz.src,
      texturenz.src,
    ];

    const textureCube = new THREE.CubeTextureLoader().load(urls);
    const parameters = { color: 0xff4900, envMap: textureCube };
    const cubeMaterial = new THREE.MeshBasicMaterial(parameters);
    const geo = new THREE.SphereGeometry(1, 20, 10);

    const xgrid = 14, ygrid = 9, zgrid = 14;
    this.nobjects = xgrid * ygrid * zgrid;
    const s = 60;
    let count = 0;

    for (let i = 0; i < xgrid; i++) {
      for (let j = 0; j < ygrid; j++) {
        for (let k = 0; k < zgrid; k++) {
          const mesh = new THREE.Mesh(
            geo,
            this.singleMaterial ? cubeMaterial : new THREE.MeshBasicMaterial(parameters)
          );

          if (!this.singleMaterial) {
            this.materials[count] = mesh.material as THREE.MeshBasicMaterial;
          }

          const x = 200 * (i - xgrid / 2);
          const y = 200 * (j - ygrid / 2);
          const z = 200 * (k - zgrid / 2);

          mesh.position.set(x, y, z);
          mesh.scale.set(s, s, s);
          mesh.matrixAutoUpdate = false;
          mesh.updateMatrix();

          this.scene.add(mesh);
          this.objects.push(mesh);
          count++;
        }
      }
    }
  }

  private setupEventListeners(): void {
    if (!this.isMobile) {
      window.addEventListener("pointermove", this.onPointerMove);
    } else {
      setInterval(() => {
        this.mouseX = Math.random() * window.innerWidth;
        this.mouseY = Math.random() * window.innerHeight;
      }, 1500);
    }
    
    window.addEventListener("resize", this.onWindowResize);
  }

  private onPointerMove(event: PointerEvent): void {
    if (!this.isWebGL2 || !event.isPrimary) return;
    
    this.mouseX = event.clientX - this.windowHalfX;
    this.mouseY = event.clientY - this.windowHalfY;
  }

  private onWindowResize(): void {
    if (!this.isWebGL2) return;

    this.windowHalfX = window.innerWidth / 2;
    this.windowHalfY = window.innerHeight / 2;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);

    if (this.postprocessing.composer) {
      this.postprocessing.composer.setSize(this.width, this.height);
    }
  }

  private initPostprocessing(): void {
    if (!this.isWebGL2) return;

    const renderPass = new RenderPass(this.scene, this.camera);
    const bokehPass = new BokehPass(this.scene, this.camera, {
      focus: 1.0,
      aperture: 0.025,
      maxblur: 0.01,
    });
    const outputPass = new OutputPass();
    const composer = new EffectComposer(this.renderer);

    composer.addPass(renderPass);
    composer.addPass(bokehPass);
    composer.addPass(outputPass);

    this.postprocessing.composer = composer;
    this.postprocessing.bokeh = bokehPass;
  }

  private render(): void {
    if (!this.isWebGL2) return;

    const time = Date.now() * 0.00005;

    this.camera.position.x += (this.mouseX - this.camera.position.x) * 0.036;
    this.camera.position.y += (-this.mouseY - this.camera.position.y) * 0.036;
    this.camera.lookAt(this.scene.position);

    if (!this.singleMaterial) {
      for (let i = 0; i < this.nobjects; i++) {
        const h = ((360 * (i / this.nobjects + time)) % 360) / 360;
        this.materials[i].color.setHSL(h, 1, 0.5);
      }
    }

    if (this.postprocessing.composer) {
      this.postprocessing.composer.render(0.1);
    }
  }

  public animate(): void {
    if (!this.isWebGL2) return;
    
    this.render();
    requestAnimationFrame(this.animate);
  }

  public destroy(): void {
    if (!this.isWebGL2) return;

    const container = document.getElementById("fancy-background");
    if (container) {
      container.remove();
    }
    window.removeEventListener("resize", this.onWindowResize);
    window.removeEventListener("pointermove", this.onPointerMove);
  }
}
