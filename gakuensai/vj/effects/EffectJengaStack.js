// エフェクト：ジェンガ・スタック（最終崩壊版）
class EffectJengaStack {
  constructor() {
    this.stacks = [];
    // ★ 1. 崩壊中の箱を管理するリストを追加
    this.fallingBoxes = [];
    this.numStacks = 10;

    this.xMin = -width * 0.6;
    this.xMax = width * 0.6;
    this.zMin = -300;
    this.zMax = 0;

    this._resetStacks(null);

    this.isAboveThreshold = false;
  }

  _resetStacks(palette) {
    this.stacks = [];
    for (let i = 0; i < this.numStacks; i++) {
      const x = random(this.xMin, this.xMax);
      const z = random(this.zMin, this.zMax);
      this.stacks.push(new BoxStack(x, z, palette));
    }
  }

  draw(spectrum, palette, audioLevels) {
    if (!palette || palette.length === 0) {
      palette = [color(255)];
    }

    noFill();
    strokeWeight(6);

    push();

    // ★ 2. タワー全体のワールド座標オフセットを計算
    const worldOffsetY = height * 0.4;
    const worldOffsetZ = -200;
    translate(0, worldOffsetY, worldOffsetZ); // 全体の土台を画面下部に移動

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
      const targetIndex = floor(random(this.stacks.length));
      const targetStack = this.stacks[targetIndex];
      const boxSize = map(audioLevels.volume, 50, 100, 40, 80, true);

      if (targetStack) {
        targetStack.addBox(boxSize, random(palette));
      }
    }

    // --- 3. タワーの更新と崩壊判定 ---
    for (let i = this.stacks.length - 1; i >= 0; i--) {
      const stack = this.stacks[i];
      stack.update(audioLevels.mid);

      if (stack.boxes.length > stack.MAX_HEIGHT) {
        // ★ 崩壊処理: FallingBoxを放出し、グローバルリストに追加
        const crumbledBoxes = stack.crumble(worldOffsetY, worldOffsetZ);
        this.fallingBoxes.push(...crumbledBoxes);

        // ★ 崩壊したタワーを新しいものに置き換え
        const newX = random(this.xMin, this.xMax);
        const newZ = random(this.zMin, this.zMax);
        this.stacks.splice(i, 1, new BoxStack(newX, newZ, palette));
      } else {
        stack.draw();
      }
    }

    // --- 4. 崩壊中 (FallingBox) の箱の更新と描画 ---
    for (let i = this.fallingBoxes.length - 1; i >= 0; i--) {
      const box = this.fallingBoxes[i];
      box.update();
      box.draw();

      // ★ 画面外に出たか、寿命が尽きたら削除
      if (box.isDead()) {
        this.fallingBoxes.splice(i, 1);
      }
    }

    pop();
  }
}

// 内部クラス：箱の積み重ね（タワー）
class BoxStack {
  constructor(x, z, palette) {
    this.pos = createVector(x, 0, z);
    this.boxes = [];
    this.MAX_HEIGHT = floor(random(5, 10));
    this.fillAlpha = 0;
  }

  addBox(size, color) {
    this.boxes.push({
      size: size,
      color: color,
    });
  }

  update(midLevel) {
    this.fillAlpha = map(midLevel, 70, 120, 20, 255, true);
  }

  // ★ 崩壊処理メソッド
  crumble(worldOffsetY, worldOffsetZ) {
    const crumbled = [];
    let currentY = 0;

    // 箱を積み上げ順と逆順に処理し、FallingBoxを生成
    for (let i = this.boxes.length - 1; i >= 0; i--) {
      const boxData = this.boxes[i];
      const boxSize = boxData.size;
      const boxCenterY = currentY - boxSize / 2;

      // ワールド座標の計算 (EffectJengaStack.draw内のtranslateを考慮)
      const absX = this.pos.x;
      // Y軸は逆転しているため、pos.y(0) + worldOffsetY + boxCenterY
      const absY = this.pos.y + boxCenterY;
      const absZ = this.pos.z;

      // FallingBoxを生成してリストに追加
      crumbled.push(
        new FallingBox(
          boxData,
          createVector(absX, absY, absZ),
          worldOffsetY,
          worldOffsetZ
        )
      );

      currentY -= boxSize;
    }
    this.boxes = []; // 内部の箱を空にする
    return crumbled;
  }

  draw() {
    push();

    translate(this.pos.x, this.pos.y, this.pos.z);

    let currentY = 0;

    for (let i = 0; i < this.boxes.length; i++) {
      const boxData = this.boxes[i];
      const boxSize = boxData.size;

      const boxCenterY = currentY - boxSize / 2;

      push();
      translate(0, boxCenterY, 0);

      boxData.color.setAlpha(this.fillAlpha);
      fill(boxData.color);

      boxData.color.setAlpha(90 * 2.55);
      stroke(boxData.color);

      box(boxSize, boxSize, boxSize);
      pop();

      currentY -= boxSize;
    }

    pop();
  }
}

// ★ 5. 崩壊中の箱（FallingBox）クラス
class FallingBox {
  constructor(boxData, startPos, worldOffsetY, worldOffsetZ) {
    this.boxData = boxData;

    // ★ World座標からローカル座標に戻す (EffectJengaStackのtranslateを相殺)
    this.pos = createVector(
      startPos.x,
      startPos.y, // Y軸はすでにタワーの土台(0)に相当する高さ
      startPos.z
    );

    // 初速をランダムに設定（タワーから飛び散るイメージ）
    this.velocity = createVector(random(-5, 5), random(-10, -5), random(-5, 5));
    this.acceleration = createVector(0, 0.5, 0); // 重力 (Y+方向が下)

    // 回転速度をランダムに設定
    this.rotSpeed = createVector(
      random(0.01, 0.05),
      random(0.01, 0.05),
      random(0.01, 0.05)
    );
    this.rotation = createVector(random(PI), random(PI), random(PI));

    this.lifespan = 255; // 画面外でフェードアウト
  }

  update() {
    // 運動を更新
    this.velocity.add(this.acceleration);
    this.pos.add(this.velocity);
    this.rotation.add(this.rotSpeed);

    // 画面外に落ちたら徐々に透明度を下げる
    if (this.pos.y > height * 1.5) {
      this.lifespan -= 10;
    }
  }

  draw() {
    if (this.lifespan <= 0) return;

    push();

    // ★ 崩壊中の箱は、EffectJengaStackのtranslate(0, Y, Z)の後に描画される
    translate(this.pos.x, this.pos.y, this.pos.z);

    // 回転を適用
    rotateX(this.rotation.x);
    rotateY(this.rotation.y);
    rotateZ(this.rotation.z);

    // 色と透明度の設定
    const boxSize = this.boxData.size;

    this.boxData.color.setAlpha(this.lifespan);
    fill(this.boxData.color);
    stroke(this.boxData.color);

    box(boxSize, boxSize, boxSize);
    pop();
  }

  isDead() {
    // 画面外に大きく落ちるか、透明度が尽きたら削除
    return this.lifespan <= 0 || this.pos.y > height * 2;
  }
}
