export class PhysicsWorld {
  constructor() {
    this.world = null;
  }

  async init() {
    await Ammo();

    const collisionConfiguration =
      new Ammo.btSoftBodyRigidBodyCollisionConfiguration();
    const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
    const broadphase = new Ammo.btDbvtBroadphase();
    const solver = new Ammo.btSequentialImpulseConstraintSolver();
    const softBodySolver = new Ammo.btDefaultSoftBodySolver();

    this.world = new Ammo.btSoftRigidDynamicsWorld(
      dispatcher,
      broadphase,
      solver,
      collisionConfiguration,
      softBodySolver
    );

    this.world.setGravity(new Ammo.btVector3(0, -9.8, 0));
  }

  step() {
    if (this.world) {
      this.world.stepSimulation(1 / 60, 10);
    }
  }
}
