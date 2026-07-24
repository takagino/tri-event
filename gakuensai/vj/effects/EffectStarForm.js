class EffectStarForm {
  constructor() {
    this.mySize = min(width, height) * 0.9;
    this.t = 0;
  }

  draw(spectrum, palette, audioLevels) {
    if (!palette || palette.length === 0) {
      palette = [color(255)];
    }

    const rotationSpeed = map(audioLevels.volume, 50, 100, 0.001, 0.0001, true); // 50, 100
    const globalScale = map(audioLevels.mid, 70, 120, 0.6, 1.0, true); // 70, 120
    const pointSize = map(audioLevels.bass, 100, 150, 5, 15, true); // 100, 150

    push();
    scale(globalScale);
    translate(0, 0, -this.mySize * 1.5);
    rotateX(PI / 2 + this.t * 3);
    rotateY(frameCount * rotationSpeed);

    let layers = 10;
    let rings = 64;
    noStroke();

    for (let yIdx = 0; yIdx < layers; yIdx++) {
      let yNorm = map(yIdx, 0, layers - 1, -1, 1, true);
      let y = yNorm * this.mySize * 1.2;

      for (let r = 0; r < rings; r++) {
        let angle = map(r, 0, rings, 0, TWO_PI, true);

        let radius = this._starProfile(
          yNorm,
          angle,
          audioLevels.mid,
          audioLevels.high
        );

        let x = radius * cos(angle);
        let z = radius * sin(angle);

        push();
        translate(x, y, z);

        const colorIndex =
          floor(
            map(r, 0, rings, 0, palette.length) +
              map(audioLevels.high, 70, 120, 0, palette.length / 2, true) // 70, 120
          ) % palette.length;
        const pointColor = palette[colorIndex % palette.length];

        let finalColor = color(
          hue(pointColor),
          saturation(pointColor),
          brightness(pointColor)
        );
        finalColor.setAlpha(90 * 2.55); // 90
        fill(finalColor);

        sphere(pointSize);
        pop();
      }
    }
    pop();

    this.t += 0.001; // 0.0003
  }

  _starProfile(yNorm, angle, midLevel, highLevel) {
    const numPoints = 5; // 5
    const sharpness = map(highLevel, 70, 120, 0.5, 0.9, true); // 70, 120

    let starMultiplier = map(sin(angle * numPoints), -1, 1, sharpness, 1.0);

    const bulge = map(midLevel, 70, 120, 0.7, 1.2, true); // 70, 120
    let vaseRadius =
      this.mySize * 0.7 * sin((PI * (yNorm + 1)) / 2) * bulge +
      this.mySize * 0.1 * cos(3 * PI * yNorm) +
      this.mySize * 0.1;

    return vaseRadius * starMultiplier;
  }
}
