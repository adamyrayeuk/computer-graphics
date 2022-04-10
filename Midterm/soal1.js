"use strict";

var canvas;
var gl;

var rotationQuaternion;
var rotationQuaternionLoc;

var angle = 0.0;
var axis = vec3(0, 0, 1);

var trackingMouse = false;
var trackballMove = false;

var lastPos = vec3(0, 0, 0);
var curx, cury;
var startX, startY;

var vertices = [
    // Shape 1 (trapezoid)
    vec4(-0.8, 0.2, 0.0, 1.0),            // 0
    vec4(-0.2, 0.2, 0.0, 1.0),            // 1
    vec4(-0.7, 0.5, 0.0, 1.0),            // 2
    vec4(-0.3, 0.5, 0.0, 1.0),            // 3

    // Shape 2 (Catface)
    vec4(0.1, 0.4, 0.0, 1.0),             // 4
    vec4(0.2, 0.5, 0.0, 1.0),             // 5
    vec4(0.3, 0.4, 0.0, 1.0),             // 6
    vec4(0.6, 0.4, 0.0, 1.0),             // 7
    vec4(0.7, 0.5, 0.0, 1.0),             // 8
    vec4(0.8, 0.4, 0.0, 1.0),             // 9
    vec4(0.45, 0.0, 0.0, 1.0),             // 10

    // Shape 3 (Kite)
    vec4(0.0, 0.05, 0.0, 1.0),             // 11
    vec4(0.2, -0.2, 0.0, 1.0),             // 12
    vec4(-0.2, -0.2, 0.0, 1.0),            // 13
    vec4(0.0, -0.6, 0.0, 1.0),             // 14
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
    vec4(0.70,0.52,0.75, 1.0),    //african violet
    vec4(0.5, 0.0, 0.5, 1.0),    //fuchsia
];

var indices = [
    // Shape 1 (trapezoid)
    2, 0, 1,
    2, 1, 3,

    // Shape 2 (Catface)
    6, 4, 5,
    8, 7, 9,
    4, 9, 10,

    // Shape 3 (Kite)
    11, 12, 13,
    12, 13, 14
];

init();

function multq(a, b) {
    // vec4(a.x*b.x - dot(a.yzw, b.yzw), a.x*b.yzw+b.x*a.yzw+cross(b.yzw, a.yzw))

    var s = vec3(a[1], a[2], a[3]);
    var t = vec3(b[1], b[2], b[3]);

    return (vec4(a[0] * b[0] - dot(s, t), add(cross(t, s), add(mult(a[0], t), mult(b[0], s)))));
}



function trackballView(x, y) {
    var d, a;
    var v = vec3();

    v[0] = x;
    v[1] = y;

    d = v[0] * v[0] + v[1] * v[1];
    if (d < 1.0)
        v[2] = Math.sqrt(1.0 - d);
    else {
        v[2] = 0.0;
        a = 1.0 / Math.sqrt(d);
        v[0] *= a;
        v[1] *= a;
    }
    return v;
}

function mouseMotion(x, y) {
    var dx, dy, dz;

    var curPos = trackballView(x, y);
    if (trackingMouse) {
        // dx = curPos[0] - lastPos[0];
        // dy = curPos[1] - lastPos[1];
        dz = curPos[2] - lastPos[2];

        if (dz) {
            //  angle =  0.01 * Math.sqrt(dx*dx + dy*dy + dz*dz);
            angle = 0.01 * Math.sqrt(dz * dz);


            //  axis[0] = lastPos[1]*curPos[2] - lastPos[2]*curPos[1];
            //  axis[1] = lastPos[2]*curPos[0] - lastPos[0]*curPos[2];
            axis[2] = lastPos[0] * curPos[1] - lastPos[1] * curPos[0];

            //  lastPos[0] = curPos[0];
            //  lastPos[1] = curPos[1];
            lastPos[2] = curPos[2];
        }
    }
    render();
}

function startMotion(x, y) {
    trackingMouse = true;
    startX = x;
    startY = y;
    curx = x;
    cury = y;

    lastPos = trackballView(x, y);
    trackballMove = true;
}

function stopMotion(x, y) {
    trackingMouse = false;
    if (startX != x || startY != y) {
    }
    else {
        angle = 0.0;
        trackballMove = false;
    }
}


function init() {
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.8, 0.8, 0.8, 1.0);

    gl.enable(gl.DEPTH_TEST);

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
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    rotationQuaternion = vec4(1, 0, 0, 0);
    rotationQuaternionLoc = gl.getUniformLocation(program, "uRotationQuaternion");
    gl.uniform4fv(rotationQuaternionLoc, rotationQuaternion);

    canvas.addEventListener("mousedown", function (event) {
        var x = 2 * event.clientX / canvas.width - 1;
        var y = 2 * (canvas.height - event.clientY) / canvas.height - 1;
        startMotion(x, y);
    });

    canvas.addEventListener("mouseup", function (event) {
        var x = 2 * event.clientX / canvas.width - 1;
        var y = 2 * (canvas.height - event.clientY) / canvas.height - 1;
        stopMotion(x, y);
    });

    canvas.addEventListener("mousemove", function (event) {

        var x = 2 * event.clientX / canvas.width - 1;
        var y = 2 * (canvas.height - event.clientY) / canvas.height - 1;
        mouseMotion(x, y);
    });

    render();
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if (trackballMove) {
        axis = normalize(axis);
        var c = Math.cos(angle / 2.0);
        var s = Math.sin(angle / 2.0);

        var rotation = vec4(c, s * axis[0], s * axis[1], s * axis[2]);
        rotationQuaternion = multq(rotationQuaternion, rotation);
        gl.uniform4fv(rotationQuaternionLoc, rotationQuaternion);
    }
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_BYTE, 0);
    requestAnimationFrame(render);
}