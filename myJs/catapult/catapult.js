class Catapult extends Node3D {
  constructor() {
    super();

    this.width = 2;
    this.depth = 4;
    this.heigth = 0.5;

    this.wheelWidth = 0.2;
    this.wheelRadius = 0.5;

    this.children = [...this.buildWheels()];
  }

  buildWheels() {
    const shape = new Circular("xy", this.wheelRadius).build(20);

    const pathControlPoints = [
      [-0.1, this.wheelRadius / 2, 0],
      [-0.1, this.wheelRadius / 2, 0],
      [0.1, this.wheelRadius / 2, 0]
    ];

    const path = new Bezier(pathControlPoints, "xz").build(20);

    const wheels = new Array(4)
      .fill(0)
      .map(() => new Node3D(new SweepSurface(shape, path)));

    wheels[0].trX = -this.width / 2 - this.wheelWidth;
    wheels[0].trZ = this.depth / 2;
    wheels[2].trX = -this.width / 2 - this.wheelWidth;
    wheels[2].trZ = -this.depth / 2;

    wheels[1].trX = this.width / 2 + this.wheelWidth;
    wheels[1].trZ = this.depth / 2;
    wheels[3].trX = this.width / 2 + this.wheelWidth;
    wheels[3].trZ = -this.depth / 2;

    return wheels;
  }
}
