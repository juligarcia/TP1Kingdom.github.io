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

    let normal = vec4.fromValues(normalMat[0], normalMat[1], normalMat[2], 0);
    let binormal = vec4.fromValues(normalMat[4], normalMat[5], normalMat[6], 0);
    let tangent = vec4.fromValues(normalMat[8], normalMat[9], normalMat[10], 0);

    vec4.transformMat4(tangent, tangent, m);
    vec4.transformMat4(normal, normal, m);
    vec4.transformMat4(binormal, binormal, m);

    tangent = vec3.fromValues(...tangent);

    vec3.negate(tangent, tangent);

    const points = new Array(cols)
      .fill(0)
      .map(() => [...vec3.fromValues(...center)]);

    const normals = new Array(cols)
      .fill(0)
      .map(() => [...vec3.fromValues(...tangent)]);

    const tangents = new Array(cols)
      .fill(0)
      .map(() => [...vec3.fromValues(...normal)]);

    const binormals = new Array(cols)
      .fill(0)
      .map(() => [...vec3.fromValues(...binormal)]);

    return [
      [...points.flat(), ...shape.flat()],
      [...normals.flat(), ...normals.flat()],
      [...binormals.flat(), ...binormals.flat()],
      [...tangents.flat(), ...tangents.flat()]
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

    let normal = vec4.fromValues(normalMat[0], normalMat[1], normalMat[2], 0);
    let binormal = vec4.fromValues(normalMat[4], normalMat[5], normalMat[6], 0);
    let tangent = vec4.fromValues(normalMat[8], normalMat[9], normalMat[10], 0);

    vec4.transformMat4(tangent, tangent, m);
    vec4.transformMat4(normal, normal, m);
    vec4.transformMat4(binormal, binormal, m);

    tangent = vec3.fromValues(...tangent);

    const points = new Array(cols)
      .fill(0)
      .map(() => [...vec3.fromValues(...center)]);

    const normals = new Array(cols).fill(0).map(() => [...tangent]);

    const binormals = new Array(cols)
      .fill(0)
      .map(() => [...vec3.fromValues(...binormal)]);

    const tangents = new Array(cols)
      .fill(0)
      .map(() => [...vec3.fromValues(...normal)]);

    return [
      [...shape.flat(), ...points.flat()],
      [...normals.flat(), ...normals.flat()],
      [...binormals.flat(), ...binormals.flat()],
      [...tangents.flat(), ...tangents.flat()]
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

  getBinormal(u, v, m) {
    let binormal = vec4.create();

    const matrix = mat4.fromValues(
      ...this.path[Math.round(v * this.levels)].normal
    );

    const shapeNormalMatrix =
      this.shape[Math.round(u * this.pointsPerLevel)].normal;

    let shapeBinormalVector = vec4.fromValues(
      shapeNormalMatrix[4],
      shapeNormalMatrix[5],
      shapeNormalMatrix[6],
      0
    );

    vec4.transformMat4(binormal, shapeBinormalVector, matrix);

    vec4.transformMat4(binormal, binormal, m);

    binormal = vec3.fromValues(...binormal);

    vec3.normalize(binormal, binormal);

    return [binormal[0], binormal[1], binormal[2]];
  }

  getTangent(u, v, m) {
    let tangent = vec4.create();

    const matrix = mat4.create();

    mat4.mul(matrix, matrix, this.path[Math.round(v * this.levels)].normal);

    const shapeNormalMatrix =
      this.shape[Math.round(u * this.pointsPerLevel)].normal;

    let shapeTangentVector = vec4.fromValues(
      shapeNormalMatrix[8],
      shapeNormalMatrix[9],
      shapeNormalMatrix[10],
      0
    );

    vec4.transformMat4(tangent, shapeTangentVector, matrix);

    vec4.transformMat4(tangent, tangent, m);

    tangent = vec3.fromValues(...tangent);

    vec3.normalize(tangent, tangent);

    return [tangent[0], tangent[1], tangent[2]];
  }

  getTextureCoordiantes(u, v) {
    return [u, v];
  }
}
