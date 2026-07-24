// エフェクト：フラクタル・ツリー
class EffectFractalTree {
  constructor() {
    this.t = 0; // 揺らぎ用の時間
  }

  draw(spectrum, palette, audioLevels) {
    if (!palette || palette.length === 0) {
      palette = [color(255)];
    }

    noFill(); // 線だけを描画

    // --- 音声連動パラメータ ---
    // 1. 低音(Bass)で幹と枝の太さが変わる
    const strokeWeight = map(audioLevels.bass, 100, 150, 3, 18, true); // 100, 150 -> 1, 8
    // 2. 中音(Mid)で枝が広がる角度が変わる
    const branchAngle = map(audioLevels.mid, 70, 120, PI / 10, PI / 4, true); // 70, 120 -> 18度, 45度
    // 3. 高音(High)で枝の長さが変わる
    const branchLength = map(audioLevels.high, 70, 120, 0.6, 0.7, true); // 70, 120
    // 4. 全体音量(Volume)で揺らぎの速度が変わる
    const timeSpeed = map(audioLevels.volume, 50, 100, 0.005, 0.02, true); // 50, 100
    this.t += timeSpeed;

    push();
    // 画面下部中央に原点を移動
    translate(0, height / 2, -100);

    // --- 最初の幹を呼び出し ---
    this._drawBranch(
      height / 4,
      strokeWeight,
      branchAngle,
      branchLength,
      0,
      palette
    );
    pop();
  }

  // ★ 再帰的に枝を描画する関数
  _drawBranch(len, weight, angle, lengthRatio, level, palette) {
    // 線の色をパレットと枝の階層(level)で決定
    const colorIndex = (level * 2) % palette.length;
    const branchColor = palette[colorIndex];
    let strokeCol = color(
      hue(branchColor),
      saturation(branchColor),
      brightness(branchColor)
    );
    strokeCol.setAlpha(200); // 200

    stroke(strokeCol);
    strokeWeight(weight);

    // 幹を描画 (Y軸マイナス方向 = 上へ)
    line(0, 0, 0, 0, -len, 0);

    // 幹の先端に移動
    translate(0, -len, 0);

    // ★ 一定の長さ（または階層）になったら分岐を停止
    if (len > 20) {
      // 20
      // 1. 右の枝
      push();
      // 全体を揺らす (sin波)
      rotateZ(angle + sin(this.t + level * 0.5) * (angle * 0.5));
      this._drawBranch(
        len * lengthRatio,
        weight * 0.7,
        angle,
        lengthRatio,
        level + 1,
        palette
      ); // 0.7
      pop();

      // 2. 左の枝
      push();
      rotateZ(-angle + sin(this.t + level * 0.5 + PI) * (angle * 0.5));
      this._drawBranch(
        len * lengthRatio,
        weight * 0.7,
        angle,
        lengthRatio,
        level + 1,
        palette
      ); // 0.7
      pop();
    }
  }
}
