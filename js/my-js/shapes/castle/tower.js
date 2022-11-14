class Tower extends Node3D {
  constructor(width, h) {
    super();

    const height = myGUI.get("Tower Height");

    if (height < h * 3) {
      throw new Error(`Tower must be at least ${H * 3} units tall`);
    }

    this.h = h;
    this.width = width;

    this.model = this;

    this.addChildren(new Torch([3.5, 2, 0]));
  }

  generateSurface() {
    const towerHeight = myGUI.get("Tower Height") - 2 * this.h;
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

    const path = new Circular().build(20);
    const shape = new JointBezier(3, controlsPoints).build(20);

    const shape3D = new SweepSurface(shape, path);

    return shape3D;
  }
}

class Torch extends Node3D {
  constructor(translation, rotation) {
    super();

    this.m;
    this.lightPos = translation;

    const lightTransform = mat4.create();
    const stickTransform = mat4.create();

    mat4.translate(lightTransform, lightTransform, translation);

    mat4.translate(stickTransform, stickTransform, translation);

    if (rotation) mat4.rotateY(stickTransform, stickTransform, rotation);

    mat4.rotateZ(stickTransform, stickTransform, -Math.PI / 4 + Math.PI);

    this.addChildren(
      new PointLight([0, 0, 0], [0.0, 0.9, 0.0]).transform(lightTransform),
      this.generateStick().transform(stickTransform)
    );
  }

  norm(vec) {
    return Math.sqrt(vec.map((x) => Math.pow(x, 2)).reduce((a, b) => a + b, 0));
  }

  generateStick() {
    const supportAxisShape = new Circular("xy", 0.05).build(20);

    const supportAxisPathCP = [
      [0, 0, 0],
      [0, 0, 0],
      [0, this.lightPos[1], 0]
    ];

    const supportAxisPath = new Bezier(supportAxisPathCP, "xy").build(20);

    return new Node3D(
      new SweepSurface(supportAxisShape, supportAxisPath, true)
    ).setColor([131, 104, 40]);
  }
}

class SpotTorch extends Node3D {
  constructor(theta, translation, rotation = 0, invert, lightId) {
    super();

    this.m;
    this.lightPos = translation;

    const lightTransform = mat4.create();
    const stickTransform = mat4.create();

    mat4.translate(lightTransform, lightTransform, translation);

    mat4.translate(stickTransform, stickTransform, translation);

    mat4.rotateX(stickTransform, stickTransform, rotation + Math.PI);

    this.addChildren(
      new SpotLight(
        [0, 0, 0],
        theta,
        [0.0, 0.4, 0.0],
        0.25,
        invert,
        lightId
      ).transform(lightTransform),
      this.generateStick().transform(stickTransform)
    );
  }

  norm(vec) {
    return Math.sqrt(vec.map((x) => Math.pow(x, 2)).reduce((a, b) => a + b, 0));
  }

  generateStick() {
    const supportAxisShape = new Circular("xy", 0.05).build(20);

    const supportAxisPathCP = [
      [0, this.lightPos[1], 0],
      [0, 0, 0],
      [0, 0, 0]
    ];

    const supportAxisPath = new Bezier(supportAxisPathCP, "xy").build(20);

    return new Node3D(
      new SweepSurface(supportAxisShape, supportAxisPath, true)
    ).setColor([131, 104, 40]);
  }
}
