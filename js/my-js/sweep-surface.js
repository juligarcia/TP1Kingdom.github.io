class SweepSurface {
  constructor(shape, path, closed) {
    this.shape = shape;
    this.pointsPerLevel = shape.length - 1;

    this.path = path;
    this.levels = path.length - 1;

    this.closed = closed;
  }

  getStartingLid(cols, m) {
    const center = vec4.fromValues(...this.path[0].point, 1);
    const normalMat = this.path[0].normal;

    vec4.transformMat4(center, center, m);

    const shape = this.shape.map(({ point }) => {
      const p = vec4.fromValues(...point, 1);
      vec4.transformMat4(p, p, normalMat);
      vec4.transformMat4(p, p, m);

      return [...vec3.fromValues(...p)];
    });

    let tangent = vec4.fromValues(normalMat[8], normalMat[9], normalMat[10], 0);

    vec4.transformMat4(tangent, tangent, m);

    tangent = vec3.fromValues(...tangent);

    vec3.negate(tangent, tangent);

    const points = new Array(cols)
      .fill(0)
      .map(() => [...vec3.fromValues(...center)]);

    const normals = new Array(cols)
      .fill(0)
      .map(() => [...vec3.fromValues(...tangent)]);

    return [
      [...points.flat(), ...shape.flat()],
      [...normals.flat(), ...normals.flat()]
    ];
  }

  getEndingLid(cols, m) {
    const center = vec4.fromValues(...this.path[this.path.length - 1].point, 1);
    const normalMat = this.path[this.path.length - 1].normal;

    vec4.transformMat4(center, center, m);

    const shape = this.shape.map(({ point }) => {
      const p = vec4.fromValues(...point, 1);
      vec4.transformMat4(p, p, normalMat);
      vec4.transformMat4(p, p, m);

      return [...vec3.fromValues(...p)];
    });

    let tangent = vec4.fromValues(normalMat[8], normalMat[9], normalMat[10], 0);

    vec4.transformMat4(tangent, tangent, m);

    tangent = vec3.fromValues(...tangent);

    const points = new Array(cols)
      .fill(0)
      .map(() => [...vec3.fromValues(...center)]);

    const normals = new Array(cols).fill(0).map(() => [...tangent]);

    return [
      [...shape.flat(), ...points.flat()],
      [...normals.flat(), ...normals.flat()]
    ];
  }

  getCenter() {
    const center = this.path.reduce((acc, curr) => {
      acc.add(acc, acc, vec3.fromValues(...curr.point));
    }, vec3.create());

    vec3.scale(center, center, 1 / this.path.length);

    return center;
  }

  getShapeCenter() {
    const center = this.shape.reduce((acc, curr) => {
      vec3.add(acc, acc, vec3.fromValues(...curr.point));

      return acc;
    }, vec3.create());

    vec3.scale(center, center, 1 / this.shape.length);

    return center;
  }

  getPosition(u, v, m) {
    let position = vec4.create();

    const matrix = mat4.create();

    mat4.mul(matrix, matrix, this.path[Math.round(v * this.levels)].normal);

    let shapePoint;

    shapePoint = vec4.fromValues(
      ...this.shape[Math.round(u * this.pointsPerLevel)].point,
      1
    );

    vec4.transformMat4(position, shapePoint, matrix);

    vec4.transformMat4(position, position, m);

    return [position[0], position[1], position[2]];
  }

  getNormal(u, v, m) {
    let normal = vec4.create();

    const matrix = mat4.create();

    mat4.mul(matrix, matrix, this.path[Math.round(v * this.levels)].normal);

    const shapeNormalMatrix =
      this.shape[Math.round(u * this.pointsPerLevel)].normal;

    let shapeNormalVector = vec4.fromValues(
      shapeNormalMatrix[0],
      shapeNormalMatrix[1],
      shapeNormalMatrix[2],
      0
    );

    vec4.transformMat4(normal, shapeNormalVector, matrix);

    vec4.transformMat4(normal, normal, m);

    normal = vec3.fromValues(...normal);

    vec3.normalize(normal, normal);

    return [normal[0], normal[1], normal[2]];
  }

  getTextureCoordiantes(u, v) {
    return [u, v];
  }
}
