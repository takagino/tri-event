// エフェクト：シティ・スケープ（ビート連動型街並み生成）
class EffectCityScape {
  constructor() {
    this.buildings = [];
    this.isAboveThreshold = false;

    this.flowSpeed = 2;

    this.X_RANGE = width * 1.5;
    this.Z_START = -1000;
    this.Z_END = 500;
  }

  draw(spectrum, palette, audioLevels) {
    if (!palette || palette.length === 0) {
      palette = [color(255)];
    }

    noStroke();

    const beatThreshold = 1.0;
    let shouldSpawn = false;

    // --- ビート判定と流れの速度 ---
    if (audioLevels.bassImpact > beatThreshold) {
      if (!this.isAboveThreshold) {
        shouldSpawn = true;
        this.isAboveThreshold = true;
      }
      this.flowSpeed = lerp(this.flowSpeed, 4, 0.5);
    } else {
      this.isAboveThreshold = false;
      this.flowSpeed = lerp(this.flowSpeed, 2, 0.1);
    }

    if (shouldSpawn) {
      const x = random(-this.X_RANGE, this.X_RANGE);
      const z = this.Z_START;

      // ★ 修正: ランダムに選んだパレットの色を、必ず p5.Color オブジェクトとして渡す
      const initialColor = color(random(palette));
      this.buildings.push(new Building(x, z, initialColor, audioLevels.volume));
    }

    // --- 3. ビルの更新と描画 ---
    push();
    translate(0, height * 0.2, 0);
    rotateX(-PI / 8);

    for (let i = this.buildings.length - 1; i >= 0; i--) {
      const building = this.buildings[i];

      building.pos.z += this.flowSpeed;

      building.update(audioLevels.volume);

      building.draw();

      if (building.pos.z > this.Z_END) {
        this.buildings.splice(i, 1);
      }
    }

    pop();
  }
}

// 内部クラス：家やビルの形状
class Building {
  constructor(x, z, colorObj, initialVolume) {
    this.pos = createVector(x, 0, z);
    this.baseColor = colorObj; // ★ p5.Colorオブジェクトが保証されている
    this.type = floor(random(3));

    const baseSize = map(initialVolume, 50, 100, 30, 80, true);
    this.width = baseSize;
    this.depth = baseSize;
    this.height = baseSize * random(1, 3);

    this.targetScaleY = 1.0;
    this.currentScaleY = 1.0;

    this.detailColor = color(0, 0, 80);
    this.windowColor = color(255, 255, 100);
  }

  update(volume) {
    this.targetScaleY = map(volume, 50, 100, 1.0, 1.2, true);
    this.currentScaleY = lerp(this.currentScaleY, this.targetScaleY, 0.1);

    const alpha = map(this.pos.z, -1000, 500, 50, 255, true);
    this.baseColor.setAlpha(alpha);
    this.detailColor.setAlpha(alpha);
    this.windowColor.setAlpha(alpha);
  }

  // 描画メソッド
  draw() {
    push();

    translate(this.pos.x, this.pos.y, this.pos.z);
    scale(1, this.currentScaleY, 1);

    noStroke();

    switch (this.type) {
      case 0:
        this._drawHouse();
        break;
      case 1:
        this._drawSkyscraper();
        break;
      case 2:
        this._drawComplex();
        break;
    }

    pop();
  }

  // --- 形状定義 ---

  // タイプ 0: 家（屋根、扉、窓、煙突）
  _drawHouse() {
    const bodyH = this.height * 0.7;
    const roofH = this.height * 0.3;
    const bodyW = this.width;
    const bodyD = this.depth;

    // --- 1. 本体 ---
    push();
    translate(0, -bodyH / 2, 0);
    fill(this.baseColor);
    box(bodyW, bodyH, bodyD);

    // ★ 2. 扉と窓 (正面Z軸 + bodyD/2)

    // 扉 (Door)
    push();
    fill(this.detailColor);
    translate(0, bodyH / 2 - 20, bodyD / 2 + 1);
    box(bodyW * 0.2, bodyH * 0.4, 2);
    pop();

    // 窓 (Window)
    push();
    let windowW = bodyW * 0.2;
    let windowH = bodyH * 0.2;
    fill(this.windowColor);

    translate(-bodyW * 0.3, -bodyH * 0.1, bodyD / 2 + 1);
    box(windowW, windowH, 2);

    translate(bodyW * 0.6, 0, 0);
    box(windowW, windowH, 2);
    pop();

    pop(); // 本体ここまで

    // --- 3. 屋根 ---
    push();
    translate(0, -bodyH - roofH / 2, 0);
    rotate(-PI);

    // ★ 修正: p5.Colorオブジェクトの輝度とアルファ値を操作
    let roofColor = color(
      hue(this.baseColor),
      saturation(this.baseColor),
      brightness(this.baseColor) * 1.5
    );
    roofColor.setAlpha(alpha(this.baseColor));
    fill(roofColor);

    cone(this.width * 1.2, bodyH * 0.6, 4);
    pop();

    // --- 4. 煙突 (Chimney) ---
    push();
    let chimneyW = bodyW * 0.1;
    let chimneyH = bodyH * 0.2;
    translate(bodyW / 2 - chimneyW / 2, -bodyH - chimneyH / 2, 0);
    fill(this.detailColor);
    box(chimneyW, chimneyH, chimneyW);
    pop();
  }

  // タイプ 1: 高層ビル（窓のグリッド）
  _drawSkyscraper() {
    push();
    translate(0, -this.height / 2, 0);

    let skyscraperColor = color(
      hue(this.baseColor),
      saturation(this.baseColor),
      brightness(this.baseColor) * 0.8
    );
    skyscraperColor.setAlpha(alpha(this.baseColor));
    fill(skyscraperColor);

    box(this.width, this.height, this.depth);

    // ★ 2. 窓のグリッド (正面Z軸 + depth/2)
    const numRows = floor(this.height / 50);
    const numCols = floor(this.width / 40);
    const windowSpacing = 15;
    const windowSize = 10;

    const startX = -this.width / 2 + windowSpacing;
    const startY = this.height / 2 - windowSpacing;

    fill(this.windowColor);

    for (let i = 0; i < numCols; i++) {
      for (let j = 0; j < numRows; j++) {
        push();
        translate(
          startX + i * windowSpacing * 2,
          startY - j * windowSpacing * 2,
          this.depth / 2 + 1
        );
        box(windowSize, windowSize, 2);
        pop();
      }
    }

    pop();
  }

  // タイプ 2: 複合ビル（段差とシンプルな窓）
  _drawComplex() {
    let currentY = 0;
    let currentW = this.width;
    let currentD = this.depth;

    for (let i = 0; i < 3; i++) {
      const h = this.height * 0.4;
      const boxCenterY = currentY - h / 2;

      push();
      translate(0, boxCenterY, 0);

      let sectionColor = color(
        hue(this.baseColor),
        saturation(this.baseColor),
        brightness(this.baseColor) * (1 - i * 0.1)
      );
      sectionColor.setAlpha(alpha(this.baseColor));
      fill(sectionColor);

      box(currentW, h, currentD);

      // ★ 窓の装飾
      if (i === 0) {
        push();
        fill(this.detailColor);
        translate(0, h / 2 - 15, currentD / 2 + 1);
        box(currentW * 0.15, h * 0.3, 2);
        pop();
      } else {
        push();
        fill(this.windowColor);
        translate(-currentW * 0.25, -h * 0.1, currentD / 2 + 1);
        box(currentW * 0.1, h * 0.1, 2);
        translate(currentW * 0.5, 0, 0);
        box(currentW * 0.1, h * 0.1, 2);
        pop();
      }

      pop();

      currentY -= h;
      currentW *= 0.8;
      currentD *= 0.8;
    }
  }
}
