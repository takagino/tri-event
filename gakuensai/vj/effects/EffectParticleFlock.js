class EffectParticleFlock {
  constructor() {
    this.boids = [];
    this.isAboveThreshold = false;
  }

  draw(spectrum, palette, audioLevels) {
    if (!palette || palette.length === 0) {
      palette = [color(255)];
    }

    // --- 1. 生成ロジック ---
    const beatThreshold = 1.0;
    let shouldSpawn = false;

    if (audioLevels.bassImpact > beatThreshold) {
      if (!this.isAboveThreshold) {
        shouldSpawn = true;
        this.isAboveThreshold = true;
      }
    } else {
      this.isAboveThreshold = false;
    }

    if (shouldSpawn) {
      const numToSpawn = floor(
        map(audioLevels.bassImpact, 1.0, 3.0, 2, 6, true) // 1.0, 3.0, 2, 6
      );
      for (let i = 0; i < numToSpawn; i++) {
        this.boids.push(new Boid());
      }
    }

    // --- 2. Boidsのパラメータ計算 ---
    const separationForce = map(audioLevels.bass, 100, 150, 0.2, 0.8, true); // 100, 150
    const cohesionForce = map(audioLevels.mid, 70, 120, 0.8, 1.5, true); // 70, 120
    const alignmentForce = map(audioLevels.high, 70, 120, 0.8, 1.2, true); // 70, 120
    const maxSpeed = map(audioLevels.volume, 50, 100, 2, 6, true); // 50, 100

    // --- 3. 蝶々の更新と描画 ---
    for (let i = this.boids.length - 1; i >= 0; i--) {
      let boid = this.boids[i];
      boid.update(
        this.boids,
        separationForce,
        cohesionForce,
        alignmentForce,
        maxSpeed
      );
      boid.draw(palette, audioLevels.high);

      if (boid.isDead()) {
        this.boids.splice(i, 1);
      }
    }
  }
}
class Boid {
  constructor() {
    this.pos = createVector(
      random(-width / 2, width / 2),
      random(-height / 2, height / 2),
      random(-300, 300)
    );
    this.vel = p5.Vector.random3D();
    this.vel.setMag(random(2, 4));
    this.acc = createVector(0, 0, 0);
    this.maxForce = 0.08;
    this.r = 8;
    this.hueOffset = random(360);
    this.wingFlapOffset = random(100);

    this.lifespan = random(100, 200); // 300, 500
    this.maxLifespan = this.lifespan;
  }

  update(boids, separationForce, cohesionForce, alignmentForce, maxSpeed) {
    let separation = this.separate(boids, maxSpeed);
    let alignment = this.align(boids, maxSpeed);
    let cohesion = this.cohesion(boids, maxSpeed);

    separation.mult(separationForce);
    alignment.mult(alignmentForce);
    cohesion.mult(cohesionForce);

    this.acc.add(separation);
    this.acc.add(alignment);
    this.acc.add(cohesion);

    this.vel.add(this.acc);
    this.vel.limit(maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);

    this.lifespan--;
  }

  isDead() {
    return this.lifespan < 0;
  }

  separate(boids, maxSpeed) {
    let desiredSeparation = this.r * 3;
    let steer = createVector(0, 0, 0);
    let count = 0;
    for (let other of boids) {
      let d = p5.Vector.dist(this.pos, other.pos);
      if (d > 0 && d < desiredSeparation) {
        let diff = p5.Vector.sub(this.pos, other.pos);
        diff.normalize();
        diff.div(d);
        steer.add(diff);
        count++;
      }
    }
    if (count > 0) {
      steer.div(count);
    }
    if (steer.magSq() > 0) {
      steer.setMag(maxSpeed);
      steer.sub(this.vel);
      steer.limit(this.maxForce);
    }
    return steer;
  }

  align(boids, maxSpeed) {
    let neighborDist = 60;
    let sum = createVector(0, 0, 0);
    let count = 0;
    for (let other of boids) {
      let d = p5.Vector.dist(this.pos, other.pos);
      if (d > 0 && d < neighborDist) {
        sum.add(other.vel);
        count++;
      }
    }
    if (count > 0) {
      sum.div(count);
      if (sum.magSq() > 0) {
        sum.setMag(maxSpeed);
        sum.sub(this.vel);
        sum.limit(this.maxForce);
      }
    }
    return sum;
  }

  cohesion(boids, maxSpeed) {
    let neighborDist = 60;
    let sum = createVector(0, 0, 0);
    let count = 0;
    for (let other of boids) {
      let d = p5.Vector.dist(this.pos, other.pos);
      if (d > 0 && d < neighborDist) {
        sum.add(other.pos);
        count++;
      }
    }
    if (count > 0) {
      sum.div(count);
      return this.seek(sum, maxSpeed);
    }
    return createVector(0, 0, 0);
  }

  seek(target, maxSpeed) {
    let desired = p5.Vector.sub(target, this.pos);
    if (desired.magSq() > 0) {
      desired.setMag(maxSpeed);
    }
    let steer = p5.Vector.sub(desired, this.vel);
    steer.limit(this.maxForce);
    return steer;
  }

  draw(palette, highLevel) {
    push();
    translate(this.pos);

    let dir = this.vel.copy();
    if (dir.magSq() > 0.01) {
      let angleY = atan2(dir.z, dir.x);
      rotateY(angleY);
      let angleP = atan2(dir.y, createVector(dir.x, 0, dir.z).mag());
      rotateZ(-angleP);
    }

    const colorLerpAmount = map(this.pos.z, -300, 300, 0, palette.length - 1);
    const index1 = floor(constrain(colorLerpAmount, 0, palette.length - 1));
    const index2 = constrain(ceil(colorLerpAmount), 0, palette.length - 1);
    const lerpAmt = colorLerpAmount - index1;
    let butterflyColor;
    if (palette[index1] && palette[index2]) {
      butterflyColor = lerpColor(palette[index1], palette[index2], lerpAmt);
    } else {
      butterflyColor = palette[0];
    }

    const lifeRatio = this.lifespan / this.maxLifespan;
    const alpha = sin(lifeRatio * PI) * 220; // 220
    butterflyColor.setAlpha(alpha);
    fill(butterflyColor);
    noStroke();

    const bodyLength = this.r * 2.5;
    const bodyThickness = this.r * 0.8;
    push();
    rotateY(PI / 2);
    cylinder(bodyThickness, bodyLength);
    pop();

    const wingSize = this.r * 3.5;
    const flapSpeed = map(highLevel, 70, 120, 0.1, 0.3, true); // 70, 120
    const flapAngle = map(
      sin(frameCount * flapSpeed + this.wingFlapOffset),
      -1,
      1,
      -PI / 3,
      PI / 3
    );

    push();
    translate(0, -wingSize * 0.5, 0);
    rotateX(flapAngle);
    translate(0, 0, this.r * 0.2);
    plane(wingSize, wingSize);
    pop();

    push();
    translate(0, wingSize * 0.5, 0);
    rotateX(-flapAngle);
    translate(0, 0, this.r * 0.2);
    plane(wingSize, wingSize);
    pop();

    pop();
  }
}
