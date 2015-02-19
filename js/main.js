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
	
	var PI = Math.PI;
	var MASS_EARTH = 1800000;
	var MASS_MOON = MASS_EARTH/4;
	var bg;
	var earth;
	var moon;
	var music;
	var cursors;
	var player;
    var splosions;
	var logo;
	
	
	
    function preload() {
       
        game.load.image('bg', 'imgs/background.jpg');
		game.load.image('planet', 'imgs/planet.png');
		game.load.image('moon', 'imgs/moon.png');
		game.load.image('ov', 'imgs/OV.png');
		
		game.load.spritesheet('splosion', 'imgs/explosion.png', 96, 96, 17);
		
		game.load.audio('music', 'audio/USAFBvenus.ogg');
		game.load.audio('war', 'audio/USAFBmars.ogg');
    }
    

    
    function create() {
		
		game.world.setBounds(0, 0, 3000, 3000);
		
		//background
		bg = game.add.tileSprite( 0, 0, 1280, 768, 'bg');
		bg.fixedToCamera = true;
		
		music = game.add.audio('music');
		music.onDecoded.add(start, this);//there will be a delay before music starts
		
		game.physics.startSystem(Phaser.Physics.P2JS);
		
		earth = game.add.sprite(game.world.centerX, game.world.centerY, 'planet');
		moon = game.add.sprite((game.world.centerX /*+ 600*/), (game.world.centerY - 700), 'moon');
		player = game.add.sprite(game.world.centerX - 310, game.world.centerY + 230, 'ov');
		
		game.physics.p2.enable([earth, moon, player]);	
		
		earth.body.setCircle(300);
		moon.body.setCircle(150);
		
		player.body.angle = -35;
		
		/*earth.mass = 100;
		moon.mass = 25;
		player.mass = 1;*/
		
		
		player.body.setZeroDamping();
		earth.body.setZeroDamping();
		moon.body.setZeroDamping();
		
		moon.body.fixedRotation = true;
		//earth.body.kinematic = true;
		//moon.body.kinematic = true;
		
		earth.body.velocity.x = 0;
		earth.body.velocity.y = 0;
		earth.body.angularVelocity = .03;
		//earth.body.fixedRotation = true;
		
		moon.body.velocity.x = -60;
		moon.body.velocity.y = 0;
		
		
		player.body.velocity.x = -15;
		player.body.velocity.y = -30;	
		
		//makes the planets not collide, but fires off events when other sprites come into contact
		//otherwise running player into earth... changes the trajectory of earth.
		earth.body.data.shapes[0].sensor = true;
		moon.body.data.shapes[0].sensor = true;
		
		//player.body.createBodyCallback(earth, hitEarth, this);
		player.body.onBeginContact.add(splode, this);
		
		cursors = game.input.keyboard.createCursorKeys();
		
		splosions = game.add.group();
		for (var i = 0; i < 10; i++){
        
		var splosionAnimation = splosions.create(0, 0, 'splosion', [0], false);
        splosionAnimation.anchor.setTo(0.5, 0.5);
        splosionAnimation.animations.add('splosion');
		}
		
		moon.bringToTop();
		earth.bringToTop();	
		
			var text = "Click to Start";
			var style = { font: "85px Arial", fill: "#b0eeff", align: "center" };

			logo = game.add.text(400, 300, text, style);
			logo.fixedToCamera = true;
		
		game.camera.focusOn(earth);
		game.camera.follow(player);

		game.paused = true;
		game.input.onDown.add(unpause, self);
		
    }
	
    
    function update() {
		
		//update moon's motion to rotate around the earth.
		var force = [];
		
		var x = distance(moon, earth); 
		var gravity = (MASS_EARTH + MASS_MOON)/Math.pow(x, 2);//I know that's not the equation. gameplay.
		var direction = angleOf(moon, earth);
		
		force[0] = Math.cos(direction)*gravity;
		force[1] = Math.sin(direction)*gravity;
		
		moon.body.force.x = force[0];
		moon.body.force.y = force[1];
		
		//calculate current force on the player - gravity of the moon, gravity of the earth, thrust.
		var eForce = [];
		var mForce = [];
		var thrust = [];
		
		//gravity decreases by radius of the mass squared. This matters in space. I need a distance function.
		x = distance(player, earth); 
		var eGravity = MASS_EARTH / Math.pow(x, 2); //MASS_EARTH isn't actually the earth's mass. it's just what makes the game feel right
		var eAngle = angleOf(player, earth);
		
		eForce[0] = Math.cos(eAngle)*eGravity;
		eForce[1] = Math.sin(eAngle)*eGravity;
		
		x = distance(player, moon);
		var mGravity =  MASS_MOON / Math.pow(x, 2); //MASS_MOON = MASS_EARTH/4
		var mAngle = angleOf(player, moon);
		
		mForce[0] = Math.cos(mAngle)*mGravity;
		mForce[1] = Math.sin(mAngle)*mGravity;
		
		//console.log(x);
		
		if (cursors.up.isDown)
		{
			var a = player.rotation + Math.PI / 2;
			thrust[0] = Math.cos(a)*-20;
			thrust[1] = Math.sin(a)* -20;
		}
		else{
			thrust[0] = 0;
			thrust[1] = 0;
		}
		
		player.body.force.x = eForce[0] + mForce[0] + thrust[0];
		player.body.force.y = eForce[1] + mForce[1] + thrust[1];
		
		if (cursors.left.isDown)
		{
			player.body.rotateLeft(15);
		}
		else if (cursors.right.isDown)
		{
			player.body.rotateRight(15);
		} 
		else{
			player.body.setZeroRotation();
		}
		
		bg.tilePosition.x = -game.camera.x;
		bg.tilePosition.y = -game.camera.y;
		
    }
	
	function distance(sprite1, sprite2){
	
		var s = Math.sqrt(Math.pow((sprite1.x - sprite2.x), 2)+ Math.pow(sprite1.y - sprite2.y, 2));

		
		return s;
	
	}
	
	function splode(body, shapeA, shapeB, equation){
		
		//	The player hit something
		//	This callback is sent: the Body it collides with
		//	shapeA is the shape in the calling Body involved in the collision
		//	shapeB is the shape in the Body it hit
		//	equation is an array with the contact equation data in it
		
			player.kill();
		    var splosionAnimation = splosions.getFirstExists(false);
			splosionAnimation.reset(player.x, player.y);
			splosionAnimation.play('splosion', 30, false, true)
			
			var text = "You died!";
			var style = { font: "65px Arial", fill: "#ff0044", align: "center" };

			var t = game.add.text(500, 0, text, style);
			t.fixedToCamera = true;
			
			text = "Hint: There are no brakes."
			t = game.add.text(250, 640, text, style);
			t.fixedToCamera = true;
			
			music.stop();
		
	}
	
	function angleOf(sprite1, sprite2){
		var ang = Math.atan2(sprite2.y - sprite1.y, sprite2.x - sprite1.x);
		return ang;
	}
	
	function start(){
		
		music.fadeIn(5000);
	}
	
	function unpause(event){
		
		logo.destroy();
		game.paused = false;
	}
};
