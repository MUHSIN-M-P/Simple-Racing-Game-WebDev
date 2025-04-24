// Create and append canvas
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
document.body.appendChild(canvas);

// Resize canvas to fit the window
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas(); // Initial call to set size

// Generate random permutation for noise
const noisePerm = [];
while (noisePerm.length < 255) {
  let val;
  while (noisePerm.includes(val = Math.floor(Math.random() * 255)));
  noisePerm.push(val);
}

// Interpolation and noise functions
const lerp = (a, b, t) => a + (b - a) * (1 - Math.cos(t * Math.PI)) / 2;
const getNoise = x => {
  x = x * 0.012 % 254;
  return lerp(noisePerm[Math.floor(x)], noisePerm[Math.ceil(x)], x - Math.floor(x));
};

// Player object definition
const Player = function () {
  this.x = canvas.width / 6; // horizontal center
  this.y = 0; // initial vertical position
  this.verticalSpeed = 0; // vertical movement
  this.rotation = 0; // rotation angle
  this.rotationSpeed = 0; // rotational velocity
  this.image = new Image();
  this.image.src = document.querySelector("img").src;


  // Draw player
  this.draw = function () {
    const terrainYFront = canvas.height - getNoise(gameTime + this.x) * 0.25;
    const terrainYNext = canvas.height - getNoise(gameTime + 5 + this.x) * 0.25;

    let isGrounded = false;

    // Apply gravity
    this.verticalSpeed += 0.05;

    // Collision with terrain
    if (this.y > terrainYFront - 20) {
      this.y = terrainYFront - 20;
      this.verticalSpeed = 0;
      isGrounded = true;
    }

    // Terrain angle
    const terrainAngle = Math.atan2((terrainYNext - 20) - this.y, (this.x + 5) - this.x);
    this.y += this.verticalSpeed;

    // Game over condition
    if (!isGameRunning || (isGrounded && Math.abs(this.rotation) > Math.PI * 0.5)) {
      isGameRunning = false;
      this.rotationSpeed = 5;
      keyState.ArrowUp = 1;
      this.x -= gameSpeed * 5;
    }

    // Rotation adjustment if grounded
    if (isGrounded && isGameRunning) {
      this.rotation -= (this.rotation - terrainAngle) * 0.65;
      this.rotationSpeed -= (terrainAngle - this.rotation);
    }

    // Manual control
    this.rotationSpeed += (keyState.ArrowLeft - keyState.ArrowRight) * 0.05;
    this.rotation -= this.rotationSpeed * 0.2;

    // Normalize rotation
    if (this.rotation > Math.PI) this.rotation = -Math.PI;
    if (this.rotation < -Math.PI) this.rotation = Math.PI;

    // Draw image rotated
    ctx.save();
    ctx.translate(this.x, this.y - 3);
    ctx.rotate(this.rotation);
    ctx.drawImage(this.image, -20, -20, 40, 40); // draw with 40x40 size
    ctx.restore();
  };
};

let player = new Player();
let gameTime = 0;
let gameSpeed = 0;
let isGameRunning = true;
let startTimestamp = performance.now();
let elapsedSeconds = 0;
const keyState = { ArrowUp: 0, ArrowDown: 0, ArrowLeft: 0, ArrowRight: 0 };

// Game loop
function loop() {
  if (isGameRunning) {
    elapsedSeconds = (performance.now() - startTimestamp) / 1000;
  }

  // Speed logic
  gameSpeed -= (gameSpeed - (keyState.ArrowUp - keyState.ArrowDown)) * 0.0075;
  gameTime += 10 * gameSpeed;

  // Create vertical gradient for sunset background
  const gradient = ctx.createLinearGradient(
    0, 0, 0, canvas.height
  );
  gradient.addColorStop(0, '#ff3b3b');     // Deep red at top
  gradient.addColorStop(0.5, '#ff6b35');   // Orange-red in the middle
  gradient.addColorStop(1, '#ffae42');     // Light orange at bottom

  // Apply sunset gradient as background
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Background terrain
  ctx.fillStyle = "#474747"; // darker terrain silhouette for better contrast
  ctx.beginPath();
  ctx.moveTo(0, canvas.height);
  for (let i = 0; i < canvas.width; i++) {
    ctx.lineTo(i * 3, canvas.height * 0.7 - getNoise(gameTime + i * 5) * 0.2);
  }
  ctx.lineTo(canvas.width, canvas.height);
  ctx.fill();

  // Foreground terrain
  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.moveTo(0, canvas.height);
  for (let i = 0; i < canvas.width; i++) {
    ctx.lineTo(i, canvas.height - getNoise(gameTime + i) * 0.25);
  }
  ctx.lineTo(canvas.width, canvas.height);
  ctx.fill();

  // Draw player
  player.draw();

  // Restart if player out of screen
  if (player.x < 0) restart();

  // Display elapsed time
  ctx.fillStyle = "white";
  ctx.font = "20px monospace";
  ctx.fillText(`Time: ${elapsedSeconds.toFixed(2)}s`, 20, 30);

  requestAnimationFrame(loop);
}


// Keyboard input
onkeydown = e => keyState[e.key] = 1;
onkeyup = e => keyState[e.key] = 0;

// Restart game
function restart() {
  player = new Player();
  gameTime = 0;
  gameSpeed = 0;
  isGameRunning = true;
  startTimestamp = performance.now();
  elapsedSeconds = 0;
  keyState.ArrowUp = keyState.ArrowDown = keyState.ArrowLeft = keyState.ArrowRight = 0;
}

// Start game loop
loop();

// Instructions
const instructions = document.createElement("div");
instructions.innerHTML += "[Up] [Down] = accelerate <br> [Left] [Right] = rotate";
document.body.appendChild(instructions);