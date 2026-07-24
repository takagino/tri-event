class EffectOrbitingBoxes {
  constructor() {
    this.boxes = [];
    this.numBoxes = 20;
    this.centerPos = createVector(0, 0, 0);
    this.noiseOffsetX = random(1000);
    this.noiseOffsetY = random(2000);
    this.noiseOffsetZ = random(3000);

    for (let i = 0; i < this.numBoxes; i++) {
      this.boxes.push(new OrbitBox(i));
    }
  }

  draw(spectrum, palette, audioLevels) {
    if (!palette || palette.length === 0) {
      palette = [color(255)];
    }

    const moveSpeed = map(audioLevels.volume, 50, 100, 0.0005, 0.001, true); // 50, 100
    this.centerPos.x = map(
      noise(this.noiseOffsetX + frameCount * moveSpeed),
      0,
      1,
      -width / 4,
      width / 4
    );
    this.centerPos.y = map(
      noise(this.noiseOffsetY + frameCount * moveSpeed),
      0,
      1,
      -height / 4,
      height / 4
    );
    this.centerPos.z = map(
      noise(this.noiseOffsetZ + frameCount * moveSpeed),
      0,
      1,
      -200,
      200
    );

    for (let box of this.boxes) {
      box.update(
        this.centerPos,
        audioLevels.bass,
        audioLevels.mid,
        audioLevels.high
      );
      box.draw(palette);
    }
  }
}

class OrbitBox {
  constructor(id) {
    this.id = id;
    this.pos = createVector(0, 0, 0);
    this.baseRadius = random(height * 0.1, height * 0.4);
    this.angleX = random(TAU);
    this.angleY = random(TAU);
    this.speedX = random(-0.02, 0.02);
    this.speedY = random(-0.02, 0.02);
    this.currentSize = 10;
    this.colorPos = random(1);
  }

  update(centerPos, bassLevel, midLevel, highLevel) {
    const orbitRadius = this.baseRadius + map(midLevel, 70, 120, 0, 100, true); // 70, 120
    const speedMultiplier = map(highLevel, 70, 120, 0.2, 0.6, true); // 70, 120
    this.angleX += this.speedX * speedMultiplier;
    this.angleY += this.speedY * speedMultiplier;
    this.currentSize = map(bassLevel, 100, 150, 5, 40, true); // 100, 150

    this.colorPos = (((this.angleX % TAU) + TAU) % TAU) / TAU;

    this.pos.x =
      centerPos.x + orbitRadius * cos(this.angleX) * sin(this.angleY);
    this.pos.y =
      centerPos.y + orbitRadius * sin(this.angleX) * sin(this.angleY);
    this.pos.z = centerPos.z + orbitRadius * cos(this.angleY);
  }

  draw(palette) {
    push();
    translate(this.pos);

    const colorLerp = constrain(
      map(this.colorPos, 0, 1, 0, palette.length - 1),
      0,
      palette.length - 1
    );
    const index1 = floor(colorLerp);
    const index2 = constrain(ceil(colorLerp), 0, palette.length - 1);
    const lerpAmt = colorLerp - index1;

    let boxColor;
    if (palette[index1] && palette[index2]) {
      boxColor = lerpColor(palette[index1], palette[index2], lerpAmt);
    } else {
      boxColor = palette[0];
    }

    let finalColor = color(
      hue(boxColor),
      saturation(boxColor),
      brightness(boxColor)
    );
    finalColor.setAlpha(80 * 2.55); // 80
    fill(finalColor);
    noStroke();

    box(this.currentSize);
    pop();
  }
}
