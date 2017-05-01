// Bis jetzt ist das hier die Maus. Daran muss noch gearbeitet werden...
var GuiModuleLoaded = true;

(function addGuiModule (Game, ResManager) {

    Game.GUI = function () {
        this.img = null;
        this.bgColor = null;
        this.borderColor = null;

    };

    Game.TextList = [];

    var mouse = [];
    mouse.X = 0;
    mouse.Y = 0;
    //mouse.image = img["cursor.png"];
    mouse.width = 60;
    mouse.height = 60;
    mouse.frame = 0;
    mouse.hoveredElement = null;

    // Ändert die Mauscoordinaten relativ zur Zeichenfläche.
    mouse.set = function (e) {
    	/*if (e.pageX || e.pageY) {
    		mouse.X = e.pageX;
    		mouse.Y = e.pageY;
    	}
    	else {
    		mouse.X = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
    		mouse.Y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    	}
    	// Koordinaten der übergeordneten Container abziehen:
    	mouse.X -= parentdiv.offsetLeft;	//cv_main.offsetLeft;
    	mouse.Y -= parentdiv.offsetTop;		//cv_main.offsetTop;
    	*/
        if(e.offsetX) {
            mouse.X = e.offsetX;
            mouse.Y = e.offsetY;
        }
        else if(e.layerX) {
            mouse.X = e.layerX;
            mouse.Y = e.layerY;
        }
    }

    // zeichnet den Mauszeiger an der aktuellen Mausposition
    mouse.draw = function (drawing_context) {
    	/*drawing_context.drawImage (img_cursor, mouse.frame*mouse.width, 0, mouse.width, mouse.height, mouse.X-29, mouse.Y-29, mouse.width, mouse.height);*/
    }

    // Die Funktion wird bei einer Bewegung der Maus über der Zeichenfläche aufgerufen.
    mouse.onMove = function (e) {
    	mouse.set (e);
    	var atX = mouse.X;
    	var atY = mouse.Y;

    	var oldHover = mouse.hoveredElement;
    	var newHover = null;
    	if (actualDialog != null) {
    		newHover = actualDialog.checkHover (atX, atY);
    	}
    	if (newHover == null) {
    		newHover = checkGui (atX, atY);
    	}
    	if (newHover == null) {
    		newHover = checkChar (atX, atY);
    	}
    	if (newHover == null) {
    		newHover = checkObj (atX, atY);
    	}
    	if (newHover != oldHover){
    		mouse.hoveredElement = newHover;
    		if (newHover) newHover.hover ();
    		if (oldHover) oldHover.hoverOff ();
    	}

    	if (newHover)mouse.frame = 1;
    	else mouse.frame = 0;
    }

    // Die Funktion wird aufgerufen, wenn jemand auf die Zeichenfläche clickt.
    mouse.onClick = function (e) {
    	// Auf Rechtsklick testen
    	var rightclick;
        if (!e) var e = window.event;
        if (e.which) rightclick = (e.which == 3);
        else if (e.button) rightclick = (e.button == 2);

    	mouse.onMove (e);
    	if (MessageList.length > 0) MessageList[0].time = 1;
    	if (SayList.length > 0 && SayList[0].active) SayList[0].time = 1;
    	else if (mouse.hoveredElement && !game.data.waiting) {
    		player.move (mouse.X - player.view.width/2, player.y, false);
    		if (rightclick && mouse.hoveredElement.rclick) mouse.hoveredElement.rclick ();
    		else mouse.hoveredElement.click ();
    	}
    	else {
    		usedItem = null;
    		didsomethingchange = true;
    		/*if (mouse.X < player.x + 175) cPolly.movingView = views.pollyWalkLeft;
    		else cPolly.movingView = views.pollyWalkRight;*/
    		player.move (mouse.X - player.view.width/2, player.y, false);
    	}
    }

})(Game, Game.ResManager);
