


var game = {};
game.settings = [];
game.data = [];
game.events = [];
game.vars = [];

game.events.start = function () {};
game.events.end = function () {};
game.events.repEx = function () {};

game.data.waiting = false;

// Der Container, in dem sich alle Zeichenflächen befinden
game.parentdiv = null;

// Hier werden alle Zeichenflächen deklariert
var cv_scene;
var cv_gui;
var context_main;
var context_scene;
var context_gui;

// Variablen, die immer wieder zum Einsatz kommen.
var didsomethingchange = false;

var actframe;
var messagebox;
var MessageList = [];
var SayList = [];

game.settings.fontsize = 30;
game.settings.height = 0;
game.settings.width = 0;

// Wichtige Oberobjekte/Listen
var room_cycle;
var Inv;

// Die Zeichenfläche (ein Canvas) wird im Element mit der ID "parentid" erstellt und mit Einstellungen versehen.
function CreateGame(parentid, width, height) {

	game.settings.height = height;
	game.settings.width = width;
	game.settings.startheight = height;
	game.settings.startwidth = width;

	cv_scene = document.createElement ('canvas');
	cv_objects = document.createElement ('canvas');
	cv_gui = document.createElement ('canvas');
	cv_buffer = document.createElement ('canvas');

	// Verschiedene Einstellungen für die Zeichenfläche (Größe, Mauszeiger)
	cv_scene.height = height;
	cv_scene.width = width;
	cv_scene.id = "cv_scene";
	cv_scene.className = "game_canvas";
	cv_scene.setAttribute ("style", "position: absolute; top: 0px; left: 0px;");

	cv_buffer.height = height;
	cv_buffer.width = width;

	cv_objects.height = height;
	cv_objects.width = width;
	cv_objects.id = "cv_objects";
	cv_objects.className = "game_canvas";
	cv_objects.setAttribute ("style", "position:absolute; top: 0px; left: 0px; pointer-events: none;");

	cv_gui.height = height;
	cv_gui.width = width;
	cv_gui.id = "cv_gui";
	cv_gui.className = "game_canvas";
	cv_gui.setAttribute ("style", "position:absolute; top: 0px; left: 0px; pointer-events: none;");

	// Die Zeichenart für die Zeichenfläche soll 2D sein.
	context_scene = cv_scene.getContext ("2d");
	context_objects = cv_objects.getContext ("2d");
	context_gui = cv_gui.getContext ("2d");

	context_gui.font="25px Arial";

	// Die Zeichenfläche wird als Unterelement an den Container "parentid" angehängt.
	parentdiv = document.getElementById (parentid);
	parentdiv.setAttribute ("style", "position: relative; width: "+width+"px; height: "+height+"px; margin: auto; overflow: hidden; ");
	parentdiv.appendChild (cv_scene);
	parentdiv.appendChild (cv_objects);
	parentdiv.appendChild (cv_gui);

	// Um das Spiel zu starten, werden vorerst die Bilder geladen, um später keine Wartezeiten zu haben.
	Game.ResManager.LoadPics ();
}

// Spielzyklus, alles immer wieder eintreffende kommt hier rein.
function game_cycle () {
	if (actframe < 120) actframe++;
	else actframe = 1;

	// Spielende überprüfen
	if (game.data.nussCounter == 10) {
		new Message("Juhuuu. Gewonnen. Ach wie toll.", 60, 590).display ();
		game.data.nussCounter = 0;
	}

	// Handlungsliste überprüfen
	if (doList.length > 0) {
		doList[0]();
	}

	// Raumaufgabe abarbeiten.
	if (loadedRoom.repEx) loadedRoom.repEx ();
	for (var i = 0; i < charList.length; i++) {
		if (charList[i].room == loadedRoom) charList[i].repeatedly_execute ();
	}
}

var myRequestAnimationFrame =  window.requestAnimationFrame ||
              window.webkitRequestAnimationFrame ||
              window.mozRequestAnimationFrame    ||
              window.oRequestAnimationFrame      ||
              window.msRequestAnimationFrame     ||
              function(callback) {
                  window.setTimeout(callback, 10);
               };
window.requestAnimationFrame=myRequestAnimationFrame;


// Zeigt eine Zeile Text für eine kurze Weile auf dem Bildschirm an
function Message (message, x, y) {
	this.message = message.split ("\n");
	this.x = x;
	this.y = y;
	this.width = context_gui.measureText(this.message[0]).width;
	if (this.x < 0) this.x = 0;
	if ((this.x + this.width) > 1200) this.x = game.settings.width-this.width;
	this.time = 8*message.length;
	this.active = false;
	var self = this;
	this.character = null;

	this.display = function () {
		MessageList.push (this);
	};

	this.draw = function (timed){
		if (timed) {
			self.time--;
			if (self.active == false) self.active = true;
		}
		if (self.time) {
			if (self.character) {
				self.x = self.character.x - self.width/2 + self.character.width/2;
				if (self.x < 0) self.x = 0;
				if ((self.x + self.width) > 1200) self.x = game.settings.width-self.width;
				self.y = self.character.y;

				if (self.character.talkingView[self.character.dir] && self.character.view != self.character.talkingView[self.character.dir]) {
					self.character.view = self.character.talkingView[self.character.dir];
					self.character.status = TALKING;
				}
				self.character.view.animate ();
			}
			//context_gui.font = "50px Arial";
			context_gui.lineWidth = 5;
			var i = 0;
			while (i < self.message.length) {
				var textoffset = (self.width - (context_gui.measureText(self.message[i]).width))/2;
				context_gui.lineWidth = 4;
				/*context_gui.strokeStyle = "#000000";
				context_gui.strokeText (self.message[i], self.x + textoffset, self.y  - game.settings.fontsize*(self.message.length-i-1));*/
				context_gui.fillStyle = "#000000";
				context_gui.fillText (self.message[i], self.x + textoffset - 2, self.y - game.settings.fontsize*(self.message.length-i-1));
				context_gui.fillText (self.message[i], self.x + textoffset - 2, self.y - 2 - game.settings.fontsize*(self.message.length-i-1));
				context_gui.fillText (self.message[i], self.x + textoffset - 2, self.y + 2 - game.settings.fontsize*(self.message.length-i-1));
				context_gui.fillText (self.message[i], self.x + textoffset + 2, self.y - game.settings.fontsize*(self.message.length-i-1));
				context_gui.fillText (self.message[i], self.x + textoffset + 2, self.y - 2 - game.settings.fontsize*(self.message.length-i-1));
				context_gui.fillText (self.message[i], self.x + textoffset + 2, self.y + 2 - game.settings.fontsize*(self.message.length-i-1));
				context_gui.fillText (self.message[i], self.x + textoffset, self.y - 2 - game.settings.fontsize*(self.message.length-i-1));
				context_gui.fillText (self.message[i], self.x + textoffset, self.y + 2 - game.settings.fontsize*(self.message.length-i-1));
				context_gui.fillStyle = "#FFFFFF";
				context_gui.fillText (self.message[i], self.x + textoffset, self.y - game.settings.fontsize*(self.message.length-i-1));
				i++;
			}
			return true;
		}
		else return false;
	};

	this.working = function () {
		self.time--;
		if (self.active == false) self.active = true;
		if (self.time <= 0) {
			if (self.character) {
				self.character.view = self.character.normalView;
				self.character.view.shownframe = 0;
				self.character.status = STANDING;
				didsomethingchange = true;
			}
			console.log (self.message[0] + " gesagt!");

		}
		return self.time;
	};
}

var doList = [];
var doingThing = false;

// Eine Funktion, um blockende Funktionen wie "say" o.ä. in die Warteschlange zu setzen.
function addToSchedule (fkt) {
	var newTask = function () {
		var done = fkt();
		if (done == 0||done == null||done==false) {
			doList.shift (0,1);
		}
	}
	doList.push (newTask);
}

function Timer (time) {
	this.time = time;
	var self = this;
	this.countDown = function () {
		self.time--;
		return self.time;
	}
}

function wait (time) {
	var tictac = new Timer (time);
	addToSchedule (function(){
		if (tictac.countDown()){
			if (!game.data.waiting) game.data.waiting = true;
			return true;
		}
		else {
			game.data.waiting = false;
			return false;
		}
	});
}
