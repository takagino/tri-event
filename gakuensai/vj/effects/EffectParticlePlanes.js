class EffectParticlePlanes {
  constructor() {
    this.planes = [];
    this.isAboveThreshold = false;
  }

  draw(spectrum, palette, audioLevels) {
    if (!palette || palette.length === 0) {
      palette = [color(255)];
    }
    noStroke();

    // --- 1. ビート検出と生成 ---
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
        map(audioLevels.bassImpact, 1.0, 3.0, 4, 10, true)
      ); // 5, 20

      // ★ 1. 全体音量をベースサイズとして渡す
      const baseSize = map(audioLevels.volume, 50, 100, 50, 200, true); // 50, 200

      for (let i = 0; i < numToSpawn; i++) {
        this.planes.push(new FadingRectangle(palette, baseSize));
      }
    }

    // --- 2. 更新と描画 ---
    for (let i = this.planes.length - 1; i >= 0; i--) {
      const rectObj = this.planes[i];
      rectObj.update(audioLevels.volume, audioLevels.mid);
      rectObj.draw();

      if (rectObj.isDead()) {
        this.planes.splice(i, 1);
      }
    }
  }
}

// 内部クラス：消えゆく平面矩形（2D）
class FadingRectangle {
  // ★ 1. baseSize を constructor で受け取る
  constructor(palette, baseSize) {
    this.pos = createVector(
      random(-width / 2, width / 2),
      random(-height / 2, height / 2)
    );
    this.lifespan = random(90, 150); // 90, 150
    this.maxLifespan = this.lifespan;

    // ★ 2. baseSize を基準にランダムな幅を加える
    const randomFactorW = random(0.5, 1.5); // ランダムな形状係数
    const randomFactorH = random(0.5, 1.5);

    this.sizeW = baseSize * randomFactorW;
    this.sizeH = baseSize * randomFactorH;

    this.color = random(palette);
  }

  update(avgVolume, midLevel) {
    // 中音域でサイズを脈動させる (揺らぎ)
    const midScale = map(midLevel, 70, 120, 1.0, 1.5, true); // 70, 120
    this.currentW = this.sizeW * midScale;
    this.currentH = this.sizeH * midScale;

    this.lifespan--;
  }

  draw() {
    push();
    translate(this.pos.x, this.pos.y);

    const alpha = map(this.lifespan, 0, this.maxLifespan, 0, 150, true); // 0, 150

    let rectColor = this.color;
    rectColor.setAlpha(alpha);

    fill(rectColor);
    rectMode(CENTER);

    rect(0, 0, this.currentW, this.currentH);

    pop();
  }

  isDead() {
    return this.lifespan < 0;
  }
}
