// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = u_Size;
  }`;

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`;


let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;


function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }
}
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;
const OVAL = 3;

let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 20;
let g_selectedType = POINT;
let g_segmentCount = 20;
let g_ovalShape = 0.3;

function addActionsForHtmlUI() {
  document.getElementById('clearButton').onclick = function () { g_shapesList = []; renderAllShapes(); };
  document.getElementById('drawButton').onclick = function () { drawPicture(); };

  document.getElementById('pointButton').onclick = function () { g_selectedType = POINT; };
  document.getElementById('triangleButton').onclick = function () { g_selectedType = TRIANGLE; };
  document.getElementById('circleButton').onclick = function () { g_selectedType = CIRCLE; };
  document.getElementById('ovalButton').onclick = function () { g_selectedType = OVAL; };


  document.getElementById('redSlide').addEventListener('mouseup', function () { g_selectedColor[0] = this.value / 100; });
  document.getElementById('greenSlide').addEventListener('mouseup', function () { g_selectedColor[1] = this.value / 100; });
  document.getElementById('blueSlide').addEventListener('mouseup', function () { g_selectedColor[2] = this.value / 100; });

  document.getElementById('sizeSlide').addEventListener('mouseup', function () { g_selectedSize = this.value; });
  document.getElementById('segmentSlide').addEventListener('mouseup', function () { g_segmentCount = this.value; });
  document.getElementById('ovalSlide').addEventListener('mouseup', function () { g_ovalShape = this.value / 100.0; });
}

function main() {
  setupWebGL();
  connectVariablesToGLSL();

  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = function (ev) { click(ev); };
  canvas.onmousemove = function (ev) { if (ev.buttons == 1) { click(ev); } };
  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_shapesList = [];

function click(ev) {
  [x, y] = convertCoordinatesEventToGL(ev);


  let shape;
  if (g_selectedType == POINT) {
    shape = new Point();
  } else if (g_selectedType == TRIANGLE) {
    shape = new Triangle();
  } else if (g_selectedType == CIRCLE) {
    shape = new Circle();
    shape.segments = g_segmentCount;
  } else {
    shape = new Oval();
    shape.segments = g_segmentCount;
    shape.width = g_ovalShape < 0.5 ? 1.0 : 1.0 - 2 * (g_ovalShape - 0.5);
    shape.height = g_ovalShape < 0.5 ? 1.0 - 2 * (0.5 - g_ovalShape) : 1.0;
  }
  shape.position = [x, y];
  shape.color = g_selectedColor.slice();
  shape.size = g_selectedSize;
  g_shapesList.push(shape);
  console.log(shape.type);
  renderAllShapes();
}

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
  y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

  return [x, y];
}

function renderAllShapes() {
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  var len = g_shapesList.length;
  for (var i = 0; i < len; i++) {
    g_shapesList[i].render();
  }
}

function drawPicture() {
  gl.uniform4f(u_FragColor, 0.5, 0.5, 0.6, 1.0);
  drawTriangle([-0.8,-0.2,0.9,-0.7,-0.2,0.2])

  gl.uniform4f(u_FragColor, 0.35, 0.35, 0.45, 1.0);
  drawTriangle([0.9,-0.7,0.3,0.1,-0.2,0.2])
  
  gl.uniform4f(u_FragColor, 0.85, 0.85, 0.9, 1.0);
  drawTriangle([-0.8,-0.2,0.9,-0.7,-0.8,-0.3])
  drawTriangle([0.9,-0.785,0.9,-0.7,-0.8,-0.3])

  gl.uniform4f(u_FragColor, 0.55, 0.55, 0.65, 1.0);
  drawTriangle([-0.2,0.0,0.15,0.06,-0.15,0.5])
  drawTriangle([0.2,0.5,0.15,0.06,-0.15,0.5])

  gl.uniform4f(u_FragColor, 0.65, 0.65, 0.75, 1.0);
  drawTriangle([-0.2,0.0,-0.3,0.1,-0.15,0.5])

  gl.uniform4f(u_FragColor, 0.75, 0.75, 0.85, 1.0);
  drawTriangle([0.05,0.35,-0.3,0.3,-0.15,0.5])
  drawTriangle([0.05,0.35,0.2,0.5,-0.15,0.5])
  drawTriangle([0.05,0.35,0.2,0.5,0.38,0.41])

  gl.uniform4f(u_FragColor, 0.0, 0.0, 0.0, 1.0);
  drawTriangle([-0.12,0.1,0.1,0.14, -0.1,0.3])
  drawTriangle([0.13,0.32,0.1,0.14, -0.1,0.3])

  gl.uniform4f(u_FragColor, 0.125, 0.192, 0.588, 1.0);
  drawTriangle([-0.08,0.13,0.08,0.17, -0.06,0.27])
  drawTriangle([0.1,0.29,0.08,0.17, -0.06,0.27])
  
  gl.uniform4f(u_FragColor, 0.64, 0.64, 0.64, 1.0);
  drawTriangle([-0.6,-0.9,-0.3,-0.9,-0.45,-0.6])
  drawTriangle([0.4,0.2,0.6,0.3,0.5,0.5])

  gl.uniform4f(u_FragColor, 1.0, 0.7, 0.05, 1.0);
  drawTriangle([-0.6,-0.9,-0.5,-0.9,-0.55,-1])
  drawTriangle([-0.4,-0.9,-0.5,-0.9,-0.45,-1])
  drawTriangle([-0.4,-0.9,-0.3,-0.9,-0.35,-1])

  drawTriangle([0.55,0.4,0.6,0.52,0.5,0.5])
  drawTriangle([0.6,0.3,0.65,0.45,0.55,0.4])

  

}
