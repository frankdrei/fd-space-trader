define([
    "Phaser"
], function (Phaser) {
    var BootState = function (game) {

    };
    BootState.prototype = {

        constructor: BootState,

        preload: function () {
            this.game.load.image("Loading", "assets/loading.png");
        },

        create: function () {

            this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            

            this.game.state.start("Preload");
        }
    };
    return BootState;
    });