class World {
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
