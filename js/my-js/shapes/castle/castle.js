const H = 0.5;

class Castle extends Node3D {
  constructor(towerWidth, distanceToTower) {
    super();

    this.towerHeight = myGUI.get("Tower Height");
    this.numberOfTowers = myGUI.get("Number of Towers");
    this.towerWidth = towerWidth;
    this.material = new Stone([217, 217, 217]);
    this.distanceToTower = distanceToTower;

    const towers = new Array(this.numberOfTowers)
      .fill(0)
      .map((_, index) =>
        new Tower(towerWidth, H, index + 1).setId(`tower-${index}`)
      );

    this.towers = towers;

    towers.forEach((towerNode, i) => {
      const totalTowers = towers.length;
      const u = i / totalTowers;

      const m = mat4.create();

      mat4.rotateY(m, m, 2 * Math.PI * u + Math.PI / totalTowers);
      mat4.translate(m, m, [distanceToTower, 0, 0]);

      towerNode.transform(m);
    });

    this.wallsNode = new Node3D(new Walls(towerWidth, distanceToTower, H));

    const bridge = new Bridge(7);

    const bridgeTransform = mat4.create();
    mat4.translate(bridgeTransform, bridgeTransform, [14, 0, 0]);

    const bridgeNode = new Node3D(bridge.generateSurface(20, 20));

    this.bridgeNode = bridgeNode.transform(bridgeTransform);

    const gate = new Gate(H, towerWidth / 3, towerWidth, distanceToTower);

    this.gateNode = gate;

    this.castleNode = new Node3D().addChildren(...towers, this.wallsNode, gate);

    this.mainBuildingNode = new MainBuilding();

    this.addChildren(
      bridgeNode.setColor([172, 133, 62]),
      this.castleNode,
      this.mainBuildingNode,
      new SpotTorch(Math.PI / 2, [17, 2, 3], 0, 0),
      new SpotTorch(Math.PI / 2, [17, 2, -3], 0, 1)
    );
  }

  updateTowersHeight() {
    const newHeight = myGUI.get("Tower Height");

    this.towerHeight = newHeight;

    this.gateNode.recalculate(true);

    this.wallsNode.model.towerHeight = newHeight;
    this.wallsNode.recalculate(true);

    this.towers.forEach((tower) => {
      tower.height = newHeight;
      tower.recalculate(true);
    });
  }

  updateNumberOfTowers() {
    const newNum = myGUI.get("Number of Towers");

    for (let i = 0; i < this.numberOfTowers; i++)
      this.castleNode.removeChild(`tower-${i}`);

    this.numberOfTowers = newNum;

    this.gateNode.doorNode.numberOfTowers = newNum;
    this.gateNode.recalculate(true);

    this.wallsNode.model.numberOfTowers = newNum;
    this.wallsNode.recalculate(true);

    const towers = new Array(this.numberOfTowers)
      .fill(0)
      .map((_, index) =>
        new Tower(this.towerWidth, H, index + 1).setId(`tower-${index}`)
      );

    this.towers = towers;

    towers.forEach((towerNode, i) => {
      const totalTowers = towers.length;
      const u = i / totalTowers;

      const m = mat4.create();

      mat4.rotateY(m, m, 2 * Math.PI * u - Math.PI / totalTowers);
      mat4.translate(m, m, [this.distanceToTower, 0, 0]);

      towerNode.transform(m);
    });

    this.castleNode.addChildren(...towers);
  }

  openGate() {
    this.gateNode.openGate();
  }

  liftBridge() {
    this.bridgeNode.rotZ = (myGUI.get("Lift Bridge") * Math.PI) / 2;
    this.bridgeNode.recalculate(true);
  }

  updateMainBuilding() {
    this.mainBuildingNode.recalculate(true);
  }
}

class MainBuilding extends Node3D {
  constructor() {
    super();

    this.addChildren(
      this.building().setId("building"),
      this.towers().setId("towers")
    );
  }

  preRender() {
    super.preRender();

    if (this.shouldRecalculate) {
      this.removeChild("building");
      this.removeChild("towers");

      this.addChildren(
        this.building().setId("building"),
        this.towers().setId("towers")
      );
    }
  }

  building() {
    const buildingNode = new Node3D();

    const height = myGUI.get("Castle Height");
    const width = myGUI.get("Castle Width");
    const depth = myGUI.get("Castle Depth");

    const buildingShapeCP = [
      [-depth / 2, -width / 2, 0],
      [-depth / 2, -width / 2, 0],
      [-depth / 2, width / 2, 0],
      [-depth / 2, width / 2, 0],

      [-depth / 2, width / 2, 0],
      [-depth / 2, width / 2, 0],
      [depth / 2, width / 2, 0],
      [depth / 2, width / 2, 0],

      [depth / 2, width / 2, 0],
      [depth / 2, width / 2, 0],
      [depth / 2, -width / 2, 0],
      [depth / 2, -width / 2, 0],

      [depth / 2, -width / 2, 0],
      [depth / 2, -width / 2, 0],
      [-depth / 2, -width / 2, 0],
      [-depth / 2, -width / 2, 0]
    ];

    const buildingPathCP = [
      [0, 0, 0],
      [0, 0, 0],
      [0, height, 0]
    ];

    const buildingShape = new JointBezier(3, buildingShapeCP, "xy").build(20);
    const buildingPath = new Bezier(buildingPathCP, "xy").build(20);

    buildingNode.addChildren(
      new Node3D(
        new SweepSurface(buildingShape, buildingPath, true)
      ).setMaterial(new Stone([217, 217, 217]))
    );

    const roofShapeCP = [
      [-depth / 2 - 0.2, 0, 0],
      [-depth / 2 - 0.2, 0, 0],
      [0, 3, 0],
      [0, 3, 0],

      [0, 3, 0],
      [0, 3, 0],
      [depth / 2 + 0.2, 0, 0],
      [depth / 2 + 0.2, 0, 0],

      [depth / 2 + 0.2, 0, 0],
      [depth / 2 + 0.2, 0, 0],
      [-depth / 2 - 0.2, 0, 0],
      [-depth / 2 - 0.2, 0, 0]
    ];

    const roofPathCP = [
      [0, height, -width / 2 - 0.2],
      [0, height, -width / 2 - 0.2],
      [0, height, width / 2 + 0.2]
    ];

    const roofShape = new JointBezier(3, roofShapeCP, "xy").build(20);
    const roofPath = new Bezier(roofPathCP, "xz").build(20);

    buildingNode.addChildren(
      new Node3D(new SweepSurface(roofShape, roofPath, true)).setMaterial(
        new RoofTile()
      ),
      new SpotTorch(Math.PI / 3, [0, 3, -width / 2 - 1], -Math.PI / 4, 2),
      new SpotTorch(Math.PI / 3, [0, 3, width / 2 + 1], Math.PI / 4, 3)
    );

    return buildingNode;
  }

  towers() {
    const towerNode = new Node3D();

    const height = myGUI.get("Castle Height");
    const width = myGUI.get("Castle Width");
    const depth = myGUI.get("Castle Depth");

    const towerShapeCP = [
      [0, 0, 0],
      [0, 0, 0],
      [-0.5, 0, 0],
      [-0.5, 0, 0],

      [-0.5, 0, 0],
      [-0.5, 0, 0],
      [-0.5, height, 0],
      [-0.5, height - 1, 0],

      [-0.5, height - 1, 0],
      [-0.5, height - 1, 0],
      [-1, height, 0],
      [-1, height + 2, 0],

      [-1, height + 2, 0],
      [-1, height + 2, 0],
      [0, height + 2, 0],
      [0, height + 2, 0]
    ];

    const towerPath = new Circular().build(20);
    const towerShape = new JointBezier(3, towerShapeCP, "xy").build(20);

    towerNode.addChildren(
      new Node3D(new SweepSurface(towerShape, towerPath))
        .setMaterial(new Stone())
        .setTranslation([depth / 2, 0, width / 2]),
      new Node3D(new SweepSurface(towerShape, towerPath))
        .setMaterial(new Stone())
        .setTranslation([-depth / 2, 0, width / 2]),
      new Node3D(new SweepSurface(towerShape, towerPath))
        .setMaterial(new Stone())
        .setTranslation([-depth / 2, 0, -width / 2]),
      new Node3D(new SweepSurface(towerShape, towerPath))
        .setMaterial(new Stone())
        .setTranslation([depth / 2, 0, -width / 2])
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
        .setTranslation([depth / 2, height + 2, width / 2]),
      new Node3D(new SweepSurface(towerRoofShape, towerRoofPath))
        .setMaterial(new RoofTile())
        .setTranslation([-depth / 2, height + 2, width / 2]),
      new Node3D(new SweepSurface(towerRoofShape, towerRoofPath))
        .setMaterial(new RoofTile())
        .setTranslation([-depth / 2, height + 2, -width / 2]),
      new Node3D(new SweepSurface(towerRoofShape, towerRoofPath))
        .setMaterial(new RoofTile())
        .setTranslation([depth / 2, height + 2, -width / 2])
    );

    towerNode.addChildren(
      new SpotLight(
        [depth / 2, height + 6, -width / 2],
        Math.PI / 4,
        [0.0, 0.35, 0.0],
        0.2,
        4
      ),
      new SpotLight(
        [depth / 2, height + 6, width / 2],
        Math.PI / 4,
        [0.0, 0.35, 0.0],
        0.2,
        5
      ),
      new SpotLight(
        [-depth / 2, height + 6, width / 2],
        Math.PI / 4,
        [0.0, 0.35, 0.0],
        0.2,
        6
      ),
      new SpotLight(
        [-depth / 2, height + 6, -width / 2],
        Math.PI / 4,
        [0.0, 0.35, 0.0],
        0.2,
        7
      )
    );

    return towerNode;
  }
}
