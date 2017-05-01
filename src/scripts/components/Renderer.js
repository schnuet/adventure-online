// the renderer component serves as bridge to the PIXI functions and objects.

let PIXI = require('pixi.js');

export default function (game) {

    console.log (PIXI);

    // ==== Preparing the canvas ===

    // local variables
    var renderer = null;
    var gameWidth = 0;
    var gameHeight = 0;
    var time = new Date().getTime();

    // set the scale mode to pixel perfect (nearest neighbor)
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

    function Renderer () {

        // hook functions
        this.onRender = function(){};

        // --------------- construct the object -------------

        // Autodetect and create the renderer
        renderer = PIXI.autoDetectRenderer(game.settings.width, game.settings.height);

        // Set the background color of the renderer to a baby-blue'ish color
        renderer.backgroundColor = 0x04180b;

        // set the game width.
        this.width = renderer.width / 2;
        this.width = renderer.height / 2;

        // Create the main stage
        this.stage = new PIXI.Container();

        // set the 'zoom' level according to the settings
        this.stage.scale.y = this.stage.scale.x = game.settings.scale;


        game.addEventListener('init', this.init.bind(this));
    };

    Renderer.prototype.init = function () {

        // add the renderer view element to the DOM
        document.getElementById(game.settings.gameContainer).appendChild(renderer.view);

        // start the draw cicle
        this.draw();
    };



    Renderer.prototype.draw = function () {

        // get the time elapsed since last draw:
        var newTime = new Date().getTime();
        var deltaT = newTime - time;
        time = newTime;

    	/*if (fade > -1) {
    		Fade ();
    	}
    	else {
    		drawGui (context_gui);
    		for (var i = 0; i < AnimateList.length;i++) {
    			if (AnimateList[i].room == loadedRoom) AnimateList[i].animate ();
    			drawObjects ();
    		}
    		// Regelmäßiges Screenupdate bei Bildänderung
    		if (didsomethingchange) {
    			drawObjects ();
    			didsomethingchange = false;
    		}
    	}*/

        this.onRender(deltaT);

        game.triggerEvent('update', deltaT);

        // Render our container
        renderer.render(this.stage);

    	requestAnimationFrame( this.draw.bind(this) );
    }

    // method to sort the layers
    function depthCompare(a, b) {
        if (a.z < b.z)  return -1;
        if (a.z > b.z)  return 1;
        return 0;
    }

    Renderer.prototype.addLayer = function (layer) {
        this.stage.addChild(layer);
        this.stage.children.sort(depthCompare);
    };
    Renderer.prototype.removeLayer = function (layer) {
        this.stage.removeChild(layer);
    };

    // ========= EXTENDING CLASSES ==========

    // make a layer, extending the container.
    Renderer.prototype.Layer = function () {
        PIXI.Container.call(this);
        this.z = 0;
    };
    Renderer.prototype.Layer.prototype = Object.create (PIXI.Container.prototype, {});
    Renderer.prototype.Layer.constructor = Renderer.prototype.Layer;
    Renderer.prototype.Layer.prototype.sortChildren = function () {
        this.children.sort(depthCompare);
    };

    Renderer.prototype.createSprite = function (image) {
        return new PIXI.Sprite.fromImage (game.settings.baseMediaPath + image);
    };

    // give access to PIXI classes.
    Renderer.prototype.Sprite = PIXI.Sprite;
    Renderer.prototype.AnimatedSprite = PIXI.extras.AnimatedSprite;
    Renderer.prototype.Text = PIXI.Text;
    Renderer.prototype.Graphics = PIXI.Graphics;
    Renderer.prototype.Rectangle = PIXI.Rectangle;

    return new Renderer();
};
