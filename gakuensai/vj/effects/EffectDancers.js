class EffectDancers {
  constructor() {
    this.dancers = [];
    for (let i = 0; i < 18; i++) {
      this.dancers.push(new Dancer());
    }
  }

  draw(spectrum, palette, audioLevels) {
    if (!palette || palette.length === 0) {
      palette = [color(255)];
    }

    for (let dancer of this.dancers) {
      dancer.update(audioLevels.bass, audioLevels.high);
      dancer.draw(palette, audioLevels.high);
    }
  }
}

class Dancer {
  constructor() {
    this.pos = createVector(
      random(-width / 2, width / 2),
      random(-height / 2, height / 2),
      random(-200, 200)
    );
    this.baseSize = random(10, 50);
    this.currentSize = this.baseSize;
    this.armAngle = 0;
    this.baseHue = random(360);
  }

  update(bass, high) {
    this.currentSize = this.baseSize + map(bass, 100, 150, 0, 50, true); // 100, 150
    const upwardSpeed = map(bass, 100, 150, 0.5, 2, true); // 100, 150
    this.pos.y -= upwardSpeed;

    this.armAngle = map(high, 70, 120, -PI / 3, PI / 3, true); // 70, 120

    this.pos.x += random(-1, 1);
    if (this.pos.y < -height / 2) {
      this.pos.y = height / 2;
    }
    if (this.pos.x < -width / 2) {
      this.pos.x = width / 2;
    }
    if (this.pos.x > width / 2) {
      this.pos.x = -width / 2;
    }
  }

  draw(palette, highLevel) {
    push();
    translate(this.pos);

    const colorPos = map(highLevel, 70, 120, 0, palette.length - 1, true); // 70, 120
    const index1 = floor(constrain(colorPos, 0, palette.length - 1));
    const index2 = constrain(ceil(colorPos), 0, palette.length - 1);
    const lerpAmt = colorPos - index1;

    let baseColor;
    if (palette[index1] && palette[index2]) {
      baseColor = lerpColor(palette[index1], palette[index2], lerpAmt);
    } else {
      baseColor = palette[0];
    }

    const currentHue =
      (hue(baseColor) + map(highLevel, 70, 120, -20, 20, true)) % 360; // 70, 120

    const bodySize = this.currentSize * 0.8;

    let bodyColor = color(
      currentHue,
      saturation(baseColor),
      brightness(baseColor)
    );
    bodyColor.setAlpha(200);
    fill(bodyColor);
    noStroke();
    sphere(bodySize);

    push();
    translate(0, 0, bodySize);
    fill(230, 230, 240); // RGB (Almost white)
    push();
    translate(-this.currentSize * 0.3, 0, 0);
    sphere(7);
    pop();
    push();
    translate(this.currentSize * 0.3, 0, 0);
    sphere(7);
    pop();
    pop();

    stroke(bodyColor);
    strokeWeight(8);

    const armLength = this.currentSize * 0.7;

    const endX_R = bodySize + armLength * cos(this.armAngle);
    const endY_R = armLength * sin(this.armAngle);

    const endX_L = -bodySize - armLength * cos(this.armAngle);
    const endY_L = armLength * sin(this.armAngle);

    line(bodySize, 0, 0, endX_R, endY_R, 0);
    line(-bodySize, 0, 0, endX_L, endY_L, 0);

    pop();
  }
}
