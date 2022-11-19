class World extends Node3D {
  constructor() {
    super();

    const terrainTransform = mat4.create();
    mat4.rotateY(terrainTransform, terrainTransform, -Math.PI / 10);

    this.setMaterial(new Grass());

    this.addChildren(
      new Node3D(this.buildCastleTerrain()).setMaterial(new CastleTerrain()),
      new Node3D(this.buildTerrain()).transform(terrainTransform),
      new Node3D(this.buildPitWater())
        .setTranslation([0, -1, 0])
        .setMaterial(new Water())
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

    const shape3D = new SweepSurface(shape, path).setUVDensity(10, 10);

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

    const shape3D = new SweepSurface(shape, path).setUVDensity(10, 10);

    return shape3D;
  }
}

class Plane {
  constructor(width, depth) {
    this.width = width;
    this.depth = depth;
    this.levels = 20;
    this.pointsPerLevel = 20;
    this.uDensity = 10;
    this.vDensity = 10;
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

  getBinormal(u, v, m) {
    const binormal = vec4.fromValues(1, 0, 0, 0);

    vec4.transformMat4(binormal, binormal, m);
    return [binormal[0], binormal[1], binormal[2]];
  }

  getTangent(u, v, m) {
    const tangent = vec4.fromValues(0, 0, 1, 0);

    vec4.transformMat4(tangent, tangent, m);
    return [tangent[0], tangent[1], tangent[2]];
  }

  getTextureCoordiantes(u, v) {
    const uu = u * this.uDensity;
    const vv = v * this.vDensity;

    return [vv, uu];
  }
}
