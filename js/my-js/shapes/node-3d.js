class Node3D {
  constructor(model = null) {
    this.model = model;
    this.transformMatrix = mat4.create();
    this.parent = null;
    this.isLightSource = false;
    this.lightType = null;

    this.glNode = new GLNode();

    this.color = null;
    this.material = this.rotX = 0;
    this.rotY = 0;
    this.rotZ = 0;

    this.trX = 0;
    this.trY = 0;
    this.trZ = 0;

    this.nodeId = null;

    this.children = [];

    this.shouldRecalculate = true;
    this.buffers = null;
  }

  preRender() {
    const ls = gl.getUniformLocation(shaderProgram, "isLightSource");
    const spot = gl.getUniformLocation(shaderProgram, "isSpotLight");
    const point = gl.getUniformLocation(shaderProgram, "isPointLight");

    gl.uniform1i(ls, this.isLightSource);
    gl.uniform1i(spot, this.lightType === "spot");
    gl.uniform1i(point, this.lightType === "point");
  }

  setColor(RGB) {
    this.color = RGB;

    return this;
  }

  setMaterial(material) {
    this.material = material;

    return this;
  }

  setRotation(rotations) {
    this.recalculate(true);

    this.rotX = rotations[0];
    this.rotY = rotations[1];
    this.rotZ = rotations[2];

    return this;
  }

  setTranslation(translations) {
    this.recalculate(true);

    this.trX = translations[0];
    this.trY = translations[1];
    this.trZ = translations[2];

    return this;
  }

  recalculateLights() {
    this.children.forEach((child) => {
      if (child.isLightSource) child.recalculate(true);
      else child.recalculateLights();
    });
  }

  addChildren(...children) {
    this.children = this.children.concat(children);

    children.forEach((child) => {
      child.parent = this;
    });

    return this;
  }

  setId(id) {
    if (!id) return this;

    this.nodeId = id;

    return this;
  }

  removeChild(id) {
    if (!id) return;

    this.children = this.children.filter((child) => {
      if (child.nodeId) return child.nodeId !== id;

      return true;
    });
  }

  transform(m) {
    this.shouldRecalculate = true;

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

    if (!this.model && this.shouldRecalculate) this.shouldRecalculate = false;

    const initialTransform = this.getInitialTransform();

    const transformMatrix = mat4.clone(this.transformMatrix);

    mat4.mul(transformMatrix, parentTransform, transformMatrix);
    mat4.mul(transformMatrix, transformMatrix, initialTransform);

    if (this.isLightSource) this.init(transformMatrix);

    const model = this.model?.generateSurface?.() || this.model;

    if (model) {
      const mesh = this.buildMesh(
        model,
        transformMatrix,
        model.levels,
        model.pointsPerLevel
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

  recalculate(should) {
    if (should) {
      this.shouldRecalculate = should;
      this.children.forEach((child) => child.recalculate(should));
    }

    return this;
  }

  buildMesh(surface, m, rows, cols) {
    if (this.shouldRecalculate) {
      this.shouldRecalculate = false;
    } else return this.buffers;

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

    // const webglPositionBuffer = this.glNode.createBuffer(
    //   new Float32Array(positionBuffer),
    //   gl.ARRAY_BUFFER,
    //   3
    // );

    // const webglNormalBuffer = this.glNode.createBuffer(
    //   new Float32Array(normalBuffer),
    //   gl.ARRAY_BUFFER,
    //   3
    // );

    // const webglUvsBuffer = this.glNode.createBuffer(
    //   new Float32Array(uvBuffer),
    //   gl.ARRAY_BUFFER,
    //   2
    // );

    // const webglIndexBuffer = this.glNode.createBuffer(
    //   new Uint16Array(indexBuffer),
    //   gl.ELEMENT_ARRAY_BUFFER,
    //   1
    // );

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

    this.buffers = {
      webglPositionBuffer,
      webglNormalBuffer,
      webglUvsBuffer,
      webglIndexBuffer
    };

    return this.buffers;
  }

  getMaterial() {
    if (this.material) return this.material;
    if (this.parent) return this.parent.material || this.parent.getMaterial();
  }

  drawSelf(mesh) {
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

    if (!!RenderingModeConfig[myGUI.get("Rendering Mode")]?.smooth) {
      const material = this.getMaterial();

      if (material) material.setGLColors(this.color);

      gl.drawElements(
        gl.TRIANGLES,
        mesh.webglIndexBuffer.numItems,
        gl.UNSIGNED_SHORT,
        0
      );
    }

    if (!!RenderingModeConfig[myGUI.get("Rendering Mode")]?.grid) {
      gl.drawElements(
        gl.LINE_STRIP,
        mesh.webglIndexBuffer.numItems,
        gl.UNSIGNED_SHORT,
        0
      );
    }
  }
}

class Material {
  constructor(ka, kd, ks, shininess, color) {
    this.ka = ka;
    this.kd = kd;
    this.ks = ks;
    this.shininess = shininess;
    this.color = color;
  }

  normalizeColor(color) {
    return color.map((element) => element / 255);
  }

  setGLColors(replaceColor) {
    gl.uniform1f(shaderProgram.ks, this.ks);
    gl.uniform1f(shaderProgram.kd, this.kd);
    gl.uniform1f(shaderProgram.ka, this.ka);
    gl.uniform1f(shaderProgram.shininess, this.shininess);
    gl.uniform3f(
      shaderProgram.materialColor,
      ...this.normalizeColor(replaceColor || this.color)
    );
  }
}

class Stone extends Material {
  constructor(color = [217, 217, 217]) {
    super(0.1, 0.5, 0.1, 1, color);
  }
}

class RoofTile extends Material {
  constructor() {
    super(0.1, 0.7, 1.0, 1.5, [83, 83, 198]);
  }
}

class Wood extends Material {
  constructor(color) {
    super(0.1, 0.7, 0.1, 0.1, color);
  }
}

class Water extends Material {
  constructor(color) {
    super(0.1, 0.5, 0.5, 1.0, color);
  }
}

class Grass extends Material {
  constructor(color) {
    super(0.1, 0.7, 0.0, 0.1, color);
  }
}

class LightEmiter extends Material {
  constructor(color) {
    super(0.0, 100.0, 0.0, 100.0, color);
  }
}
