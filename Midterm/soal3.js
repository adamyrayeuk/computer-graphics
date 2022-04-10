"use strict";

var canvas;
var gl;

var primitiveType;
var offset = 0;
var count = 10000;

var translation = [400, 300, 0]; // default translation
var rotation = [degToRad(40), degToRad(25), degToRad(325)]; // default rotation for oxygen

// Rotasi hydrogen
var r = 150;
var theta = 30;
var phi = 210;

var matrix;
var matrixLocation;
var colorUniformLocation;

window.onload = function init() {
  canvas = document.getElementById("gl-canvas");

  gl = canvas.getContext('webgl2');
  if (!gl) alert("WebGL 2.0 isn't available");

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  gl.enable(gl.CULL_FACE); //enable depth buffer
  gl.enable(gl.DEPTH_TEST);

  //  Load shaders and initialize attribute buffers
  var program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  // Load the data into the GPU
  var positionBuffer1 = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer1);

  var positionLocation = gl.getAttribLocation(program, "aPosition");
  gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(positionLocation);

  colorUniformLocation = gl.getUniformLocation(program, "uColor");

  matrixLocation = gl.getUniformLocation(program, "uMatrix");

  primitiveType = gl.TRIANGLES;
  render();
};

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  drawHidrogen1();
  drawHidrogen2();
  drawOxygen();
  requestAnimationFrame(render);
}

function drawHidrogen1() {
  count = 36;
  setGeometry(gl, 1);

  // Update nilai theta 
  theta = (theta + 0.01) % 181;
  
  // Setelah satu putaran, geser hydrogen
  if (Math.sin(theta).toFixed(3) < -0.998 && Math.cos(theta).toFixed(3) < 0.005) {
    console.log("masuk")
    phi = (phi - 0.1) % 360;
  }

  // Hitung posisi x,y,z saat ini
  var x = r * Math.cos(phi) * Math.sin(theta);
  var y = r * Math.sin(phi) * Math.sin(theta);
  var z = r * Math.cos(theta);

  matrix = m4.projection(gl.canvas.clientWidth, gl.canvas.clientHeight, 400);
  matrix = m4.translate(matrix, translation[0] - x, translation[1] + y, translation[2] - z);

  gl.uniform4f(colorUniformLocation, 0, 1.0, 0, 1);

  gl.uniformMatrix4fv(matrixLocation, false, matrix);

  gl.drawArrays(primitiveType, offset, count);
}

function drawHidrogen2() {
  count = 36;
  setGeometry(gl, 1);

   // Hitung posisi x,y,z saat ini
  var x = r * Math.cos(phi) * Math.sin(theta);
  var y = r * Math.sin(phi) * Math.sin(theta);
  var z = r * Math.cos(theta);
  matrix = m4.projection(gl.canvas.clientWidth, gl.canvas.clientHeight, 400);
  matrix = m4.translate(matrix, translation[0] + x, translation[1] + y, translation[2] + z);

  gl.uniform4f(colorUniformLocation, 0, 1.0, 0, 1);

  gl.uniformMatrix4fv(matrixLocation, false, matrix);

  gl.drawArrays(primitiveType, offset, count);
}

function drawOxygen() {
  count = 36;
  setGeometry(gl, 2);

  // Rotasi oxygen
  rotation[1] += 0.005

  matrix = m4.projection(gl.canvas.clientWidth, gl.canvas.clientHeight, 400);
  matrix = m4.translate(matrix, translation[0], translation[1], translation[2]);
  matrix = m4.xRotate(matrix, rotation[0]);
  matrix = m4.yRotate(matrix, rotation[1]);
  matrix = m4.zRotate(matrix, rotation[2]);

  gl.uniform4f(colorUniformLocation, 0, 0, 1.0, 1);

  gl.uniformMatrix4fv(matrixLocation, false, matrix);

  gl.drawArrays(primitiveType, offset, count);
}

function radToDeg(r) {
  return r * 180 / Math.PI;
}

function degToRad(d) {
  return d * Math.PI / 180;
}

var m4 = {

  projection: function (width, height, depth) {
    // Note: This matrix flips the Y axis so 0 is at the top.
    return [
      2 / width, 0, 0, 0,
      0, -2 / height, 0, 0,
      0, 0, 2 / depth, 0,
      -1, 1, 0, 1,
    ];
  },

  multiply: function (a, b) {
    var a00 = a[0 * 4 + 0];
    var a01 = a[0 * 4 + 1];
    var a02 = a[0 * 4 + 2];
    var a03 = a[0 * 4 + 3];
    var a10 = a[1 * 4 + 0];
    var a11 = a[1 * 4 + 1];
    var a12 = a[1 * 4 + 2];
    var a13 = a[1 * 4 + 3];
    var a20 = a[2 * 4 + 0];
    var a21 = a[2 * 4 + 1];
    var a22 = a[2 * 4 + 2];
    var a23 = a[2 * 4 + 3];
    var a30 = a[3 * 4 + 0];
    var a31 = a[3 * 4 + 1];
    var a32 = a[3 * 4 + 2];
    var a33 = a[3 * 4 + 3];
    var b00 = b[0 * 4 + 0];
    var b01 = b[0 * 4 + 1];
    var b02 = b[0 * 4 + 2];
    var b03 = b[0 * 4 + 3];
    var b10 = b[1 * 4 + 0];
    var b11 = b[1 * 4 + 1];
    var b12 = b[1 * 4 + 2];
    var b13 = b[1 * 4 + 3];
    var b20 = b[2 * 4 + 0];
    var b21 = b[2 * 4 + 1];
    var b22 = b[2 * 4 + 2];
    var b23 = b[2 * 4 + 3];
    var b30 = b[3 * 4 + 0];
    var b31 = b[3 * 4 + 1];
    var b32 = b[3 * 4 + 2];
    var b33 = b[3 * 4 + 3];
    return [
      b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
      b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
      b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
      b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
      b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
      b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
      b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
      b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
      b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
      b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
      b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
      b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
      b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
      b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
      b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
      b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
    ];
  },

  translation: function (tx, ty, tz) {
    return [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      tx, ty, tz, 1,
    ];
  },

  xRotation: function (angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    return [
      1, 0, 0, 0,
      0, -c, s, 0,
      0, -s, -c, 0,
      0, 0, 0, 1,
    ];
  },

  yRotation: function (angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    return [
      -c, 0, s, 0,
      0, 1, 0, 0,
      -s, 0, -c, 0,
      0, 0, 0, 1,
    ];
  },

  zRotation: function (angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    return [
      c, s, 0, 0,
      -s, c, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ];
  },

  scaling: function (sx, sy, sz) {
    return [
      sx, 0, 0, 0,
      0, sy, 0, 0,
      0, 0, sz, 0,
      0, 0, 0, 1,
    ];
  },

  translate: function (m, tx, ty, tz) {
    return m4.multiply(m, m4.translation(tx, ty, tz));
  },

  xRotate: function (m, angleInRadians) {
    return m4.multiply(m, m4.xRotation(angleInRadians));
  },

  yRotate: function (m, angleInRadians) {
    return m4.multiply(m, m4.yRotation(angleInRadians));
  },

  zRotate: function (m, angleInRadians) {
    return m4.multiply(m, m4.zRotation(angleInRadians));
  },

  scale: function (m, sx, sy, sz) {
    return m4.multiply(m, m4.scaling(sx, sy, sz));
  },

};

function setGeometry(gl, shape) {
  switch (shape) {
    case 1:
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
          // Hidrogen
          15, -15, -15,
          -15, -15, -15,
          -15, 15, -15,
          15, -15, -15,
          -15, 15, -15,
          15, 15, -15,

          -15, -15, -15,
          -15, -15, 15,
          -15, 15, 15,
          -15, -15, -15,
          -15, 15, 15,
          -15, 15, -15,

          15, 15, -15,
          -15, 15, -15,
          -15, 15, 15,
          15, 15, -15,
          -15, 15, 15,
          15, 15, 15,

          15, -15, -15,
          15, 15, -15,
          15, 15, 15,
          15, -15, -15,
          15, 15, 15,
          15, -15, 15,

          15, -15, 15,
          15, 15, 15,
          -15, 15, 15,
          15, -15, 15,
          -15, 15, 15,
          -15, -15, 15,

          15, -15, -15,
          15, -15, 15,
          -15, -15, 15,
          15, -15, -15,
          -15, -15, 15,
          -15, -15, -15
        ]),
        gl.STATIC_DRAW);
      break;
    case 2:
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
          // Oksigen
          -60, -60, 60,
          60, -60, 60,
          60, 60, 60,
          -60, -60, 60,
          60, 60, 60,
          -60, 60, 60,

          60, -60, 60,
          60, -60, -60,
          60, 60, -60,
          60, -60, 60,
          60, 60, -60,
          60, 60, 60,

          -60, 60, 60,
          60, 60, 60,
          60, 60, -60,
          -60, 60, 60,
          60, 60, -60,
          -60, 60, -60,

          -60, -60, 60,
          -60, 60, 60,
          -60, 60, -60,
          -60, -60, 60,
          -60, 60, -60,
          -60, -60, -60,

          -60, -60, -60,
          -60, 60, -60,
          60, 60, -60,
          -60, -60, -60,
          60, 60, -60,
          60, -60, -60,

          -60, -60, 60,
          -60, -60, -60,
          60, -60, -60,
          -60, -60, 60,
          60, -60, -60,
          60, -60, 60
        ]),
        gl.STATIC_DRAW);
      break;
  }
}