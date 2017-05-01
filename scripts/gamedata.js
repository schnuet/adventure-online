var gameData = function (game) {
    var Room = {};
    var Character = {};
    var Gui = {};

    var player = {};

    return {
        connect: function () {
            Character = game._loadedComponents.character;
            Room = game._loadedComponents.room;
            Gui = game._loadedComponents.gui;
        },
        room : {
            options: {
                currentRoom: 'rTest'
            },
            rTest: {
                image: 'r_standard.png',
                width: 1920,
                height: 480,
                enter: function () {
                    var player = Character.getPlayer();
                    if (player.previousRoom === 'rTest2') {
                        player.walk(100, player.y, true);
                    }
                }
            },
            rTest2: {
                image: 'r_yellow.png',
                width: 1920,
                height: 480,
                enter: function () {
                    var player = Character.getPlayer();
                    if (player.previousRoom === 'rTest') {
                        player.walk(game.settings.width - 100, player.y, true);
                    }
                }
            }
        },
        room_object: {
            rTest: {
                oBuecher: {
                    position: {
                        x: 60,
                        y: 20
                    },
                    image: 'o_buecher.png',
                    width: 186,
                    height: 199,
                    name: 'Bücher',
                    onClick: function () {
                        var player = Character.getPlayer();
                        player.walk(0, player.y, false, function () {
                            player.changeRoom('rTest2', game.settings.width, player.y);
                        });
                    }
                },
                oAnimTest: {
                    animatable: true,
                    animationSpeed: 0.25,
                    position: {
                        x: 300,
                        y: 0
                    },
                    tint: 0xAAFFAA,
                    views: ['bird/talk'],
                    name: 'Animationstest',
                    onClick: function () {
                        console.log ('click auf Typ.');
                        Character.getPlayer().walk(this.x, this.y+this.height, false, function() {
                            Character.getPlayer().say('Das ist ein Testtext.');
                        });

                        /*if (this.playing) this.stop();
                        else this.play();*/
                    },
                    onMouseIn: function () {
                        this.cursor = 'pointer';
                    },
                    onMouseOut: function () {
                        this.cursor = 'pointer';
                    }
                }
            },
            rTest2: {
                oLaptop: {
                    position: {
                        x: 400,
                        y: 10
                    },
                    image: 'o_laptop.png',
                    name: 'Ein Laptop',
                    onClick: function () {
                        var player = Character.getPlayer();
                        player.walk(1920, player.y, false, function () {
                            player.changeRoom('rTest', 0, player.y);
                        });
                    }
                }
            }
        },
        character: {
            options: {
                defaults: {

                }
            },
            jeff: {
                animationSpeed: 0.25,
                autoplay: false,
                walkspeed: 6,
                roomName: 'rTest',
                isPlayer: true,
                speechStyle: {
                    color: '#FF00FF'
                },
                position: {
                    x: 785,
                    y: 370
                },
                views: ['bird/walk_right', 'bird/walk_left', 'bird/talk'],
                dirViews: {
                    right: 'bird/walk_right',
                    down: 'bird/talk',
                    left: 'bird/walk_left'
                },
                talkViews: {
                    down: 'bird/talk',
                    right: 'bird/talk',
                    left: 'bird/talk',
                    up: 'bird/talk'
                },
                name: 'Jeff',
                onClick: function () {
                    if (this.playing) {
                        this.stop();
                        console.log ('stopping Jeff.');
                    }
                    else {
                        this.play();
                        console.log ('starting Jeff.');
                    }
                }
            },
            otherJeff: {
                animationSpeed: 0.25,
                walkspeed: 6,
                roomName: 'rTest2',
                position: {
                    x: 785,
                    y: 370
                },
                tint: 0xFF8888,
                views: ['bird/walk_right', 'bird/walk_left', 'bird/talk'],
                dirViews: {
                    right: 'bird/walk_right',
                    down: 'bird/talk',
                    left: 'bird/walk_left'
                },
                talkViews: {
                    down: 'bird/talk',
                    right: 'bird/talk',
                    left: 'bird/talk',
                    up: 'bird/talk'
                },
                name: 'Anderer Jeff',
                onClick: function () {
                    Character.getPlayer().say('Das ist wohl noch ein Jeff.');
                    game.wait(1000);
                    this.say('Ach ja. So ist das.');
                }
            }
        },
        views: {
            bird: {
                talk: {
                    image: 'spritesheets/polly_talk.json',
                    frames: [
                        'polly_talk_1.png',
                        'polly_talk_2.png',
                        'polly_talk_3.png',
                        'polly_talk_4.png',
                        'polly_talk_5.png',
                        'polly_talk_6.png',
                        'polly_talk_7.png'
                    ]
                },
                walk_right: {
                    image: 'spritesheets/polly_walk_r.json',
                    frames: [
                        'walk_right_0.png',
                        'walk_right_1.png',
                        'walk_right_2.png',
                        'walk_right_3.png',
                        'walk_right_4.png',
                        'walk_right_5.png',
                        'walk_right_6.png',
                        'walk_right_7.png',
                        'walk_right_8.png',
                        'walk_right_9.png',
                        'walk_right_10.png',
                        'walk_right_11.png',
                        'walk_right_12.png',
                        'walk_right_13.png'
                    ]
                },
                walk_left: {
                    image: 'spritesheets/polly_walk_l.json',
                    frames: [
                        'walk_left_0.png',
                        'walk_left_13.png',
                        'walk_left_12.png',
                        'walk_left_11.png',
                        'walk_left_10.png',
                        'walk_left_9.png',
                        'walk_left_8.png',
                        'walk_left_7.png',
                        'walk_left_6.png',
                        'walk_left_5.png',
                        'walk_left_4.png',
                        'walk_left_3.png',
                        'walk_left_2.png',
                        'walk_left_1.png'
                    ]
                }
            }
        },
        gui: {
            menubar: {
                visible: true,
                elements: {
                    menubutton: {
                        type: 'graphic',
                        text: 'menü',
                        textStyle: {
                            fontSize : '16px',
                            fontFamily: 'Arial',
                            fontWeight: 'normal'
                        },
                        textPosition: {
                            x: 10,
                            y: 10
                        },
                        position: {
                            x: game.settings.width - 200,
                            y: 0
                        },
                        size: {
                            w: 200,
                            h: 50
                        },
                        lineColor: 0x0000FF,
                        lineWidth: 2,
                        lineAlpha: 1,
                        onClick: function () {
                            var gMenu = Gui.get('saveLoadMenu');
                            if (gMenu.visible) {
                                gMenu.hide();
                            }
                            else gMenu.show();
                            console.log ('clicked menu button');
                        }
                    }
                }
            },
            saveLoadMenu: {
                visible: false,
                position: {
                    x: 50,
                    y: 50
                },
                elements: {
                    savebutton: {
                        type: 'graphic',
                        text: 'speichern',
                        textStyle: {
                            fontSize : '15px',
                            fontFamily: 'Arial',
                            fontWeight: 'normal'
                        },
                        textPosition: {
                            x: 10,
                            y: 10
                        },
                        position: {
                            x: 0,
                            y: 0
                        },
                        size: {
                            w: 200,
                            h: 50
                        },
                        lineColor: 0x0000AA,
                        lineWidth: 2,
                        lineAlpha: 1,
                        onClick: function () {
                            console.log ('clicked save button');
                            game.save();
                        }
                    },
                    loadbutton: {
                        type: 'graphic',
                        text: 'laden',
                        textStyle: {
                            fontSize : '15px',
                            fontFamily: 'Arial',
                            fontWeight: 'normal'
                        },
                        textPosition: {
                            x: 10,
                            y: 10
                        },
                        position: {
                            x: 210,
                            y: 0
                        },
                        size: {
                            w: 200,
                            h: 50
                        },
                        lineColor: 0x0000AA,
                        lineWidth: 2,
                        lineAlpha: 1,
                        onClick: function () {
                            console.log ('clicked load button');
                            game.load();
                        }
                    }
                }
            }
        }
    };
}
