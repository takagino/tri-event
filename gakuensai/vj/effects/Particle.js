// EffectParticleBurst が使うパーティクル自体の設計図 (カラーパレット対応版)
class Particle {
  // ★ constructor に palette 引数を追加
  constructor(x, y, z, palette) {
    this.pos = createVector(x, y, z);
    this.vel = p5.Vector.random3D().mult(random(1, 8));
    this.lifespan = 255; // 寿命

    // ★ hue を削除し、palette から色を選択して保持
    // パレットが渡されなかった場合の安全策
    if (!palette || palette.length === 0) {
      this.color = color(255); // デフォルト白
    } else {
      this.color = random(palette);
    }
  }

  update() {
    this.pos.add(this.vel);
    this.lifespan -= 3;
  }

  draw() {
    push();
    translate(this.pos.x, this.pos.y, this.pos.z);
    noStroke();
    // 寿命に応じて透明度と明るさを変える
    const brightness = map(this.lifespan, 0, 255, 0, 100);
    const alpha = map(this.lifespan, 0, 255, 0, 80);
    // ★ fill() で保持している this.color を使う
    fill(hue(this.color), saturation(this.color), brightness, alpha);
    sphere(12);
    pop();
  }

  isDead() {
    return this.lifespan < 0;
  }
}
