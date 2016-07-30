

Game.addComponent ('interactive_object', ['renderer', 'loader'], function (game, renderer, loader) {


    function InteractiveObject (scriptName, options) {
        renderer.Sprite.call(this, null);

        this.construct(scriptName, options, InteractiveObject.DEFAULTS);
    };

    // the interactive object: default options:
    InteractiveObject.DEFAULTS =
    {
            image: '',              //  _image name to use (required)
            position: {
                x: 0,               //  _x position (required)
                y: 0                //  _y position (required)
            },
            z: 0,                   //  _z-index (used to order the objects on screen)
            visible: true,          //  _can the object be seen on screen
            interactive: true,      //  _can the user click on the object?
            width: 0,               //  _width of the image
            height: 0,              //  _height of the image
            baseline: 1,
            name: '',               //  _a readable display name (eg. 'Fernseher')

                                    //  _some function hooks
            onClick: function() {},
            onMouseIn: function() {},
            onMouseOut: function() {}
    };

    InteractiveObject.prototype = Object.create(renderer.Sprite.prototype);
    InteractiveObject.constructor = InteractiveObject;

    InteractiveObject.extendedPrototype = {};

    // ================== functions =================

    // the core constructor function.
    InteractiveObject.extendedPrototype.construct = function (scriptName, options, defaults) {
        this.scriptName = scriptName;

        // get all the options from the option object
        for (var variable in defaults) {
            ///console.log (variable, options[variable]);
            if (options.hasOwnProperty(variable)) {
                this[variable] = options[variable];
                //console.log (variable, options[variable]);
            }
            else {
                this[variable] = defaults[variable];
            }
        }

        // we need to back up some options, because the loading process meddles with some properties
        // (especially sizes.)
        this._afterLoadOptions = {
            width: options.width,
            height: options.height,
            baseline: options.baseline
        };
        if (typeof this._afterLoadOptions.baseline === 'undefined') this._afterLoadOptions.baseline = 1;

        this._resourceList = [
            this.image
        ];

        // internal vars:
        this._clickedAt = false;

        // setup events
        this
            // events for drag start
            .on('mousedown', this.handleMouseDown)
            .on('touchstart', this.handleMouseDown)
            // events for drag end
            .on('mouseup', this.handleMouseUp)
            .on('mouseupoutside', this.handleMouseUpOutside)
            .on('touchend', this.handleMouseUp)
            .on('touchendoutside', this.handleMouseUpOutside)
            // events for drag move
            //.on('mousemove', onDragMove)
            //.on('touchmove', onDragMove);

            // set the mouseover callback...
            .on('mouseover', this.handleMouseOver)

            // set the mouseout callback...
            .on('mouseout', this.handleMouseOut);
    };

    // === internal methods ===

    InteractiveObject.extendedPrototype._attachLoadedTexture = function () {
        this.texture = loader.resources[this.image].texture;
        this._updatePropsAfterLoad();
    };

    InteractiveObject.extendedPrototype._updatePropsAfterLoad = function () {
        if (this._afterLoadOptions.height) this.height = this._afterLoadOptions.height;
        if (this._afterLoadOptions.width) this.width = this._afterLoadOptions.width;
        if (this._afterLoadOptions.baseline) this.baseline = this._afterLoadOptions.baseline * this.height;

        this.z = this.y + this.baseline;

        delete this._afterLoadOptions;
    };

    // ==========  event handlers ==============

    InteractiveObject.extendedPrototype.handleMouseDown = function (event) {
        this._clickedAt = true;
    };
    InteractiveObject.extendedPrototype.handleMouseUp = function (event) {
        if (this._clickedAt) {
            this._clickedAt = false;

            // user-editable click event hook
            if (!game.currentState.blockingAction) {
                event.stopPropagation();
                this.onClick();
            }
            else {
                console.log ('Interaction: Click ignored.');
            }
        }
    };
    InteractiveObject.extendedPrototype.handleMouseUpOutside = function (event) {
        this._clickedAt = false;
    };
    InteractiveObject.extendedPrototype.handleMouseOver = function (event) {
        //this.scale.set(1);
        // user-editable mouse-in event hook

        if (game.currentState.hoveredElement !== this)
            game.currentState.hoveredElement = this;

        this.onMouseIn();
    };
    InteractiveObject.extendedPrototype.handleMouseOut = function (event) {
        //this.scale.set(1);
        // user-editable mouse-out event hook
        this.onMouseOut();
    };


    // a deleter function
    /*InteractiveObject.prototype.unbind = function () {
        this.texture
    };*/


    // add the extension to the prototype
    game.mixinPrototype (InteractiveObject.prototype, InteractiveObject.extendedPrototype);

    return InteractiveObject;
});
