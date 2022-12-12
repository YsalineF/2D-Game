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
                }
                console.log(this.game.keys);
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
                console.log(this.game.keys);
            })
        }
    }
    // Handle player's lasers
    class Projectile {

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
        }
        // method to move player around
        update(){
            if(this.game.keys.includes('ArrowUp')) this.speedY = -this.maxSpeed;
            else if(this.game.keys.includes('ArrowDown')) this.speedY = this.maxSpeed;
            else this.speedY = 0;
            this.y += this.speedY;
        }

        // draw graphics representing the player
        draw(context) {
            context.fillRect(this.x, this.y, this.width, this.height);
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

    }
    // Handle the entire game
    class Game {
        constructor(width, height){
            this.width = width;
            this.height = height;
            // new Player(this) ==> this refer to the class Game
            this.player = new Player(this);
            this.input = new InputHandler(this);
            this.keys = [];
        }
        update(){
            this.player.update();
        }
        draw(context){
            // Render the player on the canvas by calling the draw method from line 40
            this.player.draw(context);
        }
    }

    const game = new Game(canvas.width, canvas.height);

    // Animation loop
    function animate(){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.update();
        game.draw(ctx);
        requestAnimationFrame(animate);
    }   
    animate();
});