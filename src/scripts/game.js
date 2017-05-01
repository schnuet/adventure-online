import Game from './Base_Game.js';

import Renderer         from './components/Renderer.js';
import Loader           from './components/Loader.js';

import GameObject           from './components/GameObject.js';
import SaveableObject       from './components/SaveableObject.js';
import Room                 from './components/Room.js';
import InteractiveObject    from './components/InteractiveObject.js';
import AnimatableObject     from './components/AnimatableObject.js';
import Gui                  from './components/Gui.js';
import Character            from './components/Character.js';
import RoomObject           from './components/RoomObject.js';

import gamedata             from './gamedata.js';



var roomName = "index";
var boxwidth = document.getElementById ("game_container").offsetWidth;
if (boxwidth < 1000) boxwidth = 1000;
//else if (boxwidth > 1920) boxwidth = 1920;

var options = {
    gameContainer: 'gamebox',
    width: boxwidth,
    height: 480
};

// the game is created with the options.
var game = new Game(options, gameData);

Renderer.init (game);
Loader.init (game);
Room.init (game);
Room.init (game);

console.log (game);

game.init ();

//Game.addComponent ('renderer', [], new Renderer() );
