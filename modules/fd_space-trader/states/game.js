define([
    "Phaser"
], function (Phaser) {

    var explosion;
    var blaster;
    var hitsound;
    var background1;
    var background2;
    var background3;
    var background4;
    var moon1;
    var boulders;
    var boulders128;
    var paperboulders300;
    var bullets;
    var ship;
    var emitter;
    var cursors;
    var allCollisionGroups = [];
    var universe = [];
    var UNIVERSEX = 10000;
    var UNIVERSEY = 10000;
    var MAXSYSTEMS = 2000;
    var WORLDSIZEX = 20000;
    var WORLDSIZEY = 20000;
    var MAXBOULDERS = 100;
    var MAXBULLETS = 100;
    var BULLETLIFESPAN = 6000;
    var firetimer = 0;
    var FIRERATE = 100;

    var upKey, downKey, rotLeftKey, rotRightKey, panLeftKey, panRightKey, fireKey, shieldKey;

    var GameState = function (game) {

    };
    GameState.prototype = {

        constructor: GameState,

        create: function () {
            var me = this;

            // Create a random generator
            var seed = Date.now();
            this.random = new Phaser.RandomDataGenerator([seed]);


            me.game.time.advancedTiming = true;

            me.game.world.setBounds(0, 0, WORLDSIZEX, WORLDSIZEY);

            me.game.physics.startSystem(Phaser.Physics.P2JS);
            me.game.physics.p2.defaultRestitution = 0.8;

            me.explosion = me.game.add.audio('Explosion');

            me.hitsound = me.game.add.audio('Hit');
            me.hitsound.allowMultiple = true;

            me.blaster = me.game.add.audio('Blaster');
            me.blaster.allowMultiple = true;
            
   
      
            background1 = this.game.add.tileSprite(0, 0, window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio, "Background1");
            background2 = this.game.add.tileSprite(0, 0, window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio, "Background2");
            background3 = this.game.add.tileSprite(0, 0, window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio, "Background3");
            background4 = this.game.add.tileSprite(0, 0, window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio, "Background4");
            background1.fixedToCamera = true;
            background2.fixedToCamera = true;
            background3.fixedToCamera = true;
            background4.fixedToCamera = true;

            moon1 = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, "Moon1");
            pluto1 = this.game.add.sprite(70000, 60000, "Pluto1");

            me.game.input.mouse.capture = true;

            cursors = this.game.input.keyboard.createCursorKeys();
            upKey = me.game.input.keyboard.addKey(Phaser.Keyboard.W);
            downKey = me.game.input.keyboard.addKey(Phaser.Keyboard.S);
            rotRightKey = me.game.input.keyboard.addKey(Phaser.Keyboard.D);
            rotLeftKey = me.game.input.keyboard.addKey(Phaser.Keyboard.A);
            panRightKey = me.game.input.keyboard.addKey(Phaser.Keyboard.E);
            panLeftKey = me.game.input.keyboard.addKey(Phaser.Keyboard.Q);
            fireKey = me.game.input.keyboard.addKey(Phaser.Keyboard.Y);
            shieldKey = me.game.input.keyboard.addKey(Phaser.Keyboard.STRGLEFT);


            // Create collision groups
            me.shipCollisionGroup = me.game.physics.p2.createCollisionGroup();
            me.boulderCollisionGroup = me.game.physics.p2.createCollisionGroup();
            me.lootCollisionGroup = me.game.physics.p2.createCollisionGroup();
            me.bulletCollisionGroup = me.game.physics.p2.createCollisionGroup();

            me.allCollisionGroups = [me.shipCollisionGroup, me.bulletCollisionGroup, me.boulderCollisionGroup, me.lootCollisionGroup];


            // Create a bunch of boulders
            me.paperboulders300 = this.createObjects("PaperBoulder300", MAXBOULDERS + 1000, 150);
            me.paperboulders80 = this.createObjects("PaperBoulder80", MAXBOULDERS + 1000, 50);

            // Create a bunch of Bulets
            me.bullets = me.createObjects("Bullet", MAXBULLETS, 1);

            // Create a bunch of Loot
            me.loot = me.createObjects("Barren64", 50, 1);

            // Create Ship
            me.ship = me.createShip("Ship1", me.shipCollisionGroup, me.allCollisionGroups, 10, 2000);

            // This is required so that the groups will collide with the world bounds
            this.game.physics.p2.updateBoundsCollisionGroup();
            
            //spawn only MAXBOLDERS
            for(var i = 0; i < MAXBOULDERS; i++) {
                me.spawnBolders(me.paperboulders300, me.boulderCollisionGroup, me.allCollisionGroups, 500, 50);
            };

            //spawn only MAXBOLDERS (1000 boulder are for splitting the big ones)
            for(var i = 0; i < MAXBOULDERS; i++) {
                me.spawnBolders(me.paperboulders80, me.boulderCollisionGroup, me.allCollisionGroups, 50, 5);
            };

            // Enable collision callbacks
            this.game.physics.p2.setImpactEvents(true);

        },


        /** @description erstelle Sprite Objecte mit P2 Body
          * @param {string} objectName Name der Textur und des Physics Shapes
          * @param {integer} ammount Menge
          * @param {integer} health Health
          * @return {object} Objecte  
          */
        createObjects: function (objectName, ammount, health) {

            var objects = this.game.add.group();
            objects.enableBody = true;
            objects.physicsBodyType = Phaser.Physics.P2JS;

            objects.createMultiple(ammount, objectName);

            objects.forEach(function (child) {
                child.health = health;
                child.body.clearShapes();
                child.body.loadPolygon('sprite_physics', objectName);
            }, this);

            return objects;

        },


        /** @description erstell ein Schiff
          * @param {string} objectName Name der Textur.  
          * @param {object} collisionGroup Objects Collision Group
          * @param {array} collisionGroups Array mit Collisiongroups
          * @param {integer} health  Health
          * @param {integer} mass Masse
          * @return {object} Schiffsobject  
          */
        createShip: function (objectName, collisionGroup, collisionGroups, mass, health) {
            // TODO evtl ein komplettes Object für die Shiffe übergeben incl aller Parameter

            // Add the player to the game
            var object = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, objectName);

            // Add Health to Ship
            object.health = health;

            // Enable physics, use "true" to enable debug drawing
            this.game.physics.p2.enable([object], false);

            // Get rid of current bounding box
            object.body.clearShapes();

            // Add our PhysicsEditor bounding shape
            object.body.loadPolygon("sprite_physics", objectName);

            // Define the players collision group and make it collide with the block and fruits
            object.body.setCollisionGroup(collisionGroup);

            object.body.collides(collisionGroups, this.shiphit, this);
            this.game.camera.follow(object);

            object.body.mass = mass;

            this.game.physics.p2.enable(object);


            object.emitterForward = this.createEmitter(500, "White", 0, 42, object, 300, 1, 0, 0.2, 0.2, new Phaser.Point(0,5), new Phaser.Point(0,100));
            object.emitterBack1 = this.createEmitter(500, "White", 22, 15, object, 300, 1, 0, 0.08, 0.08, new Phaser.Point(0,-5), new Phaser.Point(0,-70));
            object.emitterBack2 = this.createEmitter(500, "White", -22, 15, object, 300, 1, 0, 0.08, 0.08, new Phaser.Point(0, -5), new Phaser.Point(0, -70));
            object.emitterLeft = this.createEmitter(500, "White", 22, 10, object, 200, 1, 0, 0.08, 0.08, new Phaser.Point(5, 0), new Phaser.Point(100, 0));
            object.emitterRight = this.createEmitter(500, "White", -22, 10, object, 200, 1, 0, 0.08, 0.08, new Phaser.Point(-5, 0), new Phaser.Point(-100, 0));
            
            return object;
        },


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
        createEmitter: function (ammount, objectName, offsetX, offsetY, parent, lifespan, alphaFrom, alphaTo, scaleMin, scaleMax, minSpeed, maxSpeed) {
            var emitter = this.game.add.emitter(0, 0, ammount);
            emitter.makeParticles(objectName);
            parent.emitter = parent.addChild(emitter);
            emitter.x = offsetX;
            emitter.y = offsetY;
            emitter.minParticleScale = scaleMin;
            emitter.maxParticleScale = scaleMax;
            emitter.rotation = parent.rotation;
            emitter.setAlpha(alphaFrom, alphaTo, lifespan, Phaser.Easing.Quintic.Out);
            //emitter.setScale(scaleXFrom, scaleXTo, scaleYFrom, scaleYTo, lifespan, Phaser.Easing.Quintic.Out);
            emitter.lifespan = lifespan;
            emitter.minParticleSpeed = minSpeed;
            emitter.maxParticleSpeed = maxSpeed;

            return emitter;
        },


        update: function () {
            var me = this;

            if (rotLeftKey.isDown) {
                me.ship.body.thrustLeft(2000);
                me.ship.emitterLeft.emitParticle();
            }
            else if (rotRightKey.isDown) {
                me.ship.body.thrustRight(2000);
                me.ship.emitterRight.emitParticle();
            }
           
            me.ship.body.rotation = me.game.physics.arcade.angleToPointer(me.ship) + Math.PI/2;
            if (upKey.isDown) {
                me.ship.body.thrust(4000);
                me.ship.emitterForward.emitParticle();
   
            }
            else if (downKey.isDown) {
                me.ship.body.reverse(1000);
                me.ship.emitterBack1.emitParticle();
                me.ship.emitterBack2.emitParticle();
            } 

            if (me.game.input.activePointer.leftButton.isDown ) {
                if (me.game.time.now > firetimer) {
                    me.fireBullet(1,1);
                    me.blaster.play();
                }
            }

            if (!this.game.camera.atLimit.x) {
                background1.tilePosition.x -= me.ship.body.velocity.x * me.game.time.physicsElapsed/5;
                background2.tilePosition.x -= me.ship.body.velocity.x * me.game.time.physicsElapsed/3;
                background3.tilePosition.x -= me.ship.body.velocity.x * me.game.time.physicsElapsed/2;
                background4.tilePosition.x -= me.ship.body.velocity.x * me.game.time.physicsElapsed;
            }

            if (!this.game.camera.atLimit.y) {
                background1.tilePosition.y -= me.ship.body.velocity.y * me.game.time.physicsElapsed/5;
                background2.tilePosition.y -= me.ship.body.velocity.y * me.game.time.physicsElapsed/3;
                background3.tilePosition.y -= me.ship.body.velocity.y * me.game.time.physicsElapsed/2;
                background4.tilePosition.y -= me.ship.body.velocity.y * me.game.time.physicsElapsed;
            }

            me.game.debug.text(me.game.time.fps, 2, 10, "#00ff00");
            me.game.debug.text("pos: " + Math.floor(me.ship.position.x) + " / " + Math.floor(me.ship.position.y), 2, 20, "#00ff00");
            var shipspeed = Math.sqrt(Math.pow(this.ship.body.velocity.x, 2) + Math.pow(this.ship.body.velocity.x, 2));
            me.game.debug.text("speed: " + shipspeed , 2, 40, "#00ff00");
            me.game.debug.text("Ship Health: " + Math.floor(me.ship.health), 2, 50, "#00ff00");


            

        },


        fireBullet: function (mass, health) {

            var object = this.spawnObject(this.bullets, this.bulletCollisionGroup, this.boulderCollisionGroup);
            object.autoCull = true;
            object.outOfCameraBoundsKill = true;
            object.body.dampening = 0;
            object.lifespan = BULLETLIFESPAN;
            var angle = this.game.physics.arcade.angleToPointer(this.ship) + Math.PI / 2;
            object.reset(this.ship.body.x + Math.sin(angle) * 35 , this.ship.body.y + Math.cos(angle) * -42);
            object.body.mass = mass;
            object.health = health;
            object.body.rotation = angle;
            object.body.moveForward(1000);
            object.body.velocity.x += this.ship.body.velocity.x;
            object.body.velocity.y += this.ship.body.velocity.y;
            firetimer = this.game.time.now + FIRERATE;

        },


        /** @description erstell einen Boulder an Position xy mit zufälliger vx vy und rotation
          * @param {object} boulders NAme der Spritegruppe.  
          * @param {object} collisionGroup Objects Collision Group
          * @param {array} collisionGroups Array mit Collisiongroups
          * @param {integer} mass Masse
          * @param {integer} health  Health
          * @param {integer} x position x
          * @param {integer} y position y
          * @return {object} Boulder  
          */
        spawnBolder: function (boulders, collisionGroup, collisionGroups, mass, health, x, y) {

            // Spawn new object
            var object = this.spawnObject(boulders, collisionGroup, collisionGroups);
            // Set object's position and velocity
            object.reset(x, y);
            object.body.velocity.x = this.random.integerInRange(-500, 500);
            object.body.velocity.y = this.random.integerInRange(-500, 500);
            object.body.mass = mass;
            object.health = health;

            return object;
            
        },


        /** @description erstell einen Boulder an zufälliger Position mit zufälliger vx vy und rotation
          * @param {object} boulders NAme der Spritegruppe.  
          * @param {object} collisionGroup Objects Collision Group
          * @param {array} collisionGroups Array mit Collisiongroups
          * @param {integer} mass Masse
          * @param {integer} health  Health
          * @return {object} Boulder  
          */
        spawnBolders: function (boulders, collisionGroup, collisionGroups, mass, health) {

            // Spawn new object
            var object = this.spawnObject(boulders, collisionGroup, collisionGroups);
            // Set object's position and velocity
            object.reset(this.random.integerInRange(0, WORLDSIZEX), this.random.integerInRange(0, WORLDSIZEY));
            object.body.velocity.x = this.random.integerInRange(-50, 50);
            object.body.velocity.y = this.random.integerInRange(-50, 50);
            object.body.rotation = this.random.integerInRange(0, 2);
            object.body.mass = mass;
            object.health = health;

            return object;
            
        },

        spawnObject: function (objects, collisionGroup, collisionGroups) {

            var object = objects.getFirstExists(false);
            object.body.setCollisionGroup(collisionGroup);
            object.body.collides(collisionGroups, this.hit, this);

            return object;
        },


        hit: function (object1, object2) {
            
            if (object2.sprite.key === 'Bullet') {
                object2.sprite.lifespan = 100;
                object1.sprite.health -= 1;
                this.hitsound.play();
                if (object1.sprite.health <= 0)
                    {
                        if(object1.sprite.key === "PaperBoulder300") {
                            this.spawnBolder(this.paperboulders80, this.boulderCollisionGroup, this.allCollisionGroups, 50, 50, object1.x+100, object1.y+100);
                            this.spawnBolder(this.paperboulders80, this.boulderCollisionGroup, this.allCollisionGroups, 50, 50, object1.x-100, object1.y+100);
                            this.spawnBolder(this.paperboulders80, this.boulderCollisionGroup, this.allCollisionGroups, 50, 50, object1.x-100, object1.y-100);
                            this.spawnBolder(this.paperboulders80, this.boulderCollisionGroup, this.allCollisionGroups, 50, 50, object1.x+100, object1.y-100);
                        }
                        object1.sprite.alive = false;
                        object1.sprite.kill();
                        this.explosion.play();
                    }
            }
            
        },


        shiphit: function (object1, object2) {

            object1.sprite.health -= object2.mass;
            object2.sprite.health -= object1.mass;
            this.hitsound.play();
            if (object2.sprite.health <= 0) {
                object2.sprite.kill();
                this.explosion.play();
            }
            if (object1.sprite.health <= 0) {
                this.explosion.play();
                this.game.state.start("GameOver");
            }
            
        }


    };
    return GameState;
    });

    