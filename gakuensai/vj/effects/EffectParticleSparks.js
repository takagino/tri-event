// エフェクト：パーティクル・スパークス（火花）
class EffectParticleSparks {
  constructor() {
    this.particles = [];
    this.isAboveThreshold = false;
    this.gravity = createVector(0, 0.2, 0); // Y+が下
  }

  draw(spectrum, palette, audioLevels) {
    if (!palette || palette.length === 0) {
      palette = [color(255)];
    }
    noStroke();

    // --- 1. ビート検出と火花の生成 ---
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
        map(audioLevels.bassImpact, 1.0, 3.0, 10, 50, true)
      ); // 1.0, 3.0 -> 10, 50
      const initialSpeed = map(audioLevels.mid, 70, 120, 2, 8, true); // 70, 120 -> 2, 8

      for (let i = 0; i < numToSpawn; i++) {
        this.particles.push(new SparkParticle(initialSpeed, palette));
      }
    }

    // --- 2. 火花の更新と描画 ---
    for (let i = this.particles.length - 1; i >= 0; i--) {
      let p = this.particles[i];
      p.applyForce(this.gravity);
      p.update();
      p.draw(audioLevels.high, audioLevels.volume);

      if (p.isDead()) {
        this.particles.splice(i, 1);
      }
    }
  }
}

// 火花パーティクルの設計図
class SparkParticle {
  constructor(initialSpeed, palette) {
    this.pos = createVector(0, 0, 0);
    this.vel = p5.Vector.random3D().mult(initialSpeed * random(1.5, 3.0));
    this.acc = createVector(0, 0, 0);
    this.lifespan = random(60, 100); // 60, 120
    this.maxLifespan = this.lifespan;
    this.damping = 0.98; // 0.98
    this.color = random(palette);
  }

  applyForce(force) {
    this.acc.add(force);
  }

  update() {
    this.vel.add(this.acc);
    this.vel.mult(this.damping);
    this.pos.add(this.vel);
    this.lifespan--;
    this.acc.mult(0);
  }

  draw(highLevel, volume) {
    push();
    translate(this.pos);

    const size = map(volume, 50, 100, 3, 20, true); // 50, 100 -> 3, 10
    const lifeRatio = this.lifespan / this.maxLifespan;
    const alpha = sin(lifeRatio * PI) * 200; // 200
    const brightness = map(highLevel, 70, 120, 80, 100, true); // 70, 120

    let finalColor = color(hue(this.color), saturation(this.color), brightness);
    finalColor.setAlpha(alpha);

    fill(finalColor);
    sphere(size);
    pop();
  }

  isDead() {
    return this.lifespan < 0;
  }
}
