// TODO verschiedene Schiffstypen mir unterschiedlichen Parametern und Shapes
// TODO Schiffe aus einzelkomponenten, die Zerfallen / zerstört werden können
// TODO eventuell Schiffe auf Stations selbst designen aus Baukastenteilen
define([
    "Phaser",
    "units/statusbar"

], function(Phaser, Statusbar){
    var Ship = function(objectName, collisionGroup, mass, health, game){


        Phaser.Sprite.call(this,game,game.world.centerX, game.world.centerY, objectName);
        
        
        // Add Cargo to Ship (later TODO with parametersets)
        this.MAXCARGOSPACE = 200;
        this.cargoSpace = 0;
        this.cargoObjets = [];
        // Add a Flag for possible grab a Loot
        this.grabLoot = false;
        // Add an Answer if Loot is grabbed
        this.lootGrabbed = false;
        // Add Health to Ship
        this.health = health;
        // Add Thruster fwd/rew
        this.thrustPreset = 0;
        this.MAXTHRUST = 4000;
                
        // Enable physics, use "true" to enable debug drawing
        game.physics.p2.enable([this], false);
        
        // Get rid of current bounding box
        this.body.clearShapes();
        
        // Add our PhysicsEditor bounding shape
        this.body.loadPolygon("sprite_physics", objectName);
        
        // Add Mass to Ship
        this.body.mass = mass;
        
        // Define the players collision group and make it collide with the block and fruits
        this.body.setCollisionGroup(collisionGroup);
    
        // Livebar für Schiff
        this.healthbar = new Statusbar(game, {
                animationDuration: 200,
                height: 20, 
                width: 400,
                x: game.width / 2,
                y: game.height - 55,
                bar: {
                    color: "#FEFF03",
                },
            });        
        // Cargobar für Schiff
        this.cargobar = new Statusbar(game,{
            animationDuration: 200,
            height: 20,
            width: 400,
            x: game.width / 2,
            y: game.height - 80,
            bar:{
                color: "#44ff44",
            },
        });       
        this.cargobar.setPercent(0,game);   

        // Thrusterbar +/- für Schiff
        this.thrustbar = new Statusbar(game,{
            animationDuration: 2,
            height: 10,
            width: 400,
            x: game.width / 2,
            y: game.height - 100,
            bar:{
                color: "#44ffff",
            },
        });        
        this.thrustbar.setPercent(0, game);

        game.camera.follow(this);
    
    
        game.physics.p2.enable(this);

        this.emitterForward = this.createEmitter(500, "White", 0, 42, this, 300, 1, 0, 0.2, 0.2, new Phaser.Point(0,this.thrustPreset/1000), new Phaser.Point(0,this.thrustPreset/100));
        this.emitterBack1 = this.createEmitter(500, "White", 22, 15, this, 300, 1, 0, 0.08, 0.08, new Phaser.Point(0,-5), new Phaser.Point(0,-70));
        this.emitterBack2 = this.createEmitter(500, "White", -22, 15, this, 300, 1, 0, 0.08, 0.08, new Phaser.Point(0, -5), new Phaser.Point(0, -70));
        this.emitterLeft = this.createEmitter(500, "White", 22, 10, this, 200, 1, 0, 0.08, 0.08, new Phaser.Point(5, 0), new Phaser.Point(100, 0));
        this.emitterRight = this.createEmitter(500, "White", -22, 10, this, 200, 1, 0, 0.08, 0.08, new Phaser.Point(-5, 0), new Phaser.Point(-100, 0));

    }
    Ship.prototype = Object.create(Phaser.Sprite.prototype);
    Ship.prototype.constructor = Ship;

    /** @description erstell einen emitter
     * @param {integer} ammount Anzahl Partikel 
     * @param {string} objectName Name der Textur.  
     * @param {integer} offsetX Offset X von Parent
     * @param {integer} offsetY Offset Y von Parent
     * @param {object} parent Parent Sprite
     * @param {integer} lifespan  Lifespan
     * @param {integer} alphaFrom  AlphaFrom
     * @param {integer} alphaTo  AlphaTo
     * @param {integer} scaleMin  ScaleXFrom
     * @param {integer} scaleMax  ScaleXTO
     * @param {point} minSpeed min Particle Speed
     * @param {point} maxSpeed max Particle Speed
     * @return {object} Emitter  
     */    
    Ship.prototype.createEmitter = function (ammount, objectName, offsetX, offsetY, parent, lifespan, alphaFrom, alphaTo, scaleMin, scaleMax, minSpeed, maxSpeed) {
        var emitter = this.game.add.emitter(0, 0, ammount);
        emitter.makeParticles(objectName);
        parent.emitter = parent.addChild(emitter);
        emitter.x = offsetX;
        emitter.y = offsetY;
        emitter.minParticleScale = scaleMin;
        emitter.maxParticleScale = scaleMax;
        emitter.rotation = parent.rotation;
        emitter.setAlpha(alphaFrom, alphaTo, lifespan, Phaser.Easing.Quintic.Out);
        emitter.lifespan = lifespan;
        emitter.minParticleSpeed = minSpeed;
        emitter.maxParticleSpeed = maxSpeed;
    
        return emitter;
    };
    return Ship;
});