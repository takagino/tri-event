class EffectCircularRipple {
  constructor() {
    this.ripples = [];
    this.isAboveThreshold = false;
  }

  draw(spectrum, palette, audioLevels) {
    if (!palette || palette.length === 0) {
      palette = [color(255)];
    }

    noFill();

    // --- 1. 生成ロジック ---
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
      // ★ 2. map(bassImpact, 1.0, 3.0, 1, 3, true) に修正
      const numToSpawn = floor(
        map(audioLevels.bassImpact, 1.0, 3.0, 1, 3, true)
      );
      for (let i = 0; i < numToSpawn; i++) {
        this.ripples.push(new Ripple(palette));
      }
    }

    // --- 2. 更新パラメータ ---
    // ★ volume: 50, 100 に修正
    const volumeSpeed = map(audioLevels.volume, 50, 100, 0.5, 2.0, true);
    // ★ high: 70, 120 に修正
    const highWeight = map(audioLevels.high, 70, 120, 2, 6, true);

    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const ripple = this.ripples[i];
      ripple.update(volumeSpeed);
      ripple.draw(highWeight);

      if (ripple.isDead()) {
        this.ripples.splice(i, 1);
      }
    }
  }
}

class Ripple {
  constructor(palette) {
    this.pos = createVector(
      random(-width / 2, width / 2),
      random(-height / 2, height / 2),
      random(-200, 200)
    );
    this.lifespan = 80;
    this.maxLifespan = this.lifespan;
    this.initialRadius = random(10, 40);
    this.color = random(palette);
    this.rotX = random(TAU);
    this.rotY = random(TAU);
  }

  update(volumeSpeed) {
    this.initialRadius += volumeSpeed * 3; // 3
    this.lifespan--;
  }

  draw(highWeight) {
    push();
    translate(this.pos);

    rotateX(this.rotX);
    rotateY(this.rotY);

    const alpha = map(this.lifespan, 0, this.maxLifespan, 10, 80, true); // true
    const currentWeight = map(
      this.lifespan,
      0,
      this.maxLifespan,
      0.5,
      highWeight,
      true // true
    );

    strokeWeight(currentWeight);

    let strokeColor;
    if (this.color) {
      strokeColor = color(
        hue(this.color),
        saturation(this.color),
        brightness(this.color)
      );
      strokeColor.setAlpha(alpha * 2.55);
    } else {
      strokeColor = color(255, alpha * 2.55);
    }
    stroke(strokeColor);

    sphere(this.initialRadius, 24, 24); // 24, 24

    pop();
  }

  isDead() {
    return this.lifespan < 0 || this.initialRadius > width * 2;
  }
}
