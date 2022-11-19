class Catapult extends Node3D {
  constructor() {
    super();

    this.setMaterial(new Wood());

    this.width = 2;
    this.depth = 4;
    this.heigth = 0.5;

    this.wheelWidth = 0.2;
    this.wheelRadius = 0.5;

    this.armNode = this.buildArm().setTranslation([0, 2.5, 0]);

    this.addChildren(
      new Node3D().addChildren(...this.buildWheels()).setMaterial(new Stone()),
      this.buildBase(),
      this.armNode
    );

    this.initialAnimationValues = {
      height: 4,
      vx: ((Math.PI / 3) * 0.5) / 0.03,
      span: 0.5,
      vy: 0
    };

    this.boulderAnimatedValues = this.initialAnimationValues;
    this.animatedValues = {};

    this.armAnimator = new Animated(
      { angle: 0 },
      { angle: Math.PI / 3 },
      easingFunctions["easeInOut"],
      200,
      (values) => {
        this.animatedValues = values;
      },
      () => {
        this.boulderAnimator.play();
      }
    );

    this.boulderAnimator = new AnimatedPhysics(
      this.initialAnimationValues,
      (elapsed, initialValues) => {
        return {
          vx: initialValues.vx,
          span: initialValues.span + (initialValues.vx * elapsed) / 1000,
          height:
            initialValues.height +
            initialValues.vy * (elapsed / 1000) -
            10 * Math.pow(elapsed / 1000, 2)
        };
      },
      (_, currentValues) => currentValues.height <= -40,
      (values) => {
        this.boulderAnimatedValues = values;
      },
      () => {
        this.boulderAnimatedValues = this.initialAnimationValues;
        this.animatedValues = {};

        this.armAnimator.reset();
        this.boulderAnimator.reset();

        this.recalculate(true);
      }
    );

    this.updatePosition();
  }

  fire() {
    this.armAnimator.play();
  }

  updatePosition() {
    const rotateCatapultX = myGUI.get("Rotate Catapult X");
    const rotateCatapultY = myGUI.get("Rotate Catapult Y");

    this.setTranslation([
      25 * Math.cos(2 * Math.PI * rotateCatapultX),
      0,
      25 * Math.sin(2 * Math.PI * rotateCatapultX)
    ]);

    this.setRotation([
      0,
      rotateCatapultY + Math.PI / 2 - 2 * Math.PI * rotateCatapultX,
      0
    ]);
  }

  update() {
    if (this.armAnimator.playing) this.recalculate(true);

    if (this.boulderAnimator.playing) this.boulderNode.recalculate(true);

    this.armNode.rotX = -this.animatedValues.angle || 0;

    const boulderTransform = mat4.create();

    mat4.translate(boulderTransform, boulderTransform, [
      0,
      this.boulderAnimatedValues.span,
      this.boulderAnimatedValues.height
    ]);

    this.boulderNode.transformMatrix = boulderTransform;
  }

  buildBase() {
    const baseNode = new Node3D();

    const shapeControlsPoints = [
      [-this.width / 2, -0.25, 0],
      [-this.width / 2, -0.25, 0],
      [-this.width / 2, 0.25, 0],
      [-this.width / 2, 0.25, 0],

      [-this.width / 2, 0.25, 0],
      [-this.width / 2, 0.25, 0],
      [this.width / 2, 0.25, 0],
      [this.width / 2, 0.25, 0],

      [this.width / 2, 0.25, 0],
      [this.width / 2, 0.25, 0],
      [this.width / 2, -0.25, 0],
      [this.width / 2, -0.25, 0],

      [this.width / 2, -0.25, 0],
      [this.width / 2, -0.25, 0],
      [-this.width / 2, -0.25, 0],
      [-this.width / 2, -0.25, 0]
    ];

    const pathControlPoints = [
      [0, this.wheelRadius, -this.depth / 2 - 0.2],
      [0, this.wheelRadius, this.depth / 2 + 0.2],
      [0, this.wheelRadius, this.depth / 2 + 0.2]
    ];

    const path = new Bezier(pathControlPoints, "xz").build(20);

    const shape = new JointBezier(3, shapeControlsPoints).build(20);

    const base3D = new SweepSurface(shape, path, true, "box");
    baseNode.addChildren(new Node3D(base3D));

    const supportShapeCP = [
      [-1, 0, 0],
      [-1, 0, 0],
      [-0.5, 2, 0],
      [-0.5, 2, 0],

      [-0.5, 2, 0],
      [-0.5, 2, 0],
      [0.5, 2, 0],
      [0.5, 2, 0],

      [0.5, 2, 0],
      [0.5, 2, 0],
      [1, 0, 0],
      [1, 0, 0],

      [1, 0, 0],
      [1, 0, 0],
      [-1, 0, 0],
      [-1, 0, 0]
    ];

    const supportPathCP = [
      [-this.wheelWidth / 2, 0, 0],
      [-this.wheelWidth / 2, 0, 0],
      [this.wheelWidth / 2, 0, 0]
    ];

    const supportShape = new JointBezier(3, supportShapeCP, "xy").build(20);
    const supportPath = new Bezier(supportPathCP, "xz").build(20);

    const supports = new Array(2)
      .fill(0)
      .map(
        () =>
          new Node3D(new SweepSurface(supportShape, supportPath, true, "box"))
      );

    supports[0].trX = -this.width / 3;
    supports[0].trY = this.wheelRadius + 0.2;

    supports[1].trX = this.width / 3;
    supports[1].trY = this.wheelRadius + 0.2;

    baseNode.addChildren(...supports);

    const supportAxisShape = new Circular("xy", 0.1).build(20);

    const supportAxisPathCP = [
      [-this.width / 2, 2.5, 0],
      [-this.width / 2, 2.5, 0],
      [this.width / 2, 2.5, 0]
    ];

    const supportAxisPath = new Bezier(supportAxisPathCP, "xz").build(20);

    baseNode.addChildren(
      new Node3D(new SweepSurface(supportAxisShape, supportAxisPath, true))
    );

    return baseNode;
  }

  buildCounterWeight() {
    const weight = new Node3D();

    const weightShapeCP = [
      [-0.25, -0.25, 0],
      [-0.25, -0.25, 0],
      [-0.25, 0.25, 0],
      [-0.25, 0.25, 0],

      [-0.25, 0.25, 0],
      [-0.25, 0.25, 0],
      [0.25, 0.25, 0],
      [0.25, 0.25, 0],

      [0.25, 0.25, 0],
      [0.25, 0.25, 0],
      [0.25, -0.25, 0],
      [0.25, -0.25, 0],

      [0.25, -0.25, 0],
      [0.25, -0.25, 0],
      [-0.25, -0.25, 0],
      [-0.25, -0.25, 0]
    ];

    const weightPathCP = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0.5, 0]
    ];

    const weightShape = new JointBezier(3, weightShapeCP, "xy").build(20);
    const weightPath = new Bezier(weightPathCP, "xy").build(20);

    const weigthNode = new Node3D(
      new SweepSurface(weightShape, weightPath, true, "box")
    )
      .setTranslation([0, -1, -1.5])
      .setColor([99, 100, 101]);

    weight.addChildren(weigthNode);

    const supportShapeCP = [
      [-0.1, -0.1, 0],
      [-0.1, -0.1, 0],
      [-0.1, 0.1, 0],
      [-0.1, 0.1, 0],

      [-0.1, 0.1, 0],
      [-0.1, 0.1, 0],
      [0.1, 0.1, 0],
      [0.1, 0.1, 0],

      [0.1, 0.1, 0],
      [0.1, 0.1, 0],
      [0.1, -0.1, 0],
      [0.1, -0.1, 0],

      [0.1, -0.1, 0],
      [0.1, -0.1, 0],
      [-0.1, -0.1, 0],
      [-0.1, -0.1, 0]
    ];

    const supportPathCP = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0.6, 0]
    ];

    const supportShape = new JointBezier(3, supportShapeCP, "xy").build(20);
    const supportWeightPath = new Bezier(supportPathCP, "xy").build(20);

    const supportNode = new Node3D(
      new SweepSurface(supportShape, supportWeightPath, true, "box")
    ).setTranslation([0, -0.5, -1.5]);

    weight.addChildren(supportNode);

    return weight;
  }

  buildWheels() {
    const shape = new Circular("xy", this.wheelRadius).build(20);

    const pathControlPoints = [
      [-this.wheelWidth / 2, this.wheelRadius, 0],
      [-this.wheelWidth / 2, this.wheelRadius, 0],
      [this.wheelWidth / 2, this.wheelRadius, 0]
    ];

    const path = new Bezier(pathControlPoints, "xz").build(20);

    const wheels = new Array(4)
      .fill(0)
      .map(() => new Node3D(new SweepSurface(shape, path, true)));

    wheels[0].trX = -this.width / 2 - this.wheelWidth / 2;
    wheels[0].trZ = this.depth / 2;

    wheels[2].trX = -this.width / 2 - this.wheelWidth / 2;
    wheels[2].trZ = -this.depth / 2;

    wheels[1].trX = this.width / 2 + this.wheelWidth / 2;
    wheels[1].trZ = this.depth / 2;
    wheels[1].trY = this.wheelRadius * 2;
    wheels[1].rotZ = Math.PI;

    wheels[3].trX = this.width / 2 + this.wheelWidth / 2;
    wheels[3].trZ = -this.depth / 2;
    wheels[3].trY = this.wheelRadius * 2;
    wheels[3].rotZ = Math.PI;

    const axisShape = new Circular("xy", this.wheelRadius / 10).build(20);

    const axisPathControlPoints = [
      [-(this.width / 2) * 1.3, this.wheelRadius, 0],
      [-(this.width / 2) * 1.3, this.wheelRadius, 0],
      [(this.width / 2) * 1.3, this.wheelRadius, 0]
    ];

    const axisPath = new Bezier(axisPathControlPoints, "xz").build(20);

    const wheelAxis = new Array(2)
      .fill(0)
      .map(() => new Node3D(new SweepSurface(axisShape, axisPath, true)));

    wheelAxis[0].trZ = this.depth / 2;

    wheelAxis[1].trZ = -this.depth / 2;

    return [...wheels, ...wheelAxis];
  }

  buildArm() {
    const armNode = new Node3D();

    const supportShapeCP = [
      [-0.1, -0.1, 0],
      [-0.1, -0.1, 0],
      [-0.1, 0.1, 0],
      [-0.1, 0.1, 0],

      [-0.1, 0.1, 0],
      [-0.1, 0.1, 0],
      [0.1, 0.1, 0],
      [0.1, 0.1, 0],

      [0.1, 0.1, 0],
      [0.1, 0.1, 0],
      [0.1, -0.1, 0],
      [0.1, -0.1, 0],

      [0.1, -0.1, 0],
      [0.1, -0.1, 0],
      [-0.1, -0.1, 0],
      [-0.1, -0.1, 0]
    ];

    const supportPathCP = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 5]
    ];

    const supportShape = new JointBezier(3, supportShapeCP, "xy").build(20);
    const supportPath = new Bezier(supportPathCP, "xz").build(20);

    armNode.addChildren(
      new Node3D(
        new SweepSurface(supportShape, supportPath, true)
      ).setTranslation([0, 0, -1.5])
    );

    const paddleShapeCP = [
      [-0.7, -0.1, 0],
      [-0.7, -0.1, 0],
      [-0.7, 0.1, 0],
      [-0.7, 0.1, 0],

      [-0.7, 0.1, 0],
      [-0.7, 0.1, 0],
      [0.7, 0.1, 0],
      [0.7, 0.1, 0],

      [0.7, 0.1, 0],
      [0.7, 0.1, 0],
      [0.7, -0.1, 0],
      [0.7, -0.1, 0],

      [0.7, -0.1, 0],
      [0.7, -0.1, 0],
      [-0.7, -0.1, 0],
      [-0.7, -0.1, 0]
    ];

    const paddlePathCP = [
      [0, 0, 5],
      [0, 0, 5],
      [0, 0, 6]
    ];

    const paddleShape = new JointBezier(3, paddleShapeCP, "xy").build(20);
    const paddlePath = new Bezier(paddlePathCP, "xz").build(20);

    armNode.addChildren(
      new Node3D(
        new SweepSurface(paddleShape, paddlePath, true)
      ).setTranslation([0, 0, -1.5])
    );

    this.boulderNode = new PointLight([0, 0, 0], [0.1, 0.8, 0.0], 0.5, 0);

    armNode.addChildren(this.boulderNode);

    this.counterWeight = this.buildCounterWeight();

    armNode.addChildren(this.counterWeight);

    return armNode;
  }
}

class Sphere {
  constructor(radius) {
    this.radius = radius;
    this.pointsPerLevel = 20;
    this.levels = 20;
  }

  getPosition(u, v, m) {
    const position = vec4.fromValues(
      this.radius * Math.cos(2 * Math.PI * u) * Math.sin(Math.PI * v),
      this.radius * Math.sin(2 * Math.PI * u) * Math.sin(Math.PI * v),
      this.radius * Math.cos(Math.PI * v),
      1
    );

    vec4.transformMat4(position, position, m);

    return [position[0], position[1], position[2]];
  }

  getNormal(u, v, m) {
    const position = vec3.fromValues(
      Math.cos(2 * Math.PI * u) * Math.sin(Math.PI * v),
      Math.sin(2 * Math.PI * u) * Math.sin(Math.PI * v),
      Math.cos(Math.PI * v)
    );

    let normal = vec4.fromValues(...position, 0);

    vec4.transformMat4(normal, normal, m);

    normal = vec4.fromValues(...normal);

    vec3.normalize(normal, normal);

    return [normal[0], normal[1], normal[2]];
  }

  getBinormal(u, v, m) {
    return [1, 0, 0];
  }

  getTangent(u, v, m) {
    return [1, 0, 0];
  }

  getTextureCoordiantes(u, v) {
    return [u, v];
  }
}
