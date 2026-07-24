class EffectEqualizerGrid {
  constructor() {
    this.cols = 32;
    this.rows = 18;
  }

  draw(spectrum, palette, audioLevels) {
    if (!palette || palette.length === 0) {
      palette = [color(255)];
    }

    noStroke();

    const cellWidth = width / this.cols;
    const cellHeight = height / this.rows;

    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const distFromCenter = abs(x - this.cols / 2) / (this.cols / 2);
        const spectrumIndex = floor(
          map(distFromCenter, 0, 1, 0, spectrum.length)
        );
        const level = spectrum[spectrumIndex] || 0;

        const px = map(x, 0, this.cols, -width / 2, width / 2) + cellWidth / 2;
        const py =
          map(y, 0, this.rows, -height / 2, height / 2) + cellHeight / 2;

        push();
        translate(px, py, 0);
        scale(0.8);

        // ★ audioLevels.mid ではなく、元の level を使用
        const size = map(level, 0, 255, 0, cellWidth * 1.2, true); // 0, 255 -> 0, cellWidth * 1.5

        const colorIndex = floor(
          map(spectrumIndex, 0, spectrum.length, 0, palette.length)
        );
        const cellColor = palette[colorIndex % palette.length];

        // ★ audioLevels.high ではなく、元の level を使用
        const brightness = map(level, 0, 255, 20, 100, true); // 0, 255 -> 20, 100
        // ★ audioLevels.volume ではなく、元の level を使用
        const alpha = map(level, 0, 255, 30, 90, true); // 0, 255 -> 30, 90

        let finalColor = color(
          hue(cellColor),
          saturation(cellColor),
          brightness
        );
        finalColor.setAlpha(alpha * 2.55);

        fill(finalColor);

        box(size);

        pop();
      }
    }
  }
}
