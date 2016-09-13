// Das hier ist das Raum-Modul

Game.addComponent ('gui', ['renderer', 'loader', 'interactive_object', 'animatable_object'], function (game, renderer, Loader, InteractiveObject, AnimatableObject) {

	// ***************** GUI CONTAINER *****************

	var DEFAULTS = {
		z: 10,
		visible: false,
		position: {
			x: 0,
			y: 0
		}
	};
	var saveValues = [];

	var Gui = function (scriptName, options) {

		renderer.Layer.call(this);

		// save the important options:
		this.scriptName = scriptName;

		// save the optional options:
		// get all the options from the option object
		for (var variable in DEFAULTS) {
			///console.log (variable, options[variable]);
			if (options.hasOwnProperty(variable)) {
				this[variable] = options[variable];
				//console.log (variable, options[variable]);
			}
			else {
				this[variable] = DEFAULTS[variable];
			}
		}

		this._resourceList = [];
		this.objectList = [];
		this.objectMap = {};

        // add the new GUI to the game GUI list
		guiList.push(this);
		this.id = guiList.length - 1;
		guiMap[scriptName] = this.id;

		// add the layer to the canvas
		if (this.visible === true) {
			this.show();
		}

		console.log ('Gui: Created gui ' + this.scriptName);
	}


    Gui.prototype = Object.create(renderer.Layer.prototype);
    Gui.constructor = Gui;

	// ==== private variables ====

	var _options = {};
    var guiMap = {};
    var guiList = [];

	// ==== public functions ====

	Gui.prototype.addChild = function (element) {
		renderer.Layer.prototype.addChild.call(this, element);
		this.sortChildren();
	};
	Gui.prototype.removeChild = function (element) {
        // call the removeChild function of the inherited class:
        renderer.Layer.prototype.removeChild.call(this, element);
		this.sortChildren();
	};

	Gui.prototype.show = function () {
		this.visible = true;
		renderer.addLayer(this);
	};

	Gui.prototype.hide = function () {
		this.visible = false;
		renderer.removeLayer (this);
	};

	Gui.prototype.load = function () {

        /*
        // load background and add it to the canvas
		this.background = new renderer.Sprite(Loader.resources[this.backgroundImg].texture);
		// make sure the background image is always drawn in the back.
		this.background.z = -500;
		this.addChild(this.background);
        */

        /* background interaction
		this.background.interactive = true;
		this.background.on('mouseup', this._handleClick.bind(this));
        */

		game.triggerEvent('gui_loaded', this.scriptName);

		//game.addEventListener ('update', this._onCycle.bind(this));
	};


	// ============= GUI CONTENT ELEMENTS ===============

	Gui.prototype.addObject = function (scriptName, options) {

        var newObject = null;

        // create an animatable object or a standard object
        if (options.type === 'animated') {
            newObject = new AnimatableObject(scriptName, options);
        }
        else if (options.type === 'image') {
            newObject = new InteractiveObject(scriptName, options);
        }
		else if (options.type === 'graphic') {
			newObject = new renderer.Graphics(); //scriptName, options

			var GRAPHIC_DEFAULTS = {
				size: {
					w: 100,
					h: 100
				},
				lineWidth: 0,
				lineColor: 0x000000,
				lineAlpha: 1,
				fillColor: 0xFFFFFF,
				fillAlpha: 1
			};

			// add the functions of an InteractiveObject to the graphic button
			game.mixinPrototype (newObject, InteractiveObject.extendedPrototype);
			InteractiveObject.prototype.construct.call(newObject, scriptName, options);

			newObject._getDefaultProperties(options, GRAPHIC_DEFAULTS);

			newObject._resourceList = [];

			// draw a rectangle
			newObject.beginFill(newObject.fillColor, newObject.fillAlpha);
			newObject.lineStyle(newObject.lineWidth, newObject.lineColor, newObject.lineAlpha);
			newObject.drawRect(0, 0, newObject.size.w, newObject.size.h);

			newObject.hitArea = new renderer.Rectangle(0, 0, newObject.size.w, newObject.size.h);
		}
		newObject.type = options.type;

		// if there is text in the element, add the text:
		if (options.text) {
			var style = {};
			if (typeof options.textStyle !== 'undefined') style = options.textStyle;
			var text = new renderer.Text(options.text, style);
			text.anchor.x = 0;
            text.x = options.textPosition.x || 0;
            text.y = options.textPosition.y || -this.height;
			newObject.addChild(text);
		}

        // add the object to the room object list
        this.objectList.push (newObject);

        // set the object id
        newObject.id = this.objectList.length - 1;
        this.objectMap[scriptName] = newObject.id;

        // add the image to the list of resources to load when entering the room:
        var oRes = newObject._resourceList.length;
        while (oRes--) {
            this._resourceList.push(newObject._resourceList[oRes]);
        }

        // set the name of the objects room
        newObject.guiName = this.scriptName;

        // when the object's room loads, load the object.
        game.addEventListener('gui_loaded', onLoadGui.bind(null, newObject));

        console.log ('Gui: created element ' + newObject.scriptName);
    };

    Gui.prototype.deleteObject = function (objectName) {
        var id = this.objectMap[objectName];

        // remove the object from the scene
        this.removeElement (this.objectList[id]);

        // remove the objects texture from the resource list
        this._resourceList.splice(this._resourceList.indexOf(this.objectList[id].image), 1);

        // remove the object from the object name map
        delete this.objectMap[objectName];

        // replace the object with null.
        // todo: reorder the whole object list... or not?
        this.objectList[id] = null;
    };

	// load event - called when all the resources in the room are loaded.
    function onLoadGui (object, guiName) {

		console.log ('gui ' + guiName + ' loaded', object);
        // only load it if the loaded room is the room the object is in.
        if (guiName !== object.guiName) return;


        // create the image element of the object - if the element is not a plain graphic.
        if (!object._loaded && object.type !== 'graphic') object._attachLoadedTexture ();

        // add the element to the room layer
        var gui = Gui.get(guiName);
        gui.addChild(object);

        console.log ('Gui: loaded object ' + object.scriptName, object);
    }

	// === internal functions ===

	Gui.prototype._handleClick = function (event) {
		var point = event.data.getLocalPosition(this);
		game.triggerEvent('gui_click', point, event);
	};

	Gui.prototype._getSaveData = function () {
		var saveData = {};
		for (var property in DEFAULTS) {
			if (this.hasOwnProperty(property)) {
				saveData[property] = this[property];
			}
		}
		var i = saveValues.length;
		while (i--) {
			saveData[saveValues[i]] = this[saveValues[i]];
		}

		return saveData;
	};

	Gui.prototype._onCycle = function (deltaTime) {

	};

	// ==== static functions ====

	Gui.get = function (guiName) {
		if (typeof guiMap[guiName] === 'undefined') {
			throw "Kein Raum mit dem Namen " + guiName + " vorhanden.";
		}
		var guiId = guiMap[guiName];

		return guiList[guiId];
	};

	// ==== create the guis ====

	// load everything from the configuration and wire the properties into real elements.
	function setupGuis () {
		var guiConfig = game.gameData.gui;

		// split the options from the rest of the settings object:
		_options = guiConfig.options;
		delete guiConfig.options;

		// make guis from the rest of the array:
		for (var guiName in guiConfig) {
			if (guiConfig.hasOwnProperty(guiName)) {
				var options = guiConfig[guiName];

				// split the gui elements from the gui container options:
				var elements = {};
				if (typeof options.elements !== 'undefined') {
					elements = options.elements;
					delete options.elements;
				}

				// create the gui container:
				var g = new Gui (guiName, options);

				// create all the different gui elements:
				for (var element in elements) {
					g.addObject(element, elements[element]);
				}

				// add the resources of this element to the general game loadlist
		        // (so that we don't have to wait in the game for a gui to load)
		        Loader.addToLoadQueue(g._resourceList);
			}
		}

		console.log ('Gui: List of guis. ', guiList);
	};

	function createGuis () {
		// loop though all guis:
		var i = guiList.length;
		while (i--) {
			// load every single one:
			guiList[i].load();
		}
	};

	// process a save event
	game.addEventListener ('beforeSave', function () {

		var saveGuis = {};

		saveGuis.settings = {

		};

		// loop through all the guis:
		var i = guiList.length;
		while (i--) {
			console.log (guiList[i].scriptName);
			saveGuis[guiList[i].scriptName] = guiList[i]._getSaveData();
		}

		game._saveData.gui = saveGuis;
	});

	// process a load event
	game.addEventListener ('onSavegameLoad', function () {
		var guiConfig = game._saveData.gui;

		// split the options from the rest of the settings object:
		_options = guiConfig.settings;
		delete guiConfig.settings;

		// loop through all the guis in the save:
		for (var guiName in guiConfig) {
			var r = Gui.get(guiName);

			// change all the properties of the current guis to the saved props.
			for (var variable in guiConfig[guiName]) {
				r[variable] = guiConfig[guiName][variable];
			}
		}

		console.log ('GUI: all gui properties loaded.');
	});

	// bind the creation to the game events
	game.addEventListener('prepare', setupGuis);
	game.addEventListener('game_loaded', createGuis);

	return Gui;
});
