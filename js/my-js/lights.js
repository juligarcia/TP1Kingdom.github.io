class LightCount {
  constructor(variableName) {
    this.count = 0;
    this.variableName = variableName;
  }

  getCount() {
    return this.count;
  }

  increaseCount() {
    this.count += 1;
  }

  setGLCount() {
    const p = gl.getUniformLocation(shaderProgram, this.variableName);

    gl.uniform1i(p, this.count);
  }
}

class PointLight extends Node3D {
  constructor(position, diffuse, specular, coefs, r = 0.25) {
    const model = new Sphere(r);
    super(model);

    this.coefs = coefs;

    this.setMaterial(new LightEmiter(diffuse));
    this.isLightSource = true;

    this.setTranslation(position);

    this.position = [0, 0, 0];
    this.diffuse = diffuse;
    this.specular = specular;

    this.id = pointLightCount.getCount();
    pointLightCount.increaseCount();
  }

  init(m) {
    const p = gl.getUniformLocation(
      shaderProgram,
      `pLights[${this.id}].position`
    );
    const d = gl.getUniformLocation(
      shaderProgram,
      `pLights[${this.id}].diffuse`
    );
    const s = gl.getUniformLocation(
      shaderProgram,
      `pLights[${this.id}].specular`
    );
    const c = gl.getUniformLocation(shaderProgram, `pLights[${this.id}].coefs`);

    const auxPos = vec4.fromValues(...this.position, 1);

    vec4.transformMat4(auxPos, auxPos, m);

    gl.uniform3f(p, ...auxPos);
    gl.uniform3f(d, ...this.normalize(this.diffuse));
    gl.uniform3f(s, ...this.normalize(this.specular));
    gl.uniform3f(c, ...this.coefs);
  }

  normalize(vec) {
    return vec.map((item) => item / 255);
  }
}

class DirectLight {
  constructor(direction, ambient, specular) {
    const d = gl.getUniformLocation(shaderProgram, `directLight.direction`);
    const a = gl.getUniformLocation(shaderProgram, `directLight.ambient`);
    const s = gl.getUniformLocation(shaderProgram, `directLight.specular`);

    gl.uniform3f(d, ...direction);
    gl.uniform3f(a, ...this.normalize(ambient));
    gl.uniform3f(s, ...this.normalize(specular));
  }

  normalize(vec) {
    return vec.map((item) => item / 255);
  }
}

class SpotLight extends Node3D {
  constructor(position, diffuse, specular, theta, coefs, r = 0.25, invert) {
    const model = new Sphere(r);
    super(model);

    this.coefs = coefs;

    this.invert = invert;

    this.setMaterial(new LightEmiter(diffuse));
    this.isLightSource = true;

    this.setTranslation(position);

    this.ambient = [0, 0, 0];
    this.position = [0, 0, 0];
    this.diffuse = diffuse;
    this.specular = specular;

    this.id = spotLightCount.getCount();
    spotLightCount.increaseCount();

    this.theta = theta;
  }

  init(m) {
    const p = gl.getUniformLocation(
      shaderProgram,
      `sLights[${this.id}].position`
    );

    const d = gl.getUniformLocation(
      shaderProgram,
      `sLights[${this.id}].diffuse`
    );

    const s = gl.getUniformLocation(
      shaderProgram,
      `sLights[${this.id}].specular`
    );

    const a = gl.getUniformLocation(
      shaderProgram,
      `sLights[${this.id}].ambient`
    );

    const c = gl.getUniformLocation(shaderProgram, `sLights[${this.id}].coefs`);

    const t = gl.getUniformLocation(shaderProgram, `sLights[${this.id}].theta`);

    const auxPos = vec4.fromValues(...this.position, 1);

    vec4.transformMat4(auxPos, auxPos, m);

    gl.uniform3f(p, ...[auxPos[0], this.invert ? -auxPos[1] : auxPos, auxPos[2]]);
    gl.uniform3f(a, ...this.normalize(this.ambient));
    gl.uniform3f(d, ...this.normalize(this.diffuse));
    gl.uniform3f(s, ...this.normalize(this.specular));
    gl.uniform3f(c, ...this.coefs);
    gl.uniform1f(t, this.theta);
  }

  normalize(vec) {
    return vec.map((item) => item / 255);
  }
}
