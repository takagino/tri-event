// エフェクト：テキスト・エモート（単語生成）
class EffectTextEmote {
  constructor() {
    this.emotes = [];
    this.isAboveThreshold = false;

    this.wordList = [
      'OK!',
      'HAPPY!',
      'LOVE!',
      'FUNKY!',
      'COOL!',
      'WOW!',
      'YES!',
      'VIBE!',
      'GO!',
      'DANCE!',
      'PARTY!',
    ];
    // 全体的な色相シフト
    this.hueShift = 0;
  }

  draw(spectrum, palette, audioLevels) {
    if (!palette || palette.length === 0) {
      palette = [color(255)];
    }

    noStroke();
    textFont(myFont);
    textAlign(CENTER, CENTER);

    // --- 1. 全体的な色相シフトを更新 (高音域に連動) ---
    // 高音域の強さでシフト速度を決定
    const shiftSpeed = map(audioLevels.high, 70, 120, 0.5, 3.0, true);
    this.hueShift = (this.hueShift + shiftSpeed) % 360;

    // --- 2. ビート検出と生成 ---
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
        map(audioLevels.bassImpact, 1.0, 3.0, 1, 5, true) // 1, 5
      );
      for (let i = 0; i < numToSpawn; i++) {
        // ★ 生成時に、現在の全体の色相シフト値を渡す
        this.emotes.push(new EmoteWord(this.wordList, palette, this.hueShift));
      }
    }

    // --- 3. 更新と描画 ---
    const volumeSizeFactor = map(audioLevels.volume, 50, 100, 0.5, 1.5, true); // 50, 100
    const highWobbleSpeed = map(audioLevels.high, 70, 120, 0.05, 0.2, true); // 70, 120

    for (let i = this.emotes.length - 1; i >= 0; i--) {
      let emote = this.emotes[i];
      emote.update(highWobbleSpeed);
      // ★ 全体的な色相シフト値を描画に渡し、色を変化させる
      emote.draw(volumeSizeFactor, this.hueShift);

      if (emote.isDead()) {
        this.emotes.splice(i, 1);
      }
    }
  }
}

// 内部クラス：消えゆく単語
class EmoteWord {
  // ★ constructorで initialHue を受け取る
  constructor(wordList, palette, initialHue) {
    this.pos = createVector(
      random(-width / 2, width / 2),
      random(-height / 2, height / 2),
      random(-300, 300)
    );
    this.word = random(wordList);
    this.lifespan = random(120, 200);
    this.maxLifespan = this.lifespan;

    this.baseSize = random(40, 100);
    // ★ 自身の基本色相を初期化時の全体の色相シフト値から決定
    this.baseHue = (hue(random(palette)) + initialHue) % 360;

    this.noiseOffset = random(100);
  }

  update(highWobbleSpeed) {
    this.lifespan--;

    this.pos.z += map(noise(this.noiseOffset), 0, 1, 0.5, 1.5); // 0.5, 1.5

    // ★ このupdateでは、個別の揺らぎ(wobble)ロジックは削除（drawで全体シフトを使うため）
  }

  // ★ drawメソッドで現在の全体色相シフト値を受け取る
  draw(volumeSizeFactor, currentHueShift) {
    push();
    translate(this.pos);

    const lifeRatio = this.lifespan / this.maxLifespan;

    // ★ 1. 色相を全体シフト値で決定
    const finalHue = (this.baseHue + currentHueShift) % 360;

    // ★ 2. フェードアウトと透明度
    const alpha = map(lifeRatio, 1.0, 0.0, 255, 20, true); // 20

    // ★ 3. 描画色を生成
    let finalColor = color(
      finalHue,
      100, // 彩度固定
      map(lifeRatio, 1.0, 0.0, 90, 50, true) // 明度は寿命で少し下がる
    );

    // ★ 4. サイズ
    const currentSize = this.baseSize * volumeSizeFactor;

    finalColor.setAlpha(alpha);
    fill(finalColor);

    textSize(currentSize);
    text(this.word, 0, 0);

    pop();
  }

  isDead() {
    return this.lifespan < 0;
  }
}
