// エフェクト：アローストリーム（2D・外向き版）
class EffectArrowStream {
  constructor() {
    this.arrows = [];
    this.numArrows = 80; // 100

    for (let i = 0; i < this.numArrows; i++) {
      this.arrows.push(new Arrow());
    }
  }

  draw(spectrum, palette, audioLevels) {
    if (!palette || palette.length === 0) {
      palette = [color(255)];
    }

    noStroke();

    const arrowSpeed = map(audioLevels.volume, 50, 100, 5, 10, true); // 50, 100
    const arrowSize = map(audioLevels.bass, 100, 150, 10, 100, true); // 100, 150
    const highColorFactor = map(audioLevels.high, 70, 120, 0, 1, true); // 70, 120

    push();

    for (let arrow of this.arrows) {
      arrow.update(arrowSpeed);
      arrow.draw(palette, highColorFactor, arrowSize);
    }
    pop();
  }
}

// 内部クラス：単一の矢印
class Arrow {
  constructor() {
    this.baseColor = random(360);
    this.reset(); // 初期位置と方向を設定
  }

  reset() {
    // ★ 1. 画面全体のランダムなY/Zに配置
    this.pos = createVector(
      random(-width * 0.5, width * 0.5), // Xは中央付近
      random(-height * 0.5, height * 0.5),
      random(-300, 300)
    );

    // ★ 2. 配置された側によって「向き」を決定
    // 右半分にいたら右向き(1)、左半分にいたら左向き(-1)
    this.direction = this.pos.x > 0 ? 1 : -1;
  }

  update(speed) {
    // ★ 3. 決定された向き（外側）に移動
    this.pos.x += speed * this.direction;

    // 画面外に出たらリセット
    const screenMargin = width * 0.7; // 0.7
    if (abs(this.pos.x) > screenMargin) {
      this.reset();
    }
  }

  draw(palette, highColorFactor, arrowSize) {
    push();
    // 3D空間の計算された位置に移動
    translate(this.pos.x, this.pos.y, this.pos.z);

    // ★ 4. 左向き(-1)なら、形状を180度反転
    if (this.direction === -1) {
      rotateY(PI);
    }

    // --- 色の決定 ---
    const colorLerp = (this.baseColor + highColorFactor * 360) % 360;
    const paletteIndex = floor(
      map(colorLerp, 0, 360, 0, palette.length - 1, true)
    );
    const col = palette[paletteIndex % palette.length];

    let finalColor = color(hue(col), saturation(col), brightness(col));
    finalColor.setAlpha(80 * 2.55); // 200
    fill(finalColor);

    // ★ 5. 2D形状で矢印を描画 (rect + triangle)
    const bodyW = arrowSize * 0.8;
    const bodyH = arrowSize * 0.1;
    const headL = arrowSize * 0.4;
    const headH = arrowSize * 0.2;

    rectMode(CENTER);
    // 胴体 (矩形)
    rect(0, 0, bodyW, bodyH);

    // 頭 (三角形)
    // (胴体の先端から、さらに headL だけ伸びる)
    triangle(bodyW / 2, -headH, bodyW / 2, headH, bodyW / 2 + headL, 0);

    pop();
  }
}
