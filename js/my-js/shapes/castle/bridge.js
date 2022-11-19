class Bridge {
  constructor(gap) {
    this.gap = gap;
    this.width = 3;
  }

  generateSurface(rows, cols) {
    const shapeControlsPoints = [
      [-this.width / 2, 0, 0],
      [-this.width / 2, 0, 0],
      [-this.width / 2, 0.5, 0],
      [-this.width / 2, 0.5, 0],

      [-this.width / 2, 0.5, 0],
      [-this.width / 2, 0.5, 0],
      [this.width / 2, 0.5, 0],
      [this.width / 2, 0.5, 0],

      [this.width / 2, 0.5, 0],
      [this.width / 2, 0.5, 0],
      [this.width / 2, 0, 0],
      [this.width / 2, 0, 0],

      [this.width / 2, 0, 0],
      [this.width / 2, 0, 0],
      [-this.width / 2, 0, 0],
      [-this.width / 2, 0, 0]
    ];

    const pathControlPoints = [
      [0, 0, 0],
      [this.gap, 0, 0],
      [this.gap, 0, 0]
    ];

    const path = new JointBezier(2, pathControlPoints, "xz").build(cols);

    const shape = new JointBezier(3, shapeControlsPoints).build(rows);

    const shape3D = new SweepSurface(shape, path, true, "box").setUVDensity(
      5,
      5
    );

    return shape3D;
  }
}
