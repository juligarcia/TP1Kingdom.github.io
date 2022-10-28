class Circular extends Path {
  constructor(plain = "xz", radius = 0) {
    super(plain);
    this.radius = radius;
    this.rotation = plain === "xy" ? Math.PI / 2 : 0;
  }

  eval(u) {
    const point = vec3.fromValues(
      ...[
        this.radius * Math.cos(2 * Math.PI * u),
        0,
        this.radius * Math.sin(2 * Math.PI * u)
      ]
    );
1
    return this.rotate(point);
  }

  rotate(vec) {
    let rotated = vec4.fromValues(...vec, 1);
    const rotation = mat4.create();

    mat4.rotateX(rotation, rotation, this.rotation);

    vec4.transformMat4(rotated, rotated, rotation);

    return vec3.fromValues(...rotated);
  }

  tangent(u) {
    let tangent = vec3.fromValues(
      ...[Math.sin(2 * Math.PI * u), 0, Math.cos(2 * Math.PI * u)]
    );

    tangent = this.rotate(tangent);

    vec3.normalize(tangent, tangent);

    return tangent;
  }

  normal(u) {
    const tangent = this.tangent(u);

    let normal = vec3.create();

    vec3.cross(normal, tangent, [0, 1, 0]);

    normal = this.rotate(normal);

    vec3.normalize(normal, normal);

    return normal;
  }

  build(divisions) {
    const build = [];
    const step = 1 / divisions;

    for (let i = 0; i <= divisions; i++) {
      build.push({
        point: this.eval(i * step),
        normal: this.evalNormalMatrix(i * step, step)
      });
    }

    return build;
  }
}
