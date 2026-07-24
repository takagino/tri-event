class EffectHyperSpiral {
  constructor() {
    this.particles = [];
    this.numParticles = 500;
    this.sphereRadius = height / 5;

    for (let i = 0; i < this.numParticles; i++) {
      this.particles.push(
        new SpiralParticle(i, this.numParticles, this.sphereRadius)
      );
    }
  }

  draw(spectrum, palette, audioLevels) {
    if (!palette || palette.length === 0) {
      palette = [color(255)];
    }

    noStroke();

    const tightness = map(audioLevels.mid, 70, 150, 1, 10, true); // 70, 120
    const particleSize = map(audioLevels.high, 70, 120, 0.5, 1, true); // 70, 120
    const rotationSpeed = map(audioLevels.volume, 50, 100, 0.001, 0.005, true); // 50, 100

    push();
    rotateX(frameCount * rotationSpeed * 0.3);
    rotateY(frameCount * rotationSpeed * 0.5);

    for (let p of this.particles) {
      const dynamicRadius =
        this.sphereRadius + map(audioLevels.bass, 100, 150, -100, 100, true); // 100, 150

      p.update(tightness, dynamicRadius);
      p.draw(palette, particleSize);
    }
    pop();
  }
}

class SpiralParticle {
  constructor(id, total, sphereRadius) {
    this.id = id;
    this.total = total;
    this.baseRadius = sphereRadius;
    this.pos = createVector(0, 0, 0);
  }

  update(tightness, radius) {
    const phi = acos(-1.0 + (2.0 * this.id) / this.total);
    const theta = sqrt(this.total * PI) * phi;
    const angle = theta * tightness;
    this.pos.x = radius * cos(angle) * sin(phi);
    this.pos.y = radius * sin(angle) * sin(phi);
    this.pos.z = radius * cos(phi);
  }

  draw(palette, particleSize) {
    push();
    translate(this.pos);

    const colorIndex = floor(map(this.id, 0, this.total, 0, palette.length));
    const particleColor = palette[colorIndex % palette.length];

    const size = (this.baseRadius / this.total) * 10 * particleSize;

    let finalColor = color(
      hue(particleColor),
      saturation(particleColor),
      brightness(particleColor)
    );
    finalColor.setAlpha(200);

    fill(finalColor);
    sphere(size);

    pop();
  }
}
