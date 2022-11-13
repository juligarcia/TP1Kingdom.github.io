class World extends Node3D {
  constructor() {
    super();

    const terrainTransform = mat4.create();
    mat4.rotateY(terrainTransform, terrainTransform, -Math.PI / 10);

    this.setMaterial(new Grass([51, 204, 51]));

    this.addChildren(
      new Node3D(this.buildCastleTerrain()),
      new Node3D(this.buildTerrain()).transform(terrainTransform),
      new Node3D(this.buildPitWater())
        .setTranslation([0, -1, 0])
        .setMaterial(new Water([0, 153, 255]))
    );
  }

  buildPitWater() {
    return new Plane(50, 50);
  }

  buildCastleTerrain() {
    const controlsPoints = [
      [0, 0, 0],
      [15, 0, 0],
      [15, 0, 0],

      [15, 0, 0],
      [15, -3, 0],
      [15, -3, 0]
    ];

    const path = new Circular().build(50);
    const shape = new JointBezier(2, controlsPoints).build(50);

    const shape3D = new SweepSurface(shape, path);

    return shape3D;
  }

  buildTerrain() {
    const controlsPoints = [
      [15, -3, 0],
      [15, -3, 0],
      [20, -3, 0],

      [20, -3, 0],
      [20, 0, 0],
      [20, 0, 0],

      [20, 0, 0],
      [20, 0, 0],
      [45, 0, 0],

      [45, 0, 0],
      [45, 0, 0],
      [45, -3, 0]
    ];

    const path = new Circular().build(10);
    const shape = new JointBezier(2, controlsPoints).build(10);

    const shape3D = new SweepSurface(shape, path);

    return shape3D;
  }
}

class Plane {
  constructor(width, depth) {
    this.width = width;
    this.depth = depth;
    this.levels = 20;
    this.pointsPerLevel = 20;
  }

  getPosition(u, v, m) {
    const x = (u - 0.5) * this.width;
    const z = (v - 0.5) * this.depth;

    const position = vec4.fromValues(x, 0, z, 1);

    vec4.transformMat4(position, position, m);

    return [position[0], position[1], position[2]];
  }

  getNormal(u, v, m) {
    const normal = vec4.fromValues(0, 1, 0, 0);

    vec4.transformMat4(normal, normal, m);
    return [normal[0], normal[1], normal[2]];
  }

  getTextureCoordiantes(u, v) {
    return [u, v];
  }
}
