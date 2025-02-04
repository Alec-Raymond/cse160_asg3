// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
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
let u_ModelMatrix;
let u_GlobalRotateMatrix;


function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');


  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  gl.enable(gl.DEPTH_TEST);

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

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
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
let g_globalAngleX = 0;
let g_globalAngleY = 0;
let g_crabX = 0.0;
let g_crabArm = 0.0;
let g_crabPinch = 0.0;
let g_moveAnimation = false;
let g_armAnimation = false;
let g_pinchAnimation = false;
let g_isDragging = false;
let g_lastX, g_lastY;
let g_rotationX = 0, g_rotationY = 0;
let trackedChange = 0
let g_poked = false;
let g_pokedTime;
let g_eyeScale = 1.0

function addActionsForHtmlUI() {
  document.getElementById('rotateSlide').addEventListener('mousemove', function () { g_globalAngleX = this.value; renderAllShapes(); });
  document.getElementById('crabMoveSlide').addEventListener('mousemove', function () { g_crabX = this.value / 100.0; renderAllShapes(); });
  document.getElementById('crabArmSlide').addEventListener('mousemove', function () { g_crabArm = this.value; renderAllShapes(); });
  document.getElementById('crabPinchSlide').addEventListener('mousemove', function () { g_crabPinch = this.value; renderAllShapes(); });

  document.getElementById("animationMoveButton").addEventListener("change", function () { g_moveAnimation = !g_moveAnimation; renderAllShapes(); });
  document.getElementById("animationArmButton").addEventListener("change", function () { g_armAnimation = !g_armAnimation; renderAllShapes(); });
  document.getElementById("animationPinchButton").addEventListener("change", function () { g_pinchAnimation = !g_pinchAnimation; renderAllShapes(); });

  canvas.addEventListener("mousedown", (event) => {
    g_isDragging = true;
    g_lastX = event.clientX;
    g_lastY = event.clientY;
  });

  canvas.addEventListener("mouseup", () => {
    g_isDragging = false;
  });

  canvas.addEventListener("mousemove", (event) => {
    if (!g_isDragging) return;

    let deltaX = event.clientX - g_lastX;
    //console.log("X:", deltaX)
    let deltaY = event.clientY - g_lastY;
    //console.log("Y:", deltaY)
    //console.log(deltaY)
    g_lastX = event.clientX;
    g_lastY = event.clientY;
    trackedChange += deltaX;
    //console.log(trackedChange)
    // Adjust sensitivity
    g_globalAngleX += deltaX* 0.7;
    g_globalAngleY+= deltaY * 0.7;
  });

  canvas.addEventListener("click", (event) => {
    if (event.shiftKey) {
        g_poked = true;
        g_pokedTime = performance.now();
    }
});
}

function main() {
  setupWebGL();
  connectVariablesToGLSL();

  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  //canvas.onmousedown = function (ev) { click(ev); };
  //canvas.onmousemove = function (ev) { if (ev.buttons == 1) { click(ev); } };
  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  //gl.clear(gl.COLOR_BUFFER_BIT);
  renderAllShapes();
  tick();
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
  var startTimed = performance.now();

  var globalRotMat = new Matrix4().rotate(g_globalAngleX, 0, 1, 0).rotate(g_globalAngleY, 1, 0, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  //var len = g_shapesList.length;
  //for (var i = 0; i < len; i++) {
  //  g_shapesList[i].render();
  //}

  var body = new Cube();
  body.color = [1.0, 0.0, 0.0, 1.0];
  body.matrix.translate(-0.33 + g_crabX, 0, 0.25);
  body.matrix.rotate(-g_crabX * 10.0, 0, 0, 1);
  var bodyMat = new Matrix4(body.matrix);
  body.matrix.scale(0.5, 0.5, 0.25);
  body.render();

  var arm1 = new Cube();
  arm1.color = [1.0, 0.0, 0.0, 1.0];
  arm1.matrix = new Matrix4(bodyMat);
  arm1.matrix.translate(0.25, .3, 0.1);
  arm1.matrix.rotate(80, 40 - g_crabArm, 10, 1);
  var armMat = new Matrix4(arm1.matrix);
  arm1.matrix.scale(0.5, 0.1, 0.1);
  arm1.render();

  var arm2 = new Cube();
  arm2.color = [1.0, 0.0, 0.0, 1.0];
  arm2.matrix = new Matrix4(bodyMat); // Start with body matrix
  arm2.matrix.translate(-0.25, 0.4 + g_crabArm / 250.0, 0); // Mirror arm1's position (opposite side)
  arm2.matrix.rotate(-80, -40, 10, 1); // Apply the same rotation as arm1
  var arm2Mat = new Matrix4(arm2.matrix);
  arm2.matrix.scale(0.5, 0.1, 0.1); // Scale arm2
  arm2.render();

  var claw1 = new Cube();
  claw1.color = [1.0, 0.0, 0.0, 1.0];
  claw1.matrix = new Matrix4(armMat);
  claw1.matrix.translate(0.4, 0, 0);
  claw1.matrix.rotate(g_crabPinch, 0, 0, 1);
  claw1.matrix.rotate(50, 0, 40, 1);
  claw1.matrix.scale(0.3, 0.1, 0.2);
  claw1.render();

  var claw2 = new Cube();
  claw2.color = [1.0, 0.0, 0.0, 1.0];
  claw2.matrix = new Matrix4(arm2Mat);
  claw2.matrix.translate(-0.05, 0, 0.1);
  claw2.matrix.rotate(130, 0, 40, 1);
  claw2.matrix.rotate(g_crabPinch, 0, 0, 1);
  claw2.matrix.scale(0.3, 0.1, 0.2);
  claw2.render();

  var pinch1 = new Cube();
  pinch1.color = [1.0, 0.0, 0.0, 1.0];
  pinch1.matrix = new Matrix4(armMat);
  pinch1.matrix.translate(0.45, -0.15, 0);
  pinch1.matrix.rotate(0.2 * -g_crabPinch, 0, 0, 1);
  pinch1.matrix.rotate(50, -50, -30, 1);
  pinch1.matrix.scale(0.2, 0.1, 0.2);
  pinch1.render();

  var pinch2 = new Cube();
  pinch2.color = [1.0, 0.0, 0.0, 1.0];
  pinch2.matrix = new Matrix4(arm2Mat);
  pinch2.matrix.rotate(-30, 30, -50, 1);
  pinch2.matrix.rotate(0.2 * -g_crabPinch, 0, 0, 1);
  pinch2.matrix.translate(-0.1, -0.1, -0.1);
  pinch2.matrix.scale(0.2, 0.1, 0.2);
  pinch2.render();

  var eye1 = new Sphere();
  eye1.color = [0.2, 0.0, 0.0, 1.0];
  eye1.matrix = new Matrix4(bodyMat);
  eye1.matrix.translate(0.15, 0.35, 0);
  eye1.matrix.scale(0.03 * g_eyeScale, 0.03 * g_eyeScale, 0.03 * g_eyeScale);
  eye1.render();

  var eye2 = new Sphere();
  eye2.color = [0.2, 0.0, 0.0, 1.0];
  eye2.matrix = new Matrix4(bodyMat);
  eye2.matrix.translate(0.35, 0.35, 0);
  eye2.matrix.scale(0.03 * g_eyeScale, 0.03 * g_eyeScale, 0.03 * g_eyeScale);
  eye2.render();

  var mouth = new Cube();
  mouth.color = [0.2, 0.0, 0.0, 1.0];
  mouth.matrix = new Matrix4(bodyMat);
  mouth.matrix.translate(0.1 - 0.1 * g_crabX, 0.05, -0.01);
  mouth.matrix.scale(0.3, 0.03, 0.03);
  mouth.render();

  var duration = performance.now() + 1 - startTimed;
  sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000 / duration) / 10, "numdot");
}

function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (htmlElm) {
    htmlElm.innerHTML = text;
  }
}

var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;

function tick() {
  g_seconds = performance.now() / 1000.0 - g_startTime;

  updateAnimationAngles();

  renderAllShapes();

  requestAnimationFrame(tick);
}

function updateAnimationAngles() {
  if (g_moveAnimation) {
    g_crabX = (0.25 * Math.sin(3 * g_seconds));
  }
  if (g_armAnimation) {
    g_crabArm = (7.5 * Math.sin(6 * g_seconds) + 7.5);
  }
  if (g_pinchAnimation) {
    g_crabPinch = (15 * Math.sin(9 * g_seconds));
  }
  if (g_poked) {
    g_eyeScale = (1.5 * Math.sin(13 * g_seconds))+ 1.5;
    console.log(g_pokedTime - performance.now())
    if (performance.now() - g_pokedTime> 2000) {
      g_eyeScale = 1.0;
      g_poked = false;
    }
  }
}

function drawPicture() {
  gl.uniform4f(u_FragColor, 0.5, 0.5, 0.6, 1.0);
  drawTriangle([-0.8, -0.2, 0.9, -0.7, -0.2, 0.2]);

  gl.uniform4f(u_FragColor, 0.35, 0.35, 0.45, 1.0);
  drawTriangle([0.9, -0.7, 0.3, 0.1, -0.2, 0.2]);

  gl.uniform4f(u_FragColor, 0.85, 0.85, 0.9, 1.0);
  drawTriangle([-0.8, -0.2, 0.9, -0.7, -0.8, -0.3]);
  drawTriangle([0.9, -0.785, 0.9, -0.7, -0.8, -0.3]);

  gl.uniform4f(u_FragColor, 0.55, 0.55, 0.65, 1.0);
  drawTriangle([-0.2, 0.0, 0.15, 0.06, -0.15, 0.5]);
  drawTriangle([0.2, 0.5, 0.15, 0.06, -0.15, 0.5]);

  gl.uniform4f(u_FragColor, 0.65, 0.65, 0.75, 1.0);
  drawTriangle([-0.2, 0.0, -0.3, 0.1, -0.15, 0.5]);

  gl.uniform4f(u_FragColor, 0.75, 0.75, 0.85, 1.0);
  drawTriangle([0.05, 0.35, -0.3, 0.3, -0.15, 0.5]);
  drawTriangle([0.05, 0.35, 0.2, 0.5, -0.15, 0.5]);
  drawTriangle([0.05, 0.35, 0.2, 0.5, 0.38, 0.41]);

  gl.uniform4f(u_FragColor, 0.0, 0.0, 0.0, 1.0);
  drawTriangle([-0.12, 0.1, 0.1, 0.14, -0.1, 0.3]);
  drawTriangle([0.13, 0.32, 0.1, 0.14, -0.1, 0.3]);

  gl.uniform4f(u_FragColor, 0.125, 0.192, 0.588, 1.0);
  drawTriangle([-0.08, 0.13, 0.08, 0.17, -0.06, 0.27]);
  drawTriangle([0.1, 0.29, 0.08, 0.17, -0.06, 0.27]);

  gl.uniform4f(u_FragColor, 0.64, 0.64, 0.64, 1.0);
  drawTriangle([-0.6, -0.9, -0.3, -0.9, -0.45, -0.6]);
  drawTriangle([0.4, 0.2, 0.6, 0.3, 0.5, 0.5]);

  gl.uniform4f(u_FragColor, 1.0, 0.7, 0.05, 1.0);
  drawTriangle([-0.6, -0.9, -0.5, -0.9, -0.55, -1]);
  drawTriangle([-0.4, -0.9, -0.5, -0.9, -0.45, -1]);
  drawTriangle([-0.4, -0.9, -0.3, -0.9, -0.35, -1]);

  drawTriangle([0.55, 0.4, 0.6, 0.52, 0.5, 0.5]);
  drawTriangle([0.6, 0.3, 0.65, 0.45, 0.55, 0.4]);
}
