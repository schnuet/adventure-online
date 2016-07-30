var gameData = function (game) {
    var Room = {};
    var Character = {};

    return {
        connect: function () {
            Character = game._loadedComponents.character;
            Room = game._loadedComponents.room;
        },
        room : {
            options: {
                startRoom: 'rTest'
            },
            rTest: {
                image: 'r_standard.png',
                width: 1920,
                height: 480,
                options: {}
                //scriptName: 'rTest'
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
                        Character.getPlayer().walk(this.x, this.y, false, function () {
                            console.log ('He is there.');
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
                    views: ['bird/talk'],
                    name: 'Animationstest',
                    onClick: function () {
                        console.log ('click auf Typ.');
                        Character.getPlayer().walk(this.x, this.y+this.height, false, function() {
                            Character.getPlayer().say('Das ist ein Testtext.');
                        });

                        /*if (this.playing) this.stop();
                        else this.play();*/
                    }
                }
            },
        },
        character: {
            jeff: {
                animationSpeed: 0.25,
                autoplay: false,
                walkspeed: 6,
                roomName: 'rTest',
                isPlayer: true,
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
                    down: 'bird/talk'
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
        }
    };
}
