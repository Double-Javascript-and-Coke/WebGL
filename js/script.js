window.onload = init;

var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;

var VIEW_ANGLE = 45;
var NEAR_ASPECT_RATIO = WIDTH/HEIGHT;
var NEAR_CLIPPING_PLANE = 0.1;
var FAR_CLIPPING_PLANE = 10000;

var renderer;
var scene;
var camera;

var sphere;
var sperm;

function init(){

    renderer = new THREE.WebGLRenderer();

    renderer.setSize(WIDTH, HEIGHT);
}