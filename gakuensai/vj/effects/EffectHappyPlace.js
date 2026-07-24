class EffectHappyPlace {
  constructor() {
    this.num = 80;
    this.friends = [];
    this.reset();
  }

  reset() {
    this.friends = [];
    const radius = width / 3;
    for (let i = 0; i < this.num; i++) {
      const angle1 = random(TWO_PI);
      const angle2 = random(TWO_PI);
      const x = radius * sin(angle1) * cos(angle2);
      const y = radius * sin(angle1) * sin(angle2);
      const z = radius * cos(angle1);
      this.friends[i] = new Friend(x, y, z, i);
    }

    for (let k = 0; k < this.num * 1.5; k++) {
      const a = floor(random(this.num));
      const b = floor(a + random(-10, 10) + this.num) % this.num;
      if (a !== b) {
        this.friends[a].connectTo(b);
        this.friends[b].connectTo(a);
      }
    }
  }

  draw(spectrum, palette, audioLevels) {
    if (!palette || palette.length === 0) {
      palette = [color(255)];
    }

    let total = 0;
    for (let v of spectrum) total += v;
    const avgVolume = total / spectrum.length;
    const dynamicLenCon = map(avgVolume, 0, 80, 50, 150, true);

    for (let f of this.friends) {
      f.findHappyPlace(this.friends, dynamicLenCon);
    }
    for (let f of this.friends) {
      f.move();
    }

    for (let f of this.friends) {
      f.expose();
    }
    for (let f of this.friends) {
      f.exposeConnections(this.friends, spectrum, palette);
    }
  }
}

class Friend {
  constructor(x, y, z, id) {
    this.pos = createVector(x, y, z);
    this.vel = createVector(0, 0, 0);
    this.acc = createVector(0, 0, 0);
    this.id = id;
    this.maxSpeed = 4;
    this.maxForce = 0.2;
    this.friction = 0.96;

    this.maxcon = 6;
    this.connections = [];

    this.sphereSize = 5;
  }

  connectTo(fId) {
    if (
      this.connections.length < this.maxcon &&
      !this.connections.includes(fId)
    ) {
      this.connections.push(fId);
    }
  }

  applyForce(force) {
    this.acc.add(force);
  }

  findHappyPlace(allFriends, lencon) {
    let attraction = createVector(0, 0, 0);
    let repulsion = createVector(0, 0, 0);
    let attractionCount = 0;
    let repulsionCount = 0;

    for (let other of allFriends) {
      if (other.id === this.id) continue;

      const dir = p5.Vector.sub(other.pos, this.pos);
      const d = dir.mag();

      if (this.connections.includes(other.id)) {
        if (d > lencon) {
          attraction.add(dir);
          attractionCount++;
        } else if (d < lencon * 0.8) {
          repulsion.add(dir.mult(-1));
          repulsionCount++;
        }
      } else {
        if (d < lencon * 1.2) {
          repulsion.add(dir.mult(-1));
          repulsionCount++;
        }
      }
    }

    if (attractionCount > 0) {
      attraction.div(attractionCount);
      attraction.setMag(this.maxSpeed);
      const steerAttract = p5.Vector.sub(attraction, this.vel);
      steerAttract.limit(this.maxForce);
      this.applyForce(steerAttract);
    }
    if (repulsionCount > 0) {
      repulsion.div(repulsionCount);
      repulsion.setMag(this.maxSpeed);
      const steerRepulse = p5.Vector.sub(repulsion, this.vel);
      steerRepulse.limit(this.maxForce * 1.5);
      this.applyForce(steerRepulse);
    }
  }

  move() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);
    this.vel.mult(this.friction);
  }

  expose() {
    push();
    translate(this.pos);
    noStroke();
    fill(200, 80, 100);
    sphere(this.sphereSize);
    pop();
  }

  exposeConnections(allFriends, spectrum, palette) {
    let mid = 0;
    for (let i = 40; i < 100; i++) mid += spectrum[i];
    const midLevel = mid / 60;

    for (let targetId of this.connections) {
      if (targetId < this.id) {
        const targetFriend = allFriends[targetId];
        if (targetFriend) {
          const weight = map(midLevel, 0, 150, 1, 6, true);
          const colorIndex = floor(
            map(midLevel, 0, 100, 0, palette.length, true)
          );
          const lineColor = palette[colorIndex % palette.length];
          strokeWeight(weight);
          stroke(
            hue(lineColor),
            saturation(lineColor),
            brightness(lineColor),
            alpha
          );
          line(
            this.pos.x,
            this.pos.y,
            this.pos.z,
            targetFriend.pos.x,
            targetFriend.pos.y,
            targetFriend.pos.z
          );
        }
      }
    }
  }
}
