// TODO merere Statusbars für "Shield", "Cargo", "Thrust forward und backward" ...
define([
    "Phaser"
], function(Phaser){
    var Statusbar = function(game, params){
        this.defaultConfig = {
            width: 300,
            height: 50,
            x: 0,
            y: 0,
            bg: {
                color: "#00002b"
            },
            bar: {
                color: "#FEFF03"
            },
            animationDuration: 200,
            flipped: false,
            isFixedToCamera: true
        };
        if (typeof params !== "undefined"){
            for(var key in params) {
                this.defaultConfig[key] = params[key];
            };
        }

        var bmd = game.add.bitmapData(this.defaultConfig.width, this.defaultConfig.height);
        bmd.ctx.fillStyle = this.defaultConfig.bg.color;
        bmd.ctx.beginPath();
        bmd.ctx.rect(0, 0, this.defaultConfig.width, this.defaultConfig.height);
        bmd.ctx.fill();
        bmd.update();
        this.bgSprite = game.add.sprite(this.defaultConfig.x,this.defaultConfig.y, bmd);
        this.bgSprite.anchor.set(0.5);
        this.bgSprite.fixedToCamera = this.defaultConfig.isFixedToCamera;
        
        bmd = game.add.bitmapData(this.defaultConfig.width, this.defaultConfig.height);
        bmd.ctx.fillStyle = this.defaultConfig.bar.color;
        bmd.ctx.beginPath();
        bmd.ctx.rect(0, 0, this.defaultConfig.width, this.defaultConfig.height);
        bmd.ctx.fill();
        bmd.update();
        this.fgSprite = game.add.sprite(this.defaultConfig.x - this.bgSprite.width / 2, this.defaultConfig.y , bmd);
        this.fgSprite.anchor.y = 0.5;
        this.fgSprite.fixedToCamera = this.defaultConfig.isFixedToCamera;
        
    }
    Statusbar.prototype = Object.create(Phaser.Sprite.prototype);
    Statusbar.prototype.constructor = Statusbar;
    Statusbar.prototype.setPercent = function(newValue, game){
        if(newValue < 0) newValue = 0;
        if(newValue > 100) newValue = 100;
        var newWidth =  (newValue * this.defaultConfig.width) / 100;
        game.add.tween(this.fgSprite).to( { width: newWidth }, this.defaultConfig.animationDuration, Phaser.Easing.Linear.None, true);
    };
    return Statusbar;
});