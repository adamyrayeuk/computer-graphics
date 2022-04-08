"use strict";

var canvas;
var gl;

var vertices = [
    // Shape 1 (trapezoid)
    vec2(-0.8, 0.2),            // 0
    vec2(-0.2, 0.2),            // 1
    vec2(-0.7, 0.5),            // 2
    vec2(-0.3, 0.5),            // 3

    // Shape 2 (Square)
    vec2(0.2, 0.2),             // 4
    vec2(0.2, 0.5),             // 5
    vec2(0.5, 0.2),             // 6
    vec2(0.5, 0.5),             // 7

    // Shape 3 (Triangle)
    vec2(0.0, 0.0),             // 8
    vec2(-0.3, -0.3),           // 9
    vec2(0.3, -0.3),            // 10
];

var vertexColors = [
    vec4(0.0, 0.0, 0.0, 1.0),       // black
    vec4(1.0, 0.0, 0.0, 1.0),       // red
    vec4(1.0, 1.0, 0.0, 1.0),       // yellow
    vec4(0.0, 1.0, 0.0, 1.0),       // green
    vec4(0.0, 0.0, 1.0, 1.0),       // blue
    vec4(1.0, 0.0, 1.0, 1.0),       // magenta
    vec4(1.0, 1.0, 1.0, 1.0),       // white
    vec4(0.0, 1.0, 1.0, 1.0),       // cyan
    vec4(0.06, 0.76, 0.86, 1.0),    // #0fc2db
    vec4(0.98, 0.23, 0.68, 1.0),    // #fa3bae
    vec4(0.58, 0.22, 0.28, 1.0),    // #943747
    vec4(0.53, 0.64, 0.08, 1.0),    // #86a415
    vec4(0.15, 0.78, 0.91, 1.0),    // #26c6e8
];

var indices = [
    // Shape 1 (trapezoid)
    2, 0, 1,
    2, 1, 3,

    // Shape 2 (square)
    6, 4, 5,
    6, 7, 5,

    // Shape 3 (Triangle)
    8, 9, 10
];

init();

function init() {
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.8, 0.8, 0.8, 1.0);

    //  Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader")
    gl.useProgram(program);

    // array element buffer
    var iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), gl.STATIC_DRAW);

    // color array atrribute buffer
    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertexColors), gl.STATIC_DRAW);

    var colorLoc = gl.getAttribLocation(program, "aColor");
    gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorLoc);

    // vertex array attribute buffer
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    render();
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_BYTE, 0);
}