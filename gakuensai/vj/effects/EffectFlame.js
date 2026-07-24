class EffectFlame {
  constructor() {
    this.particles = [];
    this.emitterLeftX = -width * 0.45;
    this.emitterRightX = width * 0.45;
    this.spawnHeight = height * 0.4;
    this.spawnDepth = 150;
  }

  draw(spectrum, palette, audioLevels) {
    if (!palette || palette.length === 0) {
      palette = [color(255)];
    }

    noStroke();

    const spawnRate = map(audioLevels.bass, 100, 150, 1, 5, true); // 100, 150 -> 1, 10
    const flameSpeed = map(audioLevels.mid, 70, 120, 1.0, 20.0, true); // 70, 120 -> 1.0, 3.0
    const flickerAmount = map(audioLevels.high, 70, 120, 0.1, 1.0, true); // 70, 120 -> 0.1, 1.0

    for (let i = 0; i < spawnRate; i++) {
      const y = random(-this.spawnHeight, this.spawnHeight);
      const z = random(-this.spawnDepth, this.spawnDepth);
      this.particles.push(
        new FlameParticle(this.emitterLeftX, y, z, 1, palette)
      );
      this.particles.push(
        new FlameParticle(this.emitterRightX, y, z, -1, palette)
      );
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      let p = this.particles[i];
      p.update(flameSpeed, flickerAmount);
      p.draw(audioLevels.bass);
      if (p.isDead()) {
        this.particles.splice(i, 1);
      }
    }
  }
}

class FlameParticle {
  constructor(x, y, z, direction, palette) {
    this.pos = createVector(
      x + random(-10, 10),
      y + random(-20, 20),
      z + random(-30, 30)
    );
    this.vel = createVector(direction * random(0.5, 1), 0, 0);
    this.acc = createVector(0, 0, 0);
    this.direction = direction;

    this.lifespan = random(60, 100); // 60, 120
    this.maxLifespan = this.lifespan;

    this.color = random(palette);
    this.baseSize = random(5, 15); // 5, 25
  }

  update(flameSpeed, flickerAmount) {
    this.acc.add(this.direction * flameSpeed * 0.02, 0, 0);
    const flickerY = random(-flickerAmount, flickerAmount);
    const flickerZ = random(-flickerAmount, flickerAmount);
    this.acc.add(0, flickerY, flickerZ);

    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);

    this.lifespan -= 2.0; // 2.0
  }

  draw(bassLevel) {
    push();
    translate(this.pos);

    const lifeRatio = this.lifespan / this.maxLifespan;
    const brightness = map(lifeRatio, 1.0, 0.0, 80, 30, true);
    const alpha = map(lifeRatio, 1.0, 0.0, 200, 0, true);
    const sizePulse = map(bassLevel, 100, 150, 1, 3, true); // 100, 150 -> 1, 3
    const currentSize = this.baseSize * lifeRatio * sizePulse;

    let flameColor = color(hue(this.color), saturation(this.color), brightness);
    flameColor.setAlpha(alpha);

    fill(flameColor);

    sphere(currentSize);
    pop();
  }

  isDead() {
    return this.lifespan < 0;
  }
}
