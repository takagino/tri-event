class EffectSnake {
  constructor() {
    this.snakes = [];
    this.numSnakes = 10;

    for (let i = 0; i < this.numSnakes; i++) {
      this.snakes.push(new Snake());
    }
  }

  draw(spectrum, palette, audioLevels) {
    if (!palette || palette.length === 0) {
      palette = [color(255)];
    }

    for (let snake of this.snakes) {
      snake.update(
        audioLevels.volume,
        audioLevels.bass,
        audioLevels.mid,
        audioLevels.high
      );
      snake.draw(palette);
    }
  }
}

class Snake {
  constructor() {
    this.pos = p5.Vector.random3D().mult(width / 4);
    this.vel = p5.Vector.random3D().setMag(2);
    this.acc = createVector(0, 0, 0);
    this.history = [];
    this.maxForce = 0.1;

    this.noiseOffsetX = random(1000);
    this.noiseOffsetY = random(2000);
    this.noiseOffsetZ = random(3000);

    this.midLevel = 0;
    this.highLevel = 0;
  }

  update(avgVolume, bassLevel, midLevel, highLevel) {
    const moveSpeed = map(avgVolume, 50, 100, 0.005, 0.03, true); // 50, 100
    const maxSpeed = map(avgVolume, 50, 100, 2, 8, true); // 50, 100

    let target = createVector(
      map(
        noise(this.noiseOffsetX + frameCount * moveSpeed),
        0,
        1,
        -width,
        width,
        true
      ),
      map(
        noise(this.noiseOffsetY + frameCount * moveSpeed),
        0,
        1,
        -height,
        height,
        true
      ),
      map(
        noise(this.noiseOffsetZ + frameCount * moveSpeed),
        0,
        1,
        -600,
        600,
        true
      )
    );

    let desired = p5.Vector.sub(target, this.pos);
    desired.setMag(maxSpeed);
    let steer = p5.Vector.sub(desired, this.vel);
    steer.limit(this.maxForce);
    this.acc.add(steer);

    this.vel.add(this.acc);
    this.vel.limit(maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);

    this.history.push(this.pos.copy());
    const maxLength = floor(map(bassLevel, 100, 150, 15, 60, true)); // 100, 150

    if (this.history.length > maxLength) {
      this.history.splice(0, 1);
    }

    this.midLevel = midLevel;
    this.highLevel = highLevel;
  }

  draw(palette) {
    noStroke();

    for (let i = 0; i < this.history.length; i++) {
      const pos = this.history[i];

      const size =
        map(i, 0, this.history.length, 1, 3, true) * // 1, 3
        map(this.midLevel, 70, 120, 0.5, 10.0, true); // 70, 120

      const colorPos =
        (i / this.history.length + map(this.highLevel, 70, 120, 0, 1.5, true)) %
        1.0; // 70, 120
      const colorLerp = colorPos * (palette.length - 1);
      const index1 = floor(colorLerp);
      const index2 = constrain(ceil(colorLerp), 0, palette.length - 1);
      const lerpAmt = colorLerp - index1;

      let segmentColor;
      if (palette[index1] && palette[index2]) {
        segmentColor = lerpColor(palette[index1], palette[index2], lerpAmt);
      } else {
        segmentColor = palette[0];
      }

      const alpha = map(i, 0, this.history.length, 40, 100, true); // 40, 100

      let finalColor = color(
        hue(segmentColor),
        saturation(segmentColor) * 0.8, // 0.8
        brightness(segmentColor) * 0.6 // 0.6
      );
      finalColor.setAlpha(alpha * 2.55);

      push();
      translate(pos);
      fill(finalColor);
      sphere(size);
      pop();
    }
  }
}
