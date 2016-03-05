window.onload = init;

//canvas size
var WIDTH = 800;
var HEIGHT = 600;

//Camera properties
var VIEW_ANGLE = 45;
var ASPECT_RATIO = WIDTH / HEIGHT;
var NEAR_CLIPPING_PLANE = 0.1;
var FAR_CLIPPING_PLANE = 10000;

//declare variables for three.min.js
var renderer;
var scene;
var camera;

//stats infomation for scene
var stats;

//used to determine time between scene rendering
var clock = new THREE.Clock();

// handles the mouse events
var mouseOverCanvas
var mouseDown

//store three.min.js  controls
var controls;

var seaMesh;
var landMesh;

function init(){
    //create webgl renderer
    renderer = new THREE.WebGLRenderer();

    //set the renderer size
    renderer.setSize(WIDTH, HEIGHT);

    var docElement = document.getElementById("myDivContainer");
    docElement.appendChild(renderer.domElement);

    //set the clear colour
    renderer.setClearColor("rgb(135,206, 250)");

    //add an event to set if mouse is over our canvas
    renderer.domElement.onmouseover = function(e){mouseOverCanvas = true;}
    renderer.domElement.onmousemove = function(e){mouseOverCanvas = true;}
    renderer.domElement.onmouseout = function(e){mouseOverCanvas = false;}


    renderer.domElement.onmousedown = function(e){mouseOverCanvas = true;}
    renderer.domElement.onmouseup = function(e){mouseOverCanvas = false;}

    //stats
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    stats.domElement.style.zIndex = 100;
    docElement.appendChild(stats.domElement);

    //create webgl scene
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT_RATIO,
        NEAR_CLIPPING_PLANE, FAR_CLIPPING_PLANE);

    camera.position.set(0, 3, 30);

    controls = new THREE.FirstPersonControls(camera, document.getElementById('myDivContainer'));

    controls.movementSpeed = 200;
    controls.lookSpeed = 0.06;
    controls.activeLook = false;

    initScene();

    render();
}

function initScene() {

    var seaGeometry = new THREE.PlaneGeometry(10000, 10000, 100, 100);
    seaGeometry.applyMatrix(new THREE.Matrix4().makeRotationX(- Math.PI /2 ));

    var seaMaterial = new THREE.MeshBasicMaterial({color:0x1e90ff});

    seaMesh = new THREE.Mesh(seaGeometry, seaMaterial);

    seaMesh.position.y = -10;

    scene.add(seaMesh);

    var landGeometry = new THREE.PlaneGeometry(1500, 1500, 100, 100);
    landGeometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));

    for(var i = 0; i < landGeometry.vertices.length; i++){
        var vertex = landGeometry.vertices[i];
        vertex.x += Math.random() * 20 - 10;
        vertex.y += Math.random() * 2;
        vertex.z += Math.random() * 20 - 10;
    }

    for(var i = 0; i < landGeometry.faces.length; i++){
        var face = landGeometry.faces[i];
        face.vertexColors[0] =
            new THREE.Color("rgb(0,255,0)").setHSL(Math.random() * 0.2 + 0.25, 0.75, 0.75);
        face.vertexColors[1] =
            new THREE.Color("rgb(0,255,0)").setHSL(Math.random() * 0.2 + 0.25, 0.75, 0.75);
        face.vertexColors[2] =
            new THREE.Color("rgb(0,255,0)").setHSL(Math.random() * 0.2 + 0.25, 0.75, 0.75);
    }

    //create land material and mesh
    var landMaterial = new THREE.MeshBasicMaterial({vertexColors: THREE.VertexColors});
    landMesh = new THREE.Mesh(landGeometry, landMaterial);

    landMesh.position.y = -5;

    scene.add(landMesh);

    //A basic light

    var light = new THREE.DirectionalLight(0xffffff, 1.5);
    light.position.set(1,1,1);
    scene.add(light);
    var light2 = new THREE.DirectionalLight(0xffffff, 0.75);
    light2.position.set(-1,-0.5,-1);
    scene.add(light2);
}


function render() {
    //get the time since this function was called
    controls.activeLook = false;
    if(mouseOverCanvas){
        if(mouseDown){
            controls.activeLook = true;
        }
    }

    var deltaTime = clock.getDelta();

    //update the controls
    controls.update(deltaTime);

    renderer.render(scene, camera);

    stats.update();

    requestAnimationFrame(render);
}