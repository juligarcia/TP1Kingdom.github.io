class Tower {
  constructor(height, width, h) {
    if (height < h * 3) {
      throw new Error(`Tower must be at least ${H * 3} units tall`);
    }

    this.height = height;
    this.h = h;
    this.width = width;
  }

  generateSurface(rows, cols) {
    const towerHeight = this.height - 2 * this.h;
    const width = this.width;

    const controlsPoints = [
      [-width, 0, 0],
      [-width, towerHeight / 2, 0],
      [-width / 2, towerHeight / 2, 0],
      [-width / 2, towerHeight, 0],

      [-width / 2, towerHeight, 0],
      [-width / 2, towerHeight + this.h, 0],
      [-width / 2, towerHeight + this.h, 0],
      [-width / 2 - this.h, towerHeight + this.h, 0],

      [-width / 2 - this.h, towerHeight + this.h, 0],
      [-width / 2 - this.h, towerHeight + this.h, 0],
      [-width / 2 - this.h, towerHeight + 2 * this.h, 0],
      [-width / 2 - this.h, towerHeight + 2 * this.h, 0],

      [-width / 2 - this.h, towerHeight + 2 * this.h, 0],
      [-width / 2 - this.h, towerHeight + 2 * this.h, 0],
      [-width / 2 - this.h / 2, towerHeight + 2 * this.h, 0],
      [-width / 2 - this.h / 2, towerHeight + 2 * this.h, 0],

      [-width / 2 - this.h / 2, towerHeight + 2 * this.h, 0],
      [-width / 2 - this.h / 2, towerHeight + 2 * this.h, 0],
      [-width / 2 - this.h / 2, towerHeight + 1.5 * this.h, 0],
      [-width / 2 - this.h / 2, towerHeight + 1.5 * this.h, 0],

      [-width / 2 - this.h / 2, towerHeight + 1.5 * this.h, 0],
      [-width / 2 - this.h / 2, towerHeight + 1.5 * this.h, 0],
      [0, towerHeight + 1.5 * this.h, 0],
      [0, towerHeight + 1.5 * this.h, 0]
    ];

    const path = new Circular().build(cols);
    const shape = new JointBezier(3, controlsPoints).build(rows);

    const shape3D = new SweepSurface(shape, path);

    return shape3D;
  }
}
