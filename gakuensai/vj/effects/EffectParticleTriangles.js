class EffectParticleTriangles {
  constructor() {
    this.triangles = [];
    this.isAboveThreshold = false;
  }

  draw(spectrum, palette, audioLevels) {
    if (!palette || palette.length === 0) {
      palette = [color(255)];
    }

    noStroke();

    const beatThreshold = 1.0; // 1.0
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
      ); // 1.0, 3.0, 5, 20
      for (let i = 0; i < numToSpawn; i++) {
        this.triangles.push(new FadingTriangle(palette));
      }
    }

    for (let i = this.triangles.length - 1; i >= 0; i--) {
      const tri = this.triangles[i];
      tri.update(audioLevels.volume, audioLevels.high);
      tri.draw();

      if (tri.isDead()) {
        this.triangles.splice(i, 1);
      }
    }
  }
}

class FadingTriangle {
  constructor(palette) {
    this.pos = createVector(
      random(-width / 2, width / 2),
      random(-height / 2, height / 2),
      random(-300, 300)
    );
    this.lifespan = 80; // 80
    this.maxLifespan = this.lifespan;
    this.size = random(30, 150); // 30, 150
    this.rotationAxis = p5.Vector.random3D().normalize();
    this.rotationSpeed = random(0.01, 0.05);
    this.angle = random(TWO_PI);
    this.color = random(palette);
  }

  update(avgVolume, highLevel) {
    this.angle += this.rotationSpeed * map(avgVolume, 50, 100, 1, 2.5, true); // 50, 100

    const highScale = map(highLevel, 70, 120, 1.0, 1.8, true); // 70, 120
    this.currentSize = this.size * highScale;

    this.lifespan--;
  }

  draw() {
    push();
    translate(this.pos);

    rotate(this.angle, this.rotationAxis);

    const alpha = map(this.lifespan, 0, this.maxLifespan, 50, 240, true); // 0, 255

    let triColor = this.color;

    let finalColor = color(
      hue(triColor),
      saturation(triColor),
      brightness(triColor)
    );
    finalColor.setAlpha(alpha);

    fill(finalColor);
    noStroke();

    const s = this.currentSize;
    beginShape(TRIANGLES);
    vertex(0, -s / sqrt(3), 0);
    vertex(-s / 2, s / (2 * sqrt(3)), 0);
    vertex(s / 2, s / (2 * sqrt(3)), 0);
    endShape(CLOSE);

    pop();
  }

  isDead() {
    return this.lifespan < 0;
  }
}
