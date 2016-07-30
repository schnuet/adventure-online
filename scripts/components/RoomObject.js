// Extend the room to support the addition of objects.

Game.addComponent ('room_object', ['room', 'interactive_object', 'animatable_object'], function (game, Room, InteractiveObject, AnimatableObject) {

    // extend Room prototype to add object support:
    Room.prototype.objectList = [];
    Room.prototype.objectMap = {};

    Room.prototype.addObject = function (scriptName, options) {

        var newObject = null;

        // create an animatable object or a standard object
        if (options.animatable === true) {
            newObject = new AnimatableObject(scriptName, options);
        }
        else {
            newObject = new InteractiveObject(scriptName, options);
        }

        // add the object to the room object list
        this.objectList.push (newObject);

        // set the object id
        newObject.id = this.objectList.length - 1;
        this.objectMap[scriptName] = newObject.id;

        // add the image to the list of resources to load when entering the room:
        var oRes = newObject._resourceList.length;
        while (oRes--) {
            this._resourceList.push(newObject._resourceList[oRes]);
        }

        // set the name of the objects room
        newObject.roomName = this.scriptName;

        // when the object's room loads, load the object.
        game.addEventListener('room_loaded', onLoadRoom.bind(null, newObject));

        console.log ('RoomObjects: created object ' + newObject.scriptName);
    };

    Room.prototype.deleteObject = function (objectName) {
        var id = this.objectMap[objectName];

        // remove the object from the scene
        this.removeElement (this.objectList[id]);

        // remove the objects texture from the resource list
        this._resourceList.splice(this._resourceList.indexOf(this.objectList[id].image), 1);

        // remove the object from the object name map
        delete this.objectMap[objectName];

        // replace the object with null.
        // todo: reorder the whole object list... or not?
        this.objectList[id] = null;
    };

    // load event - called when all the resources in the room are loaded.
    function onLoadRoom (object, roomName) {
        // only load it if the loaded room is the room the object is in.
        if (roomName !== object.roomName) return;

        // create the image element of the object
        object._attachLoadedTexture ();

        // add the element to the room layer
        var room = Room.get(roomName);
        room.addElement(object);

        console.log ('RoomObject: loaded object ' + object.name);
    }


    // ********** EVENT HOOKS *****************

    // on game load:
    game.addEventListener ('prepare', function () {
        var config = game.gameData.room_object;

		// split the options from the rest of the settings object:
		var options = config.options;
		delete config.options;

        // go through all the listed rooms
        for (var roomName in config) {
            if (config.hasOwnProperty(roomName)) {
                var roomObjects = config[roomName];

                var currentRoom = Room.get(roomName);

                // ...and create all the objects listed there.
                for (var objectName in roomObjects) {
                    if (roomObjects.hasOwnProperty(objectName)) {
                        currentRoom.addObject(objectName, roomObjects[objectName]);
                        //new RoomObject (currentRoom, objectName, roomObjects[objectName]);
                    }
                }
            }
        }
    });

    return {

    };
});
