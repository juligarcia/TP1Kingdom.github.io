class GLNode {
  createBuffer(buffer, itemSize) {
    const GLBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, GLBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(buffer), gl.STATIC_DRAW);
    GLBuffer.itemSize = itemSize;
    GLBuffer.numItems = buffer.length / itemSize;

    return GLBuffer;
  }
}
