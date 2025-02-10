import * as THREE from "three";

export class Rope {
  constructor(scene, physicsWorld) {
    this.scene = scene;
    this.physicsWorld = physicsWorld;
    this.ropeMesh = null;
    this.softBody = null;
    this.ropeSegments = 60; // Reduced segments for easier debugging
    this.ropeLength = 6;
    this.initialSegmentLength = this.ropeLength / (this.ropeSegments - 1);
    this.modelSegmentLength = this.ropeSegments / 9;

    // this.debugSpheres = []; // Add debug visualization
    this.allModels = [];
    this.modelPositions = {};

    this.create();
  }

  create() {
    // Reuse class properties instead of creating new ones
    const ropeMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });

    // Calculate segment length
    const segmentLength = this.ropeLength / (this.ropeSegments - 1);
    const geometry = new THREE.CylinderGeometry(0.02, 0.02, segmentLength, 8);
    geometry.translate(0, segmentLength / 2, 0);
    this.ropeMesh = new THREE.InstancedMesh(
      geometry,
      ropeMaterial,
      this.ropeSegments - 1
    );
    this.scene.add(this.ropeMesh);

    // Create soft body
    const softBodyHelpers = new Ammo.btSoftBodyHelpers();
    const ropeStart = new Ammo.btVector3(-6, 2, 0);
    const ropeEnd = new Ammo.btVector3(6, 2, 0);

    this.softBody = softBodyHelpers.CreateRope(
      this.physicsWorld.getWorldInfo(),
      ropeStart,
      ropeEnd,
      this.ropeSegments - 1,
      0
    );

    const sbConfig = this.softBody.get_m_cfg();
    sbConfig.set_viterations(20); // Velocity iterations
    sbConfig.set_piterations(20); // Position iterations
    sbConfig.set_kDP(0.1); // Damping coefficient
    sbConfig.set_kLF(100); // Resistance to movement

    // Only fix the end points
    const nodes = this.softBody.get_m_nodes();
    const firstNode = nodes.at(0);
    const lastNode = nodes.at(nodes.size() - 1);
    firstNode.set_m_im(0);
    lastNode.set_m_im(0);

    this.physicsWorld.addSoftBody(this.softBody, 1, -1);
    this.softBody.setTotalMass(1, false);

    // Add debug spheres for each node
    // const sphereGeometry = new THREE.SphereGeometry(0.05);
    // const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

    // for (let i = 0; i < nodes.size(); i++) {
    //   const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    //   this.debugSpheres.push(sphere);
    //   this.scene.add(sphere);
    // }

    // Log the number of nodes for debugging
    console.log("Number of rope nodes:", nodes.size());
    console.log("Middle node index:", Math.floor(nodes.size() / 2));
  }

  update() {
    const nodes = this.softBody.get_m_nodes();

    // Need an array of 9 indices
    this.allModels.forEach((model) => {
      const node = nodes.at(this.modelPositions[model]);
      const pos = node.get_m_x();
      model.updatePosition(new THREE.Vector3(pos.x(), pos.y(), pos.z()));
    });

    // Get middle node position for attached model
    // const middleNode = nodes.at(Math.floor((nodes.size() - 1) / 2));
    // const middlePos = middleNode.get_m_x();
    // if (this.attachedModel) {
    //   const position = new THREE.Vector3(
    //     middlePos.x(),
    //     middlePos.y(),
    //     middlePos.z()
    //   );
    //   this.attachedModel.updatePosition(position);
    // }

    // // Update debug spheres and log middle node position
    // for (let i = 0; i < nodes.size(); i++) {
    //   const node = nodes.at(i);
    //   const pos = node.get_m_x();
    //   this.debugSpheres[i].position.set(pos.x(), pos.y(), pos.z());
    // }

    // Update rope visualization
    for (let i = 0; i < nodes.size() - 1; i++) {
      const node = nodes.at(i);
      const nextNode = nodes.at(i + 1);
      const pos = node.get_m_x();
      const nextPos = nextNode.get_m_x();

      const position = new THREE.Vector3(pos.x(), pos.y(), pos.z());
      const direction = new THREE.Vector3(
        nextPos.x() - pos.x(),
        nextPos.y() - pos.y(),
        nextPos.z() - pos.z()
      );

      const currentLength = direction.length();

      const quaternion = new THREE.Quaternion();
      const up = new THREE.Vector3(0, 1, 0);
      quaternion.setFromUnitVectors(up, direction.normalize());

      // Since our cylinder geometry is already scaled to segmentLength,
      // we just need to use the actual length for scaling
      const scale = new THREE.Vector3(
        1,
        currentLength / this.initialSegmentLength,
        1
      );

      const matrix = new THREE.Matrix4();
      matrix.compose(position, quaternion, scale);
      this.ropeMesh.setMatrixAt(i, matrix);
    }

    this.ropeMesh.instanceMatrix.needsUpdate = true;
  }

  attachModel(model, position) {
    this.allModels.push(model);
    this.modelPositions[model] = position;
  }

  // setMiddleNodePosition(position) {
  //   const nodes = this.softBody.get_m_nodes();
  //   const middleNode = nodes.at(Math.floor((nodes.size() - 1) / 2));
  //   const pos = new Ammo.btVector3(position.x, position.y, position.z);
  //   middleNode.set_m_x(pos);
  //   middleNode.set_m_v(new Ammo.btVector3(0, 0, 0)); // Reset velocity
  // }

  setNodePosition(index, position) {
    const nodes = this.softBody.get_m_nodes();
    const node = nodes.at(index);
    const pos = new Ammo.btVector3(position.x, position.y, position.z);
    node.set_m_x(pos);
    node.set_m_v(new Ammo.btVector3(0, 0, 0)); // Reset velocity
  }
}
