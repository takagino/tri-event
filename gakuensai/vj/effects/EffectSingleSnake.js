// エフェクト：シングルスネーク（うねり強化版）
class EffectSingleSnake {
  constructor() {
    this.snake = new LongSnake();
    this.noiseSpeed = random(0.005, 0.015);
  }

  draw(spectrum, palette, audioLevels) {
    if (!palette || palette.length === 0) {
      palette = [color(255)];
    }

    noFill();

    // --- 音声連動パラメータ ---
    const maxHistory = floor(map(audioLevels.bass, 100, 150, 150, 600, true));
    const wiggleAmp = map(audioLevels.mid, 70, 120, 0.05, 0.25, true);
    const trailWeight = map(audioLevels.high, 70, 120, 4, 10, true);
    const speed = map(audioLevels.volume, 50, 100, 4, 15, true);

    // --- 更新と描画 ---
    push();
    this.snake.update(speed, wiggleAmp, maxHistory);
    this.snake.draw(trailWeight, palette);
    pop();
  }
}

// 内部クラス：長いヘビ
class LongSnake {
  constructor() {
    this.pos = p5.Vector.random3D().mult(width * 0.1);
    this.vel = p5.Vector.random3D().setMag(5);
    this.acc = createVector(0, 0, 0);
    this.history = [];
    this.noiseOffset = random(100);
    this.maxForce = 0.5;
  }

  update(speed, wiggleAmp, maxHistory) {
    // --- 1. ベクトル場による力 (うねうね) ---
    // ★ 修正点: ノイズの時間変化を加速 (0.005 -> 0.02)
    const noiseTime = frameCount * 0.02;

    const noiseX = noise(this.noiseOffset, noiseTime);
    const noiseY = noise(this.noiseOffset + 1000, noiseTime);
    const noiseZ = noise(this.noiseOffset + 2000, noiseTime);

    const newDir = createVector(
      map(noiseX, 0, 1, -wiggleAmp, wiggleAmp),
      map(noiseY, 0, 1, -wiggleAmp, wiggleAmp),
      map(noiseZ, 0, 1, -wiggleAmp, wiggleAmp)
    );
    this.acc.add(newDir);

    // --- 境界反発ロジック ---
    const margin = width * 0.45;
    const boundaryForce = 0.8;

    if (this.pos.x > margin) this.acc.add(createVector(-boundaryForce, 0, 0));
    if (this.pos.x < -margin) this.acc.add(createVector(boundaryForce, 0, 0));
    if (this.pos.y > margin) this.acc.add(createVector(0, -boundaryForce, 0));
    if (this.pos.y < -margin) this.acc.add(createVector(0, boundaryForce, 0));
    if (this.pos.z > 400) this.acc.add(createVector(0, 0, -boundaryForce));
    if (this.pos.z < -400) this.acc.add(createVector(0, 0, boundaryForce));

    // --- 2. 物理演算 ---
    this.vel.add(this.acc);
    this.vel.normalize().mult(speed);
    this.pos.add(this.vel);
    this.acc.mult(0);

    // --- 3. 軌跡の管理 ---
    this.history.push(this.pos.copy());
    if (this.history.length > maxHistory) {
      this.history.splice(0, 1);
    }
  }

  draw(trailWeight, palette) {
    if (this.history.length < 2) return;

    // --- 1. 軌跡を描画 ---
    strokeWeight(trailWeight);
    beginShape();

    for (let i = 0; i < this.history.length; i++) {
      const v = this.history[i];

      const lifeRatio = i / this.history.length;
      const alpha = map(lifeRatio, 0, 1, 30, 255, true);

      const colorLerp = lifeRatio * (palette.length - 1);
      const index1 = floor(colorLerp);
      const index2 = constrain(ceil(colorLerp), 0, palette.length - 1);
      const lerpAmt = colorLerp - index1;

      let strokeCol;
      if (palette[index1] && palette[index2]) {
        strokeCol = lerpColor(palette[index1], palette[index2], lerpAmt);
      } else {
        strokeCol = palette[0];
      }
      strokeCol.setAlpha(alpha);

      stroke(strokeCol);
      vertex(v.x, v.y, v.z);
    }
    endShape();

    // --- 2. 頭を描画 (強調) ---
    push();
    translate(this.pos);
    let headColor = palette[0];
    headColor.setAlpha(90 * 2.55); // 90
    fill(headColor);
    noStroke();
    sphere(trailWeight * 2);
    pop();
  }
}
