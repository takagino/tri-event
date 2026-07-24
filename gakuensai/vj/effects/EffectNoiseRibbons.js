class EffectNoiseRibbons {
  constructor() {
    this.numLayers = 10;
    this.noiseScale = 0.005;
    this.layerDepth = 50;
  }

  draw(spectrum, palette, audioLevels) {
    if (!palette || palette.length === 0) {
      palette = [color(255)];
    }

    noStroke();

    const yAmplitude = map(
      audioLevels.mid,
      70,
      120,
      height * 0.1,
      height * 0.4,
      true
    ); // 70, 120
    const ribbonHeight = map(audioLevels.high, 70, 120, 2, 30, true); // 70, 120
    const timeSpeed = map(audioLevels.volume, 50, 100, 0.001, 0.01, true); // 50, 100
    const currentTime = frameCount * timeSpeed;

    push();
    rotateX(0.2); // 0.2
    rotateY(-0.1); // -0.1

    for (let i = 0; i < this.numLayers; i++) {
      const z = map(
        i,
        0,
        this.numLayers - 1,
        (-this.numLayers * this.layerDepth) / 2,
        (this.numLayers * this.layerDepth) / 2
      );

      const colorIndex = floor(
        map(audioLevels.high, 70, 120, 0, palette.length - 1, true) // 70, 120
      );
      const layerColor = palette[colorIndex % palette.length];

      let finalColor = color(
        hue(layerColor),
        saturation(layerColor),
        brightness(layerColor)
      );
      finalColor.setAlpha(90 * 2.55); // 90
      fill(finalColor);

      beginShape(TRIANGLE_STRIP);
      for (let x = -width / 2; x <= width / 2; x += 20) {
        // 20
        const noiseValY = noise(x * this.noiseScale, i * 0.1, currentTime);
        const yMax = yAmplitude * sin(map(x, -width / 2, width / 2, 0, PI));
        const y = map(noiseValY, 0, 1, -yMax, yMax);
        const yTop = y + ribbonHeight / 2;
        const yBottom = y - ribbonHeight / 2;
        vertex(x, yTop, z);
        vertex(x, yBottom, z);
      }
      endShape();
    }
    pop();
  }
}
