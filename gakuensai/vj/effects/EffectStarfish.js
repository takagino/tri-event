class EffectStarfish {
  constructor() {
    this.nodes = [];
    for (let i = 0; i < 30; i++) {
      this.nodes.push({
        angle: map(i, 0, 30, 0, TWO_PI, true),
        noiseOffset: random(1000),
      });
    }
  }

  // ★ 1. 描画ロジックを EffectBlob のものに戻す
  _drawSingleBlob(baseRadius, radiusWobble, blobMaterial) {
    fill(blobMaterial);
    noStroke();

    beginShape();

    // 最初の頂点
    const firstNode = this.nodes[0];
    let firstRadius =
      baseRadius +
      map(
        noise(firstNode.noiseOffset + frameCount * 0.005),
        0,
        1,
        -radiusWobble,
        radiusWobble,
        true
      );
    curveVertex(
      firstRadius * cos(firstNode.angle),
      firstRadius * sin(firstNode.angle),
      0
    );

    // 中間の頂点
    for (let node of this.nodes) {
      const radius =
        baseRadius +
        map(
          noise(node.noiseOffset + frameCount * 0.005),
          0,
          1,
          -radiusWobble,
          radiusWobble,
          true
        );
      const x = radius * cos(node.angle);
      const y = radius * sin(node.angle);
      curveVertex(x, y, 0);
    }

    // 閉じるための最後の頂点
    curveVertex(
      firstRadius * cos(firstNode.angle),
      firstRadius * sin(firstNode.angle),
      0
    );
    let secondActualRadius =
      baseRadius +
      map(
        noise(this.nodes[0].noiseOffset + frameCount * 0.005),
        0,
        1,
        -radiusWobble,
        radiusWobble,
        true
      );
    curveVertex(
      secondActualRadius * cos(this.nodes[0].angle),
      secondActualRadius * sin(this.nodes[0].angle),
      0
    );

    endShape(CLOSE);
  }

  draw(spectrum, palette, audioLevels) {
    if (!palette || palette.length === 0) {
      palette = [color(255)];
    }

    const zPos = map(audioLevels.volume, 50, 100, -100, 200, true); // 50, 100
    const baseRadius = map(
      audioLevels.bass,
      100,
      150,
      height / 10,
      height / 4,
      true // 100, 150
    );
    const radiusWobble = map(audioLevels.mid, 70, 120, 50, 200, true); // 70, 120

    const colorPos = map(audioLevels.mid, 70, 120, 0, palette.length - 1, true); // 70, 120
    const constrainedPos = constrain(colorPos, 0, palette.length - 1);
    const colorIndex = floor(constrainedPos);
    const blobColor = palette[colorIndex];
    const fillColor = color(
      hue(blobColor),
      saturation(blobColor),
      brightness(blobColor)
    );
    fillColor.setAlpha(90 * 2.55);

    const spacing = width / 3.5; // 3.5

    // ★ 2. _drawSingleStar の呼び出しを _drawSingleBlob に変更
    push();
    translate(-spacing, 0, zPos);
    this._drawSingleBlob(baseRadius, radiusWobble, fillColor);
    pop();

    push();
    translate(0, 0, zPos);
    this._drawSingleBlob(baseRadius, radiusWobble, fillColor);
    pop();

    push();
    translate(spacing, 0, zPos);
    this._drawSingleBlob(baseRadius, radiusWobble, fillColor);
    pop();
  }
}
