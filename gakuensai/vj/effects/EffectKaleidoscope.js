class EffectKaleidoscope {
  constructor() {
    this.particles = [];
    this.isAboveThreshold = false;
  }

  draw(spectrum, palette, audioLevels) {
    if (!palette || palette.length === 0) {
      palette = [color(255)];
    }

    push();
    rotateZ(frameCount * 0.002);
    rotateX(frameCount * 0.001);

    const segments = floor(map(audioLevels.bass, 100, 150, 3, 8, true)); // 100, 150 -> 3, 8

    const beatThreshold = 1.0;
    let shouldSpawn = false;

    if (audioLevels.bassImpact > beatThreshold) {
      if (!this.isAboveThreshold) {
        shouldSpawn = true;
        this.isAboveThreshold = true;
      }
    } else {
      this.isAboveThreshold = false;
    }

    if (shouldSpawn) {
      const numToSpawn = floor(
        map(audioLevels.bassImpact, 1.0, 3.0, 5, 20, true)
      ); // 1.0, 3.0 -> 5, 20
      for (let k = 0; k < numToSpawn; k++) {
        this.particles.push(new KaleidoParticle(palette));
      }
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update(audioLevels.volume);
      if (this.particles[i].isDead()) {
        this.particles.splice(i, 1);
      }
    }

    for (let i = 0; i < segments; i++) {
      push();
      rotateY((TWO_PI / segments) * i);
      for (let particle of this.particles) {
        particle.draw();
      }
      pop();
    }
    pop();
  }
}

class KaleidoParticle {
  constructor(palette) {
    this.pos = createVector(
      random(-width / 4, width / 4),
      random(-height / 4, height / 4),
      random(-200, 200)
    );
    this.vel = p5.Vector.random3D().mult(random(0.5, 2));
    this.lifespan = random(40, 80); // 40, 80
    this.maxLifespan = this.lifespan;
    this.color = random(palette);
  }

  update(avgVolume) {
    this.vel.mult(map(avgVolume, 50, 100, 0.98, 1.05, true)); // 50, 100
    this.pos.add(this.vel);
    this.lifespan -= 1.5; // 1.5
    if (this.pos.x > width / 2 || this.pos.x < -width / 2) this.vel.x *= -1;
    if (this.pos.y > height / 2 || this.pos.y < -height / 2) this.vel.y *= -1;
    if (this.pos.z > 400 || this.pos.z < -400) this.vel.z *= -1;
  }

  draw() {
    push();
    translate(this.pos.x, this.pos.y, this.pos.z);
    noStroke();

    const brightness = map(this.lifespan, 0, this.maxLifespan, 50, 100, true); // 20, 100
    const alpha = map(this.lifespan, 0, this.maxLifespan, 30, 100, true); // 0, 100

    let particleColor = color(
      hue(this.color),
      saturation(this.color),
      brightness
    );
    particleColor.setAlpha(alpha * 2.55);
    fill(particleColor);

    sphere(map(this.lifespan, 0, this.maxLifespan, 2, 10, true)); // 2, 8
    pop();
  }

  isDead() {
    return this.lifespan < 0;
  }
}
