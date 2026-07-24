class EffectRecursiveSplit {
  constructor() {
    this.minWidth = min(width, height) * 0.7;

    const hw = this.minWidth / 2;
    this.xy1 = createVector(-hw, -hw, 0);
    this.xy2 = createVector(hw, -hw, 0);
    this.xy3 = createVector(hw, hw, 0);
    this.xy4 = createVector(-hw, hw, 0);
    this.rootObj = new RecursiveObj(1, this.minWidth);
    this.lastResetTime = 0;
    this.resetInterval = 15000;
    this.resetBeatThreshold = 1.5;
    this.previousBass = 0;
    this.enableTimeReset = true;
    this.enableBeatReset = true;
    this.initialResetDone = false;
  }

  draw(spectrum, palette, audioLevels) {
    if (!palette || palette.length === 0) {
      palette = [color(255)];
    }

    if (!this.initialResetDone) {
      this.rootObj.reset(1, palette);
      this.initialResetDone = true;
    }

    noStroke();

    const timeNow = millis();
    let shouldReset = false;
    if (
      this.enableTimeReset &&
      timeNow - this.lastResetTime > this.resetInterval
    ) {
      shouldReset = true;
    }
    if (
      this.enableBeatReset &&
      audioLevels.bassImpact > this.resetBeatThreshold
    ) {
      shouldReset = true;
    }
    if (shouldReset) {
      console.log('Resetting Recursive Split Layout!');
      this.rootObj.reset(1, palette);
      this.lastResetTime = timeNow;
    }

    this.rootObj.update(
      this.xy1,
      this.xy2,
      this.xy3,
      this.xy4,
      audioLevels.volume,
      audioLevels.bass,
      audioLevels.high,
      palette
    );
    this.rootObj.draw(palette);
  }
}

class RecursiveObj {
  constructor(splitNumCurrent, minWidth) {
    this.splitNumCurrent = splitNumCurrent;
    this.splitNumLimit = 10;
    this.arySubObject = [];
    this.col = color(255);
  }

  reset(currentLevel, palette) {
    this.splitNumCurrent = currentLevel;
    this.col = random(palette);
    this.arySubObject = [];
    let splitProbability = map(
      this.splitNumCurrent,
      1,
      this.splitNumLimit,
      0.98,
      0.5
    );
    if (
      (currentLevel < this.splitNumLimit && random() < splitProbability) ||
      currentLevel === 1
    ) {
      this.splitObject(palette);
      if (this.arySubObject.length > 0) {
        this.arySubObject[0].reset(currentLevel + 1, palette);
        this.arySubObject[1].reset(currentLevel + 1, palette);
      }
    }
  }

  splitObject(palette) {
    this.splitDirection = random() < 0.5 ? 'vertical' : 'horizontal';
    this.noiseSeed = random(1000);
    this.freq = random(4, 8);
    this.minNoiseVal = 0.4;
    this.maxNoiseVal = 0.6;
    this.gapNoiseVal = this.maxNoiseVal - this.minNoiseVal;
    this.arySubObject = [
      new RecursiveObj(this.splitNumCurrent + 1, width),
      new RecursiveObj(this.splitNumCurrent + 1, width),
    ];
  }

  update(xy1, xy2, xy3, xy4, avgVolume, bassLevel, highLevel, palette) {
    this.xy1 = xy1;
    this.xy2 = xy2;
    this.xy3 = xy3;
    this.xy4 = xy4;
    const noiseSpeed = map(avgVolume, 50, 100, 0.0001, 0.0005, true); // 50, 100
    const shiftAmp = map(bassLevel, 100, 150, 0.5, 3, true); // 100, 150

    if (this.arySubObject.length > 0) {
      const noiseVal =
        ((sin(
          TWO_PI * this.freq * noise(this.noiseSeed + noiseSpeed * frameCount)
        ) +
          1) *
          this.gapNoiseVal) /
          2 +
        this.minNoiseVal;
      let sub1_xy1,
        sub1_xy2,
        sub1_xy3,
        sub1_xy4,
        sub2_xy1,
        sub2_xy2,
        sub2_xy3,
        sub2_xy4;
      if (this.splitDirection == 'vertical') {
        sub1_xy1 = xy1;
        sub1_xy2 = p5.Vector.lerp(xy1, xy2, noiseVal);
        sub1_xy3 = p5.Vector.lerp(xy4, xy3, noiseVal);
        sub1_xy4 = xy4;
        sub2_xy1 = sub1_xy2;
        sub2_xy2 = xy2;
        sub2_xy3 = xy3;
        sub2_xy4 = sub1_xy3;
      } else {
        sub1_xy1 = xy1;
        sub1_xy2 = xy2;
        sub1_xy3 = p5.Vector.lerp(xy2, xy3, noiseVal);
        sub1_xy4 = p5.Vector.lerp(xy1, xy4, noiseVal);
        sub2_xy1 = sub1_xy4;
        sub2_xy2 = sub1_xy3;
        sub2_xy3 = xy3;
        sub2_xy4 = xy4;
      }

      const center = p5.Vector.add(xy1, xy3).mult(0.5);
      const distCheck = p5.Vector.dist(xy1, xy2);
      const scaleFactor =
        distCheck > 0 ? max(0.1, 1.0 - shiftAmp / distCheck) : 0.1;

      if (this.arySubObject[0]) {
        const aryXy_s1 = this._scaleVertices(
          sub1_xy1,
          sub1_xy2,
          sub1_xy3,
          sub1_xy4,
          center,
          scaleFactor
        );
        this.arySubObject[0].update(
          aryXy_s1[0],
          aryXy_s1[1],
          aryXy_s1[2],
          aryXy_s1[3],
          avgVolume,
          bassLevel,
          highLevel,
          palette
        );
      }
      if (this.arySubObject[1]) {
        const aryXy_s2 = this._scaleVertices(
          sub2_xy1,
          sub2_xy2,
          sub2_xy3,
          sub2_xy4,
          center,
          scaleFactor
        );
        this.arySubObject[1].update(
          aryXy_s2[0],
          aryXy_s2[1],
          aryXy_s2[2],
          aryXy_s2[3],
          avgVolume,
          bassLevel,
          highLevel,
          palette
        );
      }
      this.col = color(
        (hue(this.col) + map(highLevel, 70, 120, 0, 1, true)) % 360, // 70, 120
        saturation(this.col),
        brightness(this.col)
      );
    }
  }

  _scaleVertices(v1, v2, v3, v4, center, scaleFactor) {
    const scaled_v1 = p5.Vector.lerp(center, v1, scaleFactor);
    const scaled_v2 = p5.Vector.lerp(center, v2, scaleFactor);
    const scaled_v3 = p5.Vector.lerp(center, v3, scaleFactor);
    const scaled_v4 = p5.Vector.lerp(center, v4, scaleFactor);
    return [scaled_v1, scaled_v2, scaled_v3, scaled_v4];
  }

  draw(palette) {
    if (this.arySubObject.length === 0) {
      if (
        this.xy1 &&
        this.xy2 &&
        this.xy3 &&
        this.xy4 &&
        p5.Vector.dist(this.xy1, this.xy2) > 1 &&
        p5.Vector.dist(this.xy1, this.xy4) > 1
      ) {
        this.col.setAlpha(80 * 2.55);
        fill(this.col);
        beginShape();
        vertex(this.xy1.x, this.xy1.y, this.xy1.z);
        vertex(this.xy2.x, this.xy2.y, this.xy2.z);
        vertex(this.xy3.x, this.xy3.y, this.xy3.z);
        vertex(this.xy4.x, this.xy4.y, this.xy4.z);
        endShape(CLOSE);
      }
    } else {
      if (this.arySubObject[0]) this.arySubObject[0].draw(palette);
      if (this.arySubObject[1]) this.arySubObject[1].draw(palette);
    }
  }
}
