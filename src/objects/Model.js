import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";
import { AmbientLight, DirectionalLight, BoxHelper, Box3 } from "three";

export class Model {
  constructor(scene, rope, positionOnRope) {
    this.scene = scene;
    this.model = null;
    this.loader = new GLTFLoader();
    this.helper = null;
    this.rope = rope;
    this.positionOnRope = positionOnRope;
  }

  update() {
    if (this.model && this.rope) {
      const nodes = this.rope.softBody.get_m_nodes();
      const prevNode = nodes.at(this.positionOnRope - 1);
      const node = nodes.at(this.positionOnRope);

      const nodePos = node.get_m_x();
      const prevNodePos = prevNode.get_m_x();

      // Only update rotation
      const direction = new THREE.Vector3(
        nodePos.x() - prevNodePos.x(),
        nodePos.y() - prevNodePos.y(),
        // nodePos.z() - prevNodePos.z()
        0
      ).normalize();

      const quaternion = new THREE.Quaternion();
      const up = new THREE.Vector3(0, 1, 0);
      quaternion.setFromUnitVectors(up, direction);

      // Apply additional rotation if needed to align model correctly
      const rotationX = new THREE.Quaternion();
      rotationX.setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2);
      quaternion.multiply(rotationX);

      this.model.setRotationFromQuaternion(quaternion);
      if (this.helper) {
        this.helper.update();
      }
    }
  }

  updatePosition(position) {
    if (this.model) {
      const model_position = new THREE.Vector3(
        position.x,
        position.y,
        position.z
      );
      this.model.position.copy(model_position);
      if (this.helper) {
        this.helper.update();
      }
      if (this.rope) {
        this.rope.setNodePosition(this.positionOnRope, position);
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
}
