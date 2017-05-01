// Hier sammeln sich alle Funktionen, die für die Dialogfunktion benötigt werden.
var DialogModuleLoaded = true;

var DialogList = [];
var actualDialog = null;

function Dialog_Option (optiontext, optionreaction, initially_visible) {
	this.text = optiontext;
	this.click = optionreaction;
	
	this.visible = initially_visible;
	
	this.hovered = false;
	this.hover = function () {
		this.hovered = true;
	}
	this.hoverOff = function () {
		this.hovered = false;
	}
}

function Dialog () {
	
	this.options = [];
	
	this.height = 0;
	this.visibleOptions = 0;
	
	this.draw = draw;
	this.show = show;
	this.hide = hide;
	this.checkHover = checkHover;
	this.addOption = addOption;
	this.showOption = showOption;
	this.hideOption = hideOption;
	
	DialogList.push (this);
	
	function show () {
		actualDialog = this;
		if (this.options.length == 1) this.option[0].click();
	}
	
	function hide () {
		actualDialog = null;
	}
	
	function addOption (optiontext, reaction, init_vis) {
		var newOption = new Dialog_Option(optiontext, reaction, init_vis);
		this.options.push (newOption);
		if (init_vis == true) this.visibleOptions++;
		this.height = this.visibleOptions * game.settings.fontsize;
	}
	
	function showOption (option) {
		if (this.options[option].visible == false) {
			this.options[option].visible = true;
			this.visibleOptions++;
			this.height = this.visibleOptions * game.settings.fontsize;
		}
	}
	function hideOption (option) {
		if (this.options[option].visible == true){
			this.options[option].visible = false;
			if (this.options[option].hovered == true) this.options[option].hoverOff ();
			this.visibleOptions--;
			this.height = this.visibleOptions * game.settings.fontsize;
		}
	}
	
	this.executeOption = function (option) {
		if (this.options[option].click) this.options[option].click();
	}
	
	function checkHover () {
		var boxheight = (this.visibleOptions * game.settings.fontsize) + game.settings.fontsize/4;
		if (mouse.Y >= game.settings.height - boxheight) {
			var optionNbr = Math.round(((mouse.Y - (game.settings.height - boxheight))/boxheight)*(this.visibleOptions-1));
			var hovOption = 0;
			var i = 0;
			for (var e = 0; i <= optionNbr; e++) {
				if (this.options[e].visible == true) {
					hovOption = e;
					i++;
				}
			}
			return this.options[hovOption];
		}
		else return null;
	}
	
	function draw (drawing_context, x, y) {
		if (this.visibleOptions == 0) this.hide ();
		else {
			drawing_context.fillStyle = "#000000";
			drawing_context.fillRect (0, 600 - this.height, game.settings.width, this.height);
			drawing_context.fillStyle = "#FFFFFF";
			//drawing_context.font = "50px Amatic";
			var e = 0; // Anzahl der gezeichneten Optionen
			for (var i = 0; i < this.options.length; i++) {
				if (this.options[i].visible){
					e++;
					if (this.options[i].hovered) drawing_context.fillStyle = "#C5C500";
					else drawing_context.fillStyle = "#FFFFFF";
					drawing_context.fillText (this.options[i].text, x, y + (game.settings.fontsize * (e)));
				}
			}
		}
	}
}
