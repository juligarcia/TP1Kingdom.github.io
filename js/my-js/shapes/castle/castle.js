const H = 0.5;
const FLOOR_HEIGHT = 2.5;
const WINDOW_PAD = 0.1;
const WINDOW_WIDTH = 0.5;
const WINDOW_HEIGHT = 0.7;
const FLOOR_PAD = 1;

class Window extends Node3D {
  constructor() {
    super();

    this.model = this;
    this.setMaterial(new Glass());
  }

  generateSurface() {
    const shapeCP = [
      [0, 0, 0],
      [0, 0, 0],
      [-WINDOW_WIDTH / 2, 0, 0],
      [-WINDOW_WIDTH / 2, 0, 0],

      [-WINDOW_WIDTH / 2, 0, 0],
      [-WINDOW_WIDTH / 2, WINDOW_HEIGHT, 0],
      [WINDOW_WIDTH / 2, WINDOW_HEIGHT, 0],
      [WINDOW_WIDTH / 2, 0, 0],

      [WINDOW_WIDTH / 2, 0, 0],
      [WINDOW_WIDTH / 2, 0, 0],
      [0, 0, 0],
      [0, 0, 0]
    ];

    const pathCP = [
      [0, 0, 0],
      [0, 0, 0],
      [0.05, 0, 0]
    ];

    const windowShape = new JointBezier(3, shapeCP, "xy").build(20);
    const windowPath = new Bezier(pathCP, "xz").build(20);

    return new SweepSurface(windowShape, windowPath, true);
  }
}

class Castle extends Node3D {
  constructor(towerWidth, distanceToTower) {
    super();

    this.towerHeight = myGUI.get("Tower Height");
    this.numberOfTowers = myGUI.get("Number of Towers");
    this.towerWidth = towerWidth;
    this.material = new Stone();
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
      bridgeNode.setMaterial(new Wood()),
      this.castleNode,
      this.mainBuildingNode,
      new SpotTorch(Math.PI / 2, [17, 3, 3], 0, 0).setTranslation([0, -1, 0]),
      new SpotTorch(Math.PI / 2, [17, 3, -3], 0, 1).setTranslation([0, -1, 0])
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

    const floors = myGUI.get("Castle Floors");
    const height = FLOOR_HEIGHT * floors;

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
        new SweepSurface(buildingShape, buildingPath, true, "box").setUVDensity(
          7,
          7
        )
      ).setMaterial(new Stone())
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
      new Node3D(
        new SweepSurface(roofShape, roofPath, true, "box")
      ).setMaterial(new RoofTile()),
      new SpotTorch(Math.PI / 3, [0, 3, -width / 2 - 1], -Math.PI / 4, 2),
      new SpotTorch(Math.PI / 3, [0, 3, width / 2 + 1], Math.PI / 4, 3)
    );

    const totalWindowWidth = WINDOW_WIDTH + 2 * WINDOW_PAD;

    const windowsFronts = Math.floor(
      (width - FLOOR_PAD * 2) / totalWindowWidth
    );
    const leftOverSpaceFront = (width - FLOOR_PAD * 2) % totalWindowWidth;

    const leftOverSpaceSide = (depth - FLOOR_PAD * 2) % totalWindowWidth;

    const windowsSides = Math.floor((depth - FLOOR_PAD * 2) / totalWindowWidth);

    const frontWindows = Array(floors)
      .fill(0)
      .map((_, floorIndex) => {
        return Array(windowsFronts)
          .fill(0)
          .map((_, index) =>
            new Window().setTranslation([
              depth / 2,
              floorIndex * FLOOR_HEIGHT + FLOOR_HEIGHT / 2,
              index * totalWindowWidth -
                (width / 2 - FLOOR_PAD) +
                leftOverSpaceFront
            ])
          );
      })
      .flat();

    const backWindows = Array(floors)
      .fill(0)
      .map((_, floorIndex) => {
        return Array(windowsFronts)
          .fill(0)
          .map((_, index) =>
            new Window()
              .setRotation([0, Math.PI, 0])
              .setTranslation([
                -depth / 2,
                floorIndex * FLOOR_HEIGHT + FLOOR_HEIGHT / 2,
                index * totalWindowWidth -
                  (width / 2 - FLOOR_PAD) +
                  leftOverSpaceFront
              ])
          );
      })
      .flat();

    const rightWindows = Array(floors)
      .fill(0)
      .map((_, floorIndex) => {
        return Array(windowsSides)
          .fill(0)
          .map((_, index) =>
            new Window()
              .setRotation([0, -Math.PI / 2, 0])
              .setTranslation([
                index * totalWindowWidth -
                  (depth / 2 - FLOOR_PAD) +
                  leftOverSpaceSide,
                floorIndex * FLOOR_HEIGHT + FLOOR_HEIGHT / 2,
                width / 2
              ])
          );
      })
      .flat();

    const leftWindows = Array(floors)
      .fill(0)
      .map((_, floorIndex) => {
        return Array(windowsSides)
          .fill(0)
          .map((_, index) =>
            new Window()
              .setRotation([0, Math.PI / 2, 0])
              .setTranslation([
                index * totalWindowWidth -
                  (depth / 2 - FLOOR_PAD) +
                  leftOverSpaceSide,
                floorIndex * FLOOR_HEIGHT + FLOOR_HEIGHT / 2,
                -width / 2
              ])
          );
      })
      .flat();

    return buildingNode.addChildren(
      ...frontWindows,
      ...backWindows,
      ...rightWindows,
      ...leftWindows
    );
  }

  towers() {
    const towerNode = new Node3D();

    const floors = myGUI.get("Castle Floors");
    const height = FLOOR_HEIGHT * floors;

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
      new Node3D(new SweepSurface(towerShape, towerPath).setUVDensity(7, 7))
        .setMaterial(new Stone())
        .setTranslation([depth / 2, 0, width / 2]),
      new Node3D(new SweepSurface(towerShape, towerPath).setUVDensity(7, 7))
        .setMaterial(new Stone())
        .setTranslation([-depth / 2, 0, width / 2]),
      new Node3D(new SweepSurface(towerShape, towerPath).setUVDensity(7, 7))
        .setMaterial(new Stone())
        .setTranslation([-depth / 2, 0, -width / 2]),
      new Node3D(new SweepSurface(towerShape, towerPath).setUVDensity(7, 7))
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
