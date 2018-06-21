define([
    "Phaser", 
    "units/ship",

], function (Phaser, Ship) {

    var background1;
    var background2;
    var background3;
    var background4;
    var universe = [];
    var UNIVERSEX = 10000;
    var UNIVERSEY = 10000;
    var MAXSYSTEMS = 1000;
    var WORLDSIZEX = 20000;
    var WORLDSIZEY = 20000;
    var MAXBOULDERS = 100;
    var MAXBULLETS = 100;
    var MAXSHIPLIFE = 2000;
    var BULLETLIFESPAN = 6000;
    var firetimer = 0;
    var FIRERATE = 100;

    var upKey, downKey, rotLeftKey, rotRightKey, panLeftKey, interactKey, fireKey, shieldKey;

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
            interactKey = me.game.input.keyboard.addKey(Phaser.Keyboard.E);
            panLeftKey = me.game.input.keyboard.addKey(Phaser.Keyboard.Q);
            fireKey = me.game.input.keyboard.addKey(Phaser.Keyboard.Y);
            shieldKey = me.game.input.keyboard.addKey(Phaser.Keyboard.STRGLEFT);


            // Create collision groups
            me.shipCollisionGroup = me.game.physics.p2.createCollisionGroup();
            me.boulderCollisionGroup = me.game.physics.p2.createCollisionGroup();
            me.lootCollisionGroup = me.game.physics.p2.createCollisionGroup();
            me.bulletCollisionGroup = me.game.physics.p2.createCollisionGroup();

            me.allCollisionGroups = [me.shipCollisionGroup, me.bulletCollisionGroup, me.boulderCollisionGroup, me.lootCollisionGroup];
            me.bulletCollisionGroups = [me.bulletCollisionGroup, me.boulderCollisionGroup, me.lootCollisionGroup];
            me.lootCollisionGroups = [me.bulletCollisionGroup, me.boulderCollisionGroup, me.shipCollisionGroup];

            // Create a bunch of boulders
            me.paperboulders300 = this.createObjects("PaperBoulder300", MAXBOULDERS + 1000, 150);
            me.paperboulders80 = this.createObjects("PaperBoulder80", MAXBOULDERS + 1000, 50);

            // Create a bunch of Bulets
            me.bullets = me.createObjects("Bullet", MAXBULLETS, 1);

            // Create a bunch of Loot
            me.loot = me.createObjects("Barren64", 50, 1);

            // Create Ship
            me.ship = new Ship("Ship1", me.shipCollisionGroup, 10, MAXSHIPLIFE, me.game);
            me.game.add.existing(me.ship);
            me.ship.body.collides(me.allCollisionGroups, this.shiphit, this);

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
            this.game.physics.p2.setPostBroadphaseCallback(this.checkOverlap, this);
            this.game.physics.p2.setImpactEvents(true);
            // this.game.physics.p2.setPostBroadphaseCallback(me.checkOverlap, this);   //this is used to start the check

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
            var i = 0;
            objects.forEach(function (child) {
                child.health = health;
                child.id = i;
                i++;
                child.body.clearShapes();
                child.body.loadPolygon('sprite_physics', objectName);
            }, this);

            return objects;

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
            if (interactKey.isDown && me.ship.grabLoot) {
                me.ship.lootGrabbed = true;
            } else {
                me.ship.lootGrabbed = false;
            }
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
                if(me.ship.thrustPreset >= me.ship.MAXTHRUST){
                    me.ship.thrustPreset = me.ship.MAXTHRUST
                } else {
                    me.ship.thrustPreset +=20;
                    me.ship.thrustbar.setPercent(me.ship.thrustPreset/me.ship.MAXTHRUST*100, this.game);
                }
                
            }
            else if (downKey.isDown) {
                if(me.ship.thrustPreset <= 0 ){
                    me.ship.thrustPreset = 0
                } else {
                    me.ship.thrustPreset -=40;
                    me.ship.thrustbar.setPercent(me.ship.thrustPreset/me.ship.MAXTHRUST*100, this.game);
                }                
                me.ship.body.reverse(1000);
                me.ship.emitterBack1.emitParticle();
                me.ship.emitterBack2.emitParticle();
            } 
            
            if (me.game.input.activePointer.leftButton.isDown ) {
                if (me.game.time.now > firetimer) {
                    me.fireBullet(me.bullets, me.bulletCollisionGroup, me.bulletCollisionGroups, 1, 1);
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
            
            me.ship.body.thrust(me.ship.thrustPreset);
            me.ship.emitterForward.minParticleSpeed = new Phaser.Point(0,me.ship.thrustPreset/1000);
            me.ship.emitterForward.maxParticleSpeed = new Phaser.Point(0,me.ship.thrustPreset/30);
            if(me.ship.thrustPreset >> 0){
                me.ship.emitterForward.emitParticle();
            }
            
            me.game.debug.text(me.game.time.fps, 2, 10, "#00ff00");
            me.game.debug.text("pos: " + Math.floor(me.ship.position.x) + " / " + Math.floor(me.ship.position.y), 2, 20, "#00ff00");
            var shipspeed = Math.sqrt(Math.pow(this.ship.body.velocity.x, 2) + Math.pow(this.ship.body.velocity.x, 2));
            me.game.debug.text("speed: " + shipspeed , 2, 40, "#00ff00");
            me.game.debug.text("Ship Health: " + Math.floor(me.ship.health), 2, 50, "#00ff00");


            

        },


        fireBullet: function (bullets, collisionGroup, collisionGroups, mass, health) {

            var object = this.spawnObject(bullets, collisionGroup, collisionGroups);
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
         spawnLoot: function (loottype, lootammount, loots, collisionGroup, collisionGroups, mass, health, x, y, angle) {

            // Spawn new object
            var object = this.spawnObject(loots, collisionGroup, collisionGroups);
            // Set object's position and velocity
            object.reset(x, y);
            object.body.damping = 0;
            object.body.angularDamping  = 0;
            object.body.velocity.x = Math.sin(angle) * this.random.integerInRange(10, 150);
            object.body.velocity.y = Math.cos(angle) * this.random.integerInRange(10, 150);
            object.body.mass = mass;
            object.health = health;
            object.type = loottype; 
            object.ammount = lootammount;

            return object;
            
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
        spawnBolder: function (boulders, collisionGroup, collisionGroups, mass, health, x, y, angle) {

            // Spawn new object
            var object = this.spawnObject(boulders, collisionGroup, collisionGroups);
            // Set object's position and velocity
            object.reset(x, y);
            object.body.velocity.x = Math.sin(angle) * this.random.integerInRange(10, 150);
            object.body.velocity.y = Math.cos(angle) * this.random.integerInRange(10, 150);
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
            if (object1.sprite.key === "Bullet" && object1.sprite.alive === true) {
                object1.sprite.lifespan = 100;
                object1.sprite.alive = false;
                object2.sprite.health -= 1;
                this.hitsound.play();
                if (object2.sprite.health <= 0) {
                    if(object2.sprite.key === "PaperBoulder300"){
                        // Großer Bouilder zerfällt in 4 kleinere
                        // random loot spawns
                        this.spawnBolder(this.paperboulders80, this.boulderCollisionGroup, this.allCollisionGroups, 50, 5, object1.x+32, object1.y+32, this.random.integerInRange(0, Math.PI));
                        this.spawnBolder(this.paperboulders80, this.boulderCollisionGroup, this.allCollisionGroups, 50, 5, object1.x+32, object1.y-32, this.random.integerInRange(0, Math.PI));
                        this.spawnBolder(this.paperboulders80, this.boulderCollisionGroup, this.allCollisionGroups, 50, 5, object1.x-32, object1.y-32, this.random.integerInRange(0, Math.PI));
                        this.spawnBolder(this.paperboulders80, this.boulderCollisionGroup, this.allCollisionGroups, 50, 5, object1.x-32, object1.y+32, this.random.integerInRange(0, Math.PI));
                        for(var i = 0; i < 5; i++) {
                            var chance = this.random.integerInRange(0, 1); //Chanche 1 / 5
                            var tmpnum = this.random.integerInRange(0, 2);
                            switch(tmpnum){
                                case 0:
                                loottype = "Stein";
                                break;
                                case 1:
                                loottype = "Metall";
                                break;
                                case 2:
                                loottype = "Gold";
                                break;
                            }
                            var lootammount = this.random.integerInRange(10, 100);
                            if(chance === 0){
                                this.spawnLoot(loottype, lootammount, this.loot, this.lootCollisionGroup, this.lootCollisionGroups, lootammount, 5, object1.x, object1.y, this.random.integerInRange(0, Math.PI));
                            }
                        }

                    }

                    this.explosionEmitter(object1.x, object1.y);
                    // var tmpemitter = this.game.add.emitter(object1.x, object1.y, 100);
                    // tmpemitter.makeParticles("White");
                    // tmpemitter.gravity = 0;
                    // tmpemitter.minParticleScale = 0.01;
                    // tmpemitter.maxParticleScale = 0.5;
                    
                    // tmpemitter.setAlpha(1, 0, 2000, Phaser.Easing.Quintic.Out);
                    
                    // tmpemitter.start(true,2000, null, 100);
                    
                    object2.sprite.kill();
                    this.explosion.play();
                }
            }
        },


        shiphit: function (object1, object2) {
            if(object1.sprite.key === "Ship1" && object2.sprite.key === "Barren64" || object1.sprite.key === "Barren64" && object2.sprite.key === "Ship1") {
                console.log(object1.sprite.key + " - Ship");
                console.log(object2.sprite.key + " - Ship");
            }

            object1.sprite.health -= object2.mass;
            object1.sprite.healthbar.setPercent(object1.sprite.health/MAXSHIPLIFE*100, this.game);
            object2.sprite.health -= object1.mass;
            this.hitsound.play();
            if (object2.sprite.health <= 0) {
                this.explosionEmitter(object2.x, object2.y);
                object2.sprite.kill();
                this.explosion.play();
            }
            if (object1.sprite.health <= 0) {
                this.explosion.play();
                this.game.state.start("GameOver");
            }
            
        },


        checkOverlap: function (object1, object2) {

            if(object1.sprite.key === "Ship1" && object2.sprite.key === "Barren64" || object2.sprite.key === "Ship1" && object1.sprite.key === "Barren64") {

                var shipobject;
                var lootobject;
                if(object1.sprite.key === "Ship1"){
                    shipobject = object1;
                    lootobject = object2;
                } else {
                    shipobject = object2;
                    lootobject = object1;
                }
                if(Math.abs(shipobject.velocity.x - lootobject.velocity.x) <=200 && Math.abs(shipobject.velocity.y - lootobject.velocity.y) <=200){

                    shipobject.sprite.grabLoot = true;

                    if(shipobject.sprite.lootGrabbed){
                        if(shipobject.sprite.cargoSpace + lootobject.sprite.ammount <= shipobject.sprite.MAXCARGOSPACE){
                            shipobject.sprite.cargoSpace += lootobject.sprite.ammount;
                            shipobject.sprite.cargobar.setPercent(shipobject.sprite.cargoSpace/shipobject.sprite.MAXCARGOSPACE*100, this.game);
                            shipobject.sprite.cargoObjets.push(object2);
                            lootobject.sprite.kill();
                            shipobject.sprite.lootGrabbed = false;
                            console.log(shipobject);
                        }
                    }
                    return false;
                }
                shipobject.sprite.grabLoot = false;
            }
            return true;
        },

        explosionEmitter: function(x, y) {
            var tmpemitter = this.game.add.emitter(x, y, 100);
            tmpemitter.makeParticles("White");
            tmpemitter.gravity = 0;
            tmpemitter.minParticleScale = 0.01;
            tmpemitter.maxParticleScale = 0.5;
            
            tmpemitter.setAlpha(1, 0, 2000, Phaser.Easing.Quintic.Out);
            
            tmpemitter.start(true,2000, null, 100);

        }


    };
    return GameState;
    });

    