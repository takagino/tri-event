class EffectLineTrails {
  constructor() {
    this.movers = [];
    this.numMovers = 50;
    for (let i = 0; i < this.numMovers; i++) {
      this.movers.push(
        new TrailMover(
          random(-width / 2, width / 2),
          random(-height / 2, height / 2),
          random(-200, 200)
        )
      );
    }
  }

  draw(spectrum, palette, audioLevels) {
    if (!palette || palette.length === 0) {
      palette = [color(255)];
    }

    for (let mover of this.movers) {
      mover.update(audioLevels.volume, audioLevels.mid);
      mover.show(audioLevels.bass, audioLevels.high, palette);
    }
  }
}

class TrailMover {
  constructor(x, y, z) {
    this.pos = createVector(x, y, z);
    this.vel = p5.Vector.random3D().mult(2);
    this.acc = createVector(0, 0, 0);
    this.maxforce = 0.1;
    this.history = [];
    this.historyLength = 30;
    this.angle = random(TAU);
  }

  applyForce(force) {
    this.acc.add(force);
  }

  update(avgVolume, midLevel) {
    const maxspeed = map(avgVolume, 50, 100, 2, 8, true); // 50, 100
    this.vel.add(this.acc);
    this.vel.limit(maxspeed);
    this.pos.add(this.vel);
    this.acc.mult(0);
    this.history.push(this.pos.copy());
    if (this.history.length > this.historyLength) {
      this.history.splice(0, 1);
    }

    const margin = width / 2 + 50;
    if (this.pos.x < -margin) this.pos.x = margin;
    if (this.pos.x > margin) this.pos.x = -margin;
    if (this.pos.y < -margin) this.pos.y = margin;
    if (this.pos.y > margin) this.pos.y = -margin;
    if (this.pos.z < -400) this.pos.z = 400;
    if (this.pos.z > 400) this.pos.z = -400;

    const angleChange = map(midLevel, 70, 120, -0.05, 0.05, true); // 70, 120
    this.angle += angleChange;
    let desired = createVector(
      cos(this.angle),
      sin(this.angle),
      tan(this.angle * 0.5)
    );
    desired.mult(maxspeed);
    let steer = p5.Vector.sub(desired, this.vel);
    steer.limit(this.maxforce);
    this.applyForce(steer);
  }

  show(bassLevel, highLevel, palette) {
    const weight = map(bassLevel, 100, 150, 2, 10, true); // 100, 150
    strokeWeight(weight);

    const colorIndex = floor(
      map(highLevel, 70, 120, 0, palette.length - 1, true)
    ); // 70, 120
    const trailColor = palette[colorIndex % palette.length];

    noFill();
    beginShape();
    for (let i = 0; i < this.history.length; i++) {
      let v = this.history[i];
      let alpha = map(i, 0, this.history.length, 20, 80, true); // 10, 80

      let strokeCol = color(
        hue(trailColor),
        saturation(trailColor),
        brightness(trailColor)
      );
      strokeCol.setAlpha(alpha * 2.55);
      stroke(strokeCol);

      vertex(v.x, v.y, v.z);
    }
    endShape();

    push();
    translate(this.pos.x, this.pos.y, this.pos.z);

    let headColor = color(
      hue(trailColor),
      saturation(trailColor),
      brightness(trailColor)
    );
    headColor.setAlpha(90 * 2.55); // 90
    fill(headColor);
    noStroke();
    sphere(weight * 0.8); // 0.8
    pop();
  }
}
