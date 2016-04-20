window.onload = init;

var container;

var width = window.innerWidth;
var height = window.innerHeight;

var view_angle = 45;
var aspect_ratio = width / height;
var near_clipping_plane = 0.1;
var far_clipping_plane = 10000;

var renderer;
var scene;
var camera;

var stats;

var clock = new THREE.Clock();
var tick = 0;

var mouseOverCanvas;
var mouseDown;

var controls;
<<<<<<< HEAD
var container;
var particleOptions;
var spawnOptions;
var particle;
var spermModel;
var eggModel;
var bacteria1;
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var ray = new THREE.ReusableRay();
var collisionObject = [];

var daeAnimations;
=======

var colladaLoader;
var daeFile;

var myDaeAnimations;
>>>>>>> animation
var keyFrameAnimations = [];
var keyFrameAnimationsLength = 0;
var lastFrameCurrentTime = [];

function init() {

    renderer = new THREE.WebGLRenderer();

    container = document.getElementById('main-container');
    container.appendChild(renderer.domElement);

    renderer.setClearColor( "rgb(51, 14, 14)", 1);
    renderer.setSize(width, height);

    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    stats.domElement.style.zIndex = 100;
    container.appendChild( stats.domElement );

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(view_angle, aspect_ratio, near_clipping_plane, far_clipping_plane);

    camera.position.set(0, 0, 120);

    controls = new THREE.FlyControls(camera, container);
    controls.movementSpeed = 1;
    controls.domElement = container;
    controls.rollSpeed = Math.PI / 24;
    controls.autoForward = true;
    controls.dragToLook = false;

    particle = new THREE.GPUParticleSystem({maxParticles: 250000});
    scene.add(particle);

    particleOptions = {
        position: new THREE.Vector3(),
        positionRandomness: 5000,
        velocity: new THREE.Vector3(),
        velocityRandomness: 360,
        color: 0xf5f5f5,
        colorRandomness: 0,
        turbulence: 5,
        lifetime: 1.1,
        size: 10,
        sizeRandomness: 10
    };

    spawnOptions = {
        spawnRate: 15000,
        horizontalSpeed: 5,
        verticalSpeed: 5,
        timeScale: 0.1
    };

<<<<<<< HEAD
    colladaLoaderSperm = new THREE.ColladaLoader();
    colladaLoaderEgg = new THREE.ColladaLoader();
    colladaLoaderBacteria = new THREE.ColladaLoader();
    colladaLoaderSperm.options.convertUpAxis = true;

    colladaLoaderSperm.load('res/models/sperm.dae',function(collada){
        spermModel = collada.scene;

        spermModel.position.x = 0;
        spermModel.position.y = 0;
        spermModel.position.z = -600;

      //  daeAnimations = spermModel.animations;
	//keyFrameAnimationsLength = daeAnimations.length;

	// Initialise last frame current time.
	for ( var i = 0; i < keyFrameAnimationsLength; i++ ) {
	  	lastFrameCurrentTime[i] = 0;
	}

	// Get all the key frame animations.
	for ( var i = 0; i < keyFrameAnimationsLength; i++ ) {
		var animation = daeAnimations[ i ];
		var keyFrameAnimation = new THREE.KeyFrameAnimation( animation );
		keyFrameAnimation.timeScale = 1;
		keyFrameAnimation.loop = false;
		// Add the key frame animation to the keyFrameAnimations array.
		keyFrameAnimations.push( keyFrameAnimation );
	}
			
	startAnimations();
		
        spermModel.scale.x = spermModel.scale.y = spermModel.scale.z = 0.01;
        spermModel.updateMatrix();

        var mesh = spermModel.children.filter(function(child){
            return child instanceof THREE.Mesh;
        })[0];

        spermModel.geometry = mesh.geometry;

        collisionObject.push(spermModel);

        scene.add(spermModel);

        animate();

    });

    colladaLoaderEgg.load('res/models/egg.dae',function(collada) {

        eggModel = collada.scene;

        eggModel.position.x = 0;
        eggModel.position.y = 0;
        eggModel.position.z = -100;

        eggModel.scale.x = eggModel.scale.y = eggModel.scale.z = 2;
        eggModel.updateMatrix();

        var mesh = eggModel.children.filter(function(child){
            return child instanceof THREE.Mesh;
        })[0];
=======
    var light = new THREE.DirectionalLight(0xffffff, 5.5);
    light.position.set(1,1,1);
    scene.add(light);
>>>>>>> animation

    initScene();

}

function initScene() {
    colladaLoader = new THREE.ColladaLoader();
    colladaLoader.options.convertUpAxis = true;

    colladaLoader.load('res/models/sperm.dae', function ( collada ) {
        daeFile = collada.scene;

<<<<<<< HEAD
    colladaLoaderBacteria.load('res/models/bacteria1.dae',function(collada) {

        bacteria1 = collada.scene;

        bacteria1.position.x = 0;
        bacteria1.position.y = 0;
        bacteria1.position.z = -50;

        bacteria1.scale.x = bacteria1.scale.y = bacteria1.scale.z = 0.5;
        bacteria1.updateMatrix();

        scene.add(bacteria1);

    });

=======
        myDaeAnimations = collada.animations;
        keyFrameAnimationsLength = myDaeAnimations.length;
>>>>>>> animation

        for ( var i = 0; i < keyFrameAnimationsLength; i++ ) {
            lastFrameCurrentTime[i] = 0;
        }

        for ( var i = 0; i < keyFrameAnimationsLength; i++ ) {
            var animation = myDaeAnimations[ i ];

            var keyFrameAnimation = new THREE.KeyFrameAnimation( animation );
            keyFrameAnimation.timeScale = 1;
            keyFrameAnimation.loop = false;
            keyFrameAnimations.push( keyFrameAnimation );
        }

        daeFile.position.x = 0;
        daeFile.position.y = 3;
        daeFile.position.z = 30;

        daeFile.scale.x = daeFile.scale.y = daeFile.scale.z = 0.1;
        daeFile.updateMatrix();

        scene.add( daeFile );

        startAnimations();

        render();
    } );
}

function startAnimations(){
    for ( var i = 0; i < keyFrameAnimationsLength; i++ ) {
        var animation = keyFrameAnimations[i];
        animation.play();
    }
}

function loopAnimations(){
    for ( var i = 0; i < keyFrameAnimationsLength; i++ ) {
        if(keyFrameAnimations[i].isPlaying && !keyFrameAnimations[i].isPaused){
            if(keyFrameAnimations[i].currentTime == lastFrameCurrentTime[i]) {
                keyFrameAnimations[i].stop();
                keyFrameAnimations[i].play();
                lastFrameCurrentTime[i] = 0;
            }
        }

    }
}

function render(){
    if(mouseOverCanvas){
        if(mouseDown){
            controls.activeLook = true;
        }
    }

    var deltaTime = clock.getDelta();

    controls.update( deltaTime );

    for ( var i = 0; i < keyFrameAnimationsLength; i++ ) {
        var animation = keyFrameAnimations[i];
        animation.update( deltaTime );
    }

    tick += deltaTime;

    if (deltaTime > 0) {
        particle.position.x = camera.position.x;
        particle.position.y = camera.position.y;
        particle.position.z = camera.position.z;

        for (var x = 0; x < spawnOptions.spawnRate * deltaTime; x++) {
            particle.spawnParticle(particleOptions);
        }
    }

    particle.update(tick);

<<<<<<< HEAD
    spermModel.position.z =  camera.position.z - 5;
    spermModel.position.y =  camera.position.y - 1;
    spermModel.position.x =  camera.position.x;


    //console.log("Sperm position: " + spermModel.position.z);
    spermModel.rotation.z += 0.2;
    update();
    render();
=======
>>>>>>> animation

    loopAnimations();

    renderer.render(scene, camera);

    stats.update();

    requestAnimationFrame(render);

    for ( var i = 0; i < keyFrameAnimationsLength; i++ ) {
        lastFrameCurrentTime[i] = keyFrameAnimations[i].currentTime;
    }
}
