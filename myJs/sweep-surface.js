class SweepSurface {
  constructor(shape, path, closed) {
    this.shape = shape;
    this.pointsPerLevel = shape.length - 1;

    this.path = path;
    this.levels = path.length - 1;

    this.closed = closed;
  }

  getCenter() {
    const center = this.path.reduce((acc, curr) => {
      acc.add(acc, acc, vec3.fromValues(...curr.point));
    }, vec3.create());

    vec3.scale(center, center, 1 / this.path.len);

    console.log({ center });

    return center;
  }

  getPosition(u, v, m) {
    let vec = vec3.fromValues(...this.path[Math.round(v * this.levels)].point);

    let position = vec4.create();

    const matrix = mat4.create();

    mat4.translate(matrix, matrix, vec);
    mat4.mul(matrix, matrix, this.path[Math.round(v * this.levels)].normal);

    const shapePoint = vec4.fromValues(
      ...this.shape[Math.round(u * this.pointsPerLevel)].point,
      1
    );

    vec4.transformMat4(position, shapePoint, matrix);

    vec4.transformMat4(position, position, m);

    return [position[0], position[1], position[2]];
  }

  norm(vec) {
    return Math.sqrt(vec.map((x) => Math.pow(x, 2)).reduce((a, b) => a + b, 0));
  }

  getNormal(u, v, m) {
    let normal = vec4.create();

    const matrix = mat4.create();

    mat4.mul(matrix, matrix, this.path[Math.round(v * this.levels)].normal);

    const shapeNormalMatrix =
      this.shape[Math.round(u * this.pointsPerLevel)].normal;

    const shapeNormalVector = vec4.fromValues(
      shapeNormalMatrix[0],
      shapeNormalMatrix[1],
      shapeNormalMatrix[2],
      0
    );

    vec4.transformMat4(normal, shapeNormalVector, matrix);

    vec4.transformMat4(normal, normal, m);

    return [normal[0], normal[1], normal[2]];
  }

  getTextureCoordiantes(u, v) {
    return [u, v];
  }
}
