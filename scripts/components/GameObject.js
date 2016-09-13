/**
 *  The Game Object is a base object that provides some functions all the different game elements might need.
 *  It can't be used by itself, though.
 */
Game.addComponent ('game_object', [], function (game) {

    // the game object default options:
    var DEFAULTS =
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
            tint: 0xFFFFFF,         //  _changing color of the object

                                    //  _some function hooks
            onClick: function() {},
            onMouseIn: function() {},
            onMouseOut: function() {}
    };

    function GameObject () {

    }

    // the core constructor function.
    GameObject.prototype.construct = function (scriptName, options) {
        this.scriptName = scriptName;

        options = this._getDefaultProperties (options, DEFAULTS);

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
        this._loaded = false;

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

        return options;
    };

    // === internal methods ===

    // save all the options in the options to the GameObject, if a default value exists for them
    GameObject.prototype._getDefaultProperties = function (options, defaults) {

        // create an internal var to save if we set an option at any point:
        if (typeof this['_alreadySet'] === 'undefined') this['_alreadySet'] = [];

        // get all the options from the option object
        for (var variable in defaults) {

            if (options.hasOwnProperty(variable)) {

                /*if (typeof options[variable] === 'array') {
                    console.log (variable + ' is an array...');
                }
                else if (typeof options[variable] === 'object') {
                    console.log (variable + ' is an object...');
                }*/
                this[variable] = options[variable];

                // delete the option, we hav deelt wit it.
                delete options[variable];
                this._alreadySet.push(variable);
            }
            // don't overwrite properties if they were already set.
            else if (this._alreadySet.indexOf(variable) === -1) {
                this[variable] = defaults[variable];
                this._alreadySet.push(variable);
            }
        }

        return options;
    };

    // loading methods:

    GameObject.prototype._attachLoadedTexture = function () {
        this.texture = loader.resources[this.image].texture;
        this._updatePropsAfterLoad();
        this._loaded = true;
    };

    GameObject.prototype._updatePropsAfterLoad = function () {
        this.scale.x = this.scale.y = 1;
        if (this._afterLoadOptions.height) this.height = this._afterLoadOptions.height;
        if (this._afterLoadOptions.width) this.width = this._afterLoadOptions.width;
        if (this._afterLoadOptions.baseline) this.baseline = this._afterLoadOptions.baseline * this.height;

        this.z = this.y + this.baseline;

        delete this._afterLoadOptions;
    };


    // ==========  event handlers ==============

    GameObject.prototype.handleMouseDown = function (event) {
        this._clickedAt = true;
    };
    GameObject.prototype.handleMouseUp = function (event) {
        if (this._clickedAt) {
            this._clickedAt = false;

            // user-editable click event hook
            if (!game.currentState.blockingAction) {
                event.stopPropagation();
                this.onClick();
            }
            else if (typeof game.currentState.passAction === 'function') {
                console.log ('Interaction: aborted current action.');
                game.currentState.passAction();
            }
            else {
                console.log ('Interaction: Click ignored.');
            }
        }
    };
    GameObject.prototype.handleMouseUpOutside = function (event) {

        this._clickedAt = false;
    };
    GameObject.prototype.handleMouseOver = function (event) {

        // save the hovered element on a game wide state:
        if (game.currentState.hoveredElement !== this)
            game.currentState.hoveredElement = this;

        // user-editable mouse-in event hook
        this.onMouseIn();
    };
    GameObject.prototype.handleMouseOut = function (event) {

        // user-editable mouse-out event hook
        this.onMouseOut();
    };
});
