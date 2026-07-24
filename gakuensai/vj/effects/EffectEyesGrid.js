class EffectEyesGrid {
  constructor() {
    this.eyeCount = 30;
    this.eyes = [];

    for (let i = 0; i < this.eyeCount; i++) {
      const specLength = 1024 - 24;
      this.eyes.push({
        pos: createVector(
          random(-width / 2, width / 2),
          random(-height / 2, height / 2),
          random(-300, 300)
        ),
        baseSize: random(30, 150),
        freqIndex: floor(random(specLength)),
      });
    }
  }

  draw(spectrum, palette, audioLevels) {
    if (!palette || palette.length === 0) {
      palette = [color(200, 80, 80)];
    }

    for (let eye of this.eyes) {
      const freqIndex = eye.freqIndex;
      const level = spectrum[freqIndex] || 0;
      this._eye(eye.pos, eye.baseSize, level, audioLevels.high, palette);
    }
  }

  _eye(pos, baseSize, level, highLevel, palette) {
    const eyeWhiteSize = map(
      level,
      0,
      255,
      baseSize * 0.5,
      baseSize * 2.5,
      true
    ); // 0, 255
    const irisSize = eyeWhiteSize * 0.7;
    const pupilMultiplier = map(highLevel, 70, 120, 0.3, 2.0, true); // 70, 120
    const pupilSize = eyeWhiteSize * pupilMultiplier;
    const highlightSize = irisSize * 0.25;

    push();
    translate(pos.x, pos.y, pos.z);
    noStroke();

    const colorIndex = floor(
      map(highLevel, 70, 120, 0, palette.length - 1, true)
    ); // 70, 120
    const irisColor = palette[colorIndex % palette.length];

    const scleraColor = color(
      hue(irisColor),
      saturation(irisColor) * 0.3, // 0.3
      brightness(irisColor) * 0.4 + 20 // 0.4, 20
    );
    scleraColor.setAlpha(240); // 240
    fill(scleraColor);
    ellipse(0, 0, eyeWhiteSize, eyeWhiteSize);

    irisColor.setAlpha(240); // 240
    fill(irisColor);
    ellipse(0, 0, irisSize, irisSize);

    const pupilColor = color(
      hue(irisColor),
      saturation(irisColor) * 0.5, // 0.5
      5 // 5
    );
    pupilColor.setAlpha(255); // 255
    fill(pupilColor);
    ellipse(0, 0, pupilSize, pupilSize);

    if (irisSize > 5 && highlightSize < irisSize / 2) {
      const highlightColor = color(
        hue(irisColor),
        saturation(irisColor) * 0.1, // 0.1
        100 // 100
      );
      highlightColor.setAlpha(220); // 220
      fill(highlightColor);
      ellipse(-irisSize * 0.25, -irisSize * 0.25, highlightSize, highlightSize);
    }

    pop();
  }
}
