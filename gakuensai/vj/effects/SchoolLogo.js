class SchoolLogo {
  constructor() {
    this.basePoints = [];
    this.initialized = false;
    this.colorNoiseOffset = random(1000);
  }

  initPoints() {
    const text = 'TRIDENT';
    const fontSize = 150;
    const sampleFactor = 0.15;

    if (!myFont) {
      console.error('SchoolLogo: myFont is not loaded!');
      return;
    }

    textFont(myFont);

    const points = myFont.textToPoints(text, 0, 0, fontSize, {
      sampleFactor: sampleFactor,
      simplifyThreshold: 0,
    });

    if (points.length === 0) {
      console.error('SchoolLogo: textToPoints() returned 0 points.');
      this.initialized = true;
      return;
    }

    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;
    for (let p of points) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }
    const textWidth = maxX - minX;
    const textHeight = maxY - minY;
    const offsetX = minX + textWidth / 2;
    const offsetY = minY + textHeight / 2;

    for (let p of points) {
      this.basePoints.push(createVector(p.x - offsetX, p.y - offsetY, 0));
    }

    this.initialized = true;
  }

  draw(spectrum, palette, audioLevels) {
    if (!myFont) {
      return;
    }
    textFont(myFont);
    if (!this.initialized) {
      this.initPoints();
    }
    if (this.basePoints.length === 0) {
      return;
    }
    if (!palette || palette.length === 0) {
      palette = [color(255)];
    }

    noStroke();

    const zDepth = map(audioLevels.bass, 100, 150, 100, 250, true); // 100, 150 -> 100, 250
    const particleSize = map(audioLevels.mid, 70, 120, 4, 8, true); // 70, 120 -> 4, 8
    const noiseSpeed =
      frameCount * 0.005 + map(audioLevels.high, 70, 120, 0.0001, 0.0005, true); // 70, 120
    const overallScale = map(audioLevels.volume, 50, 100, 1, 1.8, true); // 50, 100

    push();
    scale(overallScale);

    for (let i = 0; i < this.basePoints.length; i++) {
      const p = this.basePoints[i];
      const z = map(
        noise(p.x * 0.01, p.y * 0.01 + noiseSpeed),
        0,
        1,
        -zDepth,
        zDepth
      );

      push();
      translate(p.x, p.y, z);

      const colorPos = map(
        p.x,
        -width / 2,
        width / 2,
        0,
        palette.length - 1,
        true
      );
      const index1 = floor(colorPos);
      const index2 = constrain(ceil(colorPos), 0, palette.length - 1);
      const lerpAmt = colorPos - index1;

      let pColor;
      if (palette[index1] && palette[index2]) {
        pColor = lerpColor(
          palette[index1 % palette.length],
          palette[index2],
          lerpAmt
        );
      } else {
        pColor = palette[0];
      }

      let materialColor = color(
        hue(pColor),
        saturation(pColor),
        brightness(pColor) * 0.8
      );
      materialColor.setAlpha(80 * 2.55);

      fill(materialColor);
      sphere(particleSize);
      pop();
    }

    pop();
  }
}
