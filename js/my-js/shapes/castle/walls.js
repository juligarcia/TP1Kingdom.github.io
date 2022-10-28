class Walls {
  constructor(numberOfTowers, towerHeight, towerWidth, distanceToTower, h) {
    this.numberOfWalls = numberOfTowers - 1;
    this.h = h;
    this.height = towerHeight - 3 * h;
    this.width = towerWidth / 3;
    this.distanceToTower = distanceToTower;
    this.towerWidth = towerWidth;
  }

  generateSurface(rows, cols) {
    const shapeControlsPoints = [
      [-this.width, 0, 0],
      [-this.width, 0, 0],
      [-this.width, this.height, 0],

      [-this.width, this.height, 0],
      [-this.width, this.height, 0],
      [-this.width - this.h / 2, this.height, 0],

      [-this.width - this.h / 2, this.height, 0],
      [-this.width - this.h / 2, this.height, 0],
      [-this.width - this.h / 2, this.height + this.h, 0],

      [-this.width - this.h / 2, this.height + this.h, 0],
      [-this.width - this.h / 2, this.height + this.h, 0],
      [-this.width, this.height + this.h, 0],

      [-this.width, this.height + this.h, 0],
      [-this.width, this.height + this.h, 0],
      [-this.width, this.height, 0],

      [-this.width, this.height, 0],
      [0, this.height, 0],
      [0, this.height, 0],

      [0, this.height, 0],
      [this.width, this.height, 0],
      [this.width, this.height, 0],

      [this.width, this.height, 0],
      [this.width, this.height + this.h, 0],
      [this.width, this.height + this.h, 0],

      [this.width, this.height + this.h, 0],
      [this.width + this.h / 2, this.height + this.h, 0],
      [this.width + this.h / 2, this.height + this.h, 0],

      [this.width + this.h / 2, this.height + this.h, 0],
      [this.width + this.h / 2, this.height, 0],
      [this.width + this.h / 2, this.height, 0],

      [this.width + this.h / 2, this.height, 0],
      [this.width, this.height, 0],
      [this.width, this.height, 0],

      [this.width, this.height, 0],
      [this.width, 0, 0],
      [this.width, 0, 0]
    ];

    const totalTowers = this.numberOfWalls + 1;

    const towerAnchors = new Array(totalTowers).fill(0).map((_, index) => {
      const u = index / totalTowers;

      const m = mat4.create();

      mat4.rotateY(m, m, 2 * Math.PI * u);

      const xAxis = vec4.fromValues(1, 0, 0, 0);

      vec4.transformMat4(xAxis, xAxis, m);
      vec4.scale(
        xAxis,
        xAxis,
        this.distanceToTower
      );

      return [xAxis[0], xAxis[1], xAxis[2]];
    });

    let pathControlPoints = [];

    for (let i = 0; i < towerAnchors.length - 1; i++) {
      pathControlPoints = pathControlPoints.concat([
        towerAnchors[i],
        towerAnchors[i],
        towerAnchors[i + 1]
      ]);
    }

    const path = new JointBezier(2, pathControlPoints, "xz").build(cols);

    const shape = new JointBezier(2, shapeControlsPoints).build(rows);

    const shape3D = new SweepSurface(shape, path);

    return shape3D;
  }
}
