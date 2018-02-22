/**
 *  The Game Object is a base object that provides some functions all the different game elements might need.
 *  It can't be used by itself, though.
 */
Game.addComponent ('game_object', [], function (game) {

    function GameObject () {

    }

    // the game object default options:
    var DEFAULTS =
    {
            position: {
                x: 0,               //  _x position (required)
                y: 0                //  _y position (required)
            },
            z: 0,                   //  _z-index (used to order the objects on screen)
            visible: true,          //  _can the object be seen on screen
            interactive: true,      //  _can the user click on the object?
            width: 0,               //  _width of the object
            height: 0,              //  _height of the object
            baseline: 1,
            name: '',               //  _a readable display name (eg. 'Fernseher')
            tint: 0xFFFFFF,         //  _changing color of the object

                                    //  _some function hooks
            onClick: function() {},
            onMouseIn: function() {},
            onMouseOut: function() {}
    };

    // vars that should not be set in the options, but have to be saved:
    var saveValues = [];

    // the core constructor function.
    GameObject.prototype.construct = function (scriptName, options) {
        this.scriptName = scriptName;

        // save all the passed properties in the object.
        options = this._getDefaultProperties (options, DEFAULTS);

        // since this is the base class of other objects, all the options should
        // be used up right now. Otherwise, give a notice.
        let keys = Object.keys(options);
        if (keys.length > 0) console.log ('There are still options of '+ this.scriptName + ':', keys);

        // we need to back up some options, because the loading process meddles with some properties
        // (especially sizes.)
        this._afterLoadOptions = {
            width: options.width,
            height: options.height,
            baseline: options.baseline
        };
        if (typeof this._afterLoadOptions.baseline === 'undefined') this._afterLoadOptions.baseline = 1;

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

            //console.log(this);

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
                }*/
                if (typeof options[variable] === 'object') {
                    // using the lodash function to copy deep properties,
                    // e.g: {x: 0, y: 6} are the defaults, only x is set in the
                    // options. Using deep defaults, the default y will be kept.
                    this[variable] = _.defaultsDeep(options[variable], defaults[variable]);
                }
                else this[variable] = options[variable];

                // delete the option, we hav deelt wit it.
                delete options[variable];
                this._alreadySet.push(variable);
            }
            // set the value to the default value
            // if the property was not already set anywhere
            else if (this._alreadySet.indexOf(variable) === -1) {
                this[variable] = defaults[variable];
                this._alreadySet.push(variable);
            }
        }

        return options;
    };

    // some properties have to be updated after the object has been loaded.
    GameObject.prototype._updatePropsAfterLoad = function () {
        this.scale.x = this.scale.y = 1;
        if (this._afterLoadOptions.height) this.height = this._afterLoadOptions.height;
        if (this._afterLoadOptions.width) this.width = this._afterLoadOptions.width;
        if (this._afterLoadOptions.baseline) this.baseline = this._afterLoadOptions.baseline * this.height;

        this.z = this.y + this.baseline;

        delete this._afterLoadOptions;
    };

    // ========== saving ==============

    GameObject.prototype._getSaveData = function () {
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

    return GameObject;
});