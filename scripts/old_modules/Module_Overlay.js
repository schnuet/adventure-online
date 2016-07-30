// Das ist das tolle Overlay-Modul... yeah.

var guiList = [];

function GuiBox (x, y, width, height, pass) {
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.type = "box";
	this.visible = true;
	this.borderColor = "rgba(0, 0, 0, 0)";
	this.borderWidth = 0;
	this.backgroundColor = "rgba(0, 0, 0, 0)";
	this.img = null;
	
	if (!pass) guiList.push (this);
	
	this.draw = function () {
		if (this.visible){
			context_gui.fillStyle = this.backgroundColor;
			context_gui.strokeStyle = this.borderColor;
			context_gui.lineWidth = this.borderWidth;
			context_gui.fillRect (this.x, this.y, this.width, this.height);
			if (this.img) context_gui.drawImage (this.img, this.x, this.y, this.width, this.height);
			context_gui.strokeRect (this.x, this.y, this.width, this.height);
		}
	}
	this.remove = function () {
		guiList.splice(guiList.indexOf (this), 1);
	}
}

function GuiButton (x, y, width, height) {
	GuiBox.call (this, x, y, width, height, true);
	this.type = "button";
	this.hovered = false;
	guiList.push (this);
	
	this.click = function () { };
	this.hover = function () {};
	this.hoverOff = function () {};
	
	this.contains = function (x, y) {
		if (x >= this.x && x <= this.x + this.width) {
			if (y >= this.y && y <= this.y + this.height) return true;
		}
		return false;
	};
}

function checkGui (x, y) {
	var o = guiList.length;
	while (o--) {
		if (guiList[o].contains (x, y)) {
			return guiList[o];
		}
	}
	return null;
}

function GuiGroup () {
	this.elements = [];
	this.selectedElement = null;
	
	this.addElement = function (elem) {
		this.elements.push (elem);
	}
	this.removeElement = function (elem) {
		var pos = this.elements.indexOf (elem);
		if (pos >= 0)this.elements.slice (pos, 1);
	}
	
	this.draw = function () {
		for (var i = 0; i < this.elements.length; i++) {
			this.elements[i].draw ();
		}
	}
	
	this.contains = function (atX, atY) {
		for (var i = 0; i < this.elements.length; i++) {
			if (this.elements[i].contains (atX, atY)){
				this.selectedElement = this.elements[i];
				return true;
			}
		}
		this.selectedElements = null;
		return null;
	}
}