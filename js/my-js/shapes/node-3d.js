class Node3D {
  constructor(model = null) {
    this.model = model;
    this.transformMatrix = mat4.create();
    this.parent = null;
    this.isLightSource = false;

    this.glNode = new GLNode();

    this.color = null;

    this.rotX = 0;
    this.rotY = 0;
    this.rotZ = 0;

    this.trX = 0;
    this.trY = 0;
    this.trZ = 0;

    this.children = [];
  }

  normalizeColor(color) {
    return color.map((element) => element / 255);
  }

  preRender() {
    const ls = gl.getUniformLocation(shaderProgram, "isLightSource");
    gl.uniform1i(ls, this.isLightSource);
  }

  setColor(RGB) {
    this.color = RGB;

    return this;
  }

  setRotation(rotations) {
    this.rotX = rotations[0];
    this.rotY = rotations[1];
    this.rotZ = rotations[2];

    return this;
  }

  setTranslation(translations) {
    this.trX = translations[0];
    this.trY = translations[1];
    this.trZ = translations[2];

    return this;
  }

  addChildren(...children) {
    this.children = this.children.concat(children);

    children.forEach((child) => {
      child.parent = this;
    });

    return this;
  }

  transform(m) {
    mat4.multiply(this.transformMatrix, this.transformMatrix, m);

    return this;
  }

  getInitialTransform() {
    const initialTransform = mat4.create();

    mat4.translate(initialTransform, initialTransform, [
      this.trX,
      this.trY,
      this.trZ
    ]);

    mat4.rotateX(initialTransform, initialTransform, this.rotX);
    mat4.rotateY(initialTransform, initialTransform, this.rotY);
    mat4.rotateZ(initialTransform, initialTransform, this.rotZ);

    return initialTransform;
  }

  draw(parentTransform = mat4.create()) {
    this.preRender();

    const initialTransform = this.getInitialTransform();

    const transformMatrix = mat4.clone(this.transformMatrix);

    mat4.mul(transformMatrix, parentTransform, transformMatrix);
    mat4.mul(transformMatrix, transformMatrix, initialTransform);

    if (this.isLightSource) {
      this.init(transformMatrix);
    }

    if (this.model) {
      const mesh = this.buildMesh(
        this.model,
        transformMatrix,
        this.model.levels,
        this.model.pointsPerLevel
      );

      this.drawSelf(mesh);
    }

    this.children.forEach((child) => child.draw(transformMatrix));
  }

  getCenter() {
    let center = vec3.create();

    const m = mat4.create();

    if (this.parent) mat4.mul(m, m, this.parent.transformMatrix);

    mat4.mul(m, m, this.getInitialTransform());
    mat4.mul(m, m, this.transformMatrix);

    center = vec4.fromValues(...center, 1);

    vec4.transformMat4(center, center, m);

    return [center[0], center[1], center[2]];
  }

  buildMesh(surface, m, rows, cols) {
    let positionBuffer = [];
    let normalBuffer = [];
    let uvBuffer = [];

    for (let i = 0; i <= rows; i++) {
      for (let j = 0; j <= cols; j++) {
        const u = j / cols;
        const v = i / rows;

        positionBuffer.push(surface.getPosition(u, v, m));
        normalBuffer.push(surface.getNormal(u, v, m));
        uvBuffer.push(surface.getTextureCoordiantes(u, v));
      }
    }

    positionBuffer = positionBuffer.flat();
    normalBuffer = normalBuffer.flat();
    uvBuffer = uvBuffer.flat();

    if (surface.closed) {
      const startingLid = surface?.getStartingLid(cols + 1, m) || [];
      const endingLid = surface?.getEndingLid(cols + 1, m) || [];

      positionBuffer = [...startingLid[0], ...positionBuffer, ...endingLid[0]];
      normalBuffer = [...startingLid[1], ...normalBuffer, ...endingLid[1]];

      rows += 4;

      uvBuffer = [];

      for (let i = 0; i <= rows; i++) {
        for (let j = 0; j <= cols; j++) {
          const u = j / cols;
          const v = i / rows;

          uvBuffer.push([u, v]);
        }
      }

      uvBuffer = uvBuffer.flat();
    }

    let indexBuffer = [];

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const levelJump = cols + 1;
        const current = i * levelJump + j;

        indexBuffer.push([current, current + 1, current + levelJump]);

        indexBuffer.push([
          current + levelJump,
          current + 1,
          current + levelJump + 1
        ]);
      }
    }

    indexBuffer = indexBuffer.flat();

    // const webglPositionBuffer = this.glNode.createBuffer(positionBuffer, 3);
    // const webglNormalBuffer = this.glNode.createBuffer(normalBuffer, 3);
    // const webglUvsBuffer = this.glNode.createBuffer(uvBuffer, 2);
    // const webglIndexBuffer = this.glNode.createBuffer(indexBuffer, 1);

    const webglPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, webglPositionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(positionBuffer),
      gl.STATIC_DRAW
    );
    webglPositionBuffer.itemSize = 3;
    webglPositionBuffer.numItems = positionBuffer.length / 3;

    const webglNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, webglNormalBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(normalBuffer),
      gl.STATIC_DRAW
    );
    webglNormalBuffer.itemSize = 3;
    webglNormalBuffer.numItems = normalBuffer.length / 3;

    const webglUvsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, webglUvsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvBuffer), gl.STATIC_DRAW);
    webglUvsBuffer.itemSize = 2;
    webglUvsBuffer.numItems = uvBuffer.length / 2;

    const webglIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, webglIndexBuffer);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indexBuffer),
      gl.STATIC_DRAW
    );
    webglIndexBuffer.itemSize = 1;
    webglIndexBuffer.numItems = indexBuffer.length;

    return {
      webglPositionBuffer,
      webglNormalBuffer,
      webglUvsBuffer,
      webglIndexBuffer
    };
  }

  getParentColor() {
    if (this.parent) {
      const color = this.parent?.color;

      if (color) return color;

      return this.parent.getParentColor();
    }
  }

  drawSelf(mesh) {
    gl.uniform1i(shaderProgram.useLightingUniform, false);

    gl.uniform3f(shaderProgram.objectsColor, ...vec3.fromValues(1, 1, 1));

    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.webglPositionBuffer);
    gl.vertexAttribPointer(
      shaderProgram.vertexPositionAttribute,
      mesh.webglPositionBuffer.itemSize,
      gl.FLOAT,
      false,
      0,
      0
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.webglUvsBuffer);
    gl.vertexAttribPointer(
      shaderProgram.textureCoordAttribute,
      mesh.webglUvsBuffer.itemSize,
      gl.FLOAT,
      false,
      0,
      0
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.webglNormalBuffer);
    gl.vertexAttribPointer(
      shaderProgram.vertexNormalAttribute,
      mesh.webglNormalBuffer.itemSize,
      gl.FLOAT,
      false,
      0,
      0
    );

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.webglIndexBuffer);

    // if (modo !== "wireframe") {
    gl.uniform1i(shaderProgram.useLightingUniform, true);

    gl.uniform1f(shaderProgram.ks, 0.1);
    gl.uniform1f(shaderProgram.kd, 0.2);
    gl.uniform1f(shaderProgram.ka, 1);
    gl.uniform1f(shaderProgram.shininess, 0.1);
    gl.uniform3f(
      shaderProgram.materialColor,
      ...this.normalizeColor(
        this.color || this.getParentColor() || vec3.create()
      )
    );

    gl.drawElements(
      gl.TRIANGLES,
      mesh.webglIndexBuffer.numItems,
      gl.UNSIGNED_SHORT,
      0
    );
    // }

    // if (modo !== "smooth" && modo !== "normalMap") {
    //   gl.drawElements(
    //     gl.LINE_STRIP,
    //     mesh.webglIndexBuffer.numItems,
    //     gl.UNSIGNED_SHORT,
    //     0
    //   );
    // }
  }
}
