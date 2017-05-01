// the animatable object is basically the interactive object with animation functions.
// use texturePacker to pack animation sheets for this frame.

Game.addComponent ('character', ['animatable_object', 'room', 'loader', 'renderer'], function (game, AnimatableObject, Room, Loader, renderer) {

    var DEFAULTS = {
        walkspeed: 5,
        dir: 'down',
        roomName: '',
        isPlayer: false,
        dirViews: null,
        talkViews: null,
        speechStyle: {
            color: 0x000000,
            fontSize: 26,
            fontFamily: 'Arial'
        }
    };

    // vars that should not be set in the options, but have to be saved:
    var saveValues = [

    ];

    function Character (scriptName, options) {

        // change object defaults to character defaults:
        if (typeof options.anchor === 'undefined') options.anchor = {x: 0.5, y: 1};
        if (typeof options.baseline === 'undefined') options.baseline = 0;
        if (typeof options.autoplay === 'undefined') options.autoplay = false;

        this._getDefaultProperties (options, DEFAULTS);

        // get parent settings
        AnimatableObject.call(this, scriptName, options);

        // === public vars ===

        this.moving = false;

        // fill the views with a default value if no view was passed:
        if (this.dirViews === null) this.dirViews = {down: this.views[0]};
        if (this.talkViews === null) this.talkViews = {down: this.views[0]};

        if (this.isPlayer === true && playerChar === '') {
            playerChar = this.scriptName;
            this.interactive = false;
        }

        // === internal vars ===
        this._currentAction = null;     // used in movement
        this._actionList = [];      // used in character control
        this._movementVector = {};  // used in movement

        game.addEventListener('update', this._onCycle.bind(this));

        // add the character to the character list
        characterList.push(this);
        this.id = characterList.length - 1;
        characterMap[scriptName] = this.id;

        // add the resources of this element to the general game loadlist
        // (so that we don't have to wait in the game for a character to load)
        Loader.addToLoadQueue(this._resourceList);

        console.log ('Character: created char ' + this.scriptName);
    }

    Character.prototype = Object.create(AnimatableObject.prototype);
    Character.constructor = Character;

    // === private vars ===

    var characterList = [];
    var characterMap = {};
    var _options = {};
    var playerChar = '';

    // ==== static vars ====

    //Character.player = null;

    // ===== public functions ====

    Character.prototype.say = function (text) {
        game.pushAction (this, {action: 'say', text: text, blocking: true});
    };

    Character.prototype.walk = function (x, y, blocking, callback) {
        game.pushAction (this, {action: 'move', goal: {x, y}, blocking: blocking, callback: callback});
        //this._actionList.push({action: 'move', goal: {x, y}, blocking: blocking, callback: callback});
    };

    Character.prototype.setAsPlayer = function () {
        playerChar = this.scriptName;
    };

    Character.prototype.changeRoom = function (roomName, x, y, dir, _noautochange) {
        Room.get(this.roomName).removeElement(this);
        this.previousRoom = this.roomName;
        this.roomName = roomName;

        // add the character to its room.
        Room.get(this.roomName).addElement(this);

        if (typeof x !== 'undefined') this.x = x;
        if (typeof y !== 'undefined') this.y = y;
        if (typeof y !== 'undefined') this.changeDir (dir);

        if (playerChar === this.scriptName && _noautochange !== false) {
            Room.load(roomName);
        }
    };

    Character.prototype.changeDir = function (dirName) {
        this.dir = dirName;
        // change the current view to match the direction:
        if (this.dirViews[dirName]) {
            this.changeView(this.dirViews[dirName]);
        }
    };

    Character.prototype.changeView = function (viewName) {
        this.textures = this._viewTextures[viewName];
        this.texture = this.textures[0];
    };

    // ==== internal functions ====

    Character.prototype.runAction = function (action) {
        // in case that we interrupted an action (when blocking: false), we reset the action flags:
        this.moving = false;
        //if (this._currentAction !== null) console.log ('Character: action interrupted: ' + this._currentAction.action);

        this._currentAction = action;

        if (this._currentAction.action === 'move') {
            this._movementVector = this._calculateMovementVector(this._currentAction.goal);
            this._updateDirection (this._movementVector);
            this.play();
            this.moving = true;
        }

        if (this._currentAction.action === 'say') {
            this._textDisplayed = true;
            this.speaking = true;

            // create and position a new text element:
            this._currentText = new renderer.Text(this._currentAction.text);
            this._currentText.anchor.x = 0.5;
            this._currentText.x = 0;
            this._currentText.y = -this.height;
            this._currentText.style.fill = this.speechStyle.color;
            this.addChild (this._currentText);

            console.log ('Text: --- ', this._currentText);

            // set a game flag that says that there is currently an
            // action running that blocks additions to action queues
            game.currentState.blockingAction = true;

            // provide a game-wide way to jump over the action:
            game.currentState.passAction = this._stopTalking.bind(this);

            // remove the text after a while
            this._textTimeout = setTimeout(this._stopTalking.bind(this), 3000);     // TODO: calculate time.

            // change the animation to the talking animation for the current direction (if available)
            if (this.talkViews[this.dir]) {
                console.log ('changing to talk view ' + this.dir);
                this.changeView(this.talkViews[this.dir]);
                this.play();
            }
        }

        this.doStuff = true;
    };

    // the 'update' method of the character.
    // method name 'update' is already taken, used for animation.
    Character.prototype._onCycle = function (deltaT) {
        if (this.doStuff === true) {

            this.doStuff = false;

            // get the next goal if don't have one or the action can be jumped over.
            /*if ((this._currentAction === null || this._currentAction.blocking === false) && this._actionList.length > 0) {

                this.runAction (this._actionList.shift());
            }*/

            // handle moving/walking stuff
            if (this.moving === true) {
                this.position.x += this._movementVector.x;
                this.position.y += this._movementVector.y;
                this.z = this.y + this.baseline;
                game.currentState.zUpdated = true;
                if (distance (this._currentAction.goal, this.position) < this.walkspeed) {
                    this.position.x = this._currentAction.goal.x;
                    this.position.y = this._currentAction.goal.y;

                    if (typeof this._currentAction.callback === 'function') {

                        var listBuffer = this._actionList.slice(0);
                        this._actionList = [];

                        this._currentAction.callback();

                        this._actionList = this._actionList.concat(listBuffer);
                        delete listBuffer;

                        //console.log ('callback happened - new list: ', this._actionList);
                    }

                    this.moving = false;
                    this._currentAction = null;
                    this.gotoAndStop(0);
                }
                this.doStuff = true;
            }
            else if (this.speaking === true) {
                if (this._textDisplayed === false) {

                    console.log ('Text finished.');

                    this.removeChild (this._currentText);
                    delete this._currentText;

                    this._currentAction = null;
                    this.speaking = false;
                    this.gotoAndStop(0);
                }
                this.doStuff = true;
            }
            // if none of the actions were called, we must be finished with the action cycle.
            else {
                game.nextAction();
            }
        }
    };

    Character.prototype._stopTalking = function () {
        if (game.currentState.passAction === this._stopTalking)
            game.currentState.passAction = null;
        clearTimeout(this._textTimeout);
        this._textDisplayed = false;
    };

    Character.prototype._updateDirection = function (mV) {
        var xD = 1;
        var yD = 1;
        if (mV.x < 0) xD = -1;
        if (mV.y < 0) yD = -1;
        if (abs(mV.x) > abs(mV.y)) {
            if (xD === 1) this.changeDir ('right');
            else this.changeDir ('left');
        }
        else {
            if (yD === 1) this.changeDir ('down');
            else this.changeDir ('up');
        }
    };

    Character.prototype._calculateMovementVector = function (point) {
        var d = distance(point, this.position);
        var v = {};
        var dY = point.y - this.position.y;
        var dX = point.x - this.position.x;

        if (d >= 1) {
            var aX = dX/d;
            var aY = dY/d;
            v = { x: this.walkspeed * aX, y: this.walkspeed * aY};
        }
        else {
            v = {x: dX, y: dY};
        }
        return v;
    };

    Character.prototype._attachLoadedTexture = function () {
        // make sure all the texture attaching gets done correctly
        AnimatableObject.prototype._attachLoadedTexture.call(this);

        // setting the anchor automatically. TODO: Should be configurable.
        //this.anchor.x = 0.5;
        //this.anchor.y = 1;
    };

    Character.prototype._handleFrameChange = function () {

        // skip the first frame of the walking view cycles:
        if (this.moving && this.currentFrame === 0) {
            //console.log ('skipping one frame.');
            // move a frame ahead
            this._currentTime = 1;
            this._texture = this._textures[this.currentFrame];
        }
    };

    Character.prototype._getSaveData = function () {

        // save all the default values from the inherited class
        var saveData = AnimatableObject.prototype._getSaveData.call(this);

        // save all the properties that can be set in the defaults
		for (var property in DEFAULTS) {
			if (this.hasOwnProperty(property)) {
				saveData[property] = this[property];
			}
		}

        // get the other values
		var i = saveValues.length;
		while (i--) {
			saveData[saveValues[i]] = this[saveValues[i]];
		}

		return saveData;
	};

    // === public static functions ===

    Character.get = function (characterName) {
        if (typeof characterMap[characterName] === 'undefined') {
			console.error ("Kein Charakter mit dem Namen " + characterName + " vorhanden.");
		}
		var charId = characterMap[characterName];

		return characterList[charId];
    };

    Character.getPlayer = function () {
        return Character.get(playerChar);
    };
    Character.setPlayer = function (scriptName) {
        Character.getPlayer().interactive = true;
        playerChar = scriptName;
        Character.getPlayer().interactive = false;
    };

    // === private static functions ===

    // called when a place in a room was clicked where there is no object
    var handleRoomClick = function (clickPlace, event) {
        if (playerChar !== '') {
            var p = Character.getPlayer();

            // user-editable click event hook
            if (!game.currentState.blockingAction) {
                p.walk(clickPlace.x, clickPlace.y, false);
            }
            else if (typeof game.currentState.passAction === 'function') {
                console.log ('Character - Room Click: aborted current action.');
                game.currentState.passAction();
            }
            else {
                console.log ('Character - Room Click: Click ignored.');
            }
        }
        else console.error('No player character defined.');
    };

    // ==== used utility functions ====

    // get the distance between two points
    function distance( point1, point2 )
    {
      var xs = 0;
      var ys = 0;

      xs = point2.x - point1.x;
      xs = xs * xs;

      ys = point2.y - point1.y;
      ys = ys * ys;

      return Math.sqrt( xs + ys );
    }
    // absolute value
    function abs( number ) {
        if (number < 0) number *= -1;
        return number;
    }

    // === game preparation function ===

    // load everything from the configuration and wire the properties into real files.
    function createCharacters () {

        // get the data to build the characters from.
        var characterConfig = game.gameData.character;

        if (typeof characterConfig === 'undefined') {
            console.error ('Character: Keine Charaktere eingestellt. Mindestens ein Character wäre super.');
            return;
        }

        // split the options from the rest of the settings object:
        _options = characterConfig.options;
        delete characterConfig.options;

        // rework the defaults based on the character options.
        // TODO!
        //DEFAULTS = options.defaults.

        // make characters from the rest of the array:
        for (var charName in characterConfig) {
            new Character (charName, characterConfig[charName]);
        }

        console.log ('Characters: All characters created: ', characterList);
        console.log ('-----');
    };

    // called after all the textures for the characters are loaded.
    function positionCharacters () {
        var i = characterList.length;
        while (i--) {
            // attach the textures that have been loaded.
            characterList[i]._attachLoadedTexture();

            // add the character to its room.
            Room.get(characterList[i].roomName).addElement(characterList[i]);
        }
    }

    // saving the characters:
    game.addEventListener ('beforeSave', function () {

		var saveChars = {};

		saveChars.settings = {
			playerChar: playerChar,
		};

		// loop through all the characters and save each one.
		var i = characterList.length;
		while (i--) {
			console.log ('saving char ' + characterList[i].scriptName);
			saveChars[characterList[i].scriptName] = characterList[i]._getSaveData();
		}

		game._saveData.character = saveChars;
	});

    // process a load event
	game.addEventListener ('onSavegameLoad', function () {

        // get the data to build the characters from.
        var characterConfig = game._saveData.character;

        // split the options from the rest of the settings object:
        _options = characterConfig.settings;
        delete characterConfig.settings;

        playerChar = _options.playerChar;

		// loop through all the rooms in the save:
		for (var charName in characterConfig) {
			var r = Character.get(charName);

			// change all the properties of the current rooms to the saved props.
			for (var variable in characterConfig[charName]) {
                // room changing:
                if (variable === 'roomName') {
                    r.changeRoom(characterConfig[charName][variable]);
                }
                else {
                    r[variable] = characterConfig[charName][variable];
                }
			}
		}

		console.log ('CHARACTER: Load -> all character properties loaded.');
	});

    game.addEventListener ('afterSavegameLoad', function () {
        var player = Character.getPlayer();
        // change the room if the player character is not in its room anymore
        if (Room.getCurrent() !== player.roomName) {
            player.changeRoom(player.roomName);
        }
    });

    // add listeners to events:
    game.addEventListener('prepare', createCharacters);
    game.addEventListener('game_loaded', positionCharacters);

    game.addEventListener('room_click', handleRoomClick);

    return Character;
});
