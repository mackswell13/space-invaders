const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");

const BADGUY_WIDTH = 46.5;
const BADGUY_HEIGHT = 42;
let score = 0;
let gameOver = false;

const keysDown = {
	left: false,
	right: false,
	space: false,
};

class Player {
	constructor() {
		this.velocity = 0;
		this.edgeBuffer = 50;

		const image = new Image();
		image.src = "playerShip1_blue.png";
		image.onload = () => {
			this.image = image;

			const scale = 0.5;
			this.width = image.width * scale;
			this.height = image.height * scale;

			this.position = {
				x: canvas.width / 2 - this.width / 2,
				y: canvas.height - 50,
			};
		};
	}

	draw() {
		ctx.drawImage(
			this.image,
			this.position.x,
			this.position.y,
			this.width,
			this.height
		);
	}

	update(deltaTime) {
		if (this.image) {
			this.draw();

			if (
				(this.velocity > 0 &&
					this.position.x + this.width <
						canvas.width - this.edgeBuffer) ||
				(this.velocity < 0 && this.position.x > this.edgeBuffer)
			) {
				this.position.x += this.velocity * deltaTime * 0.2;
			}
		}
	}
}

class Meteors {
	constructor() {
		this.meteors = [];
	}

	spawnNew() {
		// generate between 200 and canvas width - 200
		const x = Math.floor(Math.random() * (canvas.width - 400)) + 200;

		this.meteors.push(new Meteor(x, 0));
	}

	update(deltaTime, player) {
		this.meteors = this.meteors.filter((m) => m.alive);
		this.meteors.forEach((m) => m.update(deltaTime, player));
	}
}

class Meteor {
	constructor(x, y) {
		this.velocity = 1 / 10;
		this.alive = true;

		const image = new Image();
		image.src = "meteorBrown_big1.png";
		image.onload = () => {
			this.image = image;

			const scale = 1;
			this.width = image.width * scale;
			this.height = image.height * scale;

			this.position = {
				x: x,
				y: y,
			};
		};
	}

	draw() {
		ctx.drawImage(
			this.image,
			this.position.x,
			this.position.y,
			this.width,
			this.height
		);
	}

	update(deltaTime, player) {
		if (this.image) {
			this.draw();
			//save memory
			if (this.position.y > canvas.height) {
				this.alive = false;
			}

			if (
				this.position.y + this.height > player.position.y &&
				this.position.y < player.position.y &&
				this.position.x + this.width > player.position.x &&
				this.position.x < player.position.x + player.width
			) {
				gameOver = true;
			}
			this.position.y += this.velocity * deltaTime;
		}
	}
}

class Lasers {
	constructor() {
		this.lasers = [];
	}

	update(deltaTime) {
		this.lasers = this.lasers.filter((l) => l.alive);
		this.lasers.forEach((l) => l.update(deltaTime));
	}
}

class Laser {
	constructor(x, y) {
		this.velocity = 1 / 2;
		this.alive = true;

		const image = new Image();
		image.src = "laserBlue03.png";
		image.onload = () => {
			this.image = image;

			const scale = 0.5;
			this.width = image.width * scale;
			this.height = image.height * scale;

			this.position = {
				x: x - this.width / 2,
				y: y - this.height,
			};
		};
	}

	draw() {
		ctx.drawImage(
			this.image,
			this.position.x,
			this.position.y,
			this.width,
			this.height
		);
	}

	update(deltaTime) {
		if (this.image) {
			this.draw();
			this.position.y -= this.velocity * deltaTime;
		}
	}
}

class BadGuys {
	constructor() {
		this.badGuys = [];
		this.spawnCounter = 0;
		this.clock = 0;
		this.step = 0;
		this.addBadGuysRow();
	}

	moveUpBadGuys() {
		this.badGuys.forEach((BadGuy) => {
			BadGuy.position.y += BadGuy.height / 2 + 5;
		});
	}

	addBadGuysRow() {
		const firstX = (canvas.width - BADGUY_WIDTH * 10 - 10 * 9) / 2;

		for (let i = 0; i < 10; i++) {
			let x = i * BADGUY_WIDTH + firstX + i * 10;
			// Add advance enemy if score > 500.
			console.log(x);
			if (score > 20) {
				const randomChance = Math.floor(Math.random() * 3);
				if (randomChance === 0) {
					this.badGuys.push(new BadGuy(x, 10, 50, 3));
				} else {
					this.badGuys.push(new BadGuy(x, 10));
				}
			} else {
				this.badGuys.push(new BadGuy(x, 10));
			}
		}
	}

	cleanUp() {
		this.badGuys.forEach((badGuy) => {
			if (badGuy.life <= 0) {
				score += badGuy.score;
				this.badGuys.splice(this.badGuys.indexOf(badGuy), 1);
			}
		});
	}

	update(deltaTime, projectileStack, player, meteors) {
		if (deltaTime > 0) {
			this.clock += deltaTime;
		}

		//Check if your a big loser
		this.badGuys.forEach((badGuy) => {
			if (player && badGuy.position) {
				if (badGuy.position.y + badGuy.height > player.position.y) {
					gameOver = true;
				}
			}
		});

		// Check collisions
		this.badGuys.forEach((badGuy) => {
			projectileStack.forEach((projectile) => {
				if (projectile.image) {
					let projectile_middle =
						projectile.position.x + projectile.width / 2;

					if (
						projectile_middle > badGuy.position.x &&
						projectile_middle < badGuy.position.x + badGuy.width &&
						projectile.position.y > badGuy.position.y &&
						projectile.position.y <
							badGuy.position.y + badGuy.height
					) {
						badGuy.life -= 1;
						projectile.alive = false;
					}
				}
			});
		});

		this.cleanUp();
		//move up every 5 seconds
		if (this.clock > 5000) {
			meteors.spawnNew();
			this.moveUpBadGuys();
			this.step += 1;
			if (this.step === 2) {
				this.addBadGuysRow();
				this.step = 0;
			}
			this.clock = 0;
		}

		this.badGuys.forEach((badGuy) => {
			badGuy.update(deltaTime);
		});
	}
}

class BadGuy {
	constructor(x, y, score = 10, life = 1) {
		this.alive = true;
		this.score = score;
		this.life = life;
		const image = new Image();
		image.src = this.life > 1 ? "enemyRed1.png" : "enemyGreen1.png";
		image.onload = () => {
			this.image = image;

			const scale = 0.5;
			this.width = image.width * scale;
			this.height = image.height * scale;

			this.position = {
				x: x,
				y: y,
			};
		};
	}

	draw() {
		ctx.drawImage(
			this.image,
			this.position.x,
			this.position.y,
			this.width,
			this.height
		);
	}

	update(deltaTime) {
		if (this.image) {
			this.draw();
		}
	}
}

const player = new Player();
const projectiles = new Lasers();
const meteors = new Meteors();
const badGuys = new BadGuys(projectiles.lasers);

let badGuy = new BadGuy(100, 10);
let lastTime = 0;

ctx.fillStyle = "black";
ctx.fillRect(0, 0, canvas.width, canvas.height);

function animate(timestamp) {
	const deltaTime = timestamp - lastTime;
	lastTime = timestamp;
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	if (gameOver) {
		//draw game over middle of screen
		ctx.fillStyle = "red";
		ctx.font = "60px Arial";
		ctx.fillText("Game Over", 250, 200);
	} else {
		// Set the velocity of the player
		if (keysDown.left && !keysDown.right) {
			player.velocity = -1;
		} else if (keysDown.right && !keysDown.left) {
			player.velocity = 1;
		} else {
			player.velocity = 0;
		}

		//Draw the score
		drawScore();
		// Draw the player

		// Update the player
		player.update(deltaTime);

		// Update the projectile
		projectiles.update(deltaTime);
		meteors.update(deltaTime, player);

		// Update the  bad guys
		badGuys.update(deltaTime, projectiles.lasers, player, meteors);

		ctx.fillStyle = "white";
	}
	window.requestAnimationFrame(animate);
}

animate();

window.addEventListener("keydown", (event) => {
	switch (event.key) {
		case "ArrowLeft":
			keysDown.left = true;
			break;
		case "ArrowRight":
			keysDown.right = true;
			break;
		case " ":
			if (keysDown.space === false) {
				let laser = new Laser(
					player.position.x + player.width / 2,
					player.position.y
				);
				projectiles.lasers.push(laser);
			}
			keysDown.space = true;
			break;
	}
});

window.addEventListener("keyup", (event) => {
	switch (event.key) {
		case "ArrowLeft":
			keysDown.left = false;
			break;
		case "ArrowRight":
			keysDown.right = false;
			break;
		case " ":
			keysDown.space = false;
			break;
	}
});

// Draw score helper
function drawScore() {
	ctx.fillStyle = "white";
	ctx.font = "20px Arial";
	ctx.fillText("Score: " + score, 8, 20);
}
