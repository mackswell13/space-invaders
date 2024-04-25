export default class Laser {
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
