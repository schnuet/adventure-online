// the animatable object is basically the interactive object with animation functions.
// use texturePacker to pack animation sheets for this frame.

Game.addComponent ('animatable_object', ['renderer', 'loader', 'interactive_object'], function (game, renderer, loader, InteractiveObject) {

    AnimatableObject = function (scriptName, options) {
        renderer.MovieClip.call(this, [PIXI.Texture.EMPTY]);

        this.construct.call(this, scriptName, options, AnimatableObject.DEFAULTS);

        this._resourceList = [];

        _loadViews.apply(this)
    };

    // set the default settings:
    AnimatableObject.DEFAULTS = InteractiveObject.DEFAULTS;

    AnimatableObject.DEFAULTS.autoplay = true;       // _play the animation after loading
    AnimatableObject.DEFAULTS.animationSpeed = 0.5;  // _default: 1 -> 60 fps.
    AnimatableObject.DEFAULTS.views = [''];
    AnimatableObject.DEFAULTS.anchor = {x: 0, y: 0};
    AnimatableObject.DEFAULTS.onFrame = function (frame) {};



    AnimatableObject.prototype = Object.create(renderer.MovieClip.prototype);
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

    game.mixinPrototype(AnimatableObject.prototype, InteractiveObject.extendedPrototype);


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

    };

    AnimatableObject.prototype.update = function (deltaTime) {
        renderer.MovieClip.prototype.update.call(this, deltaTime);
        this._handleFrameChange();
        this.onFrame(this.currentFrame);
    };

    AnimatableObject.prototype._handleFrameChange = function () {
        //var frame = this.currentFrame;
    }

    return AnimatableObject;
});
