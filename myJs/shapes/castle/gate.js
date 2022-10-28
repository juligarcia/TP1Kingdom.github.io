class Gate extends Node3D {
  constructor(
    h,
    wallWidth,
    totalTowers,
    towerWidth,
    towerHeight,
    distanceToTower
  ) {
    super();

    this.h = h;
    this.height = towerHeight - 3 * h;
    this.distanceToTower = distanceToTower;
    this.towerWidth = towerWidth;
    this.wallWidth = wallWidth;
    this.doorLength = wallWidth / 3;

    const m1 = mat4.create();

    const tower1 = vec4.fromValues(1, 0, 0, 0);

    vec4.transformMat4(tower1, tower1, m1);
    vec4.scale(tower1, tower1, this.distanceToTower);

    const m2 = mat4.create();

    mat4.rotateY(m2, m2, 2 * Math.PI * ((totalTowers - 1) / totalTowers));

    const tower2 = vec4.fromValues(1, 0, 0, 0);

    vec4.transformMat4(tower2, tower2, m2);
    vec4.scale(tower2, tower2, this.distanceToTower);

    const axis = vec3.create();
    vec3.sub(axis, vec3.fromValues(...tower2), vec3.fromValues(...tower1));

    this.distanceBetweenTowers = vec3.len(axis);

    this.wallLength = this.distanceBetweenTowers / 3;

    const angle = vec3.angle(axis, vec3.fromValues(1, 0, 0));

    const selfTransform = mat4.create();

    mat4.translate(selfTransform, selfTransform, tower1);

    mat4.rotateY(selfTransform, selfTransform, -angle);

    this.transform(selfTransform);

    const wall2Transform = mat4.create();

    mat4.translate(wall2Transform, wall2Transform, [
      vec3.len(axis) - this.wallLength,
      0,
      0
    ]);

    const doorTransform = mat4.create();

    mat4.translate(doorTransform, doorTransform, [this.wallLength, 0, 0]);

    this.doorNode = new Node3D(this.generateDoorSurface(20, 20)).transform(
      doorTransform
    );

    this.children = [
      new Node3D(this.generateWallSurface(20, 20)).setColor([99, 100, 101]),
      new Node3D(this.generateWallSurface(20, 20))
        .transform(wall2Transform)
        .setColor([99, 100, 101]),
      this.doorNode.setColor([172, 133, 62])
    ];
  }

  generateDoorSurface(rows, cols) {
    const shapeControlsPoints = [
      [-this.wallWidth / 3, 0, 0],
      [-this.wallWidth / 3, 0, 0],
      [-this.wallWidth / 3, this.height, 0],
      [-this.wallWidth / 3, this.height, 0],

      [-this.wallWidth / 3, this.height, 0],
      [-this.wallWidth / 3, this.height, 0],
      [this.wallWidth / 3, this.height, 0],
      [this.wallWidth / 3, this.height, 0],

      [this.wallWidth / 3, this.height, 0],
      [this.wallWidth / 3, this.height, 0],
      [this.wallWidth / 3, 0, 0],
      [this.wallWidth / 3, 0, 0]
    ];

    const pathControlPoints = [
      [0, 0, 0],
      [0, 0, 0],
      [this.wallLength, 0, 0]
    ];

    const path = new JointBezier(2, pathControlPoints, "xz").build(cols);

    const shape = new JointBezier(3, shapeControlsPoints).build(rows);

    const shape3D = new SweepSurface(shape, path, true);

    return shape3D;
  }

  generateWallSurface(rows, cols) {
    const shapeControlsPoints = [
      [-this.wallWidth, 0, 0],
      [-this.wallWidth, 0, 0],
      [-this.wallWidth, this.height, 0],

      [-this.wallWidth, this.height, 0],
      [-this.wallWidth, this.height, 0],
      [-this.wallWidth - this.h / 2, this.height, 0],

      [-this.wallWidth - this.h / 2, this.height, 0],
      [-this.wallWidth - this.h / 2, this.height, 0],
      [-this.wallWidth - this.h / 2, this.height + this.h, 0],

      [-this.wallWidth - this.h / 2, this.height + this.h, 0],
      [-this.wallWidth - this.h / 2, this.height + this.h, 0],
      [-this.wallWidth, this.height + this.h, 0],

      [-this.wallWidth, this.height + this.h, 0],
      [-this.wallWidth, this.height + this.h, 0],
      [-this.wallWidth, this.height, 0],

      [-this.wallWidth, this.height, 0],
      [0, this.height, 0],
      [0, this.height, 0],

      [0, this.height, 0],
      [this.wallWidth, this.height, 0],
      [this.wallWidth, this.height, 0],

      [this.wallWidth, this.height, 0],
      [this.wallWidth, this.height + this.h, 0],
      [this.wallWidth, this.height + this.h, 0],

      [this.wallWidth, this.height + this.h, 0],
      [this.wallWidth + this.h / 2, this.height + this.h, 0],
      [this.wallWidth + this.h / 2, this.height + this.h, 0],

      [this.wallWidth + this.h / 2, this.height + this.h, 0],
      [this.wallWidth + this.h / 2, this.height, 0],
      [this.wallWidth + this.h / 2, this.height, 0],

      [this.wallWidth + this.h / 2, this.height, 0],
      [this.wallWidth, this.height, 0],
      [this.wallWidth, this.height, 0],

      [this.wallWidth, this.height, 0],
      [this.wallWidth, 0, 0],
      [this.wallWidth, 0, 0]
    ];

    const pathControlPoints = [
      [0, 0, 0],
      [0, 0, 0],
      [this.wallLength, 0, 0]
    ];

    const path = new JointBezier(2, pathControlPoints, "xz").build(cols);

    const shape = new JointBezier(2, shapeControlsPoints).build(rows);

    const shape3D = new SweepSurface(shape, path, true);

    return shape3D;
  }

  openGate(open) {
    this.doorNode.trY = this.height * open;
  }
}
