class EffectTextRing {
  constructor() {
    this.textGraphic = createGraphics(1024, 128);
    this.textGraphic.colorMode(HSB, 360, 100, 100, 100);
    this.textGraphic.textFont(myFont);
    this.textGraphic.textSize(64); // 64

    this.text = 'TRIDENT COMPUTER COLLEGE '.repeat(5);
    this.textScrollX = 0;
  }

  draw(spectrum, palette, audioLevels) {
    if (!palette || palette.length === 0) {
      palette = [color(255)];
    }
    if (!myFont) {
      return;
    }

    noStroke();

    const ringRadius = map(
      audioLevels.bass,
      100,
      150,
      height * 0.2,
      height * 0.4,
      true
    ); // 100, 150
    const ringHeight = map(audioLevels.mid, 70, 120, 50, 300, true); // 70, 120
    const rotationSpeed = map(audioLevels.volume, 50, 100, 0.002, 0.0001, true); // 50, 100
    const scrollSpeed = map(audioLevels.volume, 50, 100, 1, 5, true); // 50, 100

    const colorPos = map(
      audioLevels.high,
      70,
      120,
      0,
      palette.length - 1,
      true
    ); // 70, 120
    const index1 = floor(colorPos);
    const index2 = constrain(ceil(colorPos), 0, palette.length - 1);
    const lerpAmt = colorPos - index1;
    let textColor;
    if (palette[index1] && palette[index2]) {
      textColor = lerpColor(palette[index1], palette[index2], lerpAmt);
    } else {
      textColor = palette[0];
    }

    textColor.setAlpha(70 * 2.55);
    this.textGraphic.clear();
    this.textGraphic.fill(textColor);

    const textW = this.textGraphic.textWidth(this.text);
    this.textScrollX -= scrollSpeed;
    if (this.textScrollX < -textW) {
      this.textScrollX += textW;
    }

    this.textGraphic.text(this.text, this.textScrollX, 64);
    this.textGraphic.text(this.text, this.textScrollX + textW, 64);

    push();
    texture(this.textGraphic);
    rotateX(PI / 2.5); // 2.5

    push();
    rotateZ(frameCount * -rotationSpeed * 0.5); // 0.5
    cylinder(ringRadius * 0.5, ringHeight, 48, 1, true, false); // 0.5
    pop();

    push();
    rotateZ(frameCount * rotationSpeed);
    cylinder(ringRadius, ringHeight, 48, 1, true, false); // 48, 1
    pop();

    push();
    rotateZ(frameCount * -rotationSpeed * 0.7); // 0.7
    cylinder(ringRadius * 1.5, ringHeight, 48, 1, true, false); // 1.5
    pop();

    pop();
  }
}
