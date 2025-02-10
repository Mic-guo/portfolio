import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export class SceneManager {
  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setClearColor(0xffffff);

    // Add rope reference
    this.rope = null;

    this.setupRenderer();
    this.setupLights();
    this.setupCamera();
    this.setupControls();
  }

  setupRenderer() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);
  }

  setupLights() {
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 5, 5);
    this.scene.add(light);
    this.scene.add(new THREE.AmbientLight(0xd9c8b4));
  }

  setupCamera() {
    this.camera.position.z = 10;
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
    // if (this.isGuidedPanning) {
    //   this.updateGuidedPan();
    // }
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}
