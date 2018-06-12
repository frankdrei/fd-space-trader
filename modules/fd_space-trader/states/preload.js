define([
    "Phaser"
], function (Phaser) {
    var PreloadState = function (game) {

    };
    PreloadState.prototype = {

        constructor: PreloadState,

        preload: function () {

            var loadingBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, "Loading");
            loadingBar.anchor.setTo(0.5, 0.5);
            this.load.setPreloadSprite(loadingBar);

      
            this.game.load.image("Background1", "assets/background1.png");
            this.game.load.image("Background2", "assets/background2.png");
            this.game.load.image("Background3", "assets/background3.png");
            this.game.load.image("Background4", "assets/background4.png");
            this.game.load.image("Moon1", "assets/moon1.png");
            this.game.load.image("Pluto1", "assets/pluto1.png");
            this.game.load.image("White", "assets/white.png");
            this.game.load.image("Barren64", "assets/barren64x44.png");
            this.game.load.image("PaperBoulder80", "assets/boulder80x80.png");
            this.game.load.image("PaperBoulder300", "assets/boulder300x300.png");
            this.game.load.image("Bullet", "assets/bullet.png");
            this.game.load.image("Ship1", "assets/ship1.png");
            this.game.load.image("Ship2", "assets/ship2.png");
            this.game.load.physics("sprite_physics", "assets/sprite_physics.json");

            this.game.load.image("Spark", "assets/spark.png");

            this.game.load.audio('Explosion', 'assets/audio/soundeffects/explosion.mp3');
            this.game.load.audio('Blaster', 'assets/audio/soundeffects/blaster.mp3');
            this.game.load.audio('Hit', 'assets/audio/soundeffects/hit.mp3');


        },

        create: function () {
            this.game.state.start("Game");
        }
    };
    return PreloadState;
});
