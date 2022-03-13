"use strict";

var canvas;
var gl;

var maxNumPositions  = 200;
var index = 0;

var cindex = 0;
var sindex = 0;

var colors = [
    vec4(0.0, 0.0, 0.0, 1.0),  // black
    vec4(1.0, 0.0, 0.0, 1.0),  // red
    vec4(1.0, 1.0, 0.0, 1.0),  // yellow
    vec4(0.0, 1.0, 0.0, 1.0),  // green
    vec4(0.0, 0.0, 1.0, 1.0),  // blue
    vec4(1.0, 0.0, 1.0, 1.0),  // magenta
    vec4(0.0, 1.0, 1.0, 1.0),   // cyan
    vec4(0.0, 0.5, 0.42, 1.0)  // Pine Green
];

// numPolygons adalah banyak polygon yang terbentuk baik garis, segitiga, segiempat, dan segibanyak
// numPositions adalah banyaknya vertices yang terbentuk untuk sebuah polygon
// start merupakan index titik awal setiap polygon yang terbentuk
// tPos merupakan kumpulan koordinat vertices yang ditentukan user
// ttPos merupakan kumpulan jenis warna yang dipilih user untuk setiap vertices
// types merupakan jenis bentuk yang digunakan user untuk setiap polygon terbentuk
var numPolygons = 0;
var numPositions = [];
numPositions[0] = 0;
var start = [0];
var tPos = [];
var ttPos = [];
var types = [0];

init();

function init() {
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.8, 0.8, 0.8, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, 8*maxNumPositions, gl.STATIC_DRAW);
    var postionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(postionLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(postionLoc);

    var cBufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBufferId);
    gl.bufferData(gl.ARRAY_BUFFER, 16*maxNumPositions, gl.STATIC_DRAW);
    var colorLoc = gl.getAttribLocation(program, "aColor");
    gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorLoc);

    // Mengambil menu warna dan bentuk
    var m = document.getElementById("colors");
    var s = document.getElementById("shapes")

    // mengambil tombol untuk mengakhiri gambar polygon dan tombol membersihkan canvas
    var b = document.getElementById("end-polygon")
    var cf = document.getElementById("clear-frame")

    // Mengambil warna yang dipilih user pada menu warna
    m.addEventListener("click", function() {
       cindex = m.selectedIndex;
        });
    
    // Mengambil bentuk yang dipilih user pada menu bentuk
    s.addEventListener("click", function() {
      sindex = s.selectedIndex;
      
      // Jika user mengganti shape, bersihkan data temporary yang terbentuk sebelum render terjadi 
      // array tPos dan ttPos dikosongkan kembali
      // types untuk polygon saat ini disesuaikan dengan bentuk yang dipilih
      // banyaknya vertices yang terbentuk dikembalikan ke 0
      // index dikembalikan ke posisi start polygon saat ini
      tPos = [];
      ttPos = [];
      types[numPolygons] = sindex;
      numPositions[numPolygons] = 0;
      index = start[numPolygons];

      // Jika user memilih bentuk segibanyak maka akan muncul sebuah tombol untuk end drawing
      if (sindex === 3) {
        b.style.display = "block";
      } else {
        b.style.display = "none";
      }
    });

    // Jika user menekan tombol untuk end drawing maka vertices-vertices yang terbentuk akan dikirim ke buffer
    // Kemudian dari vertices tersebut akan di render polygon
    b.addEventListener("click", function() {
      for (var i = 0; i < tPos.length; i++) {
        gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
        gl.bufferSubData(gl.ARRAY_BUFFER, 8*index, flatten(tPos[i]));

        gl.bindBuffer( gl.ARRAY_BUFFER, cBufferId );
        gl.bufferSubData(gl.ARRAY_BUFFER, 16*index, flatten(ttPos[i]));
      }

      render();
    })

    // Jika user menekan tombol untuk clear frame maka bersihkan seluruh data yang sudah tersimpan
    // Sehingga program kembali seperti awal dijalankan
    cf.addEventListener("click", function() {
      ttPos = [];
      tPos = [];
      numPolygons = 0;
      numPositions = [];
      numPositions[0] = 0;
      start = [0];
      types = [sindex]
      index = 0;
      render()
    })

    // Setiap user menekan pada canvas maka koordinat dari posisi kursor menekan canvas tersebut
    // disimpan menjadi sebuah vertices. Jika jumlah vertices sudah memenuhi untuk sebuah shape maka
    // akan dijalankan render untuk membentuk polygon.
    // garis membutuhkan 2 vertices
    // segitiga membutuhkan 3 vertices
    // segiempat membutuhkan 2 vertices
    // segibanyak membutuhkan n vertices (akan render jika user menekan tombol menyelesaikan gambar)
    canvas.addEventListener("mousedown", function(event){
        var t = vec2(2*event.clientX/canvas.width-1,
        2*(canvas.height-event.clientY)/canvas.height-1)
        var tt = vec4(colors[cindex]);
        tPos.push(t);
        ttPos.push(tt);
        
        numPositions[numPolygons]++;
        index++;

        if (sindex === 0 && numPositions[numPolygons] === 2) {
          for (var i=0; i<2; i++) { 
            gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
            gl.bufferSubData(gl.ARRAY_BUFFER, 8*(start[numPolygons]+i), flatten(tPos[i]));
            gl.bindBuffer( gl.ARRAY_BUFFER, cBufferId );
            gl.bufferSubData(gl.ARRAY_BUFFER, 16*(start[numPolygons]+i), flatten(ttPos[i]));
          }
          render()
        } else if (sindex === 1 && numPositions[numPolygons] === 3) {
            for (var i=0; i<3; i++) {
              gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
              gl.bufferSubData(gl.ARRAY_BUFFER, 8*(start[numPolygons]+i), flatten(tPos[i]));
              gl.bindBuffer( gl.ARRAY_BUFFER, cBufferId );
              gl.bufferSubData(gl.ARRAY_BUFFER, 16*(start[numPolygons]+i), flatten(ttPos[i]));
            }
            render()
        } else if (sindex === 2 && numPositions[numPolygons] === 2) {
            var temp = tPos[1];
            tPos[2] = temp;
            tPos[1] = vec2(tPos[0][0], tPos[2][1]); 
            tPos[3] = vec2(tPos[2][0], tPos[0][1]);
            numPositions[numPolygons] += 2;
            index += 2;
            for (var i=0; i<4; i++) {
              gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
              gl.bufferSubData(gl.ARRAY_BUFFER, 8*(start[numPolygons]+i), flatten(tPos[i]));
              gl.bindBuffer( gl.ARRAY_BUFFER, cBufferId );
              gl.bufferSubData(gl.ARRAY_BUFFER, 16*(start[numPolygons]+i), flatten(ttPos[0]));
            }
            render()
        } else {
          for (var i=0; i<tPos.length; i++) {
            gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
            gl.bufferSubData(gl.ARRAY_BUFFER, 8*(start[numPolygons]+i), flatten(tPos[i]));
            gl.bindBuffer( gl.ARRAY_BUFFER, cBufferId );
            gl.bufferSubData(gl.ARRAY_BUFFER, 16*(start[numPolygons]+i), flatten(ttPos[i]));
          }
        }
    });
}

function render() {
    // Jika render dijalankan, bersihkan kembali ttPos dan tPos
    // kemudian tambahkan jumlah polygon
    // simpan bentuk yang akan digunakan untuk polygon selanjutnya
    // inisialisasi jumlah vertices untuk polygon selanjutnya sebagai 0
    // set index start untuk polygon selanjutnya sebagai index terakhir dari vertices yang terbentuk
    ttPos = [];
    tPos = [];
    numPolygons++;
    types[numPolygons] = sindex;
    numPositions[numPolygons] = 0;
    start[numPolygons] = index;

    gl.clear( gl.COLOR_BUFFER_BIT );

    // Jika bentuk yang dipilih adalah garis maka gunakan gl.LINES, selain itu bentuk akan disusun menggunakan TRIANGLE_FAN
    for(var i=0; i<numPolygons; i++) {
      if (types[numPolygons] === 0){
        gl.drawArrays(gl.LINES, start[i], numPositions[i]);
      } else {
        gl.drawArrays(gl.TRIANGLE_FAN, start[i], numPositions[i]);
      }
    }
}
