var camera;
var tick = 0;
var scene;
var renderer;
var clock = new THREE.Clock(true);
var controls;
var container;
var particleOptions;
var spawnOptions;
var particle;
var spermModel;
var eggModel;

init();
animate();

function init() {
    container = document.getElementById('main-container');
    document.body.appendChild(container);

    //stats
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    stats.domElement.style.zIndex = 100;
    container.appendChild(stats.domElement);

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );

    scene = new THREE.Scene();

    camera.position.set(0,0,50);

    particle = new THREE.GPUParticleSystem({maxParticles: 250000});
    scene.add(particle);


    // options passed during each spawned
    particleOptions = {
        position: new THREE.Vector3(),
        positionRandomness: 100,
        velocity: new THREE.Vector3(),
        velocityRandomness: 360,
        color: 0xf5f5f5,
        colorRandomness: 0,
        turbulence: 100,
        lifetime: 1.1,
        size: 10,
        sizeRandomness: 5
    };

    spawnOptions = {
        spawnRate: 15000,
        horizontalSpeed: 5,
        verticalSpeed: 5,
        timeScale: 0.1
    };

    colladaLoaderSperm = new THREE.ColladaLoader();
    colladaLoaderEgg = new THREE.ColladaLoader();
    colladaLoaderSperm.options.convertUpAxis = true;

    colladaLoaderSperm.load('res/models/sperm.dae',function(collada){
        spermModel = collada.scene;

        spermModel.position.x = 0;
        spermModel.position.y = 0;
        spermModel.position.z = -600;

        spermModel.traverse( function ( child ) {
            if ( child instanceof THREE.SkinnedMesh ) {
                var animation = new THREE.Animation( child, child.geometry.animation );
                animation.play();
            }
        } );

        spermModel.scale.x = spermModel.scale.y = spermModel.scale.z = 0.01;
        spermModel.updateMatrix();

        scene.add(spermModel);

        animate();

    });


    colladaLoaderEgg.load('res/models/egg.dae',function(collada) {

        eggModel = collada.scene;

        eggModel.position.x = 0;
        eggModel.position.y = 0;
        eggModel.position.z = -1000;

        eggModel.scale.x = eggModel.scale.y = eggModel.scale.z = 2;
        eggModel.updateMatrix();

        scene.add(eggModel);
    });


    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor( "rgb(51, 14, 14)", 1);
    container.appendChild(renderer.domElement);

    // setup controls
    controls = new THREE.FlyControls(camera, container);
    controls.movementSpeed = 500;
    controls.domElement = container;
    controls.rollSpeed = Math.PI / 24;
    controls.autoForward = false;
    controls.dragToLook = false;

    window.addEventListener('resize', onWindowResize, false);


    var light = new THREE.DirectionalLight(0xffffff, 5.5);
    light.position.set(1,1,1);
    scene.add(light);
    var light2 = new THREE.DirectionalLight(0xffffff, 3.75);
    light2.position.set(-1,-0.5,-1);
    scene.add(light2);



    //still needs work
    //camera.lookAt(spermModel.position);

}



function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

function animate() {

    var delta = clock.getDelta() * spawnOptions.timeScale;
    tick += delta;

    if (tick < 0) tick = 0;

    if (delta > 0) {
        particleOptions.position.x = Math.random(tick * spawnOptions.horizontalSpeed) * 20;
        particleOptions.position.y = Math.random(tick * spawnOptions.verticalSpeed) * 10;
        particleOptions.position.z = Math.random(tick * spawnOptions.horizontalSpeed + spawnOptions.verticalSpeed) * 5;

        for (var x = 0; x < spawnOptions.spawnRate * delta; x++) {
            particle.spawnParticle(particleOptions);
        }
    }

    particle.update(tick);

    spermModel.position.z =  camera.position.z - 5;
    spermModel.position.y =  camera.position.y - 1;
    spermModel.position.x =  camera.position.x;
    console.log("Sperm position: " + spermModel.position.z);



    update();
    render();

}

function update() {

    delta = clock.getDelta();

    controls.update(delta);

    stats.update();

}

function render() {

    delta = clock.getDelta();

    var positionMovement = camera.position.y;

    //debug for movement
    console.log("Camera position " + positionMovement);

    controls.moveForward = false;
    controls.moveBackward = false;
    controls.moveLeft = false;
    controls.moveRight = false;

    camera.position.y = positionMovement;

    THREE.AnimationHandler.update( clock.getDelta() );
    renderer.render(scene, camera);

    requestAnimationFrame(animate);

}