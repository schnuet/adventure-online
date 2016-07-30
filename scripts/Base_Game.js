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

        // ------------ vars -------------

        this.gameData = gameData(this);

        // the settings object is used for the general settings of the game
        // that do not influence gameplay directly
        this.settings = {
            baseMediaPath: './media/',
            height: 0,
            width: 0,
            scale: 1,
            fontsize: 30,
        };

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

        // Der Container, in dem sich alle Zeichenflächen befinden
        this.parentdiv = null;

        // Modules
        this._loadedComponents = {};


        // ---------- construction ------------

        // take the passed settings:
        for (var attrname in settingsObject) {
            this.settings[attrname] = settingsObject[attrname];
        }

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
    };


    Game.prototype.start = function (loader, resources) {


    };

    // ************** STATIC METHODS **********************

    var componentCalls = {};

    /**
     * @params: componentName   _the name of the component to add
     *          dependencies    _an array with all the componentNames of the components it needs to work
      *         callback        _the building function that creates the component (called on 'create')
    **/
    Game.addComponent = function functionName(componentName, dependencies, callback) {

        componentCalls[componentName] = callback;

        // add to global event list.
        Game.prototype.events.create.push(function () {

            this.activateComponent(componentName, dependencies);
        });

        console.log ('Game: added component ' + componentName);
    };


    // ******************* COMPONENTS *************************

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
        this._loadedComponents[componentName] = componentCalls[componentName].apply(null, resolvedDeps);

        // the var has served its purpose. Not needed any longer.
        delete componentCalls;
    };

    Game.prototype.mixinPrototype = function (prototypeA, prototypeB, overwrite) {
        for ( var property in prototypeB ) {
            if ( prototypeB.hasOwnProperty(property) ) {
                if (overwrite || prototypeA.hasOwnProperty(property) === false) {
                    prototypeA[property] = prototypeB[property];
                }
            }
        }
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
