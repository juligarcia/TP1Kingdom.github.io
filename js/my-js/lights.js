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
  constructor(position, ambient, specular, r = 0.25) {
    const model = new Sphere(r);
    super(model);

    this.isLightSource = true;

    this.setTranslation(position);

    this.position = [0, 0, 0];
    this.ambient = ambient;
    this.specular = specular;

    this.id = pointLightCount.getCount();
    pointLightCount.increaseCount();

    this.setColor(specular);
  }

  init(m) {
    const p = gl.getUniformLocation(
      shaderProgram,
      `pLights[${this.id}].position`
    );
    const a = gl.getUniformLocation(
      shaderProgram,
      `pLights[${this.id}].ambient`
    );
    const s = gl.getUniformLocation(
      shaderProgram,
      `pLights[${this.id}].specular`
    );

    const auxPos = vec4.fromValues(...this.position, 1);

    vec4.transformMat4(auxPos, auxPos, m);

    gl.uniform3f(p, ...auxPos);
    gl.uniform3f(a, ...this.normalize(this.ambient));
    gl.uniform3f(s, ...this.normalize(this.specular));
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
  constructor(position, ambient, specular, theta, model) {
    super(model);

    this.position = position;
    this.ambient = ambient;
    this.specular = specular;
    this.theta = theta;

    this.id = spotLightCount.getCount();
    spotLightCount.increaseCount();

    this.setColor(specular);
  }
}
