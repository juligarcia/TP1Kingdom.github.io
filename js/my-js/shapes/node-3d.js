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
    let binormalBuffer = [];
    let tangentBuffer = [];
    let uvBuffer = [];

    for (let i = 0; i <= rows; i++) {
      for (let j = 0; j <= cols; j++) {
        const u = j / cols;
        const v = i / rows;

        positionBuffer.push(surface.getPosition(u, v, m));
        normalBuffer.push(surface.getNormal(u, v, m));
        binormalBuffer.push(surface.getBinormal(u, v, m));
        tangentBuffer.push(surface.getTangent(u, v, m));
        uvBuffer.push(surface.getTextureCoordiantes(u, v));
      }
    }

    positionBuffer = positionBuffer.flat();
    normalBuffer = normalBuffer.flat();
    tangentBuffer = tangentBuffer.flat();
    binormalBuffer = binormalBuffer.flat();
    uvBuffer = uvBuffer.flat();

    if (surface.closed) {
      const startingLid = surface?.getStartingLid(cols + 1, m) || [];
      const endingLid = surface?.getEndingLid(cols + 1, m) || [];

      positionBuffer = [...startingLid[0], ...positionBuffer, ...endingLid[0]];
      normalBuffer = [...startingLid[1], ...normalBuffer, ...endingLid[1]];
      binormalBuffer = [...startingLid[2], ...binormalBuffer, ...endingLid[2]];
      tangentBuffer = [...startingLid[3], ...tangentBuffer, ...endingLid[3]];
      uvBuffer = [...startingLid[4], ...uvBuffer, ...endingLid[4]];

      rows += 4;
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

    const webglBinormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, webglBinormalBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(binormalBuffer),
      gl.STATIC_DRAW
    );
    webglBinormalBuffer.itemSize = 3;
    webglBinormalBuffer.numItems = binormalBuffer.length / 3;

    const webglTangentBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, webglTangentBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(tangentBuffer),
      gl.STATIC_DRAW
    );
    webglTangentBuffer.itemSize = 3;
    webglTangentBuffer.numItems = tangentBuffer.length / 3;

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
      webglIndexBuffer,
      webglBinormalBuffer,
      webglTangentBuffer
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

    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.webglBinormalBuffer);
    gl.vertexAttribPointer(
      shaderProgram.vertexBinormalAttribute,
      mesh.webglBinormalBuffer.itemSize,
      gl.FLOAT,
      false,
      0,
      0
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.webglTangentBuffer);
    gl.vertexAttribPointer(
      shaderProgram.vertexTangentAttribute,
      mesh.webglTangentBuffer.itemSize,
      gl.FLOAT,
      false,
      0,
      0
    );

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.webglIndexBuffer);

    if (!!RenderingModeConfig[myGUI.get("Rendering Mode")]?.smooth) {
      const material = this.getMaterial();

      if (material) {
        material.setGLColors(this.color);
        material.setTextures();
      }

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
  constructor({
    ka = 0.0,
    kd = 0.0,
    ks = 0.0,
    shininess = 1.0,
    color = [0, 0, 0],
    texture = null,
    normalMap = null
  }) {
    this.ka = ka;
    this.kd = kd;
    this.ks = ks;
    this.shininess = shininess;
    this.color = color;
    this.texture = texture;
    this.normalMap = normalMap;
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

  setTextures() {
    const hasTextures = gl.getUniformLocation(shaderProgram, "hasTextures");

    if (this.texture && this.normalMap) {
      gl.uniform1i(hasTextures, 1);

      const normalMapSampler = gl.getUniformLocation(
        shaderProgram,
        "normalMapSampler"
      );

      const textureSampler = gl.getUniformLocation(
        shaderProgram,
        "textureSampler"
      );

      gl.uniform1i(normalMapSampler, 0);
      gl.uniform1i(textureSampler, 1);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, textures[this.normalMap]);

      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, textures[this.texture]);
      return;
    }

    gl.uniform1i(hasTextures, 0);
  }
}

class Stone extends Material {
  constructor() {
    super({
      ka: 0.3,
      kd: 0.7,
      ks: 0.0,
      shininess: 0.1,
      color: [122, 122, 122],
      texture: "/textures/stone-wall2-t.jpg",
      normalMap: "/textures/stone-wall2-nm.jpg"
    });
  }
}

class RoofTile extends Material {
  constructor() {
    super({
      ka: 0.1,
      kd: 0.7,
      ks: 1.0,
      shininess: 1.5,
      color: [83, 83, 198],
      texture: "/textures/tiles-t.jpg",
      normalMap: "/textures/tiles-nm.jpg"
    });
  }
}

class Wood extends Material {
  constructor() {
    super({
      ka: 0.1,
      kd: 0.7,
      ks: 0.1,
      shininess: 0.1,
      color: [172, 133, 62],
      texture: "/textures/wood-t.jpg",
      normalMap: "/textures/wood-nm.jpg"
    });
  }
}

class Water extends Material {
  constructor() {
    super({
      ka: 0.1,
      kd: 0.5,
      ks: 0.5,
      shininess: 2.0,
      color: [0, 153, 255],
      texture: "/textures/water-t.jpg",
      normalMap: "/textures/water-nm.jpg"
    });
  }
}

class Glass extends Material {
  constructor() {
    super({
      ka: 0.5,
      kd: 0.7,
      ks: 0.7,
      shininess: 2.0,
      color: [184, 228, 242]
    });
  }
}

class Grass extends Material {
  constructor() {
    super({
      ka: 0.7,
      kd: 0.7,
      ks: 0.0,
      shininess: 0.1,
      color: [51, 204, 51],
      texture: "/textures/grass2-t.jpg",
      normalMap: "/textures/grass2-nm.jpg"
    });
  }
}

class CastleTerrain extends Material {
  constructor() {
    super({
      ka: 0.7,
      kd: 0.7,
      ks: 0.0,
      shininess: 0.1,
      color: [51, 204, 51],
      texture: "/textures/grass2-t.jpg",
      normalMap: "/textures/grass2-nm.jpg"
    });
  }
}

class LightEmiter extends Material {
  constructor(color) {
    super({ ka: 0.0, kd: 100.0, ks: 0.0, shininess: 100.0, color });
  }
}
