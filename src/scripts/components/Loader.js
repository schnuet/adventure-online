// Das hier ist ein Modul, das alle Ressourcen managed, damit es bei der Laufzeit des Spiel zu keinen Fehlern kommt.

let _ = require('lodash');

export default function (game) {

	var basePath = '';

	var Loader = function () {
		this.loader = PIXI.loader;

		// a list of all the loaded resources:
		this.resources = [];

		// a list of stuff that has to be loaded.
		this.toLoad = [];

		basePath = game.settings.baseMediaPath;

		game.addEventListener ('init', this.loadMedia.bind(this, this.toLoad, this._afterInitialLoad));
	};

	// a helper function that eliminates duplicates in an array:
	/*function uniq(arr) {
	    return arr.sort().filter(function(item, pos, ary) {
	        return !pos || item != ary[pos - 1];
	    })
	}*/

	Loader.prototype.loadMedia  = function (mediaList, callback) {

		if (mediaList.length === 0) {
			console.log ('Nothing to load. Proceeding.');
			callback();
			return;
		}

		mediaList = _.uniq(mediaList);

		console.log ('Loader: media list to load: ', mediaList);

		//this.loader.reset();

		var newRessources = 0;

		// add every picture to load list
		var i = mediaList.length;
		while (i--) {
			// add the resource - if it is not loaded yet.
			if (!this.resources[mediaList[i]]) {
				this.loader.add(mediaList[i], basePath + mediaList[i]);
				newRessources++;
			}
		}

		// if any new ressources have been added to the loader, load them:
		if (newRessources > 0) {
			this.loader.load(this._mediaLoaded.bind(this, callback));
		}
		// if all ressources have already been loaded, call the callback directly:
		else {
			console.log ('Loader: All resources already loaded. Proceeding.');
			callback();
		}

		return this;
		//DrawLoadingScreen ("Der Header wird geladen.");
	};

	Loader.prototype.addToLoadQueue = function (resArray) {
		var i = resArray.length;
		while (i--) {
			this.toLoad.push (resArray[i]);
		}
	};

	// ==== internal functions ====

	Loader.prototype._mediaLoaded = function (callback, loader, resources) {
		this.resources = resources;
		console.log ('Loader: loaded resources. ', this.resources);
		callback();
	};

	Loader.prototype._afterInitialLoad = function () {
		game.triggerEvent('game_loaded');
		console.log ('------- game successfully loaded -------');
	};

	return new Loader();
};
