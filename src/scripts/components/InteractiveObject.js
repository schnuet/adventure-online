import Renderer from './Renderer.js';
import Loader from './Loader.js';

import GameObject from './GameObject.js';


//Game.addComponent ('interactive_object', ['renderer', 'loader', 'game_object'], function (game, renderer, loader, GameObject) {

function InteractiveObject (scriptName, options) {
    renderer.Sprite.call(this, null);

    options = this._getDefaultProperties (options, DEFAULTS);
    this.construct(scriptName, options, DEFAULTS);

    this._resourceList = [
        this.image
    ];
};

var DEFAULTS = {
    image: ''              //  _image name to use (required)
};

// vars that should not be set in the options, but have to be saved:
var saveValues = [];

InteractiveObject.prototype = Object.create(renderer.Sprite.prototype);
InteractiveObject.constructor = InteractiveObject;


// === loading methods ===

InteractiveObject.prototype._attachLoadedTexture = function () {
    this.texture = loader.resources[this.image].texture;
    this._updatePropsAfterLoad();
    this._loaded = true;
};

// === saving ===

InteractiveObject.prototype._getSaveData = function () {
    // save all the default values from the inherited class
    var saveData = GameObject.prototype._getSaveData.call(this);

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

// add the extension to the prototype
game.mixinComponent (InteractiveObject, GameObject);

export default InteractiveObject;
