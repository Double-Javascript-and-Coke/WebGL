
// Stores the animations.
var myDaeAnimations;
// Stores the key frame animations.
var keyFrameAnimations = [];
// The length of the key frame animations array.
var keyFrameAnimationsLength = 0;
// Stores the time for the last frame. 
// Used to control animation looping.
var lastFrameCurrentTime = [];





myColladaLoader.load( 'spinner.dae', function ( collada ) {
			// Here we store the dae in a global variable.
			myDaeFile = collada.scene;
			
			// Store the animations.
			myDaeAnimations = collada.animations;
			// Store the number of animations.
			keyFrameAnimationsLength = myDaeAnimations.length;

		    // Initialise last frame current time.
		    for ( var i = 0; i < keyFrameAnimationsLength; i++ ) {
		    	lastFrameCurrentTime[i] = 0;
		    }

			// Get all the key frame animations.
			for ( var i = 0; i < keyFrameAnimationsLength; i++ ) {
				var animation = myDaeAnimations[ i ];

				var keyFrameAnimation = new THREE.KeyFrameAnimation( animation );
				keyFrameAnimation.timeScale = 1;
				keyFrameAnimation.loop = false;
				// Add the key frame animation to the keyFrameAnimations array.
				keyFrameAnimations.push( keyFrameAnimation );
			}
			
			
			
			startAnimations();
			
			
			
			
			// Start the animations.
function startAnimations(){
	// Loop through all the animations.
	for ( var i = 0; i < keyFrameAnimationsLength; i++ ) {
		// Get a key frame animation.
		var animation = keyFrameAnimations[i];
		animation.play();
	}
}

// Manually loop the animations.
function loopAnimations(){
	// Loop through all the animations.
	for ( var i = 0; i < keyFrameAnimationsLength; i++ ) {
		// Check if the animation is player and not paused.
		if(keyFrameAnimations[i].isPlaying && !keyFrameAnimations[i].isPaused){
			if(keyFrameAnimations[i].currentTime == lastFrameCurrentTime[i]) {
				keyFrameAnimations[i].stop();
				keyFrameAnimations[i].play();
				lastFrameCurrentTime[i] = 0;
			}
		}

	}
}