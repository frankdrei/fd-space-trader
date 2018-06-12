define([
    "Phaser"
], function (FdSpaceTraderGame) {
    var FdSpaceTraderGame = function (w, h) {
        return new Phaser.Game(w, h, Phaser.AUTO);
    };
    return FdSpaceTraderGame;
});