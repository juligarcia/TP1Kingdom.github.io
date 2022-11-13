class GLNode {
  createBuffer(buffer, type, itemSize) {
    const GLBuffer = gl.createBuffer();
    gl.bindBuffer(type, GLBuffer);
    gl.bufferData(type, new Float32Array(buffer), gl.STATIC_DRAW);
    GLBuffer.itemSize = itemSize;

    GLBuffer.numItems = buffer.length / itemSize;

    return GLBuffer;
  }
}
