// Fires when the whole page has been loaded (including stylesheets and image)
window.addEventListener('load', function(){
    // canvas setup
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 500;
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
        }
        update(){
            this.x += this.speed;
            // If the x coordinate of the projectile is more than 80% of the width of the game, then it becomes true
            // 80% (0.8) because the player takes some space and we don't want enemies to be hit and destroyed off screen 
            if(this.x > this.game.width * 0.8) this.markedForDeletion = true;
        }
        draw(context){
            context.fillStyle= 'yellow';
            context.fillRect(this.x, this.y, this.width, this.height);
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
            this.speedY = 0;
            this.maxSpeed = 3;
            this.projectiles = [];
        }
        // method to move player around
        update(){
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
        }

        // draw graphics representing the player
        draw(context) {
            context.fillStyle = 'black';
            context.fillRect(this.x, this.y, this.width, this.height);
            //Handle projectiles
            this.projectiles.forEach(projectile => {
                projectile.draw(context);
            });
        }

        shootTop(){
            // If we have ammo (> 0), we can shoot and everytime we shoot, we decrease the amount of ammo by 1
            if(this.game.ammo > 0) {
                this.projectiles.push(new Projectile(this.game, this.x + 80, this.y + 30));
                this.game.ammo--;
                console.log(this.game.ammo);
            }
        }
    }
    // Handle different enemy types
    class Enemy {

    }
    // Handle individual background layers
    class Layer {

    }
    // Animate the entire game's world
    class Background {

    }
    // Draw score, timer and other information that needs to be displayed for the user
    class UI {
        constructor(game) {
            this.game = game;
            this.fontSize = 25;
            this.fontFamily = 'Helvetica';
            this.color = 'yellow';
        }
        draw(context){
            //ammo => we can see the ammo recharging on the canvas and it will recharge until it hits maxAmmo
            context.fillStyle = this.color;
            for(let i = 0; i < this.game.ammo; i++){
                //x = 5 (+ 20px left margin), y = 50, width = 3, height = 20
                context.fillRect(20 + 5 * i, 50, 3, 20);
            }
        }
    }
    // Handle the entire game
    class Game {
        constructor(width, height){
            this.width = width;
            this.height = height;
            // new Player(this) ==> this refer to the class Game
            this.player = new Player(this);
            this.input = new InputHandler(this);
            this.UI = new UI(this);
            this.keys = [];
            this.ammo = 20;
            this.maxAmmo = 50;
            this.ammoTimer = 0;
            this.ammoInterval = 500;
        }
        update(deltaTime){
            this.player.update();
            if(this.ammoTimer > this.ammoInterval) {
                if(this.ammo < this.maxAmmo) this.ammo++;
                this.ammoTimer = 0;
            } else {
                this.ammoTimer += deltaTime;
            }
        }
        draw(context){
            // Render the player on the canvas by calling the draw method from line 96 (from the player class)
            this.player.draw(context);
            // Render the UI on the canvas by calling the draw method from line 134 (from the UI class)
            this.UI.draw(context);
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