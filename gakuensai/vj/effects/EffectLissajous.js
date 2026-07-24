class EffectLissajous {
  constructor() {}

  draw(spectrum, palette, audioLevels) {
    if (!palette || palette.length === 0) {
      palette = [color(50, 100, 100)];
    }

    push();

    const freqX = map(audioLevels.bass, 100, 150, 1, 10, true); // 100, 150
    const freqY = map(audioLevels.mid, 70, 120, 1, 10, true); // 70, 120
    const freqZ = map(audioLevels.high, 70, 120, 1, 10, true); // 70, 120

    const phase = frameCount * 0.01;
    const amp = width / 3;

    const colorIndex = floor(
      map(audioLevels.high, 70, 120, 0, palette.length - 1, true)
    ); // 70, 120
    const curveColor = palette[colorIndex % palette.length];

    stroke(curveColor);
    strokeWeight(3); // 3
    noFill();

    rotateY(frameCount * 0.002);
    rotateX(frameCount * 0.003);

    beginShape();
    for (let t = 0; t < TWO_PI; t += 0.01) {
      const x = sin(t * freqX + phase) * amp;
      const y = sin(t * freqY) * amp;
      const z = sin(t * freqZ) * amp;
      vertex(x, y, z);
    }
    endShape();
    pop();
  }
}
