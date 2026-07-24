class EffectBars {
  constructor() {}

  draw(spectrum, palette, audioLevels) {
    if (!palette || palette.length === 0) {
      palette = [color(255)];
    }

    noStroke();

    const halfLength = spectrum.length / 2;

    for (let i = 0; i < halfLength; i++) {
      const h = map(spectrum[i], 0, 255, 0, height * 1.5, true); // 0, height * 1.5
      const w = width / 2 / halfLength;
      const alpha = map(spectrum[i], 0, 200, 10, 90, true); // 0, 90

      const colorPos = i / halfLength;
      const colorLerp = colorPos * (palette.length - 1);
      const index1 = floor(colorLerp);
      const index2 = ceil(colorLerp);
      const lerpAmt = colorLerp - index1;

      const barColor = lerpColor(
        palette[index1 % palette.length],
        palette[index2 % palette.length],
        lerpAmt
      );

      barColor.setAlpha(alpha * 2.55);

      const x_left = map(i, 0, halfLength, -width / 2, 0, true) + w / 2;
      push();
      translate(x_left, 0, 0);
      fill(barColor);
      rect(-w / 2, -h / 2, w, h);
      pop();

      const x_right = -x_left;
      push();
      translate(x_right, 0, 0);
      fill(barColor);
      rect(-w / 2, -h / 2, w, h);
      pop();
    }
  }
}
