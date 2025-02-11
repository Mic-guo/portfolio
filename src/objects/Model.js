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

      const rotationY = new THREE.Quaternion();
      rotationY.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
      quaternion.multiply(rotationX);
      quaternion.multiply(rotationY);

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

  async load(path, texturePath) {
    return new Promise((resolve, reject) => {
      this.loader.load(
        path,
        (gltf) => {
          this.model = gltf.scene;

          // Improve model quality
          this.model.traverse((child) => {
            if (child.isMesh) {
              // Improve geometry
              if (child.geometry) {
                child.geometry.computeVertexNormals(); // Ensure smooth shading
              }

              // Improve materials
              if (child.material) {
                child.material.precision = "highp"; // Use high precision materials
                child.material.flatShading = false; // Use smooth shading

                // Enable shadows
                child.castShadow = true;
                child.receiveShadow = true;
              }
            }
          });

          // If there's a texture...
          if (texturePath) {
            const textureLoader = new THREE.TextureLoader();
            const texture = textureLoader.load(texturePath);

            // Improve texture quality
            texture.encoding = THREE.sRGBEncoding;
            texture.anisotropy = 16; // Improves texture quality at angles
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.generateMipmaps = true;

            // Flip texture 180 degrees
            texture.center.set(0.5, 0.5);
            texture.rotation = Math.PI;

            // Apply texture and improve material quality
            this.model.traverse((child) => {
              if (child.isMesh && child.name == "Plane") {
                child.material = new THREE.MeshStandardMaterial({
                  map: texture,
                  side: THREE.DoubleSide,
                  roughness: 0.5,
                  metalness: 0.5,
                });

                // Improve mesh quality
                child.castShadow = true;
                child.receiveShadow = true;

                // Ensure proper texture display
                child.material.needsUpdate = true;
              }
            });
          }

          // Preserve model scale and detail
          this.model.position.set(0, 2, 0);
          this.model.rotation.set(0, 0, 0);
          // Adjust scale if needed - smaller values might lose detail
          this.model.scale.set(0.5, 0.5, 0.5);
          // this.helper = new BoxHelper(this.model, 0xff0000);
          // this.scene.add(this.helper);

          this.scene.add(this.model);
          console.log("Model added to scene");
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
