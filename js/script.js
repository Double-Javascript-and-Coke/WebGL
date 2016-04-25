//set the bounds
var container;

var width = window.innerWidth;
var height = window.innerHeight;

//camera angles and respective views
var view_angle = 45;
var aspect_ratio = width / height;
var near_clipping_plane = 0.1;
var far_clipping_plane = 10000;

var raycasterSperm;
var raycasterEgg;

//scene and scene logic
var renderer;
var scene;
var camera;

//fps tracking
var stats;

//game loop
var clock = new THREE.Clock();
var tick = 0;

//controls
var mouseOverCanvas;
var mouseDown;
var controls;

//models
var colladaLoader;
var spermDae;
var eggDae;
var bacteriaDae = [];

//collision tracking
var objects = [];
var badObjects = [];

//animation handling
var daeAnimations;
var keyFrameAnimations = [];
var keyFrameAnimationsLength = 0;
var lastFrameCurrentTime = [];

//life trackng
var lives = 3;

//time out
var timeOut = true;
var tempTick = 0;

function init() {

    //start the game and remove the splash screen
    document.getElementById('splash-container').style.display = 'none';

    //begin rendering
    renderer = new THREE.WebGLRenderer();

    container = document.getElementById('main-container');
    container.appendChild(renderer.domElement);

    renderer.setClearColor( "rgb(51, 14, 14)", 1);
    renderer.setSize(width, height);

    //setup stats
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    stats.domElement.style.right = '0px';
    stats.domElement.style.zIndex = 100;
    container.appendChild( stats.domElement );

    scene = new THREE.Scene();

    //camera initilisation
    camera = new THREE.PerspectiveCamera(view_angle, aspect_ratio, near_clipping_plane, far_clipping_plane);
    camera.position.set(0, 0, 120);

    //controls initilisation
    controls = new THREE.FlyControls(camera, container);
    controls.movementSpeed = 30;
    controls.domElement = container;
    controls.rollSpeed = Math.PI / 24;
    controls.autoForward = false;
    controls.dragToLook = false;

    //particle effects
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

    //setup collision tracking with raycasting
    raycasterSperm = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(-1, 0, 0), -10, 24);
    raycasterEgg = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, 0, 0), -10, 24);


    //initialise life tracking
    updateLives();

    //call and iniitalise scene
    initScene();

}

function initScene() {

    //load models
    colladaLoader = new THREE.ColladaLoader();
    colladaLoader.options.convertUpAxis = true;

    colladaLoader.load('res/models/sperm.dae', function ( collada ) {
        spermDae = collada.scene;

        daeAnimations = collada.animations;
        keyFrameAnimationsLength = daeAnimations.length;

        for ( var i = 0; i < keyFrameAnimationsLength; i++ ) {
            lastFrameCurrentTime[i] = 0;
        }

        for ( var i = 0; i < keyFrameAnimationsLength; i++ ) {
            var animation = daeAnimations[ i ];

            var keyFrameAnimation = new THREE.KeyFrameAnimation( animation );
            keyFrameAnimation.timeScale = 1;
            keyFrameAnimation.loop = false;
            keyFrameAnimations.push( keyFrameAnimation );
        }

        //set lighting
        var light = new THREE.DirectionalLight(0xffffff, 1.2);
        light.position.set(1,1,1);
        scene.add(light);

        spermDae.position.x = 0;
        spermDae.position.y = 3;
        spermDae.position.z = 100;

        spermDae.scale.x = spermDae.scale.y = spermDae.scale.z = 0.1;
        spermDae.updateMatrix();

        spermDae.name = 'sperm';

        objects.push(spermDae);
        badObjects.push(spermDae);

        scene.add( spermDae );
        startAnimations();
        render();
    } );

    colladaLoader.load('res/models/egg.dae', function ( collada ) {
        eggDae = collada.scene;

        daeAnimations = collada.animations;
        keyFrameAnimationsLength = daeAnimations.length;

        for ( var i = 0; i < keyFrameAnimationsLength; i++ ) {
            lastFrameCurrentTime[i] = 0;
        }

        for ( var i = 0; i < keyFrameAnimationsLength; i++ ) {
            var animation = daeAnimations[ i ];

            var keyFrameAnimation = new THREE.KeyFrameAnimation( animation );
            keyFrameAnimation.timeScale = 1;
            keyFrameAnimation.loop = false;
            keyFrameAnimations.push( keyFrameAnimation );
        }

        eggDae.position.x = 0;
        eggDae.position.y = 3;
        eggDae.position.z = -1000;

        eggDae.scale.x = eggDae.scale.y = eggDae.scale.z = 4;
        eggDae.updateMatrix();

        eggDae.name = 'egg';

        objects.push(eggDae);
        scene.add( eggDae );
        startAnimations();
        render();
    } );

    //build bacteria models
    colladaBuilder();

}

//start animations
function startAnimations(){
    for ( var i = 0; i < keyFrameAnimationsLength; i++ ) {
        var animation = keyFrameAnimations[i];
        animation.play();
    }

}

//loop animations
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

function render(){/*
 if(mouseOverCanvas){
 if(mouseDown){
 controls.activeLook = true;
 }
 }*/

    var deltaTime = clock.getDelta();

    camera.position.z += -1;
    spermDae.position.x = camera.position.x-2;
    spermDae.position.y = camera.position.y-1;
    spermDae.position.z = camera.position.z-30;

    if(spermDae.position.z < -870){
        gameWon();
    }
    var matrix = new THREE.Matrix4();
    matrix.extractRotation(camera.matrix);

    var direction = new THREE.Vector3(0, 0, -1);
    direction = direction.applyMatrix4(matrix);

    raycasterSperm.ray.origin.copy(spermDae.position);
    raycasterSperm.ray.direction.copy(direction);
    raycasterEgg.ray.origin.copy(spermDae.position);
    raycasterEgg.ray.direction.copy(direction);

    var intersections = raycasterEgg.intersectObjects(objects, true);
    if(intersections.length > 0){
        console.log("Game won");
        //gameWon();
    }

    var badIntersections = raycasterSperm.intersectObjects(badObjects, true);
    if (badIntersections.length > 0){
        if(timeOut == true){
            updateLives(decrease=true);
            timeOut = false;
        }
        console.log("Hit of a bad object");
    }
    controls.update( deltaTime );

    for ( var i = 0; i < keyFrameAnimationsLength; i++ ) {
        var animation = keyFrameAnimations[i];
        animation.update( deltaTime );
    }

    tick += deltaTime;

    if(timeOut == false){
        if(tempTick == 0){
            tempTick = tick;
        }else{
            if(tick > tempTick + 3){
                timeOut = true;
                tempTick = 0;
            }
        }
    }

    if (deltaTime > 0) {
        particle.position.x = camera.position.x;
        particle.position.y = camera.position.y;
        particle.position.z = camera.position.z;

        for (var x = 0; x < spawnOptions.spawnRate * deltaTime; x++) {
            particle.spawnParticle(particleOptions);
        }

    }
    for(var i = 0; i < bacteriaDae.length; i++){
        if(bacteriaDae[i].position.z > spermDae.position.z+150){
            bacteriaDae[i].position.z = spermDae.position.z-400;
            var generateRes = Math.floor(Math.random() * 54) + -53;
            var generateyRes = Math.floor(Math.random() * 5) + -5;
            bacteriaDae[i].position.x = spermDae.position.x + generateRes;
            bacteriaDae[i].position.y = spermDae.position.y + generateyRes;
        }else{
            var bacSpeed = Math.floor(Math.random() * 8) + 2;
            bacteriaDae[i].position.z += bacSpeed;
        }
    }


    camera.position.y = 0
    controls.moveForward = false;
    controls.moveBackward = false;
    controls.moveLeft = false;
    controls.moveRight = false;
    camera.rotateX = 0;

    particle.update(tick);

    loopAnimations();

    renderer.render(scene, camera);

    stats.update();

    requestAnimationFrame(render);

    for ( var i = 0; i < keyFrameAnimationsLength; i++ ) {
        lastFrameCurrentTime[i] = keyFrameAnimations[i].currentTime;
    }

}


function colladaBuilder(){

    colladaLoader.load('res/models/bacteria.dae', function ( collada ) {
        bacteriaDae[0] = collada.scene;

        bacteriaDae[0].position.x = 0;
        bacteriaDae[0].position.y = -1;
        bacteriaDae[0].position.z = -15;

        bacteriaDae[0].scale.x = bacteriaDae[0].scale.y = bacteriaDae[0].scale.z = 1;
        bacteriaDae[0].updateMatrix();

        bacteriaDae[0].name = 'bacteria0';

        scene.add( bacteriaDae[0] );
        render();
    } );

    colladaLoader.load('res/models/bacteria.dae', function ( collada ) {
        bacteriaDae[1] = collada.scene;

        bacteriaDae[1].position.x = 20;
        bacteriaDae[1].position.y = -1;
        bacteriaDae[1].position.z = -753;

        bacteriaDae[1].scale.x = bacteriaDae[1].scale.y = bacteriaDae[1].scale.z = 1;
        bacteriaDae[1].updateMatrix();

        bacteriaDae[1].name = 'bacteria1';

        scene.add( bacteriaDae[1] );
        render();
    } );

    colladaLoader.load('res/models/bacteria.dae', function ( collada ) {
        bacteriaDae[2] = collada.scene;

        bacteriaDae[2].position.x = 40;
        bacteriaDae[2].position.y = -1;
        bacteriaDae[2].position.z = -523;

        bacteriaDae[2].scale.x = bacteriaDae[2].scale.y = bacteriaDae[2].scale.z = 1;
        bacteriaDae[2].updateMatrix();

        bacteriaDae[2].name = 'bacteria2';

        scene.add( bacteriaDae[2] );
        render();
    } );

    colladaLoader.load('res/models/furbac.dae', function ( collada ) {
        bacteriaDae[3] = collada.scene;

        bacteriaDae[3].position.x = 40;
        bacteriaDae[3].position.y = -1;
        bacteriaDae[3].position.z = -150;

        bacteriaDae[3].scale.x = bacteriaDae[3].scale.y = bacteriaDae[3].scale.z = 1;
        bacteriaDae[3].updateMatrix();

        bacteriaDae[3].name = 'bacteria3';

        scene.add( bacteriaDae[3] );
        render();
    } );

    colladaLoader.load('res/models/furbac.dae', function ( collada ) {
        bacteriaDae[4] = collada.scene;

        bacteriaDae[4].position.x = 40;
        bacteriaDae[4].position.y = -1;
        bacteriaDae[4].position.z = -3;

        bacteriaDae[4].scale.x = bacteriaDae[4].scale.y = bacteriaDae[4].scale.z = 1;
        bacteriaDae[4].updateMatrix();

        bacteriaDae[4].name = 'bacteria4';

        scene.add( bacteriaDae[4] );
        render();
    } );

    colladaLoader.load('res/models/ugly-bacteria.dae', function ( collada ) {
        bacteriaDae[5] = collada.scene;

        bacteriaDae[5].position.x = 40;
        bacteriaDae[5].position.y = -1;
        bacteriaDae[5].position.z = 63;

        bacteriaDae[5].scale.x = bacteriaDae[5].scale.y = bacteriaDae[5].scale.z = 1;
        bacteriaDae[5].updateMatrix();

        scene.add( bacteriaDae[5] );
        render();
    } );

    //collisions with bacteria
    badObjects.push.apply(objects, bacteriaDae[0]);
    badObjects.push.apply(objects, bacteriaDae[1]);
    badObjects.push.apply(objects, bacteriaDae[2]);
    badObjects.push.apply(objects, bacteriaDae[3]);
    badObjects.push.apply(objects, bacteriaDae[4]);
    badObjects.push.apply(objects, bacteriaDae[5]);

}

function updateLives(decrease){
    // update the lives display, reduce lives if decrease is passed
    var livesNo = document.getElementById('lives-no');
    livesNo.innerHTML = '';

    if (decrease != undefined){
        lives = lives - 1;
    }

    for (i = 0; i < lives; i++) {
        livesNo.innerHTML = livesNo.innerHTML +' <i class="fa fa-heart" aria-hidden="true"></i>';
    }

    if (lives==0){
        //if you manage to get here, you have officially lost the game
        gameOver();
    }

}

function gameOver(){
    //show the game over screen and prevent the game from continuing
    document.getElementById('game-over-container').style.visibility = 'visible';
    document.getElementById('main-container').style.visibility = 'hidden';
}

function gameWon() {
    document.getElementById('game-won-container').style.visibility = 'visible';
    document.getElementById('main-container').style.visibility = 'hidden';
}
