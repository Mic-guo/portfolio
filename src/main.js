import { SceneManager } from "./scene/SceneManager";
import { PhysicsWorld } from "./physics/PhysicsWorld";
import { Rope } from "./objects/Rope";
import { Model } from "./objects/Model";
import * as THREE from "three";

class App {
  constructor() {
    this.sceneManager = new SceneManager();
    this.physicsWorld = new PhysicsWorld();
    this.rope = null;
    this.model = null;
    this.isDragging = false;
  }

  async init() {
    await this.physicsWorld.init();

    this.rope = new Rope(this.sceneManager.scene, this.physicsWorld.world);
    this.model = new Model(this.sceneManager.scene, this.physicsWorld.world);
    await this.model.load("../src/models/polaroid_model.gltf");

    this.rope.attachModel(this.model);

    this.setupEventListeners();
    this.animate();
  }

  setupEventListeners() {
    this.sceneManager.renderer.domElement.addEventListener(
      "mousedown",
      this.onMouseDown.bind(this)
    );
    this.sceneManager.renderer.domElement.addEventListener(
      "mousemove",
      this.onMouseMove.bind(this)
    );
    this.sceneManager.renderer.domElement.addEventListener(
      "mouseup",
      this.onMouseUp.bind(this)
    );
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.physicsWorld.step();
    this.rope.update();
    this.model.update();
    this.sceneManager.render();
  }

  onMouseDown(event) {
    const mouse = new THREE.Vector2(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.sceneManager.camera);

    // Check if we clicked on the model
    const intersects = raycaster.intersectObject(this.model.model, true);
    if (intersects.length > 0) {
        this.isDragging = true;
    }
  }

  onMouseMove(event) {
    if (!this.isDragging) return;

    // Convert mouse position to 3D coordinates
    const mouse = new THREE.Vector2(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );

    // Create a raycaster
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.sceneManager.camera);

    // Calculate the world position at a fixed distance from camera
    const planeZ = 0; // The z-coordinate of our interaction plane
    const distanceFromCamera = this.sceneManager.camera.position.z - planeZ;
    const mouseWorld = new THREE.Vector3();
    raycaster.ray.at(distanceFromCamera, mouseWorld);

    // Update model position
    this.model.updatePosition(mouseWorld);
  }

  onMouseUp(event) {
    this.isDragging = false;
  }
}

const app = new App();
app.init();
