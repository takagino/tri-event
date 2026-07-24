class EffectTunnel {
  constructor() {
    this.stars = [];
    this.numStars = 400; // 400

    this.targetOffsetX = 0;
    this.targetOffsetY = 0;
    this.noiseOffsetX_target = random(1000);
    this.noiseOffsetY_target = random(2000);
  }

  init() {
    this.stars = [];
    for (let i = 0; i < this.numStars; i++) {
      const initialOffsetX = map(
        noise(this.noiseOffsetX_target),
        0,
        1,
        -width / 3,
        width / 3,
        true
      );
      const initialOffsetY = map(
        noise(this.noiseOffsetY_target),
        0,
        1,
        -height / 3,
        height / 3,
        true
      );
      this.stars[i] = {
        x: random(-width, width) + initialOffsetX,
        y: random(-height, height) + initialOffsetY,
        z: random(width * 0.5, width * 1.5),
      };
    }
  }

  draw(spectrum, palette, audioLevels) {
    if (!palette || palette.length === 0) {
      palette = [color(255)];
    }

    if (this.stars.length === 0) {
      this.init();
    }

    const speed = map(audioLevels.volume, 50, 100, 2, 40, true); // 50, 100

    const targetMoveSpeed = 0.005;
    this.targetOffsetX = map(
      noise(this.noiseOffsetX_target + frameCount * targetMoveSpeed),
      0,
      1,
      -width,
      width,
      true
    );
    this.targetOffsetY = map(
      noise(this.noiseOffsetY_target + frameCount * targetMoveSpeed),
      0,
      1,
      -height,
      height,
      true
    );

    for (let star of this.stars) {
      star.z -= speed;
      if (star.z < 1) {
        star.z = width * 1.5;
        star.x = random(-width, width) + this.targetOffsetX;
        star.y = random(-height, height) + this.targetOffsetY;
      }

      push();
      translate(star.x, star.y, star.z);

      const colorPos = map(star.z, width * 1.5, 1, 0, 1);
      const colorLerp = colorPos * (palette.length - 1);
      const index1 = floor(colorLerp);
      const index2 = ceil(colorLerp);
      const lerpAmt = colorLerp - index1;

      let starColor;
      if (palette[index1] && palette[index2]) {
        starColor = lerpColor(
          palette[index1 % palette.length],
          palette[index2 % palette.length],
          lerpAmt
        );
      } else {
        starColor = palette[0];
      }

      const brightness = map(star.z, 0, width * 1.5, 100, 60, true); // 100, 60
      const alpha = map(star.z, 0, width, 0, 200, true); // 90, 40

      let finalColor = color(hue(starColor), saturation(starColor), brightness);
      finalColor.setAlpha(alpha * 2.55);
      fill(finalColor);

      noStroke();
      const r = map(star.z, 0, width, 1, 40, true); // 15, 1
      sphere(r);

      pop();
    }
  }
}
