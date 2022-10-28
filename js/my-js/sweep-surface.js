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

    vec4.transformMat4(center, center, m);

    const normal = mat4.fromValues(...this.path[0].normal);

    mat4.mul(normal, normal, m);

    const tangent = vec3.fromValues(normal[8], normal[9], normal[10]);
    mat4.rotate(normal, normal, Math.PI / 2, tangent);

    const points = new Array(cols)
      .fill(0)
      .map(() => [...vec3.fromValues(...center)]);

    const normals = new Array(cols).fill(0).map(() => [...tangent]);

    return [points.flat(), normals.flat()];
  }

  getEndingLid(cols, m) {
    const center = vec4.fromValues(...this.path[this.path.length - 1].point, 1);

    vec4.transformMat4(center, center, m);

    const normal = mat4.fromValues(...this.path[this.path.length - 1].normal);

    const tangent = vec3.fromValues(normal[8], normal[9], normal[10]);
    mat4.rotate(normal, normal, -Math.PI / 2, tangent);

    vec3.negate(tangent, tangent);

    const points = new Array(cols)
      .fill(0)
      .map(() => [...vec3.fromValues(...center)]);

    const normals = new Array(cols).fill(0).map(() => [...tangent]);

    return [points.flat(), normals.flat()];
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

    if (this.closed && (v === 0 || v === 1)) {
      const tangent = vec3.fromValues(matrix[8], matrix[9], matrix[10]);
      mat4.rotate(matrix, matrix, v === 0 ? Math.PI / 2 : Math.PI / 2, tangent);
    }

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
