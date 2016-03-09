var camera;
var tick = 0;
var scene;
var renderer;
clock = new THREE.Clock(true);
var controls;
var container;
var options;
var spawnOptions;
var particle;

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
        timeScale: 0.1,
    }


    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor( "rgb(51, 14, 14)", 1);
    container.appendChild(renderer.domElement);

    // setup controls
    controls = new THREE.FlyControls(camera, container);
    controls.movementSpeed = 100;
    controls.domElement = container;
    controls.rollSpeed = Math.PI / 24;
    controls.autoForward = true;
    controls.dragToLook = false;

    window.addEventListener('resize', onWindowResize, false);

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

function animate() {

    requestAnimationFrame(animate);

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
    update();
    render();

}

function update()
{
    // update the FPS / stats counter
    stats.update();
}

function render() {

    delta = clock.getDelta();

    //debug
    //console.log("Delta " + delta);

    controls.update(delta);

    renderer.render(scene, camera);


}