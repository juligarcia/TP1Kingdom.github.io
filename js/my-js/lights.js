class LightCount {
  constructor(variableName) {
    this.count = 0;
    this.variableName = variableName;
  }

  set(id) {
    if (id > this.count) {
      this.count = id;
    }
  }

  setGLCount() {
    const p = gl.getUniformLocation(shaderProgram, this.variableName);

    console.log(this.count);

    gl.uniform1i(p, this.count + 1);
  }
}

class PointLight extends Node3D {
  constructor(position, coefs, r = 0.25, id) {
    const model = new Sphere(r);
    super(model);

    this.coefs = coefs;

    this.lightType = "point";
    this.isLightSource = !!this.lightType;

    this.setTranslation(position);

    this.position = [0, 0, 0];

    this.id = id;
    pointLightCount.set(id);
  }

  preRender() {
    super.preRender();
    this.setMaterial(new LightEmiter(myGUI.getColor("Point Light Diffuse")));
  }

  init(m) {
    const a = gl.getUniformLocation(
      shaderProgram,
      `pLights[${this.id}].ambient`
    );

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
    gl.uniform3f(d, ...myGUI.getColor("Point Light Diffuse"));
    gl.uniform3f(s, ...myGUI.getColor("Point Light Specular"));
    gl.uniform3f(a, ...myGUI.getColor("Point Light Ambient"));
    gl.uniform3f(c, ...this.coefs);
  }

  normalize(vec) {
    return vec.map((item) => item / 255);
  }
}

class DirectLight extends Node3D {
  constructor(direction) {
    super();

    this.lightType = "direct";
    this.isLightSource = !!this.lightType;

    this.direction = direction;
  }

  init() {
    const ambient = myGUI.getColor("Direct Light Ambient");
    const diffuse = myGUI.getColor("Direct Light Diffuse");
    const specular = myGUI.getColor("Direct Light Specular");

    const d = gl.getUniformLocation(shaderProgram, `directLight.direction`);
    const a = gl.getUniformLocation(shaderProgram, `directLight.ambient`);
    const dif = gl.getUniformLocation(shaderProgram, `directLight.diffuse`);
    const s = gl.getUniformLocation(shaderProgram, `directLight.specular`);

    gl.uniform3f(d, ...this.direction);
    gl.uniform3f(a, ...ambient);
    gl.uniform3f(s, ...specular);
    gl.uniform3f(dif, ...diffuse);
  }
}

class SpotLight extends Node3D {
  constructor(position, theta, coefs, r = 0.25, id) {
    const model = new Sphere(r);
    super(model);

    this.coefs = coefs;

    this.lightType = "spot";
    this.isLightSource = !!this.lightType;

    this.setTranslation(position);

    this.position = [0, 0, 0];

    this.id = id;
    spotLightCount.set(id);

    this.theta = theta;
  }

  preRender() {
    super.preRender();
    this.setMaterial(new LightEmiter(myGUI.getColor("Spot Light Diffuse")));
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

    gl.uniform3f(p, ...auxPos);
    gl.uniform3f(a, ...myGUI.getColor("Spot Light Ambient"));
    gl.uniform3f(d, ...myGUI.getColor("Spot Light Diffuse"));
    gl.uniform3f(s, ...myGUI.getColor("Spot Light Specular"));
    gl.uniform3f(c, ...this.coefs);
    gl.uniform1f(t, this.theta);
  }

  normalize(vec) {
    return vec.map((item) => item / 255);
  }
}
