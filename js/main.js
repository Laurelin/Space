window.onload = function() {
    // You might want to start with a template that uses GameStates:
    //     https://github.com/photonstorm/phaser/tree/master/resources/Project%20Templates/Basic
    
    // You can copy-and-paste the code from any of the examples at http://examples.phaser.io here.
    // You will need to change the fourth parameter to "new Phaser.Game()" from
    // 'phaser-example' to 'game', which is the id of the HTML element where we
    // want the game to go.
    // The assets (and code) can be found at: https://github.com/photonstorm/phaser/tree/master/examples/assets
    // You will need to change the paths you pass to "game.load.image()" or any other
    // loading functions to reflect where you are putting the assets.
    // All loading functions will typically all be found inside "preload()".
    
    "use strict";
	
    var game = new Phaser.Game( 1280, 768, Phaser.AUTO, 'game', { preload: preload, create: create, update: update } );
	
	var bg;
	var earth;
	var moon;
	
    
    function preload() {
       
        game.load.image('bg', 'imgs/background.jpg');
		game.load.image('planet', 'imgs/planet.png');
		game.load.image('moon', 'imgs/moon.png');
		game.load.image('ov', 'imgs/OV.png');
		game.load.audio('music', 'audio/USAFBvenus.ogg');
		game.load.audio('war', 'audio/USAFBmars.ogg');
    }
    

    
    function create() {
		
		game.world.setBounds(-2000, -2000, 4000, 4000);
		
		//background
		bg = game.add.sprite( 0, 0, 'bg');
		bg.fixedToCamera = true;
		
		twinkle = game.add.audio('music');
		
		earth = game.add.sprite(game.world.centerX, game.world.centerY, 'planet');
		
		moon = game.add.sprite((game.world.centerX + 400), (game.world.centerY - 200), 'moon');
		cursors = game.input.keyboard.createCursorKeys();

		
		
    }
	
    
    function update() {
	
		if (cursors.up.isDown)
		{
			game.camera.y -= 4;
		}
		else if (cursors.down.isDown)
		{
			game.camera.y += 4;
		}

		if (cursors.left.isDown)
		{
			game.camera.x -= 4;
		}
		else if (cursors.right.isDown)
		{
			game.camera.x += 4;
		} 
    }
	
	function render() {

    game.debug.cameraInfo(game.camera, 32, 32);

	}
};
