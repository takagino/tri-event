class EffectSunburst {
  constructor() {
    this.isAboveThreshold = false;
  }

  draw(spectrum, palette, audioLevels) {
    if (!palette || palette.length === 0) {
      palette = [color(255)];
    }

    const beatThreshold = 1; // 1
    let isBeat = audioLevels.bassImpact > beatThreshold;

    push();
    rotateX(frameCount * 0.002);
    rotateY(frameCount * 0.003);

    const numLines = 128;

    for (let i = 0; i < numLines; i++) {
      const spectrumIndex = floor(map(i, 0, numLines, 0, spectrum.length));
      const level = spectrum[spectrumIndex] || 0;

      const theta = map(i, 0, numLines, 0, TWO_PI);
      const phi = map(i, 0, numLines, 0, PI);
      const baseLen = map(audioLevels.volume, 50, 100, 20, 100, true); // 50, 100
      let currentLen = map(level, 0, 255, baseLen, height * 0.8, true); // 0, 255
      if (isBeat) {
        currentLen *= map(
          audioLevels.bassImpact,
          beatThreshold,
          3.0,
          1.1,
          2.0,
          true
        ); // 1.1, 2.0
      }

      const x = currentLen * sin(phi) * cos(theta);
      const y = currentLen * sin(phi) * sin(theta);
      const z = currentLen * cos(phi);
      const weight = map(level, 0, 255, 1, 12, true); // 0, 255
      const colorPos = i / numLines;
      const colorLerp = colorPos * (palette.length - 1);
      const index1 = floor(colorLerp);
      const index2 = ceil(colorLerp);
      const lerpAmt = colorLerp - index1;

      let lineColor;
      if (palette[index1] && palette[index2]) {
        lineColor = lerpColor(
          palette[index1 % palette.length],
          palette[index2 % palette.length],
          lerpAmt
        );
      } else {
        lineColor = palette[0];
      }

      const brightness = map(level, 0, 200, 60, 100, true); // 0, 200
      const alpha = map(level, 0, 255, 100, 200, true); // 0, 255

      let strokeColor = color(
        hue(lineColor),
        saturation(lineColor),
        brightness
      );
      strokeColor.setAlpha(alpha);
      stroke(strokeColor);
      strokeWeight(weight);
      line(0, 0, 0, x, y, z);
    }
    pop();
  }
}
