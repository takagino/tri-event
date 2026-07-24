class EffectFloaters {
  constructor() {
    this.floaters = [];
    this.numFloaters = 6;

    for (let i = 0; i < this.numFloaters; i++) {
      this.floaters.push(new Floater());
    }
  }

  draw(spectrum, palette, audioLevels) {
    if (!palette || palette.length === 0) {
      palette = [color(255)];
    }

    for (let floater of this.floaters) {
      floater.update(
        audioLevels.volume,
        audioLevels.bass,
        audioLevels.mid,
        audioLevels.high
      );
      floater.draw(palette);
    }
  }
}

class Floater {
  constructor() {
    this.pos = createVector(
      random(-width / 2, width / 2),
      random(-height / 2, height / 2),
      random(-300, 300)
    );
    this.vel = createVector(0, 0, 0);
    this.acc = createVector(0, 0, 0);
    this.maxSpeed = 1.0;
    this.maxForce = 0.03;
    this.baseSize = random(5, 20);

    this.noiseOffsetX = random(1000);
    this.noiseOffsetY = random(2000);
    this.noiseOffsetZ = random(3000);

    this.currentSize = this.baseSize;
    this.currentColor = color(255);
    this.tentacleLength = 0;
    this.numTentacles = floor(random(6, 8));
    this.tentacleOffsets = [];
    for (let i = 0; i < this.numTentacles; i++) {
      this.tentacleOffsets.push({
        end_x: random(1000),
        end_z: random(2000),
        mid_x: random(3000),
        mid_z: random(4000),
      });
    }
  }

  update(avgVolume, bassLevel, midLevel, highLevel) {
    const moveSpeed = map(avgVolume, 50, 100, 0.0005, 0.002, true); // 50, 100
    let target = createVector(
      map(
        noise(this.noiseOffsetX + frameCount * moveSpeed),
        0,
        1,
        -width / 2,
        width / 2,
        true
      ),
      map(
        noise(this.noiseOffsetY + frameCount * moveSpeed),
        0,
        1,
        -height / 2,
        height / 2,
        true
      ),
      map(
        noise(this.noiseOffsetZ + frameCount * moveSpeed),
        0,
        1,
        -300,
        300,
        true
      )
    );

    let desired = p5.Vector.sub(target, this.pos);
    desired.setMag(this.maxSpeed);
    let steer = p5.Vector.sub(desired, this.vel);
    steer.limit(this.maxForce);
    this.acc.add(steer);

    const jumpForce = map(bassLevel, 100, 150, 0, 0.3, true); // 100, 150
    this.acc.add(0, jumpForce, 0);

    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);

    this.currentSize = this.baseSize + map(midLevel, 70, 120, 0, 50, true); // 70, 120
    this.tentacleLength = map(
      highLevel,
      70,
      120,
      this.currentSize * 2.0,
      this.currentSize * 6.0,
      true // 70, 120
    );

    const bottomEdge = height / 2 + this.tentacleLength;
    const topEdge = -height / 2 - this.currentSize;
    if (this.pos.y > bottomEdge) {
      this.pos.y = topEdge;
      this.pos.x = random(-width / 2, width / 2);
      this.pos.z = random(-300, 300);
      this.vel.mult(0);
      this.acc.mult(0);
    }
  }

  draw(palette) {
    push();
    translate(this.pos);

    const colorPos = map(
      this.pos.y,
      -height / 2,
      height / 2,
      0,
      palette.length - 1,
      true
    );
    const index1 = floor(colorPos);
    const index2 = constrain(ceil(colorPos), 0, palette.length - 1);
    const lerpAmt = colorPos - index1;

    let baseColor;
    if (palette[index1] && palette[index2]) {
      baseColor = lerpColor(palette[index1], palette[index2], lerpAmt);
    } else {
      baseColor = palette[0];
    }

    noStroke();
    baseColor.setAlpha(200);
    fill(baseColor);
    const bodyRadiusX = this.currentSize * 1.2;
    const bodyRadiusY = this.currentSize * 0.8;
    const bodyRadiusZ = this.currentSize * 1.2;
    ellipsoid(bodyRadiusX, bodyRadiusY, bodyRadiusZ);

    strokeWeight(4);
    let tentacleColor = color(
      hue(baseColor),
      saturation(baseColor),
      brightness(baseColor)
    );
    tentacleColor.setAlpha(180);
    stroke(tentacleColor);
    noFill();

    for (let i = 0; i < this.numTentacles; i++) {
      const noiseSpeed = 0.005;
      const offsets = this.tentacleOffsets[i];

      const startY = bodyRadiusY / 2;
      const startX = map(
        noise(offsets.end_x),
        0,
        1,
        -this.currentSize * 0.3,
        this.currentSize * 0.3,
        true
      );
      const startZ = map(
        noise(offsets.end_z),
        0,
        1,
        -this.currentSize * 0.3,
        this.currentSize * 0.3,
        true
      );

      const endY = startY + this.tentacleLength;
      const endX =
        startX +
        map(
          noise(frameCount * noiseSpeed + offsets.end_x),
          0,
          1,
          -this.currentSize * 2,
          this.currentSize * 2,
          true
        );
      const endZ =
        startZ +
        map(
          noise(frameCount * noiseSpeed + offsets.end_z),
          0,
          1,
          -this.currentSize * 2,
          this.currentSize * 2,
          true
        );

      const midY = lerp(startY, endY, 0.5);
      const midWiggle = this.currentSize * 1.5;
      const midX =
        lerp(startX, endX, 0.5) +
        map(
          noise(frameCount * noiseSpeed * 2 + offsets.mid_x),
          0,
          1,
          -midWiggle,
          midWiggle,
          true
        );
      const midZ =
        lerp(startZ, endZ, 0.5) +
        map(
          noise(frameCount * noiseSpeed * 2 + offsets.mid_z),
          0,
          1,
          -midWiggle,
          midWiggle,
          true
        );

      beginShape();
      curveVertex(startX, startY, startZ);
      curveVertex(startX, startY, startZ);
      curveVertex(midX, midY, midZ);
      curveVertex(endX, endY, endZ);
      curveVertex(endX, endY, endZ);
      endShape();
    }

    pop();
  }
}
