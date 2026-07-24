// エフェクト：スノーメン（雪だるま）
class EffectSnowmen {
  constructor() {
    this.snowmen = [];
    this.cols = 6; // 横に並べる数
    this.rows = 6; // 縦に並べる数
    this.spacingX = width / this.cols;
    this.spacingY = height / this.rows;

    // ★ 1. グリッド状に Snowman を事前配置
    for (let j = 0; j < this.rows; j++) {
      for (let i = 0; i < this.cols; i++) {
        let x = map(i, 0, this.cols, -width / 2, width / 2);
        let y = map(j, 0, this.rows, -height / 2, height / 2);

        // ★ 1行ごとにX座標を半分ずらす
        if (j % 2 === 0) {
          x += this.spacingX / 2;
        }

        // 奥行きをランダムに
        let z = random(-100, 100); // -300, -100

        this.snowmen.push(new Snowman(x, y, z));
      }
    }
  }

  draw(spectrum, palette, audioLevels) {
    if (!palette || palette.length === 0) {
      palette = [color(255)];
    }

    noStroke();

    // ★ 2. 全体を画面下部に移動し、見下ろす
    push();
    translate(this.spacingX / 2, height * 0.05, -200); // 0.05, -200
    rotateX(PI / 6); // 6

    // --- 3. 各雪だるまを更新・描画 ---
    for (let snowman of this.snowmen) {
      snowman.update(audioLevels);
      snowman.draw(palette);
    }
    pop();
  }
}

// 内部クラス：雪だるま
class Snowman {
  constructor(x, y, z) {
    this.basePos = createVector(x, y, z);
    this.noiseOffset = random(1000); // 揺れ用

    // 頭が浮き上がるアニメーション用
    this.headLift = 0;
    this.headLiftDecay = 0.9; // 減衰率 (0.9)

    // ビート検出用
    this.isAboveThreshold = false;
  }

  update(audioLevels) {
    // --- 1. 頭の浮き上がり (BassImpact) ---
    const beatThreshold = 1.0;
    let shouldLift = false;
    if (audioLevels.bassImpact > beatThreshold) {
      if (!this.isAboveThreshold) {
        shouldLift = true;
        this.isAboveThreshold = true;
      }
    } else {
      this.isAboveThreshold = false;
    }

    if (shouldLift) {
      // ビートが来たら、頭が浮き上がる力を最大値にする
      this.headLift = map(audioLevels.bassImpact, 1.0, 3.0, 15, 30, true); // 1.0, 3.0 -> 15, 30
    }
    // 毎フレーム、浮き上がり量を減衰させる
    this.headLift *= this.headLiftDecay;

    // --- 2. 左右の揺れ (Volume) ---
    const swingSpeed = 0.05; // 0.05
    const swingAmount = map(audioLevels.volume, 50, 100, PI / 20, PI / 6, true); // 50, 100
    this.rockingAngle =
      sin(frameCount * swingSpeed + this.noiseOffset) * swingAmount;

    // --- 3. 全体の大きさ (Bass) ---
    this.currentSize = map(audioLevels.bass, 100, 150, 0.5, 3.0, true); // 100, 150
  }

  draw(palette) {
    push();
    translate(this.basePos.x, this.basePos.y, this.basePos.z);

    // ★ Z軸（中心軸）で揺らす
    rotateZ(this.rockingAngle);

    // ★ 全体の大きさ
    scale(this.currentSize);

    // --- 色の決定 (パレットの最初の色を基準) ---
    let baseColor = palette[0];
    baseColor.setAlpha(80 * 2.55);
    fill(baseColor);

    // --- 描画 ---
    const bodySize = 15; // 15
    const headSize = 10; // 10

    // 体 (下の球)
    sphere(bodySize);

    // 頭 (上の球)
    push();
    // ★ headLift (BassImpact) の分だけY軸（上）にずらす
    translate(0, -(bodySize * 0.8 + headSize * 0.5) - this.headLift, 0);
    sphere(headSize);
    pop();

    pop();
  }
}
