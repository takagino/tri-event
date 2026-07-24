class EffectRotatingCircles {
  constructor() {
    this.num = 8;
    this.rotX = [];
    this.rotY = [];
    this.rotZ = [];
    for (let i = 0; i < this.num; i++) {
      this.rotX.push(float(random(-2, 2)));
      this.rotY.push(float(random(-2, 2)));
      this.rotZ.push(float(random(-2, 2)));
    }
  }

  draw(spectrum, palette, audioLevels) {
    if (!palette || palette.length === 0) {
      palette = [color(255)];
    }

    noFill();

    const speedMultiplier = map(audioLevels.volume, 50, 100, 0.5, 2.0, true); // 50, 100
    const sizePulse = map(audioLevels.mid, 70, 120, 0, width / 4, true); // 70, 120

    for (let i = 0; i < this.num; i++) {
      push();

      rotateX(((frameCount * this.rotX[i]) / 100) * speedMultiplier);
      rotateY(((frameCount * this.rotY[i]) / 100) * speedMultiplier);
      rotateZ(((frameCount * this.rotZ[i]) / 100) * speedMultiplier);

      strokeWeight(map(audioLevels.bass, 100, 150, 1, 8, true)); // 100, 150

      const circleColor = palette[i % palette.length];

      let strokeColor = color(
        hue(circleColor),
        saturation(circleColor),
        brightness(circleColor)
      );
      strokeColor.setAlpha(90 * 2.55); // 90
      stroke(strokeColor);

      circle(0, 0, (width * i) / this.num + sizePulse);

      pop();
    }
  }
}
