import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";
import { AmbientLight, DirectionalLight, BoxHelper, Box3 } from "three";

export class Model {
  constructor(scene) {
    this.scene = scene;
    this.model = null;
    this.loader = new GLTFLoader();
    this.helper = null;
    this.rope = null;
  }

  attachToRope(rope) {
    this.rope = rope;
  }

  update() {
    if (this.model && this.rope) {
      const nodes = this.rope.softBody.get_m_nodes();
      // Get the last two nodes to calculate direction
      const lastNode = nodes.at(nodes.size() - 1);
      const secondLastNode = nodes.at(nodes.size() - 2);

      const nodePos = lastNode.get_m_x();
      const prevNodePos = secondLastNode.get_m_x();

      // Set position
      this.model.position.set(nodePos.x(), nodePos.y() - 2, nodePos.z());

      // Calculate direction vector between nodes
      const direction = new THREE.Vector3(
        nodePos.x() - prevNodePos.x(),
        nodePos.y() - prevNodePos.y(),
        nodePos.z() - prevNodePos.z()
      ).normalize();

      // Create a quaternion from the direction
      const quaternion = new THREE.Quaternion();
      const up = new THREE.Vector3(0, 1, 0);
      quaternion.setFromUnitVectors(up, direction);

      // Create 90-degree X-rotation quaternion
      const rotationX = new THREE.Quaternion();
      rotationX.setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2);

      // Combine the rotations (multiply the quaternions)
      quaternion.multiply(rotationX);

      // Apply rotation
      this.model.setRotationFromQuaternion(quaternion);

      if (this.helper) {
        this.helper.update();
      }
    }
  }

  async load(path) {
    return new Promise((resolve, reject) => {
      this.loader.load(
        path,
        (gltf) => {
          this.model = gltf.scene;
          this.model.position.set(0, 2, 0);
          this.model.rotation.set(0, 0, 0);
          this.model.scale.set(0.5, 0.5, 0.5);
          this.helper = new BoxHelper(this.model, 0xff0000);
          this.scene.add(this.helper);

          this.scene.add(this.model);
          console.log("Model added to scene:", this.model);
          resolve(this.model);
        },
        (progress) => {
          console.log(
            "Loading progress:",
            (progress.loaded / progress.total) * 100 + "%"
          );
        },
        (error) => {
          console.error("Error loading model:", error);
          reject(error);
        }
      );
    });
  }

  updatePosition(position) {
    if (this.model) {
      console.log("updating position", position);
      this.model.position.copy(position);
      if (this.helper) {
        this.helper.update();
      }
    }
  }
}
