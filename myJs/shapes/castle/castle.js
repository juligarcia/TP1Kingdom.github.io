const H = 0.5;

class Castle extends Node3D {
  constructor(numberOfTowers, towerHeight, towerWidth, distanceToTower) {
    super();

    const castleTransform = mat4.create();
    mat4.rotateY(castleTransform, castleTransform, Math.PI / numberOfTowers);

    const towers = new Array(numberOfTowers)
      .fill(0)
      .map(
        () =>
          new Node3D(
            new Tower(towerHeight, towerWidth, H).generateSurface(20, 20)
          )
      );

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

    const bridge = new Bridge(5);

    const bridgeTransform = mat4.create();
    mat4.translate(bridgeTransform, bridgeTransform, [12, 0, 0]);

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

    this.children = [
      new Node3D()
        .transform(castleTransform)
        .addChildren(...towers, walls, gate),
      bridgeNode
    ];
  }

  openGate(open) {
    this.gateNode.openGate(open);
  }

  liftBridge(lift) {
    this.bridgeNode.rotZ = (lift * Math.PI) / 2;
  }
}
