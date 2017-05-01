// the animatable object is basically the interactive object with animation functions.
// use texturePacker to pack animation sheets for this frame.

import Renderer from './Renderer.js';
import Loader from './Loader.js';
import GameObject from './GameObject.js';

//Game.addComponent ('animatable_object', ['renderer', 'loader', 'game_object'], function (game, renderer, loader, GameObject) {

// set the default settings:
var DEFAULTS = {
    autoplay: true,                 // _play the animation after loading
    animationSpeed: 0.5,            // _default: 1 -> 60 fps.
    views: [],
    anchor: {
        x: 0,
        y: 0
    },
    onFrame : function (frame) {

    }
};

// vars that should not be set in the options, but have to be saved:
var saveValues = [];

AnimatableObject = function (scriptName, options) {
    renderer.AnimatedSprite.call(this, [PIXI.Texture.EMPTY]);

    options = this._getDefaultProperties (options, DEFAULTS);

    // construct the GameObject
    this.construct.call(this, scriptName, options);

    this._resourceList = [];

    _loadViews.apply(this);
};

AnimatableObject.prototype = Object.create(renderer.AnimatedSprite.prototype);
AnimatableObject.constructor = AnimatableObject;

// === private functions ===

// load all the views of the object and add the required variables.
function _loadViews () {

    // adding variables:
    this._resolvedViews = {};
    this._viewTextures = {};
    this.currentView = '';

    // get the images from the view:
    var l = this.views.length;
    for (var i = 0; i < l; i++) {
        _loadView.apply (this, [ this.views[i] ]);
    }

    // set the default view to the first view
    this.currentView = this.views[0];
}

// load the elements of a view
function _loadView (view) {

    // get to the right 'folder'
    var parts = view.split('/');
    var dir = game.gameData.views;
    var l = parts.length;
    for (var i = 0; i < l; i++) {
        dir = dir[parts[i]];
    }
    // save the 'folder' for future use
    this._resolvedViews[view] = dir;

    // add the view image(s) to the resources to load.
    this._resourceList.push(dir.image);
};

game.mixinComponent(AnimatableObject, GameObject);


// === internal functions ===

AnimatableObject.prototype._attachLoadedTexture = function () {

    var i = this.views.length;
    while (i--) {

        var textureArray = [];
        var view = this._resolvedViews[ this.views[i] ];

        var l = view.frames.length;
        for (var j = 0; j < l; j++) {
            textureArray.push (loader.resources[view.image].textures[view.frames[j]]);
        }

        this._viewTextures[ this.views[i] ] = textureArray;
    }

    this.textures = this._viewTextures[this.currentView];
    this.texture = this.textures[0];

    // reset size to fit the new textures.
    this.scale.x = this.scale.y = 1;

    this._updatePropsAfterLoad();

    if (this.autoplay) {
        console.log (this.name + ' starting to play.');
        this.play();
    }

    this._loaded = true;
};

AnimatableObject.prototype._getSaveData = function () {

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

AnimatableObject.prototype.update = function (deltaTime) {
    renderer.AnimatedSprite.prototype.update.call(this, deltaTime);
    this._handleFrameChange();
    this.onFrame(this.currentFrame);
};

AnimatableObject.prototype._handleFrameChange = function () {
    //var frame = this.currentFrame;
}

export default GameObject;
