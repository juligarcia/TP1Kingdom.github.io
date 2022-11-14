class Walls {
  constructor(towerWidth, distanceToTower, h) {
    this.towerHeight = myGUI.get("Tower Height");

    this.h = h;
    this.width = towerWidth / 3;
    this.distanceToTower = distanceToTower;
    this.towerWidth = towerWidth;
  }

  generateSurface() {
    const height = this.towerHeight - 3 * this.h;
    const numberOfWalls = myGUI.get("Number of Towers") - 1;

    const shapeControlsPoints = [
      [-this.width, 0, 0],
      [-this.width, 0, 0],
      [-this.width, height, 0],

      [-this.width, height, 0],
      [-this.width, height, 0],
      [-this.width - this.h / 2, height, 0],

      [-this.width - this.h / 2, height, 0],
      [-this.width - this.h / 2, height, 0],
      [-this.width - this.h / 2, height + this.h, 0],

      [-this.width - this.h / 2, height + this.h, 0],
      [-this.width - this.h / 2, height + this.h, 0],
      [-this.width, height + this.h, 0],

      [-this.width, height + this.h, 0],
      [-this.width, height + this.h, 0],
      [-this.width, height, 0],

      [-this.width, height, 0],
      [0, height, 0],
      [0, height, 0],

      [0, height, 0],
      [this.width, height, 0],
      [this.width, height, 0],

      [this.width, height, 0],
      [this.width, height + this.h, 0],
      [this.width, height + this.h, 0],

      [this.width, height + this.h, 0],
      [this.width + this.h / 2, height + this.h, 0],
      [this.width + this.h / 2, height + this.h, 0],

      [this.width + this.h / 2, height + this.h, 0],
      [this.width + this.h / 2, height, 0],
      [this.width + this.h / 2, height, 0],

      [this.width + this.h / 2, height, 0],
      [this.width, height, 0],
      [this.width, height, 0],

      [this.width, height, 0],
      [this.width, 0, 0],
      [this.width, 0, 0]
    ];

    const numberOfTowers = myGUI.get("Number of Towers");

    const towerAnchors = new Array(numberOfTowers).fill(0).map((_, index) => {
      const u = index / numberOfTowers;

      const m = mat4.create();

      mat4.rotateY(m, m, 2 * Math.PI * u + Math.PI / numberOfTowers);

      const xAxis = vec4.fromValues(1, 0, 0, 0);

      vec4.transformMat4(xAxis, xAxis, m);
      vec4.scale(xAxis, xAxis, this.distanceToTower);

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

    const path = new JointBezier(2, pathControlPoints, "xz").build(20);

    const shape = new JointBezier(2, shapeControlsPoints).build(20);

    const shape3D = new SweepSurface(shape, path);

    return shape3D;
  }
}
