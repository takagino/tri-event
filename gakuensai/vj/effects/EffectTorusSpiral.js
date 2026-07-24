class EffectTorusSpiral {
  constructor() {
    this.particles = [];
    this.numParticles = 300;
    this.t = 0;

    for (let i = 0; i < this.numParticles; i++) {
      this.particles.push({
        u: random(TAU),
        v: random(TAU),
      });
    }
  }

  draw(spectrum, palette, audioLevels) {
    if (!palette || palette.length === 0) {
      palette = [color(255)];
    }

    noStroke();

    const R = map(audioLevels.bass, 100, 150, height * 0.2, height * 0.4, true); // 100, 150
    const r = map(audioLevels.mid, 70, 120, height * 0.02, height * 0.2, true); // 70, 120
    const particleSize = map(audioLevels.high, 70, 120, 0.4, 2, true); // 70, 120
    const rotationSpeed = map(audioLevels.volume, 50, 100, 0.0001, 0.001, true); // 50, 100
    this.t += map(audioLevels.volume, 50, 100, 0.01, 0.05, true); // 50, 100

    push();
    rotateX(frameCount * rotationSpeed * 0.3 + PI / 3);
    rotateZ(frameCount * rotationSpeed * 0.05);

    for (let i = 0; i < this.numParticles; i++) {
      let p = this.particles[i];

      const u = p.u;
      const v = (p.v + this.t) % TAU;

      const x = (R + r * cos(v)) * cos(u);
      const y = (R + r * cos(v)) * sin(u);
      const z = r * sin(v);

      push();
      translate(x, y, z);

      rotateY(u);
      rotateX(v + PI / 2);

      const colorPos = map(v, 0, TAU, 0, palette.length - 1);
      const index1 = floor(colorPos);
      const index2 = constrain(ceil(colorPos), 0, palette.length - 1);
      const lerpAmt = colorPos - index1;

      let particleColor;
      if (palette[index1] && palette[index2]) {
        particleColor = lerpColor(palette[index1], palette[index2], lerpAmt);
      } else {
        particleColor = palette[0];
      }
      particleColor.setAlpha(80 * 2.55);

      fill(particleColor);

      torus(particleSize * 8, particleSize * 4); // 10, 5

      pop();
    }
    pop();
  }
}
