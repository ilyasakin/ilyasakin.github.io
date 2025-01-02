import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass";
import { BokehPass } from "three/examples/jsm/postprocessing/BokehPass";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import texturepxAvif from "../assets/textures/px.avif";
import texturepyAvif from "../assets/textures/py.avif";
import texturepzAvif from "../assets/textures/pz.avif";
import texturenxAvif from "../assets/textures/nx.avif";
import texturenyAvif from "../assets/textures/ny.avif";
import texturenzAvif from "../assets/textures/nz.avif";
import texturepxJpg from "../assets/textures/px.jpg";
import texturepyJpg from "../assets/textures/py.jpg";
import texturepzJpg from "../assets/textures/pz.jpg";
import texturenxJpg from "../assets/textures/nx.jpg";
import texturenyJpg from "../assets/textures/ny.jpg";
import texturenzJpg from "../assets/textures/nz.jpg";
import { setInterval } from "worker-timers";

export class FancyBackground {
  private camera!: THREE.PerspectiveCamera;
  private scene!: THREE.Scene;
  private renderer!: THREE.WebGLRenderer;
  private objects: THREE.Mesh[] = [];
  private mouseX: number = 0;
  private mouseY: number = 0;
  private windowHalfX: number;
  private windowHalfY: number;
  private width: number;
  private height: number;
  private postprocessing: {
    composer: EffectComposer | null;
    bokeh: BokehPass | null;
  } = { composer: null, bokeh: null };

  private readonly isMobile: boolean = /Android|iPhone|iPad/i.test(
    typeof navigator !== "undefined" ? navigator.userAgent : "",
  );

  private readonly isWebGL2: boolean;

  private readonly GRID_SIZE = {
    x: this.isMobile ? 6 : 10,
    y: this.isMobile ? 4 : 7,
    z: this.isMobile ? 6 : 10,
  };
  private readonly SPHERE_DETAIL = {
    segments: this.isMobile ? 8 : 16,
    rings: this.isMobile ? 4 : 8,
  };
  private animationFrameId: number | null = null;
  private textureCube: THREE.CubeTexture | null = null;

  constructor() {
    this.isWebGL2 = this.getIsWebGL2();
    this.windowHalfX =
      typeof window !== "undefined" ? window.innerWidth / 2 : 0;
    this.windowHalfY =
      typeof window !== "undefined" ? window.innerHeight / 2 : 0;
    this.width = typeof window !== "undefined" ? window.innerWidth : 0;
    this.height = typeof window !== "undefined" ? window.innerHeight : 0;

    if (this.isWebGL2) {
      // Initialize core components in constructor
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(
        70,
        this.width / this.height,
        1,
        3000,
      );
      this.renderer = new THREE.WebGLRenderer({ antialias: true });

      // Bind methods
      this.onPointerMove = this.onPointerMove.bind(this);
      this.onWindowResize = this.onWindowResize.bind(this);
      this.animate = this.animate.bind(this);
    }
  }

  private getIsWebGL2(): boolean {
    try {
      const canvas: HTMLCanvasElement = document.createElement("canvas");
      return !!(window.WebGL2RenderingContext && canvas.getContext("webgl2"));
    } catch (e) {
      return false;
    }
  }

  public init(): void {
    if (!this.isWebGL2) return;

    const container: HTMLDivElement = document.createElement("div");
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
    if (!this.isMobile) {
      this.renderer.setPixelRatio(window.devicePixelRatio * 0.5);
    } else {
      // skip postprocessing on mobile
      this.postprocessing.bokeh = null;
    }
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

  private checkAvifSupport(): boolean {
    if (typeof window === 'undefined') return false;
    
    const canvas = document.createElement('canvas');
    return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
  }

  private setupScene(): void {
    // Pre-load textures once
    if (!this.textureCube) {
      const supportsAvif = this.checkAvifSupport();
      const urls = [
        supportsAvif ? texturepxAvif.src : texturepxJpg.src,
        supportsAvif ? texturenxAvif.src : texturenxJpg.src,
        supportsAvif ? texturepyAvif.src : texturepyJpg.src,
        supportsAvif ? texturenyAvif.src : texturenyJpg.src,
        supportsAvif ? texturepzAvif.src : texturepzJpg.src,
        supportsAvif ? texturenzAvif.src : texturenzJpg.src,
      ];

      this.textureCube = new THREE.CubeTextureLoader().load(urls);
    }

    const parameters = {
      color: 0xff4900,
      envMap: this.textureCube,
      fog: false,
      lights: false,
      precision: this.isMobile ? ("lowp" as const) : ("mediump" as const),
    };

    const geo: THREE.SphereGeometry = new THREE.SphereGeometry(
      1,
      this.SPHERE_DETAIL.segments,
      this.SPHERE_DETAIL.rings,
    );
    geo.computeBoundingSphere();

    // Use instanced mesh for better performance
    const instancedMesh = new THREE.InstancedMesh(
      geo,
      new THREE.MeshBasicMaterial(parameters),
      this.GRID_SIZE.x * this.GRID_SIZE.y * this.GRID_SIZE.z,
    );

    const matrix: THREE.Matrix4 = new THREE.Matrix4();
    const s: number = 60;
    let count: number = 0;

    for (let i = 0; i < this.GRID_SIZE.x; i++) {
      for (let j = 0; j < this.GRID_SIZE.y; j++) {
        for (let k = 0; k < this.GRID_SIZE.z; k++) {
          const x: number = 200 * (i - this.GRID_SIZE.x / 2);
          const y: number = 200 * (j - this.GRID_SIZE.y / 2);
          const z: number = 200 * (k - this.GRID_SIZE.z / 2);

          matrix.makeTranslation(x, y, z);
          matrix.scale(new THREE.Vector3(s, s, s));
          instancedMesh.setMatrixAt(count++, matrix);
        }
      }
    }

    instancedMesh.instanceMatrix.needsUpdate = true;
    this.scene.add(instancedMesh);
    this.objects = [instancedMesh];
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
    if (!this.isWebGL2 || !event.isPrimary || this.isMobile) return;

    this.mouseX = event.clientX - this.windowHalfX;
    this.mouseY = event.clientY - this.windowHalfY;
  }

  private onWindowResize(event: UIEvent): void {
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

    const time: number = Date.now() * 0.00005;

    // Camera movement
    this.camera.position.x += (this.mouseX - this.camera.position.x) * 0.036;
    this.camera.position.y += (-this.mouseY - this.camera.position.y) * 0.036;
    this.camera.lookAt(this.scene.position);

    // Color animation for instanced mesh
    if (this.objects[0] instanceof THREE.InstancedMesh) {
      const material: THREE.MeshBasicMaterial = this.objects[0].material;
      const h: number = time % 1; // Cycles between 0 and 1
      material.color.setHSL(h, 1, 0.5);
      material.needsUpdate = true;
    }

    if (this.postprocessing.composer) {
      this.postprocessing.composer.render(0.1);
    }
  }

  public animate(): void {
    if (!this.isWebGL2) return;

    this.render();
    this.animationFrameId = requestAnimationFrame(this.animate);
  }

  public destroy(): void {
    if (!this.isWebGL2) return;

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    // Dispose of geometries and materials
    this.objects.forEach((object) => {
      if (object.geometry) {
        object.geometry.dispose();
      }
      if (object instanceof THREE.Mesh && object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach((material) => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });

    // Dispose of textures
    if (this.textureCube) {
      this.textureCube.dispose();
    }

    // Clean up renderer
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.forceContextLoss();
    }

    // Remove DOM elements
    const container = document.getElementById("fancy-background");
    if (container) {
      container.remove();
    }

    // Remove event listeners
    window.removeEventListener("resize", this.onWindowResize);
    window.removeEventListener("pointermove", this.onPointerMove);

    // Clear arrays
    this.objects = [];
  }
}
