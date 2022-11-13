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

    this.addChildren(bridgeNode.setColor([172, 133, 62]), this.castleNode);
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
