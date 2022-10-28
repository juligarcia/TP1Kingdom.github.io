class World extends Node3D {
  constructor() {
    super();

    const terrainTransform = mat4.create();
    mat4.rotateY(terrainTransform, terrainTransform, -Math.PI / 10);

    this.children = [
      new Node3D(this.buildCastleTerrain()).setColor([20, 128, 70]),
      new Node3D(this.buildTerrain())
        .setColor([20, 128, 70])
        .transform(terrainTransform)
    ];
  }

  buildCastleTerrain() {
    const controlsPoints = [
      [0, 0, 0],
      [15, 0, 0],
      [15, 0, 0],

      [15, 0, 0],
      [15, -3, 0],
      [15, -3, 0]
    ];

    const path = new Circular().build(50);
    const shape = new JointBezier(2, controlsPoints).build(50);

    const shape3D = new SweepSurface(shape, path);

    return shape3D;
  }

  buildTerrain() {
    const controlsPoints = [
      [15, -3, 0],
      [15, -3, 0],
      [20, -3, 0],

      [20, -3, 0],
      [20, 0, 0],
      [20, 0, 0],

      [20, 0, 0],
      [20, 0, 0],
      [45, 0, 0]
    ];

    const path = new Circular().build(10);
    const shape = new JointBezier(2, controlsPoints).build(10);

    const shape3D = new SweepSurface(shape, path);

    return shape3D;
  }
}
