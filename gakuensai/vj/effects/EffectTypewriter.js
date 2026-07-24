class EffectTypewriter {
  constructor() {
    this.isOverlay = true;
    this.fullText =
      'This is a sample text for the VJ effect. As the music plays, characters will appear one by one, faster or slower depending on the volume. We can place any long string of text here and watch it type out in sync with the audio spectrum. When the text reaches the end, it will loop back to the beginning... ';
    this.characters = [];
    this.currentIndex = 0;
    this.lastCharTime = 0;
    this.currentX = 0;
    this.currentY = 0;
    this.currentLineHeight = 0;
    this.fontSizeMin = 16;
    this.fontSizeMax = 60;
    this.lineHeightRatio = 1.2;
    this.margin = 20;

    this.textGraphic = createGraphics(width, height);
    this.textGraphic.textFont(myFont);
    this.textGraphic.textAlign(LEFT, TOP);
    this.textGraphic.noStroke();
    this.textGraphic.colorMode(HSB, 360, 100, 100);

    this.currentColor = null;

    this.currentX = this.margin;
    this.currentY = this.margin;
    this.currentLineHeight = this.fontSizeMin * this.lineHeightRatio;

    this.connectionPoints = [];
    this.maxPoints = 20;
  }

  _updateTextBuffer(newChar, palette) {}

  draw(spectrum, palette, audioLevels) {
    if (!palette || palette.length === 0) {
      palette = [color(0, 0, 100)];
    }
    if (this.currentColor === null) {
      this.currentColor = palette[0];
    }

    const typingDelay = map(audioLevels.bassImpact, 0.5, 1.5, 50, 100, true); // 50, 100

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
    if (palette[index1] && palette[index2]) {
      this.currentColor = lerpColor(palette[index1], palette[index2], lerpAmt);
    } else {
      this.currentColor = palette[0];
    }

    const currentDynamicFontSize = map(
      audioLevels.volume,
      50,
      120,
      this.fontSizeMin,
      this.fontSizeMax,
      true
    ); // 80, 150

    const timeNow = millis();
    if (timeNow - this.lastCharTime > typingDelay) {
      if (this.currentIndex >= this.fullText.length) {
        this.currentIndex = 0;
      }
      const newChar = this.fullText[this.currentIndex];
      const charObj = {
        char: newChar,
        x: this.currentX,
        y: this.currentY,
        size: currentDynamicFontSize,
        colorHSB: [
          hue(this.currentColor),
          saturation(this.currentColor),
          brightness(this.currentColor),
        ],
      };
      this.textGraphic.textSize(charObj.size);
      const charWidth = this.textGraphic.textWidth(newChar);
      const charHeight = charObj.size * this.lineHeightRatio;
      if (this.currentX + charWidth > width - this.margin) {
        this.currentX = this.margin;
        this.currentY += this.currentLineHeight;
        this.currentLineHeight = charHeight;
        charObj.x = this.currentX;
        charObj.y = this.currentY;
      } else {
        if (charHeight > this.currentLineHeight) {
          this.currentLineHeight = charHeight;
        }
      }
      if (this.currentY + this.currentLineHeight > height - this.margin) {
        const scrollAmount = this.currentLineHeight;
        for (let c of this.characters) {
          c.y -= scrollAmount;
        }
        for (let p of this.connectionPoints) {
          p.y -= scrollAmount;
        }
        this.currentY -= scrollAmount;
        this.characters = this.characters.filter(
          (c) => c.y > -this.fontSizeMax
        );
        this.connectionPoints = this.connectionPoints.filter(
          (p) => p.y > -this.fontSizeMax
        );
      }
      this.characters.push(charObj);
      this.currentX += charWidth;
      this.currentIndex++;
      this.lastCharTime = timeNow;
    }

    if (random(100) < 3 && this.characters.length > 0) {
      // 3
      const randomChar = random(this.characters);
      if (!randomChar) return;

      this.textGraphic.textSize(randomChar.size);
      const charWidth = this.textGraphic.textWidth(randomChar.char);
      const pointX = randomChar.x + charWidth / 2;
      const pointY = randomChar.y + randomChar.size / 2;

      this.connectionPoints.push(createVector(pointX, pointY));

      if (this.connectionPoints.length > this.maxPoints) {
        this.connectionPoints.shift();
      }
    }

    this.textGraphic.clear();

    if (this.connectionPoints.length > 1) {
      this.textGraphic.strokeWeight(1);
      this.textGraphic.stroke(0, 0, 100, 30); // 100, 30
      this.textGraphic.noFill();
      this.textGraphic.beginShape();
      for (let p of this.connectionPoints) {
        this.textGraphic.vertex(p.x, p.y);
      }
      this.textGraphic.endShape();
    }

    this.textGraphic.noStroke();
    for (let p of this.connectionPoints) {
      const pointColor = palette[1 % palette.length] || palette[0];
      this.textGraphic.fill(pointColor);
      this.textGraphic.ellipse(p.x, p.y, 8, 8); // 8, 8
    }

    for (let charObj of this.characters) {
      this.textGraphic.fill(
        charObj.colorHSB[0],
        charObj.colorHSB[1],
        charObj.colorHSB[2],
        100
      );
      this.textGraphic.textSize(charObj.size);
      this.textGraphic.text(charObj.char, charObj.x, charObj.y);
    }

    this.textGraphic.fill(this.currentColor);
    this.textGraphic.textSize(currentDynamicFontSize);
    if (frameCount % 30 < 15) {
      this.textGraphic.text('_', this.currentX, this.currentY);
    }

    push();
    noStroke();
    drawingContext.disable(drawingContext.DEPTH_TEST);
    texture(this.textGraphic);
    plane(width, height);
    drawingContext.enable(drawingContext.DEPTH_TEST);
    pop();
  }
}
