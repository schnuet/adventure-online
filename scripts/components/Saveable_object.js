
Game.addComponent ('saveable_object', [], function (game) {
    // vars that should not be set in the options, but have to be saved:
    var saveValues = [];

    function SaveableObject () {

    }

    // return all the properties of the object that we want to save.
    SaveableObject.prototype._getSaveData = function (propertiesToSave) {
		var saveData = {};

		for (var property in propertiesToSave) {
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

    return SaveableObject;
});
