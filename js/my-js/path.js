class Path {
  constructor(plane = "xy", closed) {
    this.closed = closed;
    this.cross =
      plane === "xz" ? vec3.fromValues(0, 1, 0) : vec3.fromValues(0, 0, -1);
  }

  tangent(u, delta) {
    const eval1 = this.eval(u);
    const invert = u === 1;
    const deltaT = invert ? -2 * delta : delta;

    let eval2 = null;

    if (this.closed) eval2 = this.eval(delta);
    else eval2 = this.eval(u + deltaT);

    const tangent = vec3.create();

    if (invert && !this.closed) vec3.sub(tangent, eval1, eval2);
    else vec3.sub(tangent, eval2, eval1);

    vec3.normalize(tangent, tangent);

    return [tangent[0], tangent[1], tangent[2]];
  }

  normal(u, delta) {
    const tangent = this.tangent(u, delta);

    let normal = vec3.create();

    vec3.cross(normal, tangent, this.cross);

    vec3.normalize(normal, normal);

    return [normal[0], normal[1], normal[2]];
  }

  binormal(tangent, normal) {
    const binormal = vec3.create();

    vec3.cross(binormal, normal, tangent);

    vec3.normalize(binormal, binormal);

    return binormal;
  }

  evalNormalMatrix(u, delta) {
    const tangent = this.tangent(u, delta);
    const normal = this.normal(u, delta);
    const binormal = this.binormal(tangent, normal);
    const position = this.eval(u);

    const normalMatrix = mat4.fromValues(
      ...normal,
      0,
      ...binormal,
      0,
      ...tangent,
      0,
      ...position,
      1
    );

    return normalMatrix;
  }
}
