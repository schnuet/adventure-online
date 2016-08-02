// Das hier ist ein Modul, das alle Ressourcen managed, damit es bei der Laufzeit des Spiel zu keinen Fehlern kommt.

/*var sprites = {};
var loader = PIXI.loader
    .add('cloudstars',"imgs/cloudstars.jpg")
    .add('star1',"imgs/star1.png")

    .load(function (loader, resources) {
         sprites.title_ship = new PIXI.Sprite(resources.title_ship.texture);
         var ready = setTimeout(accountSetup,3000);
     });*/

Game.addComponent ('loader', [], function (game) {

	// Variablen für den Ladevorgang
	/*var checkload;
	var resToLoadCount = 0;
	var sndsToLoadCount = 0;*/

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
	function uniq(arr) {
	    return arr.sort().filter(function(item, pos, ary) {
	        return !pos || item != ary[pos - 1];
	    })
	}

	Loader.prototype.loadMedia  = function (mediaList, callback) {

		if (mediaList.length === 0) {
			console.log ('Nothing to load. Proceeding.');
			callback();
			return;
		}

		mediaList = uniq(mediaList);

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

	// Zeichnet einen Ladebildschirm auf das Bild
	/*function DrawLoadingScreen (text) {
		context_scene.fillStyle="#ffffff";
		context_scene.fillRect (0,0,game.settings.width,game.settings.height);
		context_scene.lineWidth = 4;
		context_scene.fillStyle="#464646";
		context_scene.font="50px mountains_of_christmasregular";
		context_scene.fillText (text,game.settings.width/2-300,250);
	}

	// Ein Container für ein Bildobjekt: Beim Laden wird das geladene Objekt zurückgegeben.
	function ImageLoader (src) {
		this.load = load;
		this.hasLoaded = hasLoaded;
		this.img = new Image ();
		this.src = src;


		function load () {
			// Die Liste der Bilder, die geladen werden, wird um 1 erhöht.
			resToLoadCount++;

			// Ein neues Bild wird aus der angegebenen quelle erstellt, es wird angewiesen, nach dem Ladevorgang "HasLoaded" aufzurufen.
			this.img.src = "game/pics/" + this.src;
			this.img.addEventListener ("load", this.hasLoaded.bind(this), false);
			return this.img;
		}

		function hasLoaded () {
			resToLoadCount--;
			this.img.removeEventListener ("load", this.hasLoaded.bind(this), false);
			WaitToLoad ();
		}
	}

	function AudioDummy () {
		d_log("creating dummy sound.");
		this.currentTime = 0;
		this.setVolume = function () {};
		this.play = function () {};
		this.pause = function () {};
	}

	// Ein Container für ein Audioobjekt: Beim Laden wird das geladene Objekt zurückgegeben.
	function Sound (src, altsrc, callback) {
		this.load = load;
		this.hasLoaded = hasLoaded;
		this.errorCame = errorCame;
		this.audio = new Audio ();
		this.setVolume = function (volume) {
			this.audio.volume = volume;
		};
		if (this.audio.canPlayType ("audio/mpeg;")) this.src = src;
		else if (this.audio.canPlayType ("audio/ogg;"))this.src = altsrc;
		else callback (new AudioDummy ());

		function load () {
			// Die Liste der Sounds, die geladen werden, wird um 1 erhöht.
			resToLoadCount++;

			// Ein neuer Sound wird aus der angegebenen quelle erstellt, es wird angewiesen, nach dem Ladevorgang "WaitToLoad" aufzurufen.
			this.audio.src = "game/snd/" + this.src;
			this.audio.addEventListener ("canplaythrough", this.hasLoaded.bind(this), false);
			this.audio.addEventListener ("error", this.errorCame.bind(this), false);
		}

		function hasLoaded () {
			resToLoadCount--;
			this.audio.removeEventListener ("canplaythrough", this.hasLoaded.bind(this), false);
			callback (this.audio);
			WaitToLoad ();
		}

		function errorCame () {
			d_log ("Fehler beim laden des Sounds");
			resToLoadCount--;
			this.audio.removeEventListener ("error", this.errorCame.bind(this), false);
			callback (new AudioDummy ());
			WaitToLoad ();
		}
	}

	// Überprüft, ob Bilder geladen haben und gibt Anweisungen für den Fall, wenn ja und wenn nicht.
	function WaitToLoad () {
		if (resToLoadCount > 0) { 				// Falls noch Bilder am Laden sind, wird das auf dem Bildschirm angezeigt.
			DrawLoadingScreen ("Noch " + resToLoadCount + " Objekte zu laden.");
		}
		else if  (resToLoadCount == 0){		// Falls alle Bilder fertig geladen sind, werden die nächsten Schritte eingeleitet.
			DrawLoadingScreen ("Alles fertig geladen.");

			// Alle Szenen- und Objektdaten werden geschrieben.
			BuildGame ();

			// Ab jetzt sollen clicks und Mauspositionen behandelt werden.
			parentdiv.addEventListener ("mousemove", mouse.onMove, true); //cv_scene
			parentdiv.addEventListener ("mousedown", mouse.onClick, true); //cv_scene
			parentdiv.oncontextmenu = function() {	// Kontextmenü ausschalten.
			   return false;
			}

			// Der erste Raum wird geladen, der Spielzyklus wird gestartet.
			room[roomName].load ();
			room_cycle = setInterval (game_cycle, 1000/60);
			drawGame ();
		}
		else d_log (resToLoadCount);
	}*/

	return new Loader();
});
