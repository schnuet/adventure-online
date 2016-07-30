// the renderer component serves as bridge to the PIXI functions and objects.

Game.addComponent ('renderer', [], function (game) {

    // ==== Preparing the canvas ===

    // local variables
    var renderer = null;
    var gameWidth = 0;
    var gameHeight = 0;
    var time = new Date().getTime();

    // set the scale mode to pixel perfect (nearest neighbor)
    PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;

    var Renderer = function () {

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
    Renderer.prototype.MovieClip = PIXI.extras.MovieClip;
    Renderer.prototype.Text = PIXI.Text;

    // Die Funktion, um das Bild neu zu zeichnen.
    /*function drawScene () {
    	d_log ("bei Frame nr.+"+actframe+" wird der Hintergrund gezeichnet.");
    	// Zuerst wird das Bild geleert.
    	context_scene.clearRect (0, 0, game.settings.width, game.settings.height);
    	// Anschließend wird der Hintergrund des aktuellen Raums gezeichnet
    	context_scene.drawImage (loadedRoom.img, viewport.X, viewport.Y, loadedRoom.width, loadedRoom.height, 0, 0, loadedRoom.width, loadedRoom.height);

    	// Danach werden nacheinander alle Objekte auf die Leinwand aufgetragen.
    	drawObjects ();

    }

    function drawGui (drawing_context) {
    	drawing_context.clearRect (0, 0, game.settings.width, 480);

    	// Erst wird das Dialogauswahlfeld gezeichnet
    	if (actualDialog && SayList.length == 0) actualDialog.draw (drawing_context, 10, game.settings.height - actualDialog.height - game.settings.fontsize/4);

    	// Dann der gesprochene und angezeigte Text
    	if (MessageList.length > 0) {
    		if (MessageList[0].draw (true) == false) MessageList.splice (0, 1);
    	}
    	if (SayList.length > 0) {
    		if (SayList[0].active) {
    			if (SayList[0].draw(false) == false) SayList.splice (0, 1);
    		}
    	}

    	// Schließlich die aktivierten Gui-Elemente
    	if (guiList) {
    		var o = guiList.length;
    		while (o--) {
    			guiList[o].draw ();
    		}
    	}

    	// Danach darüber die Maus
    	mouse.draw (drawing_context);
    }


    // Eine Funktion für eine Schwarzblende zwischen zwei Szenen.
    // Sobald die variable "fade" über 0 ist, wird sie bei jedem Tick aufgerufen.
    var fade;
    function Fade () {
    	// Der Füllstil wird auf Schwarz gelegt.
    	context_objects.fillStyle="#000000";
    	// Nach und nach werden schwarze Flächen mit 80% Transparenz übereinandergelegt, um ein langsames abdunkeln zu bezwecken.
    	if (fade < 6) {
    		context_objects.globalAlpha=0.2;
    		context_objects.fillRect (0, 0, game.settings.width, game.settings.height);
    		fade++;
    	}
    	// Danach wird der Raum geändert, anschließend die Objektebene immer wieder neu gezeichnet, mit immer weniger Schwarzanteil.
    	else if (fade < 12){
    		if (fade == 6) drawScene ();
    		drawObjects ();
    		context_objects.globalAlpha = 1.0/(fade-5);
    		context_objects.fillRect (0, 0, game.settings.width, game.settings.height);
    		context_objects.globalAlpha=1.0;
    		fade++;
    	}
    	// Ist der Vorgang abgeschlossen, wird der Status wieder auf -1 gesetzt, damit das Spiel weiter gehen kann.
    	else {
    		drawObjects ();
    		fade = -1;
    	}
    }*/

    return new Renderer();
});
