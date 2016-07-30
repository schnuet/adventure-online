// Hier wird das Inventar verwaltet.
var InventoryModuleLoaded = true;

var ItemList = [];

var usedItem = null;

function InvItem (name, image) {
	this.name = name;
	this.img = image;
	
	this.hovered = false;
	
	ItemList.push (this);
	
	// Handlung beim "Überfahren" des Items
	this.hover = function () {
		this.hovered = true;
		didsomethingchange = true;
	}
	
	this.hoverOff = function () {
		this.hovered = false;
		didsomethingchange = true;
	}
	
	// Handlung beim Click auf das Items
	this.click = function () {
		usedItem = this;
		didsomethingchange = true;
		d_log (usedItem.name + " selected");
	}
}

function Inventory () {

	this.Items = [];
	this.height = 100;
	this.width = 1200;
	this.x = 0;
	this.y = 0;
	this.itemSpacing = 10;
	this.itemBorderWidth = 2;
	this.itemWidth = 100;
	this.itemHeight = 80;
	this.itemBorderColor = "#303030";
	this.itemBorderColorActive = "#BB0000";
	this.itemBorderColorHover = "#F0F000";
	
	this.hoveredItem = -1;
	
	this.rowScroll = 0;
	var itemsPerRow = Math.floor (this.width/this.itemWidth);
	var maxRows = Math.floor (this.height / (this.itemHeight + this.itemSpacing*2));
	
	// Inventare sind grundsätzlich erst einmal nicht sichtbar und werden weder gezeichnet noch für Kollisionen geparst.
	// Durch die Show- und Hide- Funktionen lässt sich das ändern.
	this.visible = false;
	
	this.hasItem = function (item) {
		if (this.Items.indexOf (this) >= 0) return true;
		else return false;
	}
	
	this.show = function () {
		this.visible = true;
		guiList.push (this);
	};
	this.hide = function () {
		this.visible = false;
		guiList.slice (guiList.indexOf(this), 1);
	}
	
	this.draw = function () {
		var actDir = 0;
		var actRow = 0;
		for (var i = this.rowScroll*itemsPerRow; i < this.Items.length; i++) {
			if (i > 0 && (i % itemsPerRow) == 0) actRow++; 
			if (actRow - this.rowScroll < maxRows){ 
				actDir = i - actRow*itemsPerRow;
				context_gui.drawImage (this.Items[i].img, this.itemSpacing + i*(this.itemSpacing + this.itemWidth), this.itemSpacing, this.itemWidth, this.itemHeight);
				if (this.Items[i] == usedItem) context_gui.strokeStyle = this.itemBorderColorActive; 
				else if (this.Items[i] == this.hoveredItem) context_gui.strokeStyle = this.itemBorderColorHover; 
				else context_gui.strokeStyle = this.itemBorderColor;
				context_gui.lineWidth = this.itemBorderWidth;
				context_gui.strokeRect (this.itemSpacing + this.itemSpacing*i + i*this.itemWidth, this.itemSpacing, this.itemWidth, this.itemHeight);
			}
		}
	};

	this.addItem = function (item) {
		this.Items.push (item);
	};
	
	this.loseItem = function (item) {
		itempos = this.Items.indexOf (item);
		this.Items.splice (itempos, 1);
	};
	
	this.contains = function (atX, atY) {
		if (this.visible && atY <= (this.y+this.height-this.itemSpacing) && atY >= (this.y+this.itemSpacing)) {
			for (var i = 0;i < this.Items.length; i++) {
				if (atX >= (this.itemSpacing + i*(this.itemSpacing + this.itemWidth)) && atX <= (this.itemSpacing + this.itemSpacing*i + (i+1)*this.itemWidth)){
					this.hoveredItem = this.Items[i];
					return true;
				}
			}
			return false;
		}
		else return false;
	};
	
	this.hover = function () {
		if (this.hoveredItem) this.hoveredItem.hover();
	}
	this.hoverOff = function () {
		if (this.hoveredItem) this.hoveredItem.hoverOff();
		this.hoveredItem = null;
	}
	this.click = function () {
		if (this.hoveredItem) this.hoveredItem.click();
	}
}

d_log ("Inventar klar und bereit.");