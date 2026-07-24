// エフェクト：ペタル・フォール（花びらの落下）
class EffectPetalFall {
  constructor() {
    this.petals = []; // 花びらの粒子を格納
    this.gravity = createVector(0, 0.05, 0); // 緩やかな重力 (Y+が下)
  }

  draw(spectrum, palette, audioLevels) {
    if (!palette || palette.length === 0) {
      palette = [color(255)];
    }

    // 花びらが回転するので、noStrokeのままでOK
    noStroke();

    // --- 音声連動パラメータ ---
    // 1. 高音(High)で発生頻度と揺らぎ（繊細さ）が決まる
    const spawnRate = map(audioLevels.high, 70, 160, 1, 2, true); // 70, 120 -> 1, 5
    const highWiggle = map(audioLevels.high, 70, 120, 0.01, 0.08, true); // 70, 120 -> 0.01, 0.08
    // 2. 中音(Mid)で落下の速度が決まる
    const fallSpeed = map(audioLevels.mid, 70, 120, 0.5, 1.5, true); // 70, 120 -> 0.5, 1.5
    // 3. 全体音量(Volume)で花びらのサイズと横の動き（風）が変わる
    const petalSize = map(audioLevels.volume, 50, 100, 5, 40, true); // 50, 100 -> 15, 40

    // --- パーティクル生成 ---
    for (let i = 0; i < floor(spawnRate); i++) {
      this.petals.push(new Petal(palette));
    }

    // --- 各花びらの更新と描画 ---
    for (let i = this.petals.length - 1; i >= 0; i--) {
      let p = this.petals[i];
      p.applyForce(this.gravity);
      p.update(fallSpeed, highWiggle);
      p.draw(petalSize);

      if (p.isDead()) {
        this.petals.splice(i, 1);
      }
    }
  }
}

// 内部クラス：花びら（Plane）
class Petal {
  constructor(palette) {
    // 画面上部外側から発生
    this.pos = createVector(
      random(-width * 0.7, width * 0.7),
      -height * 0.7,
      random(-400, 400)
    );
    this.vel = createVector(random(-0.5, 0.5), 0, random(-0.5, 0.5));
    this.acc = createVector(0, 0, 0);

    this.lifespan = random(150, 200); // 400
    this.maxLifespan = this.lifespan;

    this.color = random(palette);
    this.rotationOffset = random(TAU); // 初期回転
  }

  applyForce(force) {
    this.acc.add(force);
  }

  update(fallSpeed, highWiggle) {
    // 重力と速度を更新
    this.vel.add(this.acc);
    this.vel.y += fallSpeed * 0.05; // Y軸に常に落下速度を維持

    // ★ 1. 揺らぎの動き (Z軸とX軸にノイズを加える)
    const wiggleX = map(
      noise(this.pos.y * highWiggle, frameCount * 0.01),
      0,
      1,
      -0.5,
      0.5
    );
    const wiggleZ = map(
      noise(this.pos.x * highWiggle, frameCount * 0.01),
      0,
      1,
      -0.5,
      0.5
    );
    this.vel.add(wiggleX, 0, wiggleZ);

    this.pos.add(this.vel);
    this.acc.mult(0);
    this.vel.mult(0.99); // 0.99

    this.lifespan--;
  }

  draw(petalSize) {
    push();
    translate(this.pos);

    // ★ 2. 独自の回転と傾き（ひらひら感）
    rotateX(this.rotationOffset + frameCount * 0.05); // 0.05
    rotateY(this.rotationOffset + frameCount * 0.02); // 0.02
    rotateZ(this.rotationOffset + frameCount * 0.03); // 0.03

    const lifeRatio = this.lifespan / this.maxLifespan;
    const alpha = map(lifeRatio, 1.0, 0.0, 200, 0, true); // 200, 0

    // 描画サイズをノイズで少し変化させる (花びらの鼓動)
    const noisePulse = map(noise(frameCount * 0.1), 0, 1, 0.9, 1.1); // 0.9, 1.1
    const currentSize = petalSize * noisePulse;

    let finalColor = this.color;
    finalColor.setAlpha(alpha);

    fill(finalColor);

    // ★ 3. plane() を描画
    plane(currentSize, currentSize * 1.5); // 縦長の花びら
    pop();
  }

  isDead() {
    // 画面外（下端）に落ちるか、寿命が尽きたら削除
    return this.lifespan < 0 || this.pos.y > height * 0.7;
  }
}
