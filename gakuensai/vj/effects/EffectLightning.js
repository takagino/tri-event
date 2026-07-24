class EffectLightning {
  constructor() {
    this.bolts = [];
    this.numBolts = 6;
    this._reset(null);
  }

  _reset(palette) {
    this.bolts = [];
    const p = palette || [color(255)];
    for (let i = 0; i < this.numBolts; i++) {
      const startX = random(-width / 2, width / 2);
      const startY = -height / 2;
      const startPos = createVector(startX, startY, random(-100, 100));
      this.bolts.push(new BoltSegment(startPos, 0, random(p)));
    }
  }

  draw(spectrum, palette, audioLevels) {
    if (!palette || palette.length === 0) {
      palette = [color(255)];
    }
    noFill();

    const beatThreshold = 1.1;
    if (audioLevels.bassImpact > beatThreshold) {
      this._reset(palette);
    }

    for (let bolt of this.bolts) {
      bolt.updateAndDraw(audioLevels, palette);
    }
  }
}

class BoltSegment {
  constructor(startPoint, level, baseColor) {
    this.start = startPoint.copy();
    this.level = level;
    this.baseColor = baseColor;
    this.children = [];
    this.maxLevel = 4;
    this.maxChildren = 3;

    this.baseAngle = random(-PI / 6, PI / 6); // -PI/6, PI/6
    this.baseLength = random(20, 200) / (level + 1); // 80, 160

    if (this.level < this.maxLevel) {
      for (let i = 0; i < this.maxChildren; i++) {
        this.children.push(
          new BoltSegment(this.start, this.level + 1, baseColor)
        );
      }
    }
  }

  updateAndDraw(audioLevels, palette) {
    const currentLength =
      this.baseLength * map(audioLevels.bass, 100, 150, 1.0, 2.0, true); // 100, 150
    const currentAngle =
      this.baseAngle + map(audioLevels.mid, 70, 120, -PI / 6, PI / 8, true); // 70, 120
    const currentZAngle = map(
      noise(frameCount * 0.01 + this.level),
      0,
      1,
      -PI / 6,
      PI / 6
    );

    let end = this.start.copy();
    end.add(
      currentLength * sin(currentAngle) * cos(currentZAngle),
      currentLength * cos(currentAngle),
      currentLength * sin(currentZAngle)
    );

    const weight = map(audioLevels.high, 70, 120, 3, 20, true); // 70, 120

    let strokeCol = color(
      hue(this.baseColor),
      saturation(this.baseColor),
      brightness(this.baseColor)
    );

    // ★★★ ここを修正 ★★★
    // レベル0(幹)の透明度
    const trunkAlpha = 220; // 220
    // レベル最大(先端)の透明度
    const tipAlpha = 60; // 60

    // レベル(0 ~ 4)に応じて、透明度(220 ~ 60)にマッピング
    const alpha = map(this.level, 0, this.maxLevel, trunkAlpha, tipAlpha, true);
    strokeCol.setAlpha(alpha);
    // ★★★★★★★★★★★★★

    stroke(strokeCol);
    strokeWeight(weight / (this.level + 1));
    line(this.start.x, this.start.y, this.start.z, end.x, end.y, end.z);

    const numBranches = floor(
      map(audioLevels.high, 70, 120, 0, this.children.length, true) // 70, 120
    );

    for (let i = 0; i < numBranches; i++) {
      const child = this.children[i];
      if (child) {
        child.start = end.copy();
        child.updateAndDraw(audioLevels, palette);
      }
    }
  }
}
