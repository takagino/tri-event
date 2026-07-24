class EffectWaveformCircular {
  constructor() {
    this.phase = 0;
    this.rotationX = 0;
    this.rotationY = 0;
    this.rotationZ = 0;
  }

  draw(spectrum, palette, audioLevels) {
    if (!palette || palette.length === 0) {
      palette = [color(255)];
    }

    noFill();
    strokeWeight(map(audioLevels.volume, 50, 100, 3, 20, true)); // 10

    const phaseSpeed = map(audioLevels.volume, 50, 100, 0, 0.05, true); // 50, 100
    this.phase += phaseSpeed;

    const speedX = map(audioLevels.bass, 100, 150, 0, 0.02, true); // 100, 150
    const speedY = map(audioLevels.mid, 70, 120, 0, 0.03, true); // 70, 120
    const speedZ = map(audioLevels.high, 70, 120, 0, 0.04, true); // 70, 120

    this.rotationX += speedX;
    this.rotationY += speedY;
    this.rotationZ += speedZ;

    this.drawRing(
      spectrum.slice(0, 80),
      audioLevels.bass,
      100, // 100
      150, // 150
      { x: this.rotationX, y: this.rotationY },
      palette
    );
    this.drawRing(
      spectrum.slice(80, 160),
      audioLevels.mid,
      70, // 70
      120, // 120
      { y: this.rotationY, z: this.rotationZ },
      palette
    );
    this.drawRing(
      spectrum.slice(160),
      audioLevels.high,
      70, // 70
      120, // 120
      { z: this.rotationZ, x: -this.rotationX },
      palette
    );
  }

  drawRing(bandSpectrum, overallLevel, minIn, maxIn, rotation, palette) {
    const baseRadius = map(
      overallLevel,
      minIn,
      maxIn,
      height / 5,
      height / 2.5,
      true
    );
    const vertices = 30;

    push();
    if (rotation.x) rotateX(rotation.x);
    if (rotation.y) rotateY(rotation.y);
    if (rotation.z) rotateZ(rotation.z);
    translate(0, 0, map(overallLevel, minIn, maxIn, -100, 100, true));

    beginShape();
    for (let i = 0; i < vertices; i++) {
      const angle = map(i, 0, vertices, 0, TWO_PI) + this.phase;
      const spectrumIndex = floor(map(i, 0, vertices, 0, bandSpectrum.length));
      const level = bandSpectrum[spectrumIndex] || 0;
      const radius = baseRadius + map(level, 0, 255, -150, 150, true); // 0, 255
      const x = radius * cos(angle);
      const y = radius * sin(angle);

      const colorPos = i / vertices;
      const colorLerp = colorPos * (palette.length - 1);
      const index1 = floor(colorLerp);
      const index2 = ceil(colorLerp);
      const lerpAmt = colorLerp - index1;

      let ringColor;
      if (palette[index1] && palette[index2]) {
        ringColor = lerpColor(
          palette[index1 % palette.length],
          palette[index2 % palette.length],
          lerpAmt
        );
      } else {
        ringColor = palette[0];
      }

      let strokeColor = color(
        hue(ringColor),
        saturation(ringColor),
        brightness(ringColor)
      );
      strokeColor.setAlpha(90 * 2.55); // 90
      stroke(strokeColor);

      curveVertex(x, y);
    }

    let firstIndex = 0;
    let firstAngle = map(firstIndex, 0, vertices, 0, TWO_PI) + this.phase;
    let firstSpectrumIndex = floor(
      map(firstIndex, 0, vertices, 0, bandSpectrum.length)
    );
    let firstLevel = bandSpectrum[firstSpectrumIndex] || 0;
    let firstRadius = baseRadius + map(firstLevel, 0, 255, -150, 150, true); // 0, 255
    let firstX = firstRadius * cos(firstAngle);
    let firstY = firstRadius * sin(firstAngle);
    curveVertex(firstX, firstY);

    let secondIndex = 1;
    let secondAngle = map(secondIndex, 0, vertices, 0, TWO_PI) + this.phase;
    let secondSpectrumIndex = floor(
      map(secondIndex, 0, vertices, 0, bandSpectrum.length)
    );
    let secondLevel = bandSpectrum[secondSpectrumIndex] || 0;
    let secondRadius = baseRadius + map(secondLevel, 0, 255, -150, 150, true); // 0, 255
    let secondX = secondRadius * cos(secondAngle);
    let secondY = secondRadius * sin(secondAngle);
    curveVertex(secondX, secondY);

    endShape();
    pop();
  }
}
