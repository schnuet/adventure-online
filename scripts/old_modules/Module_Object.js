// Das hier ist die Objekt - "Klasse"
var ObjectModuleLoaded = true;

var AnimateList = [];
var views = [];
var charList = []; // Verwaltungsliste für alle Charaktere

function RoomObject (room, xpos, ypos, width, height, image, name, xsource, ysource) {

	// Deklaration der einzelnen Variablen des Objektes
	this.room = room;
	this.x = xpos;
	this.y = ypos;
	this.width = width;
	this.height = height;
	this.img = image;
	this.name = name;
	if (!xsource) this.xsource = 0;
	else this.xsource = xsource;
	if (!ysource) this.ysource = 0;
	else this.ysource = ysource;

	this.clickable = true;
	this.visible = true;
	this.comment = "Da gibt es nichts zu sehen...";
	this.frame = 0;
	this.framerate = 20;
	this.sound = null;
	this.anyClick = null;

	this.room.ObjectList.push (this);

	// Variablen für die Behandlung bei einem Click auf das Objekt
	this.type = "placeholder";
	this.roomToGo = 0;
	this.inventoryItem = 0;

	// Entfernt das Objekt aus dem Raum. Für immer.
	this.remove = function () {
		var ObjIndex = loadedRoom.ObjectList.indexOf(this);
		if (AnimateList.indexOf (this)>-1) AnimateList.splice (AnimateList.indexOf (this), 1);
		loadedRoom.ObjectList.splice (ObjIndex, 1);
	}

	// Verwandelt das Objekt in einen "Raumänderer"
	this.makeToPath = function (roomtogo) {
		this.type = "path";
		this.roomToGo = roomtogo;
	}

	// Erlaubt das Nehmen eines Objekts beim Click.
	this.makeTakable = function (item) {
		this.type = "take";
		this.inventoryItem = item;
	}

	// Handlung beim "Überfahren" des Objekts
	this.hover = function () {
		didsomethingchange = true;
	}

	// Handlung beim Verlassen des Objekts
	this.hoverOff = function () {
		didsomethingchange = true;
	}

	// Handlung beim Click auf das Objekt
	this.click = function () {
		if (usedItem !== null) {
			if (! this.useItemOn) player.say ("Das verstößt gegen das Eichhörnchengesetz!");
			else this.useItemOn (usedItem);
			usedItem = null;
			didsomethingchange = true;
		}
		else if (this.type == "path") {
			if (this.sound !== null){
				this.sound.currentTime = 0;
				this.sound.play ();
			}
			player.changeRoom(this.roomToGo, 600, 550);
		}
		else if (this.type == "take") {
			player.inv.addItem (this.inventoryItem, 600, 550);
			this.remove ();
			didsomethingchange = true;
		}
		else if (this.anyClick !== null) {
			this.anyClick ();
		}
		else if (SayList.length == 0) player.say (this.comment);
	}
	this.rclick = null;

	this.animate = function () {
		if (actframe%this.framerate == 0) {
			if (this.frame*this.width < this.img.width - this.width) this.frame++;
			else this.frame = 0;
		}
	}

	this.say = function (message) {
		txtwidth = context_gui.measureText(message).width;
		var textToSay = new Message (message, this.x - txtwidth/2 + this.width/2, this.y);
		textToSay.character = this;
		SayList.push (textToSay);
		addToSchedule (textToSay.working);
	}

}
RoomObject.prototype.contains = FKTcontains;

// Überprüft, ob sich an den derzeitigen Coordinaten ein Objekt befindet.
function checkObj (atX, atY) {
	i = loadedRoom.ObjectList.length;
	while (i--) {
		var actObj = loadedRoom.ObjectList[i];
		// gibt das erste Objekt zurück, das anklickbar, sichtbar und an der Position des Mauszeigers ist.
		if (actObj.visible && actObj.clickable && actObj.contains (atX + viewport.X, atY + viewport.Y) ) return actObj;
	}
	return null;
}

function drawObjects () {
	// Die Objekte werden auf die Objektebene gezeichnet, beginnend mit dem zuletzt erstellten.
	// d.h., dass die zuerst erstellten Objekte unter den anderen liegen.
	context_objects.clearRect (0, 0, game.settings.width, game.settings.height);

	var i = loadedRoom.ObjectList.length;
	while (i--) {
		var actObj = loadedRoom.ObjectList[i];
		if (actObj.img !== img["dummy.png"] && actObj.visible) context_objects.drawImage (actObj.img, actObj.xsource+actObj.width*actObj.frame, actObj.ysource, actObj.width, actObj.height, actObj.x-viewport.X, actObj.y-viewport.Y, actObj.width, actObj.height);
	}

	i = charList.length;
	while (i--) {
		if (charList[i].room == loadedRoom)charList[i].draw (context_objects);
	}
}

function Frame (pos, dur) {
	this.position = pos;
	this.duration = dur;
	this.snd = null;
}

function View (w, h, img) {
	this.height = h;
	this.width = w;
	this.shownframe = 0;
	this.framerate = 1;
	this.loops = -1; // 1: wiederholen
	var repeats = 0;
	this.image = img;
	this.frames = [];

	var framescreentime = 0;

	this.addFrame = function (pos, dur) {
		this.frames.push (new Frame (pos, dur));
	};
	this.animate = function () {
		if (actframe%this.framerate == 0){
			if (this.shownframe < this.frames.length-1) {
				if (framescreentime == this.frames[this.shownframe].duration){
					this.shownframe++;
					framescreentime = 0;
					didsomethingchange = true;
				}
				framescreentime++;
				return true;
			}
			else if (this.loops > 0) {
				if (repeats < this.loops) {
					this.shownframe = 0;
					didsomethingchange = true;
					repeats++;
					return true;
				}
				else {
					this.shownframe = 0;
					didsomethingchange = true;
					repeats = 0;
					return false;
				}
			}
			else return false;
		}
		else return true;
	};
}

const STANDING = 0;
const WALKING = 1;
const TALKING = 2;
const IDLE = 3;

const DIR_DOWN = 0;
const DIR_LEFT = 1;
const DIR_RIGHT = 2;
const DIR_UP = 3;

function Character (room, xpos, ypos, name, view) {

	charList.push (this);

	this.id = charList.length-1;

	this.room = room;
	this.room.charList.push (this);
	this.x = xpos;
	this.y = ypos;

	this.dir = DIR_DOWN;
	this.name = name;

	this.inv = new Inventory ();

	this.view = view;
	this.normalView = view;

	this.idleViews = [];

	this.talkingView = [];
	this.talkingView[0] = view;
	this.talkingView[1] = view;
	this.talkingView[2] = view;
	this.talkingView[3] = view;

	this.movingView = [];
	this.movingView[0] = view;
	this.movingView[1] = view;
	this.movingView[2] = view;
	this.movingView[3] = view;

	this.idleTime = 500;

	this.width = view.width;
	this.height = view.height;
	this.status = STANDING;

	var self = this;

	this.waypoints = [];
	this.movespeed = 5;

	var idleCounter = 0;

	this.repEx = null;

	this.visible = true;
	this.clickable = true;

	this.hover = function () {};
	this.hoverOff = function () {};

	this.useItemOn = function () {};
	this.anyClick = function () {
		this.say ("Ich hab grad nichts zu sagen.");
	};
	this.click = function () {
		if (usedItem !== null) {
			this.useItemOn (usedItem);
			usedItem = null;
		}
		else this.anyClick ();
	};
	this.rclick = null;

	this.say = function (message) {
		txtwidth = context_gui.measureText(message).width;
		var textToSay = new Message (message, this.x - txtwidth/2 + this.width/2, this.y);
		textToSay.character = this;
		SayList.push (textToSay);
		addToSchedule (textToSay.working);
	};

	this.changeRoom = function (theRoom, x, y) {
		this.room.charList.splice (this.room.charList.indexOf(this), 1);
		this.room = theRoom;
		theRoom.charList.push (this);
		this.x = x;
		this.y = y;
		if (game.settings.playerCharacter == this) {
			this.room.load();
		}
	};

	this.idle = function () {
		if ((this.status == STANDING || this.status == IDLE) && this.idleViews.length > 0) {
			if (idleCounter) {
				idleCounter--;
				return false;
			}
			else {
				if (this.status == STANDING) {
					this.status = IDLE;
					this.view = this.idleViews[Math.round (Math.random () * (this.idleViews.length - 1))];
				}
				if (this.view.animate()){
					return true;
				}
				else{
					this.status = STANDING;
					this.view = this.normalView;
					this.view.shownframe = 0;
					idleCounter = Math.ceil(Math.random () * this.idleTime);
					return false;
				}
			}
		}
	};

	this.repeatedly_execute = function () {
		if (this.repEx) this.repEx ();
	};

	this.draw = function (ctxt) {
		if (this.visible == true) {
			ctxt.drawImage (this.view.image, this.view.width*this.view.frames[this.view.shownframe].position, 0, this.view.width, this.view.height, this.x-viewport.X, this.y-viewport.Y, this.view.width, this.view.height);
		}
	};

	this.goToNextWaypoint = function () {
		var wpoint = self.waypoints[0];
		var xdest = wpoint[0];
		var ydest = wpoint[1];
		var wpsin = wpoint[3];
		var wpcos = wpoint[4];
		//console.log (self.x + " - > " + xdest);
		if (calculateDistance (self.x, self.y, xdest, ydest) > self.movespeed) {
			self.dir = wpoint[5];
			if (self.movingView[wpoint[5]] && self.view != self.movingView[wpoint[5]]) {
				self.view = self.movingView[wpoint[5]];
			}
			self.view.animate ();
			self.x += (self.movespeed * wpcos);
			self.y += (self.movespeed * wpsin);
			didsomethingchange = true;
			self.status = WALKING;
			return true;
		}
		else {
			console.log ("Laufen Abgeschlossen.");
			self.x = xdest;
			self.y = ydest;
			self.waypoints.shift(); // Abgearbeiteten Wegpunkt entfernen.
			self.view = self.normalView;
			self.view.shownframe = 0;
			self.status = STANDING;
			didsomethingchange = true;
			return false;
		}
	};

	this.move = function (xcor, ycor, blocking) {
		var wpts = this.waypoints.length;
		// falls noch kein Laufbefehl gegeben wurde
		if (wpts == 0) {
			var move_distance = calculateDistance (this.x, this.y, xcor, ycor);
			var move_sin = -(this.y - ycor)/move_distance; 			// Sinuswert für Y-Verschiebungs-berechnung
			var move_cos = -(this.x - xcor)/move_distance; 			// Cosinuswert für X-Verschiebungs-berechnung
			var dir = Math.round (move_cos);
			if (dir == 1) dir = DIR_RIGHT;
			else dir = DIR_LEFT;
			var newPoint = [xcor, ycor, blocking, move_sin, move_cos, dir];

			this.waypoints.push (newPoint);
			addToSchedule (self.goToNextWaypoint);	// Lauffunktion in Handlungsliste einreihen
		}
		// Falls der gegebene Laufbefehl nicht dem letzten entspricht
		else if (this.waypoints[wpts-1][0] != xcor || this.waypoints[wpts-1][1] != ycor) {
			var move_distance = calculateDistance (this.x, this.y, xcor, ycor);
			var move_sin = -(this.y - ycor)/move_distance; 			// Sinuswert für Y-Verschiebungs-berechnung
			var move_cos = -(this.x - xcor)/move_distance; 			// Cosinuswert für X-Verschiebungs-berechnung
			var dir = Math.round (move_cos);
			if (dir == 1) dir = DIR_RIGHT;
			else dir = DIR_LEFT;
			var newPoint = [xcor, ycor, blocking, move_sin, move_cos, dir];

			if (this.waypoints[wpts-1][2] == false) { // falls letzter Laufbefehl nicht blockend,
				this.waypoints.splice (wpts-1, 1, newPoint); // wird letzter wegpunkt überschrieben.
			}
			else {
				console.log ("New waypoint set!");
				this.waypoints.push (newPoint);
				addToSchedule (self.goToNextWaypoint);
			}
		}
		else {
			console.log ("Ausnahmefall: Laufbefehl an genau die gleiche Stelle gesetzt!");
		}
	};

	this.setAsPlayer = function() {
		game.settings.playerCharacter = this;
		player = this;
	}
}
Character.prototype.contains = FKTcontains;

// Überprüft, ob sich an den derzeitigen Coordinaten ein Charakter befindet.
function checkChar (atX, atY) {
	i = loadedRoom.charList.length;
	while (i--) {
		var actChar = loadedRoom.charList[i];
		// gibt das erste Objekt zurück, das anklickbar, sichtbar und an der Position des Mauszeigers ist.
		if (actChar.visible && actChar.clickable && actChar.contains (atX + viewport.X, atY + viewport.Y) ) return actChar;
	}
	return null;
}

// GEMEINSAM GENUTZTE FUNKTIONEN

function FKTcontains (x, y){
	if (x >= this.x && y >= this.y) {
		if (x < this.x + this.width && y < this.y + this.height) return true;
	}
	return false;
}

function calculateDistance (x1, y1, x2, y2) {
	var xdistance = (x1 - x2) * (x1 - x2);
	var ydistance = (y1 - y2) * (y1 - y2);
	return Math.round (Math.sqrt (xdistance + ydistance));
}

// Funktion, um eine Meldung in die Konsole zu schreiben. Zum Debuggen.
function d_log (text) {
	if (console && console.log) console.log(text);
}

d_log ("Objects activated!");
