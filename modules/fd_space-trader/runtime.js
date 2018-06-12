requirejs.config({
    paths: {
        Phaser: "vendor/phaser"
    }
});
require([
    "fd_space-trader-game",
    "states/boot",
    "states/preload",
    "states/game",
    "states/gameover"
], function (FdSpaceTraderGame, BootState, PreloadState, GameState, GameOverState) {
    var game = new FdSpaceTraderGame(window.innerWidth * window.devicePixelRatio - 50, window.innerHeight * window.devicePixelRatio - 50);
    game.state.add("Boot", BootState);
    game.state.add("Preload", PreloadState);
    game.state.add("Game", GameState);
    game.state.add("GameOver", GameOverState);

    game.state.start("Boot");
}
);
