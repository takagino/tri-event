// エフェクト：アイシクルドロップ（つらら落下）
class EffectIcicleDrop {
  constructor() {
    this.icicles = []; // つららの配列
    this.numIcicles = 80; // つららの数
    const spectrumLength = FFT_SIZE - CUT_LOW_FREQ;

    // ★ 1. 初期配置（画面上部〜中央にランダムに配置）
    for (let i = 0; i < this.numIcicles; i++) {
      this.icicles.push({
        pos: createVector(
          random(-width * 0.6, width * 0.6), // -0.6, 0.6
          random(-height * 0.8, -height * 0.2), // -0.8, -0.2 (画面上部から出現)
          random(-200, 300) // -200, 300
        ),
        freqIndex: floor(random(spectrumLength)),
        colorOffset: random(1.0),
        // ★ 落下用のYオフセット
        yOffset: -random(height * 0.2), // 初期Yオフセット (バラバラに落ち始めるように)
        // ★ 次の落下までの遅延
        dropDelay: random(0, 500),
      });
    }
  }

  draw(spectrum, palette, audioLevels) {
    if (!palette || palette.length === 0) {
      palette = [color(255)];
    }

    noStroke();

    const coneRadius = map(audioLevels.bass, 100, 150, 5, 15, true); // 100, 150
    // ★ 落下速度（音量に連動）
    const dropSpeed = map(audioLevels.volume, 50, 100, 2, 10, true); // 50, 100 -> 2, 10

    push();
    translate(0, -height * 0.4, 0); // -0.4 (画面上部がY=0になるように調整)

    for (let icicle of this.icicles) {
      // ★ 2. 落下アニメーションの更新
      if (icicle.dropDelay > 0) {
        icicle.dropDelay--; // 遅延中は落下しない
      } else {
        icicle.yOffset += dropSpeed;
      }

      // ★ 3. 画面下端に達したらリスポーン
      if (icicle.yOffset > height * 1.5) {
        // -1.5 (画面外まで落ちたら)
        icicle.yOffset = -height * 0.2; // 画面上部よりさらに上からリスポーン
        icicle.dropDelay = random(0, 500); // 新しい遅延を設定
      }

      const level = spectrum[icicle.freqIndex] || 0;
      const coneHeight = map(level, 0, 255, 20, 100, true); // 0, 255 -> 1, 300

      const colorPos = (icicle.colorOffset + audioLevels.high * 0.01) % 1.0;
      const colorLerp = colorPos * (palette.length - 1);
      const index1 = floor(colorLerp);
      const index2 = (index1 + 1) % palette.length;

      let coneColor;
      if (palette[index1] && palette[index2]) {
        coneColor = lerpColor(
          palette[index1],
          palette[index2],
          colorPos - index1
        );
      } else {
        coneColor = palette[0];
      }

      push();
      translate(icicle.pos.x, icicle.pos.y + icicle.yOffset, icicle.pos.z);

      coneColor.setAlpha(80 * 2.55); // 200
      fill(coneColor);

      cone(coneRadius, coneHeight, 16, 1); // 16, 1

      pop();
    }
    pop();
  }
}
