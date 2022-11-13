const H = 0.5;

class Castle extends Node3D {
  constructor(numberOfTowers, towerHeight, towerWidth, distanceToTower) {
    super();

    this.material = new Stone([217, 217, 217]);

    const castleTransform = mat4.create();
    mat4.rotateY(castleTransform, castleTransform, Math.PI / numberOfTowers);

    const towers = new Array(numberOfTowers)
      .fill(0)
      .map(() => new Tower(towerHeight, towerWidth, H));

    towers.forEach((towerNode, i) => {
      const totalTowers = towers.length;
      const u = i / totalTowers;

      const m = mat4.create();

      mat4.rotateY(m, m, 2 * Math.PI * u);
      mat4.translate(m, m, [distanceToTower, 0, 0]);

      towerNode.transform(m);
    });

    const walls = new Node3D(
      new Walls(
        numberOfTowers,
        towerHeight,
        towerWidth,
        distanceToTower,
        H
      ).generateSurface(20, 50)
    );

    const bridge = new Bridge(7);

    const bridgeTransform = mat4.create();
    mat4.translate(bridgeTransform, bridgeTransform, [14, 0, 0]);

    const bridgeNode = new Node3D(bridge.generateSurface(20, 20));

    this.bridgeNode = bridgeNode.transform(bridgeTransform);

    const gate = new Gate(
      H,
      towerWidth / 3,
      numberOfTowers,
      towerWidth,
      towerHeight,
      distanceToTower
    );

    this.gateNode = gate;

    this.castleNode = new Node3D()
      .transform(castleTransform)
      .addChildren(...towers, walls, gate);

    this.addChildren(
      bridgeNode.setColor([172, 133, 62]),
      this.castleNode,
      new MainBuilding()
    );
  }

  openGate(open) {
    this.gateNode.openGate(open);
  }

  liftBridge(lift) {
    if ((this, this.bridgeNode.rotZ !== (lift * Math.PI) / 2)) {
      this.bridgeNode.rotZ = (lift * Math.PI) / 2;
      this.bridgeNode.recalculate(true);
    }
  }
}

class MainBuilding extends Node3D {
  constructor() {
    super();

    this.addChildren(this.building(), this.towers());
  }

  building() {
    const buildingNode = new Node3D();

    const buildingShapeCP = [
      [-2, -4, 0],
      [-2, -4, 0],
      [-2, 4, 0],
      [-2, 4, 0],

      [-2, 4, 0],
      [-2, 4, 0],
      [2, 4, 0],
      [2, 4, 0],

      [2, 4, 0],
      [2, 4, 0],
      [2, -4, 0],
      [2, -4, 0],

      [2, -4, 0],
      [2, -4, 0],
      [-2, -4, 0],
      [-2, -4, 0]
    ];

    const buildingPathCP = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 7, 0]
    ];

    const buildingShape = new JointBezier(3, buildingShapeCP, "xy").build(20);
    const buildingPath = new Bezier(buildingPathCP, "xy").build(20);

    buildingNode.addChildren(
      new Node3D(
        new SweepSurface(buildingShape, buildingPath, true)
      ).setMaterial(new Stone([217, 217, 217]))
    );

    const roofShapeCP = [
      [-2.2, 0, 0],
      [-2.2, 0, 0],
      [0, 3, 0],
      [0, 3, 0],

      [0, 3, 0],
      [0, 3, 0],
      [2.2, 0, 0],
      [2.2, 0, 0],

      [2.2, 0, 0],
      [2.2, 0, 0],
      [-2.2, 0, 0],
      [-2.2, 0, 0]
    ];

    const roofPathCP = [
      [0, 7, -4.2],
      [0, 7, -4.2],
      [0, 7, 4.2]
    ];

    const roofShape = new JointBezier(3, roofShapeCP, "xy").build(20);
    const roofPath = new Bezier(roofPathCP, "xz").build(20);

    buildingNode.addChildren(
      new Node3D(new SweepSurface(roofShape, roofPath, true)).setMaterial(
        new RoofTile()
      ),
      new SpotTorch(Math.PI / 2, [0, 2, -5], Math.PI / 2, true),
      new SpotTorch(Math.PI / 2, [0, 2, 5], -Math.PI / 2, true)
    );

    return buildingNode;
  }

  towers() {
    const towerNode = new Node3D();

    const towerShapeCP = [
      [0, 0, 0],
      [0, 0, 0],
      [-0.5, 0, 0],
      [-0.5, 0, 0],

      [-0.5, 0, 0],
      [-0.5, 0, 0],
      [-0.5, 5, 0],
      [-0.5, 5, 0],

      [-0.5, 5, 0],
      [-0.5, 6, 0],
      [-1, 6, 0],
      [-1, 8, 0],

      [-1, 8, 0],
      [-1, 8, 0],
      [0, 8, 0],
      [0, 8, 0]
    ];

    const towerPath = new Circular().build(20);
    const towerShape = new JointBezier(3, towerShapeCP, "xy").build(20);

    towerNode.addChildren(
      new Node3D(new SweepSurface(towerShape, towerPath))
        .setMaterial(new Stone())
        .setTranslation([2, 0, 4]),
      new Node3D(new SweepSurface(towerShape, towerPath))
        .setMaterial(new Stone())
        .setTranslation([-2, 0, 4]),
      new Node3D(new SweepSurface(towerShape, towerPath))
        .setMaterial(new Stone())
        .setTranslation([-2, 0, -4]),
      new Node3D(new SweepSurface(towerShape, towerPath))
        .setMaterial(new Stone())
        .setTranslation([2, 0, -4])
    );

    const towerRoofShapeCP = [
      [0, 0, 0],
      [0, 0, 0],
      [-1, 0, 0],
      [-1, 0, 0],

      [-1, 0, 0],
      [-0.3, 1.5, 0],
      [-0.3, 1.5, 0],
      [0, 4, 0]
    ];

    const towerRoofPath = new Circular().build(20);
    const towerRoofShape = new JointBezier(3, towerRoofShapeCP, "xy").build(20);

    towerNode.addChildren(
      new Node3D(new SweepSurface(towerRoofShape, towerRoofPath))
        .setMaterial(new RoofTile())
        .setTranslation([2, 8, 4]),
      new Node3D(new SweepSurface(towerRoofShape, towerRoofPath))
        .setMaterial(new RoofTile())
        .setTranslation([-2, 8, 4]),
      new Node3D(new SweepSurface(towerRoofShape, towerRoofPath))
        .setMaterial(new RoofTile())
        .setTranslation([-2, 8, -4]),
      new Node3D(new SweepSurface(towerRoofShape, towerRoofPath))
        .setMaterial(new RoofTile())
        .setTranslation([2, 8, -4])
    );

    towerNode.addChildren(
      new SpotLight(
        [0, 0, 0],
        [128, 159, 255],
        [179, 198, 255],
        Math.PI / 3,
        [1.0, 0.2, 0.0],
        0.2
      ).setTranslation([2, 12, -4]),
      new SpotLight(
        [0, 0, 0],
        [128, 159, 255],
        [179, 198, 255],
        Math.PI / 3,
        [1.0, 0.2, 0.0],
        0.2
      ).setTranslation([2, 12, 4]),
      new SpotLight(
        [0, 0, 0],
        [128, 159, 255],
        [179, 198, 255],
        Math.PI / 3,
        [1.0, 0.2, 0.0],
        0.2
      ).setTranslation([-2, 12, 4]),
      new SpotLight(
        [0, 0, 0],
        [128, 159, 255],
        [179, 198, 255],
        Math.PI / 3,
        [1.0, 0.2, 0.0],
        0.2
      ).setTranslation([-2, 12, -4])
    );

    return towerNode;
  }
}
