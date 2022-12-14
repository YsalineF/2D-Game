// Fires when the whole page has been loaded (including stylesheets and image)
window.addEventListener('load', function(){
    // canvas setup
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 700;
    canvas.height = 500;

    // Keep track of specified user inputs (ex: arrow keys)
    class InputHandler {
        constructor(game) {
            this.game = game;
            // When we press the key
            window.addEventListener('keydown', e => {
                // Check if arrowUp or ArrowDown is pressed and if the key is not yet in the array (if not present, it will return -1)
                if((
                    (e.key === "ArrowUp") ||
                    (e.key === "ArrowDown")
                ) && this.game.keys.indexOf(e.key) === -1){
                    this.game.keys.push(e.key);
                } else if (e.key === " ") {
                    this.game.player.shootTop();
                } else if (e.key === 'd') {
                    this.game.debug = !this.game.debug;
                }
            });
            // When we release the key
            window.addEventListener('keyup', e => {
                // the .indexOf() method returns the first index at which a given element can be found in the array
                // if it's not present, it will return -1
                if(this.game.keys.indexOf(e.key) > -1){
                    // the .splice() method changes the content of an array by removing or replacing existing elements
                    // it needs at least 2 arguments : an index (where we want to start changing the array) and a delete
                    // count (an int indicating the number of elements in the array we want to remove from that 
                    // starting index)
                    this.game.keys.splice(this.game.keys.indexOf(e.key), 1);
                }
            });
        }
    }
    // Handle player's lasers
    class Projectile {
        constructor(game, x, y){
            this.game = game;
            this.x = x;
            this.y = y;
            this.width = 10;
            this.height = 3;
            this.speed = 3;
            this.markedForDeletion = false;
            this.image = document.getElementById('projectile');
        }
        update(){
            this.x += this.speed;
            // If the x coordinate of the projectile is more than 80% of the width of the game, then it becomes true
            // 80% (0.8) because the player takes some space and we don't want enemies to be hit and destroyed off screen 
            if(this.x > this.game.width * 0.8) this.markedForDeletion = true;
        }
        draw(context){
            context.drawImage(this.image, this.x, this.y);
        }
    }
    // Handle falling screws and bolts (from damaged enemies)
    class Particle {

    }
    // Control the main character (animate player)
    class Player {
        // constructor() creates a new JS object and assign it properties and values based on the blueprint inside
        constructor(game){
            this.game = game;
            this.width = 120;
            this.height = 190;
            // player's x position
            this.x = 20;
            // player's y position
            this.y = 100;
            this.frameX = 0;
            this.frameY = 0;
            this.maxFrame = 37;
            this.speedY = 0;
            this.maxSpeed = 3;
            this.projectiles = [];
            this.image = document.getElementById('player');
            this.powerUp = false;
            this.powerUpTimer = 0;
            this.powerUpLimit = 10000;
        }
        // method to move player around
        update(deltaTime){
            if(this.game.keys.includes('ArrowUp')) this.speedY = -this.maxSpeed;
            else if(this.game.keys.includes('ArrowDown')) this.speedY = this.maxSpeed;
            else this.speedY = 0;
            this.y += this.speedY;
            // Handle projectiles
            this.projectiles.forEach(projectile => {
                projectile.update();
            });
            // Filters the array of projectiles and only keep those with a false value for "markedForDeletion"
            // "this.projectiles =" means we overwrite on the existing array
            this.projectiles = this.projectiles.filter(projectile => !projectile.markedForDeletion);
            // Sprite animation
            if(this.frameX < this.maxFrame) {
                this.frameX++;
            } else {
                this.frameX = 0;
            }
            //power up
            if(this.powerUp) {
                if(this.powerUpTimer > this.powerUpLimit) {
                    this.powerUpTimer = 0;
                    this.powerUp = false;
                    this.frameY = 0;
                } else {
                    this.powerUpTimer += deltaTime;
                    this.frameY = 1;
                    this.game.ammo += 0.1;
                }
            }
        }

        // draw graphics representing the player
        draw(context) {
            //Handle projectiles
            this.projectiles.forEach(projectile => {
                projectile.draw(context);
            });
            if(this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
            // this.frameX * this.width, this.frameY * this.height, this.width, this.height => we select the part of the image we want
            context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width, this.height,this.x, this.y, this.width, this.height);
        }
        // Shoot from the mouth
        shootTop(){
            // If we have ammo (> 0), we can shoot and everytime we shoot, we decrease the amount of ammo by 1
            if(this.game.ammo > 0) {
                this.projectiles.push(new Projectile(this.game, this.x + 80, this.y + 30));
                this.game.ammo--;
                //console.log(this.game.ammo);
            }
            if(this.powerUp) this.shootBottom();
        }
        // Shoot from the tail
        shootBottom(){
            if(this.game.ammo > 0) {
                this.projectiles.push(new Projectile(this.game, this.x + 80, this.y + 175));
                this.game.ammo--;
                //console.log(this.game.ammo);
            }
        }
        enterPowerUp() {
            this.powerUpTimer = 0;
            this.powerUp = true;
            this.game.ammo = this.game.maxAmmo;
        }
    }
    // Handle different enemy types
    // Parent class (super)
    class Enemy {
        constructor(game){
            this.game = game;
            this.x = this.game.width;
            this.speedX = Math.random() * -1.5 - 0.5;
            this.markedForDeletion = false;
            this.frameX = 0;
            this.frameY = 0;
            this.maxFrame = 37;
        }
        update() {
            this.x += this.speedX - this.game.speed;
            if(this.x + this.width < 0) this.markedForDeletion = true;
            // Sprite animation
            if(this.frameX < this.maxFrame) {
                this.frameX++;
            } else this.frameX = 0;
        }
        draw(context) {
            if(this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
            context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height);
            context.font = '20px Helvetica';
            context.fillText(this.lives, this.x, this.y);
        }
    }

    // We have different enemy types
    // Child class (sub)
    class Angler1 extends Enemy {
        constructor(game) {
            // Refer to the parent constructor (super = parent)
            super(game);
            this.width = 228;
            this.height = 169;
            this.y = Math.random() * (this.game.height * 0.9 - this.height);
            this.image = document.getElementById('angler1');
            // Randomly choose a number between 0 and 2 bc we have 3 different animations
            this.frameY = Math.floor(Math.random() * 3);
            this.lives = 2;
            this.score = this.lives;
        }
    }
    // Child class (sub)
    class LuckyFish extends Enemy {
        constructor(game) {
            // Refer to the parent constructor (super = parent)
            super(game);
            this.width = 99;
            this.height = 95;
            this.y = Math.random() * (this.game.height * 0.9 - this.height);
            this.image = document.getElementById('lucky');
            // Randomly choose a number between 0 and 1 bc we have 2 different animations
            this.frameY = Math.floor(Math.random() * 2);
            this.lives = 3;
            this.score = 15;
            this.type = 'lucky';
        }
    }

    class Angler2 extends Enemy {
        constructor(game) {
            // Refer to the parent constructor (super = parent)
            super(game);
            this.width = 213;
            this.height = 165;
            this.y = Math.random() * (this.game.height * 0.9 - this.height);
            this.image = document.getElementById('angler2');
            // Randomly choose a number between 0 and 1 bc we have 2 different animations
            this.frameY = Math.floor(Math.random() * 2);
            this.lives = 3;
            this.score = this.lives;
        }
    }

    // Handle individual background layers
    class Layer {
        constructor(game, image, speedModifier) {
            this.game = game;
            this.image = image;
            this.speedModifier = speedModifier;
            this.width = 1768;
            this.height = 500;
            this.x = 0;
            this.y = 0;
        }
        update(){
            if(this.x <= -this.width) this.x = 0;
            this.x -= this.game.speed * this.speedModifier;
        }
        draw(context){
            context.drawImage(this.image, this.x, this.y);
            // So we don't have an empty background, a copy fill the space while the first background reload
            context.drawImage(this.image, this.x + this.width, this.y);
        }
    }
    // Animate the entire game's world
    class Background {
        constructor(game) {
            this.game = game;
            this.image1 = document.getElementById('layer1');
            this.image2 = document.getElementById('layer2');
            this.image3 = document.getElementById('layer3');
            this.image4 = document.getElementById('layer4');
            this.layer1 = new Layer(this.game, this.image1, 0.2);
            this.layer2 = new Layer(this.game, this.image2, 0.4);
            this.layer3 = new Layer(this.game, this.image3, 1);
            this.layer4 = new Layer(this.game, this.image4, 1.5);
            this.layers = [this.layer1, this.layer2, this.layer3];
        }
        update(){
            this.layers.forEach(layer => layer.update());
        }
        draw(context){
            this.layers.forEach(layer => layer.draw(context));
        }
    }
    // Draw score, timer and other information that needs to be displayed for the user
    class UI {
        constructor(game) {
            this.game = game;
            this.fontSize = 25;
            this.fontFamily = 'Bangers';
            this.color = 'white';
        }
        draw(context){
            // context.save() and context.restore() means the shadow only affect the elements between the save and the store (so not the player, the enemies, ...)
            context.save();
            context.fillStyle = this.color;
            context.shadowOffsetX = 2;
            context.shadowOffsetY = 2;
            context.shadowColor = 'black';
            context.font = this.fontSize + 'px' + this.fontFamily;
            
            // score
            context.font = '20px Bangers';
            context.fillText('Score : ' + this.game.score, 20, 40);
            
            //timer
            const formattedTime = (this.game.gameTime * 0.001).toFixed(1);
            context.fillText('Timer : ' + formattedTime, 20, 100);
            //game over messages
            if(this.game.gameOver){
                context.textAlign = 'center';
                let message1;
                let message2;
                if(this.game.score > this.game.winningScore) {
                    message1 = 'Most Wondrous!';
                    message2 = 'Well done explorer!'
                } else {
                    message1 = 'Blazes!';
                    message2 = 'Get my repair kit and try again!';
                }
                context.font = '70px ' + this.fontFamily;
                context.fillText(message1, this.game.width * 0.5, this.game.height * 0.5 - 20);
                context.font = '25px ' + this.fontFamily;
                context.fillText(message2, this.game.width * 0.5, this.game.height * 0.5 + 20);
            }
            //ammo 
                // => we can see the ammo recharging on the canvas and it will recharge until it hits maxAmmo
                if(this.game.player.powerUp) context.fillStyle = '#ffffbd';
                for(let i = 0; i < this.game.ammo; i++){
                    //x = 5 (+ 20px left margin), y = 50, width = 3, height = 20
                    context.fillRect(20 + 5 * i, 50, 3, 20);
                }
            context.restore();
        }
    }
    // Handle the entire game
    class Game {
        constructor(width, height){
            this.width = width;
            this.height = height;
            this.Background = new Background(this);
            // new Player(this) ==> this refer to the class Game
            this.player = new Player(this);
            this.input = new InputHandler(this);
            this.UI = new UI(this);
            this.keys = [];
            this.enemies = [];
            this.enemyTimer = 0;
            this.enemyInterval = 1000;
            this.ammo = 20;
            this.maxAmmo = 50;
            this.ammoTimer = 0;
            this.ammoInterval = 500;
            this.gameOver = false;
            this.score = 0;
            this.winningScore = 10;
            this.gameTime = 0;
            this.timeLimit = 15000;
            this.speed = 1;
            this.debug = true;
        }
        update(deltaTime){
            if(!this.gameOver) this.gameTime += deltaTime;
            if(this.gameTime > this.timeLimit) this.gameOver = true;
            this.Background.update();
            this.Background.layer4.update();
            this.player.update(deltaTime);
            if(this.ammoTimer > this.ammoInterval) {
                if(this.ammo < this.maxAmmo) this.ammo++;
                this.ammoTimer = 0;
            } else {
                this.ammoTimer += deltaTime;
            }
            this.enemies.forEach(enemy => {
                enemy.update();
                if(this.checkCollision(this.player, enemy)) {
                    enemy.markedForDeletion = true;
                    if(enemy.type = 'lucky') this.player.enterPowerUp();
                    else this.score--;
                }
                this.player.projectiles.forEach(projectile => {
                    if(this.checkCollision(projectile, enemy)){
                        enemy.lives--;
                        projectile.markedForDeletion =true;
                        if(enemy.lives <= 0) {
                            enemy.markedForDeletion = true;
                            if(!this.gameOver) this.score += enemy.score;
                            if(this.score > this.winningScore) this.gameOver = true;
                        }
                    }
                })
            })
            this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion);
            if(this.enemyTimer > this.enemyInterval && !this.gameOver){
                this.addEnemy();
                this.enemyTimer = 0;
            } else {
                this.enemyTimer += deltaTime;
            }
        }
        draw(context){
            // Render the background before the player to make sure the background is behind the player
            // Render the background on the canvas by calling the draw method from line 180 (from the background class)
            this.Background.draw(context);
            // Render the player on the canvas by calling the draw method from line 96 (from the player class)
            this.player.draw(context);
            // Render the UI on the canvas by calling the draw method from line 134 (from the UI class)
            this.UI.draw(context);
            this.enemies.forEach(enemy => {
                enemy.draw(context);
            });
            this.Background.layer4.draw(context);
        }
        // Create new enemies
        addEnemy(){
            // Math.random() generates a number between 0 and 1
            const randomize = Math.random();
            if(randomize < 0.3) this.enemies.push(new Angler1(this));
            else if(randomize < 0.6) this.enemies.push(new Angler2(this));
            else this.enemies.push(new LuckyFish(this));
            console.log(this.enemies);
        }

        checkCollision(rect1, rect2){
            // if all of them are true, it returns true and checkCollision will return true
            //  if one of them is false,it returns false and checkCollision will return false
            return (    rect1.x < rect2.x + rect2.width &&
                        rect1.x + rect1.width > rect2.x &&
                        rect1.y < rect2.y + rect2.height &&
                        rect1.y + rect1.height > rect2.y)
        }
    }

    const game = new Game(canvas.width, canvas.height);
    let lastTime = 0;
    // Animation loop
    function animate(timeStamp){
        // deltaTime is the difference in milliseconds between the timestamp from this loop and the timestamp from the previous loop
        const deltaTime = timeStamp - lastTime;
        // So that it can be used to calculate deltaTime in the next loop
        lastTime = timeStamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.update(deltaTime);
        game.draw(ctx);
        // "requestAnimationFrame" has a special feature : it automatically passes a timestamp as an argument at the 
        // function it calls (here it's : "animate")
        requestAnimationFrame(animate);
    }   
    // We pass 0 as the first timestamp here
    animate(0);
});