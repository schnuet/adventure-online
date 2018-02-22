// Main game Object.

// settings: {
//      gameContainer   _ID of container in which to insert the game
//      height          _real height of the game window
//      width           _real width of the game window
//      scale           _zoom factor to show a bigger game
//      fontsize        _default fontsize used for text
// }

(function functionName(window) {

    // base game object.
    var Game = function (settingsObject, gameData) {

        // ----------- settings ------------

        // the settings object is used for the general settings of the game
        // that do not influence gameplay directly
        this.settings = {
            baseMediaPath: './media/',
            height: 0,
            width: 0,
            scale: 1,
            fontsize: 30,
            gameContainer: 'gamebox'
        };

        // take the passed settings:
        for (var attrname in settingsObject) {
            this.settings[attrname] = settingsObject[attrname];
        }

        // ------------ other vars -------------

        // create the game objects. We pass in a reference to this object.
        this.gameData = gameData(this);


        this.data = {
            waiting: false
        };

        // here, we save variables used at the game runtime
        // e.g. the current hover text, the selected action
        // in short: nothing worth saving.
        this.currentState = {

        };

        // this is a container where you can put all the variables of your logic
        // that don't fit anywhere else.
        // e.g. didHeroSeeTheCat: false
        this.vars = {};

        // an array for chaining multiple actions in the game
        // so that different characters can wait for each other, etc.
        this.actionList = [];

        // a boolean controlling the flow of the action.
        this.runningActions = false;
        this._currentAction = null;

        // used for save events:
        this._saveData = {};

        // Modules
        this._loadedComponents = {};


        // ---------- construction ------------

        // create event loads all the required modules.
        this.triggerEvent('create');

        // add the connection to the modules to the game data.
        this.gameData.connect();

        this.triggerEvent('prepare');

        console.log ('-------- game system ready. -------');
    };

    // the events are set in the prototype so that they can still be editable
    // independently of an instance.
    Game.prototype.events = {
        create: []
    };

    /*Game.prototype.prepare = function () {
        this.triggerEvent('prepare');
    };*/

    Game.prototype.init = function () {
        this.triggerEvent('init');
        this.addEventListener('update', this.doActions.bind(this));
    };


    // ************** SAVING / LOADING *****************

    // JSON.stringify(value);
    // JSON.parse(value);
    Game.prototype.save = function (slot) {
        // if no saveslot was specified, save to autosave-slot 0.
        if (typeof slot === 'undefined') slot = 0;

        this.triggerEvent('beforeSave');

        var saveData = this._saveData;
        console.log (saveData);

        var textSaveData = JSON.stringify(saveData);
        console.log (textSaveData);

        localStorage.setItem('save' + slot, textSaveData);
        console.log ('SAVING: saved data to save' + slot);
    };

    Game.prototype.load = function (slot) {
        // if no saveslot was specified, load from autosave-slot 0.
        if (typeof slot === 'undefined') slot = 0;

        var textSaveData = localStorage.getItem('save' + slot);
        console.log ('LOADING: loaded save' + slot, textSaveData);

        this._saveData = JSON.parse(textSaveData);
        console.log ('Parsed save data: ', this._saveData);

        this.triggerEvent('onSavegameLoad');

        this.triggerEvent('afterSavegameLoad');
    };

    // ************** ACTION LIST **********************

    Game.prototype.doActions = function () {
        if (this.runningActions) {
            this.runningActions = false;

            // get the next goal if don't have one or the action can be jumped over.
            if ((this._currentAction === null || this._currentAction.blocking === false) && this.actionList.length > 0) {
                var a = this.actionList.shift();
                this._currentAction = a.action;
                a.element.runAction(a.action);
            }
        }
    };
    // add an action to the action queue:
    Game.prototype.pushAction = function (element, action) {
        this.actionList.push ({element: element, action: action});
        this.runningActions = true;
    };
    // a method to mark the end of an action execution.
    Game.prototype.nextAction = function () {
        game.currentState.blockingAction = false;
        this._currentAction = null;
        this.runningActions = true;
    };

    // add a waiting action (wait for ... milliseconds)
    Game.prototype.wait = function (time) {
        this.pushAction (this, {action: 'wait', time: time});
    };
    Game.prototype.runAction = function (action) {
        if (action.action === 'wait') {
            game.currentState.blockingAction = true;
            setTimeout (this.nextAction.bind(this), action.time);
        }
    };

    // ************** STATIC METHODS **********************

    var componentCallbacks = {};

    /**
     * @param {string} componentName   the name of the component to add
     * @param {Array} dependencies     an array with all the componentNames of the components it needs to work
     * @param {Function} callback      the building function that creates the component (called on 'create')
    **/
    Game.addComponent = function functionName(componentName, dependencies, callback) {

        componentCallbacks[componentName] = callback;

        // add to global event list.
        Game.prototype.events.create.push(function () {

            this.activateComponent(componentName, dependencies);
        });

        console.log ('Game: added component ' + componentName);
    };


    // ******************* COMPONENTS *************************

    /**
     * 
     * @param {string} componentName The name of the component
     * @param {string[]} dependencies The registered names of the modules the component requires.
     */
    Game.prototype.activateComponent = function (componentName, dependencies) {

        console.log ('Components: activating component ' + componentName);

        // get the object to each dependency (eg. dependency 'renderer' gets the module with the name 'renderer')
        var resolvedDeps = [];
        var l = dependencies.length;
        while (l--) {
            resolvedDeps[l] = this._loadedComponents[dependencies[l]];

            // give an error if the dependency was not found.
            if (typeof resolvedDeps[l] === 'undefined') {
                console.error('Components: The component "' + dependencies[l] + '" could not be added as dependency. (requested in ' + componentName + ')\nMake sure you load it before any component that is dependent on it.');
            }
        }

        // to pass a reference to the current game instance to the components,
        // add "this" as the first argument.
        resolvedDeps.unshift(this);

        // build the components, save them with their names
        this._loadedComponents[componentName] = componentCallbacks[componentName].apply(null, resolvedDeps);

        // the var has served its purpose. Not needed any longer.
        delete componentCallbacks;
    };

    /**
     *  Inserts the methods of a prototype to a different prototype
     *
     */
    Game.prototype.mixinPrototype = function (receiver, donator, overwrite) {
        // loop through all the properties of the donator prototype:
        for ( var property in donator ) {
            if ( donator.hasOwnProperty(property) ) {

                // if the receiver does not have the property (or if we chose to overwrite it)
                // save the property/method to the receiving object
                if (overwrite || receiver.hasOwnProperty(property) === false) {
                    receiver[property] = donator[property];
                }
            }
        }
    };

    Game.prototype.mixinComponent = function (receiver, donator, overwrite) {
        this.mixinPrototype(receiver.prototype, donator.prototype, overwrite);

        // save the component to the list of parent components:
        if (typeof receiver.prototype.pears !== 'array') receiver.prototype.pears = [];
        receiver.prototype.pears.push (donator.name);
    };



    // ************************ EVENTS ***********************

    // events are the way the different components in the system should communicate
    // with each other.
    // every component can trigger events and share data through that way.
    // Every component can listen to events and 'get notified' when something happened.


    Game.prototype.addEventListener = function (eventName, callback) {
        // create the event if it doesn't exist
        if (typeof this.events[eventName] === 'undefined') {
            this.events[eventName] = [];
        }
        // add the callback to the list of stuff to be done when the event is triggered
        this.events[eventName].push(callback);
    };
    Game.prototype.removeEventListener = function (eventName, callback) {
        var index = this.events[eventName].indexOf(callback);

        // If the callback wasn't registered, throw error.
        if (index === -1) {
            throw "Callback is not registered on event " + eventName;
        }

        this.events[eventName].splice(index, 1);
    };

    // trigger an event, activating every added callbacks
    Game.prototype.triggerEvent = function (eventName) {
        var eventlist = this.events[eventName];

        if (typeof eventlist === 'undefined') {
            //console.log ("No callbacks on event " + eventName);
            return;
        }
        // don't log when 'update' is triggered. happens too often.
        if (! (eventName === 'update')) console.log ('Event: ' + eventName + ' triggered.');

        // call every callback - in the order they were registered.
        var l = eventlist.length;
        for (var i = 0; i < l; i++) {
            eventlist[i].apply(this, Array.prototype.slice.call(arguments, 1));
        }
    };


    window.Game = Game;
})(window);
