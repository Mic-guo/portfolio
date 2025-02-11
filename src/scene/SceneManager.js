import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export class SceneManager {
  constructor(devMode) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.renderer = new THREE.WebGLRenderer();
    // this.renderer.setClearColor(0xffffff);

    // Add rope reference
    this.rope = null;
    this.devMode = devMode;

    // Add spotlight and mouse tracking
    this.spotlight = null;
    this.mouse = new THREE.Vector2();
    this.targetMouse = new THREE.Vector2(); // Add target mouse position
    this.lerpFactor = 1; // 0-1 (1 is not lerp, close to 0 is more lerp)

    this.setupRenderer();
    this.setupLights();
    this.setupCamera();
    // this.setupControls();
  }

  setupRenderer() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    if (!this.devMode) {
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.physicallyCorrectLights = true;
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.renderer.outputEncoding = THREE.sRGBEncoding;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1;
    }
    document.body.appendChild(this.renderer.domElement);
  }

  setupLights() {
    // const light = new THREE.DirectionalLight(0xffffff, 1);
    // light.position.set(0, 5, 5);
    // this.scene.add(light);
    this.scene.add(new THREE.AmbientLight(0xf2e0c0, 0.01));

    // Add spotlight
    this.spotlight = new THREE.SpotLight(0xffffff, 5); // Increased intensity
    this.spotlight.angle = Math.PI / 6; // Wider angle for better visibility
    this.spotlight.penumbra = 0.2; // Softer edges
    this.spotlight.decay = 1.5;
    this.spotlight.distance = 30;
    this.spotlight.castShadow = true;
    this.spotlight.position.set(0, 0, 5);

    // Add spotlight target to scene
    this.spotlight.target.position.set(0, 0, 0);
    this.scene.add(this.spotlight.target);
    this.scene.add(this.spotlight);
  }

  setupCamera() {
    this.camera.position.z = 8;
  }

  setupControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;

    // Guided Pan controls
    // this.controls.enableRotate = false;
    // this.controls.enableZoom = false;
    // this.controls.enablePan = true;
    // this.controls.panSpeed = 1.0;

    // // Only allow horizontal panning
    // this.controls.screenSpacePanning = true;
    // this.controls.maxAzimuthAngle = 0;
    // this.controls.minAzimuthAngle = 0;

    // // Create and set min and max X boundaries
    // this.controls.minPan = new THREE.Vector3(-10, 0, 0);
    // this.controls.maxPan = new THREE.Vector3(10, 0, 0);

    // // Initialize guided pan properties
    // this.isGuidedPanning = false;
    // this.currentNodeIndex = 0;
    // this.panProgress = 0;
    // this.panSpeed = 0.005; // Adjust this value to control movement speed
  }

  setRope(rope) {
    this.rope = rope;
  }

  // startGuidedPan(direction = "right") {
  //   if (!this.rope) return;

  //   this.isGuidedPanning = true;
  //   this.controls.enabled = false;
  //   this.currentNodeIndex =
  //     direction === "right" ? this.rope.ropeSegments - 1 : 0;
  //   this.panDirection = direction;
  //   this.panProgress = 0;
  // }

  // updateGuidedPan() {
  //   if (!this.isGuidedPanning || !this.rope) return;

  //   const nodes = this.rope.softBody.get_m_nodes();

  //   // Calculate current and next node indices
  //   let currentNode = nodes.at(this.currentNodeIndex);
  //   let nextNodeIndex =
  //     this.panDirection === "right"
  //       ? Math.min(this.currentNodeIndex + 1, nodes.size() - 1)
  //       : Math.max(this.currentNodeIndex - 1, 0);
  //   let nextNode = nodes.at(nextNodeIndex);

  //   // Get positions
  //   const currentPos = currentNode.get_m_x();
  //   const nextPos = nextNode.get_m_x();

  //   // Interpolate between current and next position
  //   this.panProgress += this.panSpeed;

  //   if (this.panProgress >= 1) {
  //     this.panProgress = 0;
  //     this.currentNodeIndex = nextNodeIndex;

  //     // Check if we've reached the end
  //     if (
  //       (this.panDirection === "right" &&
  //         this.currentNodeIndex >= nodes.size() - 1) ||
  //       (this.panDirection === "left" && this.currentNodeIndex <= 0)
  //     ) {
  //       this.isGuidedPanning = false;
  //       this.controls.enabled = true;
  //       return;
  //     }
  //   }

  //   // Calculate the target position for the controls
  //   const targetX = THREE.MathUtils.lerp(
  //     currentPos.x(),
  //     nextPos.x(),
  //     this.panProgress
  //   );
  //   const targetY = THREE.MathUtils.lerp(
  //     currentPos.y(),
  //     nextPos.y(),
  //     this.panProgress
  //   );

  //   // Update the camera's target (look-at point)
  //   const newTarget = new THREE.Vector3(targetX, targetY, 0);
  //   this.controls.target.lerp(newTarget, 0.01);

  //   // Maintain fixed camera position relative to target
  //   const distance = 3; // Same as initial camera.position.z
  //   this.camera.position.lerp(
  //     new THREE.Vector3(targetX, targetY, distance),
  //     0.1
  //   );
  // }

  render() {
    // Lerp the mouse position
    this.mouse.x += (this.targetMouse.x - this.mouse.x) * this.lerpFactor;
    this.mouse.y += (this.targetMouse.y - this.mouse.y) * this.lerpFactor;

    const vector = new THREE.Vector3(this.mouse.x, this.mouse.y, 0.5);
    vector.unproject(this.camera);
    const dir = vector.sub(this.camera.position).normalize();
    const distance = -this.camera.position.z / dir.z;
    const pos = this.camera.position.clone().add(dir.multiplyScalar(distance));
    this.spotlight.position.set(pos.x, pos.y, 5);
    this.spotlight.target.position.set(pos.x, pos.y, 0);

    this.renderer.render(this.scene, this.camera);
  }

  updateMousePosition(event) {
    // Update target mouse position instead of actual mouse position
    this.targetMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.targetMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }
}
