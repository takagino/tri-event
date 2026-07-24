class EffectSeaAnemone {
  constructor() {
    this.tentacles = [];
    this.numTentacles = 20;

    for (let i = 0; i < this.numTentacles; i++) {
      this.tentacles.push(new Tentacle(i, this.numTentacles));
    }
  }

  draw(spectrum, palette, audioLevels) {
    if (!palette || palette.length === 0) {
      palette = [color(255)];
    }

    push();
    rotateX(frameCount * 0.001);
    rotateY(frameCount * 0.002);

    for (let tentacle of this.tentacles) {
      tentacle.update(
        audioLevels.volume,
        audioLevels.bass,
        audioLevels.mid,
        audioLevels.high
      );
      tentacle.draw(palette);
    }
    pop();
  }
}

class Tentacle {
  constructor(id, totalTentacles) {
    this.id = id;
    this.totalTentacles = totalTentacles;
    this.baseDir = p5.Vector.random3D().normalize();
    this.baseLength = random(height * 0.2, height * 0.4);
    this.noiseSeed1 = random(1000);
    this.noiseSeed2 = random(2000);
    this.currentLength = this.baseLength;
    this.currentWiggle = 1;
    this.currentSpeed = 0.01;
    this.currentColor = color(255);
    this.currentWeight = 6;
  }

  update(avgVolume, bassLevel, midLevel, highLevel) {
    this.currentLength =
      this.baseLength +
      map(
        bassLevel,
        100,
        150,
        -this.baseLength * 0.3,
        this.baseLength * 0.5,
        true
      ); // 100, 150

    this.currentWiggle = map(midLevel, 70, 120, 10, 80, true); // 70, 120

    this.currentSpeed = map(avgVolume, 50, 100, 0.005, 0.02, true); // 50, 100

    this.currentWeight = map(highLevel, 70, 120, 6, 15, true); // 70, 120
  }

  draw(palette) {
    push();

    const colorPos =
      (this.id / this.totalTentacles + frameCount * this.currentSpeed * 0.1) %
      1.0;
    const colorLerp = colorPos * (palette.length - 1);
    const index1 = floor(colorLerp);
    const index2 = (index1 + 1) % palette.length;
    const lerpAmt = colorLerp - index1;

    let tentacleColor;
    if (palette[index1] && palette[index2]) {
      tentacleColor = lerpColor(palette[index1], palette[index2], lerpAmt);
    } else {
      tentacleColor = palette[0];
    }
    tentacleColor.setAlpha(80 * 2.55);

    strokeWeight(this.currentWeight);
    stroke(tentacleColor);
    noFill();

    const p1 = createVector(0, 0, 0);

    const midRatio = 0.5;
    const p2_base = this.baseDir.copy().mult(this.currentLength * midRatio);
    const p2_wiggleX = map(
      noise(this.noiseSeed1 + frameCount * this.currentSpeed),
      0,
      1,
      -this.currentWiggle,
      this.currentWiggle,
      true
    );
    const p2_wiggleY = map(
      noise(this.noiseSeed2 + frameCount * this.currentSpeed),
      0,
      1,
      -this.currentWiggle,
      this.currentWiggle,
      true
    );
    const p2 = p5.Vector.add(p2_base, createVector(p2_wiggleX, p2_wiggleY, 0));

    const p3_base = this.baseDir.copy().mult(this.currentLength);
    const p3_wiggleX = map(
      noise(this.noiseSeed1 * 2 + frameCount * this.currentSpeed),
      0,
      1,
      -this.currentWiggle,
      this.currentWiggle,
      true
    );
    const p3_wiggleY = map(
      noise(this.noiseSeed2 * 2 + frameCount * this.currentSpeed),
      0,
      1,
      -this.currentWiggle,
      this.currentWiggle,
      true
    );
    const p3 = p5.Vector.add(p3_base, createVector(p3_wiggleX, p3_wiggleY, 0));

    beginShape();
    curveVertex(p1.x, p1.y, p1.z);
    curveVertex(p1.x, p1.y, p1.z);
    curveVertex(p2.x, p2.y, p2.z);
    curveVertex(p3.x, p3.y, p3.z);
    curveVertex(p3.x, p3.y, p3.z);
    endShape();

    pop();
  }
}
