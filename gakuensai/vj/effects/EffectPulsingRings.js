class EffectPulsingRings {
  constructor() {
    this.rings = [];
    this.isAboveThreshold = false;
  }

  draw(spectrum, palette, audioLevels) {
    if (!palette || palette.length === 0) {
      palette = [color(255)];
    }

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
      const numToSpawn = floor(map(audioLevels.bassImpact, 1.0, 3.0, 4, 10)); // 1.0, 3.0, 1, 3
      for (let i = 0; i < numToSpawn; i++) {
        this.rings.push(new PulsingRing(spectrum.length, palette));
      }
    }

    for (let i = this.rings.length - 1; i >= 0; i--) {
      const ring = this.rings[i];
      ring.update(spectrum);
      ring.draw();
      if (ring.isDead()) {
        this.rings.splice(i, 1);
      }
    }
  }
}

class PulsingRing {
  constructor(spectrumSize, palette) {
    this.pos = createVector(
      random(-width / 2, width / 2),
      random(-height / 2, height / 2),
      random(-400, 400)
    );
    this.lifespan = 90; // 90
    this.maxLifespan = this.lifespan;
    this.freqBin = floor(random(spectrumSize));
    this.color = random(palette);
  }

  update(spectrum) {
    const level = spectrum[this.freqBin] || 0;
    this.size = map(level, 0, 255, 10, 300); // 10, 300
    this.lifespan--;
  }

  draw() {
    push();
    translate(this.pos);

    const alpha = map(this.lifespan, 0, this.maxLifespan, 0, 100); // 0, 100
    noStroke();

    let finalColor = color(
      hue(this.color),
      saturation(this.color),
      brightness(this.color)
    );
    finalColor.setAlpha(alpha * 2.55);

    fill(finalColor);

    const tubeRadius = map(this.lifespan, 0, this.maxLifespan, 8, 1); // 8, 1
    torus(this.size, tubeRadius, 48, 24); // 48, 24

    pop();
  }

  isDead() {
    return this.lifespan < 0;
  }
}
