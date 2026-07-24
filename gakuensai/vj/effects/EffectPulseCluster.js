class EffectPulseCluster {
  constructor() {
    this.spheres = [];
    const numSpheres = 200;
    const clusterRadius = height / 5;

    for (let i = 0; i < numSpheres; i++) {
      const pos = p5.Vector.random3D().mult(random(clusterRadius));
      this.spheres.push({ pos: pos });
    }
  }

  draw(spectrum, palette, audioLevels) {
    if (!palette || palette.length === 0) {
      palette = [color(255)];
    }

    push();

    const rotSpeedX = map(audioLevels.volume, 50, 100, 0.001, 0.003, true); // 50, 100
    const rotSpeedY = map(audioLevels.mid, 70, 120, 0.001, 0.003, true); // 70, 120

    rotateX(frameCount * rotSpeedX);
    rotateY(frameCount * rotSpeedY);

    const zWobble = map(audioLevels.mid, 70, 120, -200, 200, true); // 70, 120

    for (let sphereData of this.spheres) {
      const finalPos = sphereData.pos.copy().add(0, 0, zWobble);

      push();
      translate(finalPos);

      const colorPos =
        (map(audioLevels.high, 70, 120, 0, palette.length, true) + // 70, 120
          map(
            sphereData.pos.y,
            -height / 3,
            height / 3,
            0,
            palette.length / 2,
            true
          )) %
        palette.length;

      const index1 = floor(colorPos);
      const index2 = (index1 + 1) % palette.length;
      const lerpAmt = colorPos - index1;

      let sphereColor;
      if (palette[index1] && palette[index2]) {
        sphereColor = lerpColor(palette[index1], palette[index2], lerpAmt);
      } else {
        sphereColor = palette[0];
      }

      const flash = map(audioLevels.high, 70, 120, 0, 40, true); // 70, 120
      const finalBrightness = constrain(60 + flash, 0, 100); // 60

      let finalColor = color(
        hue(sphereColor),
        saturation(sphereColor),
        finalBrightness
      );
      finalColor.setAlpha(200); // 200
      fill(finalColor);
      noStroke();

      const baseSize = 5;
      const pulse = map(audioLevels.bass, 100, 150, 2, 15, true); // 100, 150

      sphere(baseSize * pulse);
      pop();
    }

    pop();
  }
}
