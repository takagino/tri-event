class EffectGridMovers {
  constructor() {
    this.gridCount = 30;
    this.movers = [];
    this.shapes = [];

    const cellW = width / this.gridCount;

    for (let i = 0; i < this.gridCount; i++) {
      for (let j = 0; j < this.gridCount; j++) {
        const cellX =
          map(j, 0, this.gridCount, -width / 2, width / 2) + cellW / 2;
        const cellY =
          map(i, 0, this.gridCount, -height / 2, height / 2) + cellW / 2;
        this.shapes.push({ x: cellX, y: cellY, w: cellW });
      }
    }

    for (let i = 0; i < this.gridCount; i++) {
      for (let j = 0; j < this.gridCount; j++) {
        const cellX =
          map(j, 0, this.gridCount, -width / 2, width / 2) + cellW / 2;
        const cellY =
          map(i, 0, this.gridCount, -height / 2, height / 2) + cellW / 2;
        if (random() > 0.6) {
          this.movers.push(new Mover(cellX, cellY, cellW));
        }
      }
    }
  }

  draw(spectrum, palette, audioLevels) {
    if (!palette || palette.length === 0) {
      palette = [color(255)];
    }

    noStroke();

    let gridDotColor = color(255, 255, 255);
    gridDotColor.setAlpha(10 * 2.55); // 10
    fill(gridDotColor);

    for (let i of this.shapes) {
      push();
      translate(i.x, i.y, -50);
      sphere(i.w * 0.03);
      pop();
    }

    for (let i of this.movers) {
      i.run(audioLevels.volume, audioLevels.bass, audioLevels.high, palette);
    }
  }
}

class Mover {
  constructor(x, y, d) {
    this.pos = createVector(x, y, 0);
    this.d = d;
    this.circleD = this.d * 0.2;
    this.thickness = 10;
    this.restTime = int(random(300));
    this.timings = [0, 8, 16, 24, 32];
    this.currentPos1 = this.pos.copy();
    this.currentPos2 = this.pos.copy();
    this.targetPos = this.pos.copy();
    this.originPos = this.pos.copy();
    this.timer = 0;
    this.init();
  }

  run(avgVolume, bassLevel, highLevel, palette) {
    this.update(avgVolume, bassLevel);
    this.show(palette, highLevel);
  }

  update(avgVolume, bassLevel) {
    const speedMultiplier = map(avgVolume, 50, 100, 0.5, 2.0, true); // 50, 100
    this.timer += speedMultiplier;
    this.thickness = map(bassLevel, 100, 150, 1, this.d * 0.2, true); // 100, 150

    if (this.timings[0] < this.timer && this.timer < this.timings[3]) {
      let nrm = norm(this.timer, this.timings[0], this.timings[3] - 1);
      this.currentPos1 = p5.Vector.lerp(
        this.originPos,
        this.targetPos,
        easeInOutQuint(nrm)
      );
    }
    if (this.timings[1] < this.timer && this.timer < this.timings[4]) {
      let nrm = norm(this.timer, this.timings[1], this.timings[4] - 1);
      this.currentPos2 = p5.Vector.lerp(
        this.originPos,
        this.targetPos,
        easeInOutQuint(nrm)
      );
    }
    if (this.timings[4] < this.timer) {
      this.init();
    }
  }

  show(palette, highLevel) {
    push();

    let centerPos = p5.Vector.lerp(this.currentPos1, this.currentPos2, 0.5);
    translate(centerPos);

    let direction = p5.Vector.sub(this.currentPos2, this.currentPos1);
    if (direction.magSq() > 0.01) {
      let angleY = atan2(direction.x, direction.z);
      let magXZ = createVector(direction.x, 0, direction.z).mag();
      let angleX = atan2(direction.y, magXZ);
      rotateY(angleY);
      rotateX(-angleX);
    }

    const colorIndex = floor(
      map(highLevel, 70, 120, 0, palette.length - 1, true)
    ); // 70, 120
    const moverColor = palette[colorIndex % palette.length];

    noStroke();

    let finalColor = color(
      hue(moverColor),
      saturation(moverColor),
      brightness(moverColor)
    );
    finalColor.setAlpha(60 * 2.55); // 80
    fill(finalColor);

    box(this.thickness, this.thickness, direction.mag());

    pop();
  }

  init() {
    this.timer = 0;
    this.originPos = this.currentPos2.copy();
    this.currentPos1 = this.originPos.copy();
    this.currentPos2 = this.originPos.copy();

    let r = floor(random(1, 4)) * this.d;
    let newTargetPos;

    let attempts = 0;
    do {
      let directionAngle = random([0, HALF_PI, PI, PI + HALF_PI]);
      newTargetPos = createVector(
        this.originPos.x + r * cos(directionAngle),
        this.originPos.y + r * sin(directionAngle),
        this.originPos.z
      );
      attempts++;
    } while (
      (abs(newTargetPos.x) > width / 2 || abs(newTargetPos.y) > height / 2) &&
      attempts < 10
    );

    if (abs(newTargetPos.x) > width / 2 || abs(newTargetPos.y) > height / 2) {
      this.targetPos = this.originPos.copy();
    } else {
      this.targetPos = newTargetPos;
    }

    this.timer = -this.restTime;
  }
}

function easeInOutQuint(x) {
  return x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2;
}
