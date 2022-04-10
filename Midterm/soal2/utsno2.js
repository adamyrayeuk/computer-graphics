var canvas;
var gl;

var vertices_arr = []; //array untuk menyimpan semua titik untuk algoritma midpoint

function midPoint(XA, YA, XB, YB, H, W){ //implementasi midpoint ini bergantung pada ukuran height dan width dari canvas
//XA, YA : x dan y awal
//XB, YB : x dan y akhir
//H, W : height dan width canvas
let dx = XB - XA;
let dy = YB - YA;
if (dx < 0) dx = -dx;
if (dy < 0) dy = -dy;
XB < XA? incx = -1 : incx = 1;
YB < YA? incy = -1 : incy = 1;
let xi = XA, yi = YA;
vertices_arr.push(vec2(xi/H, yi/W)); //memasukkan titik awal dari midpoint

if (dx > dy) { //kondisi apabila dx lebih besar dari dy
    d = 2 * dy-dx;
    incNE = 2*(dy-dx);
    incE = 2*dy;
    for (i=0; i<dx; i++) {
        if (d >= 0) {
            yi += incy;
            d += incNE;
        }
        else{
            d += incE;
        }
        xi += incx;
        vertices_arr.push(vec2(xi/H, yi/W));
    }
}else{ //kondisi apabila dy lebih besar dari dx
	d = 2*dx-dy;
	incNE = 2*(dx-dy);
	incE = 2*dx;
	for (i=0; i<dy; i++) {
		if (d >= 0) {
			xi += incx;
			d += incE;
		}
		else{
			d += incNE;
        }
		yi += incy;
        vertices_arr.push(vec2(xi/H, yi/W));
		}
	}

}


window.onload = function init(){
    canvas = document.getElementById( "gl-canvas" );
        
    gl = canvas.getContext('webgl2');

    if ( !gl ) { alert( "WebGL2 isn't available" ); }
    // Four Vertices
    
    midPoint(-512, -512, 512, 512, 512, 512); //miring ke kanan
    midPoint(512, 0, -512, 0, 512, 512); //horizontal
    midPoint(0, 512, 0, -512, 512, 512); //vertikal
    midPoint(-512, 512, 512, -512, 512, 512); //miring ke kiri
    var vertices = vertices_arr
    console.log(vertices)
	
//  Configure WebGL
 
 gl.viewport( 0, 0, canvas.width, canvas.height );
 gl.clearColor( 0.0, 0.0, 0.0, 0.0 );

  //  Load shaders and initialize attribute buffers

 var program = initShaders( gl, "vertex-shader", "fragment-shader" );
 gl.useProgram( program );

  // Load the data into the GPU

 var bufferId = gl.createBuffer();
 gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
 gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

  // Associate out shader variables with our data buffer

 var vPosition = gl.getAttribLocation( program, "vPosition" );
 gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
 gl.enableVertexAttribArray( vPosition );
 
     render();
};

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.POINTS, 0, vertices_arr.length);
}
