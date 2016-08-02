// Das hier ist das Raum-Modul

Game.addComponent ('room', ['renderer', 'loader'], function (game, renderer, loader) {

	// ***************** ROOM OBJECT *****************

	var DEFAULTS = {
		name: '',		// _ a readable, descriptive Name of the room
		music: '',		// _ the name of the music file to play in that room
		loop: true,

		enter : function () {},
		repEx : function () {},
		leave : function () {}
	}

	var Room = function (scriptName, options) { // image, width, height, scriptName, options) {

		// create the layer this room will be drawn in:
		this.layer = new renderer.Layer();
		this.backgroundImg = options.image;

		// save the important options:
		this.scriptName = scriptName;
		this.width = options.width;
		this.height = options.height;

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

		if (this.music) {
			if (this.loop) this.music.loop = true;
		}

		this._resourceList = [
			this.backgroundImg
		];

		this.visited = 0;

		// add the new Room to the game Room list
		roomList.push(this);
		this.id = roomList.length - 1;
		roomMap[scriptName] = this.id;

		console.log ('Room: Created room ' + this.scriptName);
	}

	// ==== private variables ====

	var roomList = [];
	var roomMap = {};
	var _options = {};

	var currentRoom = '';
	var currentRoomNbr = -1;

	// ==== public functions ====

	Room.prototype.addElement = function (element) {
		this.layer.addChild(element);
		this.layer.sortChildren();
	};
	Room.prototype.removeElement = function (element) {
		this.layer.removeChild(element);
		this.layer.sortChildren();
	};

	Room.prototype.load = function () {

		// if that room is currently loaded, don't do anything.
		if (currentRoom === this.scriptName) return;

		// if a room is currently loaded, unload that one first.
		if (currentRoom !== '') {
			roomList[roomMap[currentRoom]].unload();
		}

		currentRoom = this.scriptName;
		currentRoomNbr = this.id;

		//viewport.set (0, 0);
		this.visited++;

		loader.loadMedia(this._resourceList, this._resourcesLoaded.bind(this));

					// Musikübergang --> ...wenn musik eingebaut.

					/*var prevsnd = null;
					if (game.currentRoom) {
						d_log ("vorheriger Raum:" + game.currentRoom.name);
						if (game.currentRoom.music) prevsnd = game.currentRoom.music;
					}
					if (prevsnd !== this.music) {
						if (prevsnd) prevsnd.pause ();
						if (this.music) this.music.currentTime = 0;
						if (this.music) this.music.play ();
					}*/

		//new Message (this.name, 60, 590).display();



		console.log ('Room: Raum ' + this.scriptName + ' geladen. ');
	};

	Room.prototype.unload = function () {

			// Offene Daten vom letzten Raum entfernen (geöffnete Dialoge, Sätze, usw.)
			/*if (mouse.hoveredElement){
				mouse.hoveredElement.hoverOff ();
				mouse.hoveredElement = null;
			}
			actualDialog = null;
			MessageList.splice (0, MessageList.length);
			SayList.splice (0, SayList.length);*/

		// call leave action of the room.
		if (this.leave) this.leave ();

		renderer.removeLayer(this.layer);

		currentRoom = '';
		currentRoomNbr = -1;
	};

	// === internal functions ===

	Room.prototype._handleClick = function (event) {
		var point = event.data.getLocalPosition(this.background);
		game.triggerEvent('room_click', point, event);
		//console.log ('Room clicked ', point);
	};

	Room.prototype._resourcesLoaded = function () {
		// load room background and add it to the canvas
		this.background = new renderer.Sprite(loader.resources[this.backgroundImg].texture);
		// make sure the background image is always drawn in the back.
		this.background.z = -500;
		this.layer.addChild(this.background);

		this.background.interactive = true;
		this.background.on('mouseup', this._handleClick.bind(this));

		renderer.addLayer(this.layer);

		if (this.enter) this.enter ();
		game.triggerEvent('room_loaded', this.scriptName);

		console.log ('------ room completely loaded -----');

		game.addEventListener ('update', this._onCycle.bind(this));
	};

	Room.prototype._onCycle = function (deltaTime) {
		// check if the room is currently loaded
		if (currentRoomNbr === this.id) {
			// TODO: some sort of flag or somtin to prevent continous sorting
			if (game.currentState.zUpdated) {
				this.layer.sortChildren();
				game.currentState.zUpdated = false;
			}
		}
	};

	// ==== static functions ====

	Room.get = function (roomName) {
		if (typeof roomMap[roomName] === 'undefined') {
			throw "Kein Raum mit dem Namen " + roomName + " vorhanden.";
		}
		var roomId = roomMap[roomName];

		return roomList[roomId];
	};
	Room.load = function (roomName) {
		console.log ('-------------------------------');
		console.log ('Room: Loading room ' + roomName);
		Room.get(roomName).load();
	};

	Room.getCurrent = function () {
		return Room.get(currentRoom);
	};

	// ==== create the rooms ====

	// load everything from the configuration and wire the properties into real files.
	function setupRooms () {
		var roomConfig = game.gameData.room;

		// split the options from the rest of the settings object:
		_options = roomConfig.options;
		delete roomConfig.options;

		// make rooms from the rest of the array:
		for (var roomName in roomConfig) {
			if (roomConfig.hasOwnProperty(roomName)) {
				new Room (roomName, roomConfig[roomName]); /*.image,
				 			roomConfig[roomName].width,
							roomConfig[roomName].height,
							roomName,
							roomConfig[roomName].options);*/
			}
		}

		console.log ('Room: List of rooms. ', roomList);
	};

	function loadFirstRoom () {
		if (_options.startRoom !== 'undefined') {
			Room.load (_options.startRoom);
		}
	};

	// bind the creation to the game events
	game.addEventListener('prepare', setupRooms);
	game.addEventListener('game_loaded', loadFirstRoom);

	return Room;
});
