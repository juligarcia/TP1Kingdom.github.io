class Gate extends Node3D {
  constructor(h, wallWidth, towerWidth, distanceToTower) {
    super();

    this.towerHeight = myGUI.get("Tower Height");

    this.h = h;
    this.distanceToTower = distanceToTower;
    this.towerWidth = towerWidth;
    this.wallWidth = wallWidth;
    this.doorLength = wallWidth / 3;

    const [_, selfTransform] = this.getSelfTranform();

    this.transform(selfTransform);

    const doorTransform = mat4.create();

    mat4.translate(doorTransform, doorTransform, [this.wallLength, 0, 0]);

    this.doorNode = new Door(this.h).transform(doorTransform);

    this.addChildren(new GateWall(this.h), new GateWall(this.h), this.doorNode);
  }

  openGate() {
    const height = this.towerHeight - 3 * this.h;

    this.doorNode.recalculate(true);
    this.doorNode.trY = height * myGUI.get("Open Gate");
  }

  getSelfTranform() {
    const numberOfTowers = myGUI.get("Number of Towers");

    const m1 = mat4.create();

    mat4.rotateY(m1, m1, Math.PI / numberOfTowers);

    const tower1 = vec4.fromValues(1, 0, 0, 0);

    vec4.transformMat4(tower1, tower1, m1);
    vec4.scale(tower1, tower1, this.distanceToTower);

    const m2 = mat4.create();

    mat4.rotateY(
      m2,
      m2,
      2 * Math.PI * ((numberOfTowers - 1) / numberOfTowers) +
        Math.PI / numberOfTowers
    );

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

    return [axis, selfTransform];
  }

  preRender() {
    super.preRender();

    const [axis, selfTransform] = this.getSelfTranform();

    this.transformMatrix = selfTransform;

    const wall2Transform = mat4.create();

    mat4.translate(wall2Transform, wall2Transform, [
      vec3.len(axis) - this.wallLength,
      0,
      0
    ]);

    const doorTransform = mat4.create();
    mat4.translate(doorTransform, doorTransform, [this.wallLength, 0, 0]);

    this.children[1].transformMatrix = wall2Transform;
    this.children[2].transformMatrix = doorTransform;
  }
}

class Door extends Node3D {
  constructor(h) {
    super();
    this.h = h;

    this.setMaterial(new Wood([172, 133, 62]));

    this.model = this;
  }

  generateSurface() {
    const height = myGUI.get("Tower Height") - 3 * this.h;

    const wallWidth = this.parent.wallWidth;
    const wallLength = this.parent.wallLength;

    const shapeControlsPoints = [
      [-wallWidth / 3, 0, 0],
      [-wallWidth / 3, 0, 0],
      [-wallWidth / 3, height, 0],
      [-wallWidth / 3, height, 0],

      [-wallWidth / 3, height, 0],
      [-wallWidth / 3, height, 0],
      [wallWidth / 3, height, 0],
      [wallWidth / 3, height, 0],

      [wallWidth / 3, height, 0],
      [wallWidth / 3, height, 0],
      [wallWidth / 3, 0, 0],
      [wallWidth / 3, 0, 0]
    ];

    const pathControlPoints = [
      [0, 0, 0],
      [0, 0, 0],
      [wallLength, 0, 0]
    ];

    const path = new JointBezier(2, pathControlPoints, "xz").build(20);

    const shape = new JointBezier(3, shapeControlsPoints).build(20);

    const shape3D = new SweepSurface(shape, path, true);

    return shape3D;
  }
}

class GateWall extends Node3D {
  constructor(h) {
    super();
    this.h = h;
    this.model = this;
  }

  generateSurface() {
    const height = myGUI.get("Tower Height") - 3 * this.h;

    const wallWidth = this.parent.wallWidth;
    const wallLength = this.parent.wallLength;

    const shapeControlsPoints = [
      [-wallWidth, 0, 0],
      [-wallWidth, 0, 0],
      [-wallWidth, height, 0],

      [-wallWidth, height, 0],
      [-wallWidth, height, 0],
      [-wallWidth - this.h / 2, height, 0],

      [-wallWidth - this.h / 2, height, 0],
      [-wallWidth - this.h / 2, height, 0],
      [-wallWidth - this.h / 2, height + this.h, 0],

      [-wallWidth - this.h / 2, height + this.h, 0],
      [-wallWidth - this.h / 2, height + this.h, 0],
      [-wallWidth, height + this.h, 0],

      [-wallWidth, height + this.h, 0],
      [-wallWidth, height + this.h, 0],
      [-wallWidth, height, 0],

      [-wallWidth, height, 0],
      [0, height, 0],
      [0, height, 0],

      [0, height, 0],
      [wallWidth, height, 0],
      [wallWidth, height, 0],

      [wallWidth, height, 0],
      [wallWidth, height + this.h, 0],
      [wallWidth, height + this.h, 0],

      [wallWidth, height + this.h, 0],
      [wallWidth + this.h / 2, height + this.h, 0],
      [wallWidth + this.h / 2, height + this.h, 0],

      [wallWidth + this.h / 2, height + this.h, 0],
      [wallWidth + this.h / 2, height, 0],
      [wallWidth + this.h / 2, height, 0],

      [wallWidth + this.h / 2, height, 0],
      [wallWidth, height, 0],
      [wallWidth, height, 0],

      [wallWidth, height, 0],
      [wallWidth, 0, 0],
      [wallWidth, 0, 0]
    ];

    const pathControlPoints = [
      [0, 0, 0],
      [0, 0, 0],
      [wallLength, 0, 0]
    ];

    const path = new JointBezier(2, pathControlPoints, "xz").build(20);

    const shape = new JointBezier(2, shapeControlsPoints).build(20);

    const shape3D = new SweepSurface(shape, path, true);

    return shape3D;
  }
}
