class EffectFlowField {
  constructor() {
    this.particles = [];
    this.variation = 0;
    this.changeDuration = 5000;
    this.lastChange = 0;
    this.flowScale = 10;
    this.isAboveThreshold = false; // ビート検出用
  }

  draw(spectrum, palette, audioLevels) {
    if (!palette || palette.length === 0) {
      palette = [color(255)];
    }

    push();
    scale(2); // 2

    // --- 1. 生成ロジック (EffectCircularRipple と同じ) ---
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
        map(audioLevels.bassImpact, 1.0, 3.0, 20, 100, true)
      ); // 1.0, 3.0, 5, 20

      for (let i = 0; i < numToSpawn; i++) {
        // ★ 2. 外側の円状にパーティクルを生成
        const radius = random(width * 0.1, width * 0.25); // 0.1, 0.25
        const angle = random(TAU);
        const zAngle = random(-PI / 4, PI / 4);

        const pos = createVector(
          radius * cos(angle),
          radius * sin(angle),
          radius * sin(zAngle)
        );

        this.particles.push({
          pos: pos,
          lastPos: pos.copy(),
          size: random(5, 15),
          color: random(palette),
          direction: random(0.1, 1) * (random() > 0.5 ? 1 : -1),
          lifespan: 100,
        });
      }
    }
    // --- 従来のエミッションロジックは削除 ---

    let time = millis();
    if (time - this.lastChange > this.changeDuration) {
      this.lastChange = time;
      this.variation = (this.variation + 1) % 12;
    }

    const stepsize = map(audioLevels.volume, 50, 100, 0.001, 0.01, true); // 50, 100

    for (let i = this.particles.length - 1; i >= 0; i--) {
      let p = this.particles[i];
      p.lifespan--;
      const border = max(width, height);
      if (
        p.lifespan <= 0 ||
        abs(p.pos.x) > border ||
        abs(p.pos.y) > border ||
        abs(p.pos.z) > border
      ) {
        this.particles.splice(i, 1);
        continue;
      }

      const flowX = p.pos.x / this.flowScale;
      const flowY = p.pos.y / this.flowScale;
      let slopeX = this._getSlopeX(flowX, flowY);
      let slopeY = this._getSlopeY(flowX, flowY);

      let vel = createVector(slopeX, slopeY, 0);
      vel.mult(p.direction * this.flowScale * stepsize);
      p.pos.add(vel);

      const weight = map(audioLevels.bass, 100, 150, 1, p.size * 4, true); // 100, 150
      const strokeHue =
        (hue(p.color) + map(audioLevels.high, 70, 120, -30, 30, true)) % 360; // 70, 120
      const alpha = map(p.lifespan, 0, 100, 40, 90, true); // 0, 150 -> 0, 80

      let strokeColor = color(
        strokeHue,
        saturation(p.color),
        brightness(p.color)
      );
      strokeColor.setAlpha(alpha * 2.55);
      stroke(strokeColor);
      strokeWeight(weight);

      line(p.pos.x, p.pos.y, p.pos.z, p.lastPos.x, p.lastPos.y, p.lastPos.z);
      p.lastPos.set(p.pos);
    }

    pop();
  }

  _getSlopeY(x, y) {
    switch (this.variation) {
      case 0:
        return Math.sin(x);
      case 1:
        return Math.sin(x * 5) * y * 0.3;
      case 2:
        return Math.cos(x * y);
      case 3:
        return Math.sin(x) * Math.cos(y);
      case 4:
        return Math.cos(x) * y * y;
      case 5:
        return Math.log(Math.abs(x) + 0.1) * Math.log(Math.abs(y) + 0.1);
      case 6:
        return Math.tan(x) * Math.cos(y);
      case 7:
        return -Math.sin(x * 0.1) * 3;
      case 8:
        return (x - x * x * x) * 0.01;
      case 9:
        return -Math.sin(x);
      case 10:
        return -y - Math.sin(1.5 * x) + 0.7;
      case 11:
        return Math.sin(x) * Math.cos(y);
      default:
        return 0;
    }
  }

  _getSlopeX(x, y) {
    switch (this.variation) {
      case 0:
        return Math.cos(y);
      case 1:
        return Math.cos(y * 5) * x * 0.3;
      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
        return 1;
      case 7:
        return Math.sin(y * 0.1) * 3;
      case 8:
        return y / 3;
      case 9:
        return -y;
      case 10:
        return -1.5 * y;
      case 11:
        return Math.sin(y) * Math.cos(x);
      default:
        return 0;
    }
  }
}
