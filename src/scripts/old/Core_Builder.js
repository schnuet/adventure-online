// Funktion, in der das ganze Spiel zusammengesetzt wird.
// Erst werden die einzelnen Räume erstellt, dann werden ihnen Objekte zugeordnet.
// Die einzelnen Items werden definiert und das Inventar wird erstellt

/*  VARIABLEN
	sessionStorage.
		firstLook		<- Erster Besuch auf der Seite?
		visitedShowcase <- Showcase Besucht?
		visitedPerson   <- Person   ''
		visitedIndex	<- Index   ''
		visitedStudium	<- Studium   ''
		prevRoom		<- zuvor besuchter Raum
*/

// Characters
var cPlayer = null;

// Rooms
var room = [];
room["showcase"] = null;
room["skills"] = null;
room["aboutme"] = null;
room["index"] = null;

function BuildGame () {

	// ************ INVENTAR *************//


	// ************ VIEWS ****************//-

		// views.viewname = new View (width, height, image);
		// views.viewname.addFrame (index, duration);

		views.pollyWalkRight = new View (351, 350, img["c_polly_walk_r.png"]);
		views.pollyWalkRight.addFrame (0, 1);
		views.pollyWalkRight.addFrame (1, 1);
		views.pollyWalkRight.addFrame (2, 1);
		views.pollyWalkRight.addFrame (3, 1);
		views.pollyWalkRight.addFrame (4, 1);
		views.pollyWalkRight.addFrame (5, 1);
		views.pollyWalkRight.addFrame (6, 1);
		views.pollyWalkRight.addFrame (7, 1);
		views.pollyWalkRight.addFrame (8, 1);
		views.pollyWalkRight.addFrame (9, 1);
		views.pollyWalkRight.addFrame (10, 1);
		views.pollyWalkRight.addFrame (11, 1);
		views.pollyWalkRight.addFrame (12, 1);
		views.pollyWalkRight.framerate = 4;
		views.pollyWalkRight.loops = 1;

		views.pollyWalkLeft = new View (351, 350, img["c_polly_walk_l.png"]);
		views.pollyWalkLeft.addFrame (0, 1);
		views.pollyWalkLeft.addFrame (1, 1);
		views.pollyWalkLeft.addFrame (2, 1);
		views.pollyWalkLeft.addFrame (3, 1);
		views.pollyWalkLeft.addFrame (4, 1);
		views.pollyWalkLeft.addFrame (5, 1);
		views.pollyWalkLeft.addFrame (6, 1);
		views.pollyWalkLeft.addFrame (7, 1);
		views.pollyWalkLeft.addFrame (8, 1);
		views.pollyWalkLeft.addFrame (9, 1);
		views.pollyWalkLeft.addFrame (10, 1);
		views.pollyWalkLeft.addFrame (11, 1);
		views.pollyWalkLeft.addFrame (12, 1);
		views.pollyWalkLeft.framerate = 4;
		views.pollyWalkLeft.loops = 1;

		views.pollyTalk = new View (351, 350, img["c_polly_talk.png"]);
		views.pollyTalk.addFrame (0, 1);
		views.pollyTalk.addFrame (1, 1);
		views.pollyTalk.addFrame (2, 1);
		views.pollyTalk.addFrame (3, 1);
		views.pollyTalk.addFrame (4, 1);
		views.pollyTalk.addFrame (5, 1);
		views.pollyTalk.addFrame (6, 1);
		views.pollyTalk.framerate = 4;
		views.pollyTalk.loops = 1;

	// ************ DIALOGE **************//
		// dName = new Dialog ();
		// dName.addOption ("Optiontext", Optionfunction, visible?);

	// ************ ROOMS *************** //

		room["showcase"] = new Room (img["bg_std.png"], game.settings.width, 480, "Showcase", null);
		room["index"] = new Room (img["bg_std.png"], game.settings.width, 480, "RoomName", null);
		room["skills"] = new Room (img["bg_std.png"], game.settings.width, 480, "RoomName", null);
		room["aboutme"] = new Room (img["bg_std.png"], game.settings.width, 480, "RoomName", null);
		room["studium"] = new Room (img["bg_std.png"], game.settings.width, 480, "Studium", null);

	// ************** CHARACTERS **************//
		// cName = new Character (room, x, y, "Name", views.viewName);
		// cName.movingView = views.moveView;
		// cName.movingView.framerate = 10;
		// cName.movingView.loops = 1;
		// cName.idleViews[0] = views.baer;
		// cName.idleViews[0].loops = 0;
		// cName.idleViews[0].framerate = 60;
		// cName.idleTime = 0;
		// cName.repEx = function () { this.idle();	}
		// cName.anyClick = function () {}
		// cName.useItemOn = function (item) {
		// 	  if (item == iAst) {}
		// 	  else player.say ("Lieber nichts auf einen Bären legen!");
		// };

		cPolly = new Character (room["showcase"], -300, 120, "Polly", views.pollyTalk);
		cPolly.movingView[DIR_RIGHT] = views.pollyWalkRight;
		cPolly.movingView[DIR_LEFT] = views.pollyWalkLeft;
		cPolly.talkingView[DIR_RIGHT] = views.pollyTalk;
		cPolly.talkingView[DIR_LEFT] = views.pollyTalk;
		cPolly.talkingView[DIR_UP] = views.pollyTalk;
		cPolly.talkingView[DIR_DOWN] = views.pollyTalk;
		cPolly.movespeed = 5;


	// ************** ROOM FUNCTION **************//

		room["showcase"].enter = function () {
			cPolly.room = room["showcase"];
			if (sessionStorage.firstLook == "") {
				player.move (game.settings.width/2 - player.width/2, 120, true);
				player.say ("Willkommen im Portfolio von... ");
				player.say ("Ntimi Schnütgen!");
				sessionStorage.firstLook = "showcase";
			}
			else if (sessionStorage.prevRoom == "index") {
				player.move (200 - player.width/2, 120, true);
			}
			else {
				player.x = game.settings.width + 200;
				player.move (game.settings.width - 200 - player.width/2, 120, true);
			}
			if (!sessionStorage.visitedShowcase){
				player.say ("Hier befinden sich ein paar vorzeigbare Arbeiten von Ntimi.");
				sessionStorage.visitedShowcase = "true";
			}
			else {
				player.say ("Wir sind jetzt wieder im Showcase.");
			}

			sessionStorage.visitedShowcase = "true";
			sessionStorage.prevRoom = "showcase";
			room["showcase"].o.staffelei = new RoomObject (room["showcase"], (game.settings.width / 3)*2 + 100 , 120, 172, 336, img["o_staffelei.png"], "Staffelei");
			room["showcase"].o.staffelei.anyClick = function () {
				player.say ("Ein Meisterwerk. Ein Schwarzbär bei Neumond.");
			}
			room["showcase"].o.statue = new RoomObject (room["showcase"], (game.settings.width / 3) + 100, 60, 180, 399, img["o_statue.png"], "Statue");
			room["showcase"].o.statue.anyClick = function () {
				player.say ("Eine Medusa-statue aus Stein.");
				player.say ("Wie ironisch.");
			}
			room["showcase"].o.jeff = new RoomObject (room["showcase"], 100 , 280, 98, 184, img["o_jeff.png"], "Jeff");
			room["showcase"].o.jeff.anyClick = function () {
				player.say ("Das ist Jeff.");
				player.say ("Zumindest eine Puppe von Jeff.");
				player.say ("Oder ein schwarzes Bild von einer Puppe von Jeff, \nje nach dem, von wo man schaut.");
			}
		}

		room["studium"].enter = function () {
			cPolly.room = room["studium"];
			if (sessionStorage.firstLook == "") {
				player.move (game.settings.width/2 - player.width/2, 120, true);
				player.say ("Willkommen im Portfolio von... ");
				player.say ("Ntimi Schnütgen!");
				sessionStorage.firstLook = "studium";
			}
			else if (sessionStorage.prevRoom == "index" || sessionStorage.prevRoom == "aboutme" || sessionStorage.prevRoom == "skills" || sessionStorage.prevRoom == "showcase") {
				player.move (200 - player.width/2, 120, true);
			}
			else {
				player.x = game.settings.width + 200;
				player.move (game.settings.width - 200 - player.width/2, 120, true);
			}
			if (!sessionStorage.visitedStudium){
				player.say ("Ntimi ist ein Student in Ulm.");
				player.say ("Seine Hochschule bildet die Leute zwar nur sehr allgemein aus,...");
				player.say ("aber dafür hat sie nette Leute.");
				sessionStorage.visitedStudium = "true";
			}
			else {
				player.say ("Was willst du denn noch über das Studium wissen?");
			}

			sessionStorage.visitedStudium = "true";
			sessionStorage.prevRoom = "studium";
			room["studium"].o.kamera = new RoomObject (room["studium"], (game.settings.width / 3)*2 + 100 , 300, 82, 163, img["o_kamera.png"], "Kamera");
			room["studium"].o.kamera.anyClick = function () {
				player.say ("Nach dem letzten Semester sollte Ntimi eigentlich mit jeder Kamera umgehen können.");
				player.say ("...eigentlich.");
			}
			room["studium"].o.mac = new RoomObject (room["studium"], (game.settings.width / 3) + 100, 320, 160, 141, img["o_mac.png"], "Mac");
			room["studium"].o.mac.anyClick = function () {
				player.say ("Die Hochschule ist super ausgestattet.");
				player.say ("Computer überall, von jeder Sorte.");
				player.say ("...und die Studenten bringen trotzdem ihre Laptops mit.");
			}
			room["studium"].o.animtisch = new RoomObject (room["studium"], 100 , 300, 117, 161, img["o_animtisch.png"], "Animationstisch");
			room["studium"].o.animtisch.anyClick = function () {
				player.say ("Im Wahlfach Animation krakeln einige der Studenten auf den Dingern rum.");
				player.say ("Einfach nur Abpausen, stundenlang.");
			}
		}

		room["index"].enter = function () {
			cPolly.room = room["index"];
			if (sessionStorage.firstLook == "") {
				player.move (game.settings.width/2 - player.width/2, 120, true);
				player.say ("Hey.");
				player.say ("Willkommen.");
				player.say ("Ich hoffe mal, du hast dich nicht verlaufen.");
				player.say ("Hier geht es nämlich nur um eines:...");
				player.say ("Ntimi Schnütgen.");
				player.say ("Das hier ist nämlich sein Portfolio, okay?");
				sessionStorage.firstLook = "index";
			}
			else {
				player.x = game.settings.width + 200;
				player.move (game.settings.width/2 - player.width/2, 120, true);
			}
			if (!sessionStorage.visitedIndex){
				player.say ("Falls du was wissen willst, besuch am besten die Unterseiten!");
				player.say ("Da gibt es solche Sachen wie...");
				player.say ("...Eine Beschreibung über Ntimi selbst.");
				player.say ("...oder eine Erklärung, was der Kerl studiert...");
				player.say ("...außerdem natürlich eine Übersicht über seine Fertigkeiten\n und ein paar Werke von ihm.");
				sessionStorage.visitedIndex = "true";
			}
			else {
				player.say ("Hier ist eigentlich nur die Startseite.");
				player.say ("Vollkommen uninteressant.");
			}

			sessionStorage.visitedIndex = "true";
			sessionStorage.prevRoom = "index";
		}
		room["aboutme"].enter = function () {
			cPolly.room = room["aboutme"];
			if (sessionStorage.firstLook == "") {
				player.move (game.settings.width/2 - player.width/2, 120, true);
				player.say ("Willkommen im Portfolio von... ");
				player.say ("Ntimi Schnütgen!");
				sessionStorage.firstLook = "aboutme";
			}
			else if (sessionStorage.prevRoom == "index" || sessionStorage.prevRoom == "aboutme" || sessionStorage.prevRoom == "showcase") {
				player.move (200 - player.width/2, 120, true);
			}
			else {
				player.x = game.settings.width + 200;
				player.move (game.settings.width - 200 - player.width/2, 120, true);
			}
			if (!sessionStorage.visitedPerson){
				player.say ("Wenn du tatsächlich hier bist, um Ntimi privat besser kennen zu lernen,\nist die Kontaktseite vermutlich besser." );
				player.say ("...aber zum anonymen stalken wird das hier reichen.");
				sessionStorage.visitedPerson = "true";
			}
			else {
				player.say ("Ich weiß, ich weiß, Ntimi ist sehr interessant.");
			}
			sessionStorage.visitedPerson = "true";
			sessionStorage.prevRoom = "aboutme";
			room["aboutme"].o.brettspiele = new RoomObject (room["aboutme"], (game.settings.width / 3)*2 + 100 , 360, 263, 93, img["o_brettspiele.png"], "Brettspiele");
			room["aboutme"].o.brettspiele.anyClick = function () {
				player.say ("Ntimi ist vernarrt in Brettspiele.");
				player.say ("Aber ohne Mitspieler sitzt er blöd da.");
			}
			room["aboutme"].o.laptop = new RoomObject (room["aboutme"], 100, 370, 316, 86, img["o_laptop.png"], "Laptop");
			room["aboutme"].o.laptop.anyClick = function () {
				player.say ("Hier verbringt der Kerl wohl die meiste Zeit seines Tages.");
				player.say ("Manchmal kommt sogar was sinnvolles dabei raus.");
			}
			room["aboutme"].o.buecher = new RoomObject (room["aboutme"], (game.settings.width / 3) + 100 , 260, 186, 199, img["o_buecher.png"], "Bücher");
			room["aboutme"].o.buecher.anyClick = function () {
				player.say ("Überraschend, dass die Bücher hier so ordentlich rumstehen.");
				player.say ("Normalerweise liegt hier alles kreuz und quer herum.");
				player.say ("Dieser Heuchler wird wohl aufgeräumt haben.");
			}
		}
		room["skills"].enter = function () {
			cPolly.room = room["skills"];
			if (sessionStorage.firstLook == "") {
				player.move (game.settings.width/2 - player.width/2, 120, true);
				player.say ("Willkommen im Portfolio von... ");
				player.say ("Ntimi Schnütgen!");
				sessionStorage.firstLook = "skills";
			}
			else if (sessionStorage.prevRoom == "index" || sessionStorage.prevRoom == "showcase" || sessionStorage.prevRoom == "skills" || sessionStorage.prevRoom == "aboutme") {
				player.move (200 - player.width/2, 120, true);
			}
			else {
				player.x = game.settings.width + 200;
				player.move (game.settings.width - 200 - player.width/2, 120, true);
			}
			if (!sessionStorage.visitedSkills){
				player.say ("Falls du mehr über das erfahren willst, was Ntimi kann..." );
				player.say ("...bist du hier richtig!");
				sessionStorage.visitedSkills = "true";
			}
			else {
				player.say ("All diese Begabung ist kaum zu fassen, oder?");
			}
			sessionStorage.visitedSkills = "true";
			sessionStorage.prevRoom = "skills";
			room["skills"].o.orden = new RoomObject (room["skills"], (game.settings.width / 3)*2 + 100 , 150, 215, 161, img["o_orden.png"], "Orden");
			room["skills"].o.orden.anyClick = function () {
				player.say ("\"Orden für geniale Programmierkünste\"");
				player.say ("Ts. Befehle eintippen kann doch jeder.");
			}
			room["skills"].o.pokal = new RoomObject (room["skills"], (game.settings.width / 3) + 100, 240, 88, 202, img["o_pokal.png"], "Pokal");
			room["skills"].o.pokal.anyClick = function () {
				player.say ("\"Preis für überragende Animationen\"");
				player.say ("...überragend?");
				player.say ("Was überragen die? Seinen Kopf?");
			}
			room["skills"].o.dokumente = new RoomObject (room["skills"], 100 , 150, 294, 156, img["o_dokumente.png"], "Dokumente");
			room["skills"].o.dokumente.anyClick = function () {
				player.say ("\"Urkunden für spannende Geschichtenerzählung\"");
				player.say ("...von Kindern aus dem letzten Zeltlager.");
				player.say ("Die crème de la crème der Buchkritik.");
			}
		}


		//rName.repEx = function () {	}
		//rName.leave = function () { }

		//rName.o.ObjectName = new RoomObject (room, x, y, width, height, image, "Name");

	// ************** GAME_START ************* //

		// cPlayer.inv.show ();

		// snd_wald.loop = true;
		// snd_feld.loop = true;

		game.settings.playerCharacter = cPolly;
		player = game.settings.playerCharacter;
		player.clickable = false;

		// game.vars.nussCounter = 0;
}
