define([
    "Phaser"
], function (Phaser) {
    var GameOverState = function (game) {

    };
    GameOverState.prototype = {

        constructor: GameOverState,

        init: function () {

        },

        create: function () {
            this.game.debug.text("Game Over!", 100, 100, "#ff0000");
        }
    };
    return GameOverState;
});