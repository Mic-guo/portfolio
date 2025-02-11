import { SceneManager } from "./scene/SceneManager";
import { PhysicsWorld } from "./physics/PhysicsWorld";
import { Rope } from "./objects/Rope";
import { Model } from "./objects/Model";
import * as THREE from "three";

class App {
  constructor() {
    this.devMode = false;
    this.sceneManager = new SceneManager(this.devMode);
    this.physicsWorld = new PhysicsWorld();
    this.ropes = [];
    this.rope = null;
    this.isDragging = false;
    this.models = [];
    this.activeModel = null;
    this.modelPerRope = 8;
    this.modelOnRopeOffset = 7;
    // this.createGuidedPanButton();
  }

  // createGuidedPanButton() {
  //   const createButton = (text, direction) => {
  //     const button = document.createElement("button");
  //     button.innerHTML = text;
  //     button.style.position = "fixed";
  //     button.style.right = direction === "right" ? "20px" : "120px"; // Offset left button
  //     button.style.top = "20px";
  //     button.style.padding = "10px 20px";
  //     button.style.backgroundColor = "#4CAF50";
  //     button.style.color = "white";
  //     button.style.border = "none";
  //     button.style.borderRadius = "5px";
  //     button.style.cursor = "pointer";
  //     button.style.zIndex = "1000";

  //     button.addEventListener("mouseenter", () => {
  //       button.style.backgroundColor = "#45a049";
  //     });

  //     button.addEventListener("mouseleave", () => {
  //       button.style.backgroundColor = "#4CAF50";
  //     });

  //     button.addEventListener("click", () => {
  //       this.sceneManager.startGuidedPan(direction);
  //     });

  //     document.body.appendChild(button);
  //   };

  //   createButton("Pan Right", "right");
  //   createButton("Pan Left", "left");
  // }

  async init() {
    await this.physicsWorld.init();

    this.ropes.push(
      new Rope(this.sceneManager.scene, this.physicsWorld.world, -0.5)
    );
    this.ropes.push(
      new Rope(this.sceneManager.scene, this.physicsWorld.world, 2)
    );
    this.ropes.push(
      new Rope(this.sceneManager.scene, this.physicsWorld.world, 4.5)
    );

    // Update your animation loop to handle multiple ropes
    this.ropes.forEach((rope) => {
      this.sceneManager.setRope(rope); // You might need to modify this to handle multiple ropes
    });
    for (let j = 0; j < this.ropes.length; j++) {
      for (let i = 1; i < this.modelPerRope; i++) {
        const model = new Model(
          this.sceneManager.scene,
          this.ropes[j],
          i * this.modelOnRopeOffset
        );
        // await model.load("../src/models/only_polaroid_rooted_at_clip.gltf");
        if (i == 4) {
          await model.load(
            "../src/models/polaroid_with_material.glb",
            "../src/images/IMG_7142 2.JPG"
          );
        } else {
          await model.load("../src/models/polaroid_with_material.glb");
        }
        this.ropes[j].attachModel(model, i * this.modelOnRopeOffset);
        this.models.push(model);
      }
    }

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
    this.ropes.forEach((rope) => rope.update()); // Update all ropes
    this.models.forEach((model) => {
      model.update();
    });
    this.sceneManager.render();
  }

  onMouseDown(event) {
    const mouse = new THREE.Vector2(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.sceneManager.camera);

    // Check intersections with all models
    for (const model of this.models) {
      const intersects = raycaster.intersectObject(model.model, true);
      if (intersects.length > 0) {
        this.isDragging = true;
        this.activeModel = model; // Store the model being dragged
        break;
      }
    }
  }

  onMouseMove(event) {
    // Update spotlight position in SceneManager
    this.sceneManager.updateMousePosition(event);

    if (!this.isDragging || !this.activeModel) return;

    const mouse = new THREE.Vector2(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.sceneManager.camera);

    const planeZ = 0;
    const distanceFromCamera = this.sceneManager.camera.position.z - planeZ;
    const mouseWorld = new THREE.Vector3();
    raycaster.ray.at(distanceFromCamera, mouseWorld);

    // Create a delayed position by lerping between current position and mouse position
    const lerpFactor = 0.1;
    const delayedPosition = new THREE.Vector3().lerpVectors(
      this.activeModel.model.position,
      mouseWorld,
      lerpFactor
    );

    // Update the active model's position
    this.activeModel.updatePosition(delayedPosition);
  }

  onMouseUp(event) {
    this.isDragging = false;
    this.activeModel = null; // Clear the active model reference
  }
}

const app = new App();
app.init();
