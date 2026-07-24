// エフェクト：パス・ウィーバー（直角の織り - 直線版）
class EffectPathWeaver {
  constructor() {
    this.weavers = [];
    this.numWeavers = 5;
    this.isAboveThreshold = false;

    for (let i = 0; i < this.numWeavers; i++) {
      this.weavers.push(new Weaver(i * 30));
    }
  }

  draw(spectrum, palette, audioLevels) {
    if (!palette || palette.length === 0) {
      palette = [color(255)];
    }
    noFill();

    // --- 1. ビート検出と方向転換 ---
    const beatThreshold = 1.0;
    let shouldTrigger = false;

    if (audioLevels.bassImpact > beatThreshold) {
      if (!this.isAboveThreshold) {
        shouldTrigger = true;
        this.isAboveThreshold = true;
      }
    } else {
      this.isAboveThreshold = false;
    }

    if (shouldTrigger) {
      // ビートでY軸方向の目標を反転
      const targetWeaver = random(this.weavers);
      targetWeaver.toggleDirection();
    }

    // --- 2. 描画と更新 ---
    for (let weaver of this.weavers) {
      // highLevelはもはや使わないが、引数はそのまま残す
      weaver.update(audioLevels.volume, audioLevels.high);
      weaver.draw(audioLevels.bass, palette);
    }
  }
}

// 内部クラス：直角に曲がるエージェント
class Weaver {
  constructor(delayFrames) {
    // ★ 1. 画面外側でランダムに初期位置を決定
    this.pos = this._getRandomStartPosition();
    this.maxSpeed = 10;
    this.history = [];
    this.historyLength = 100; // 100
    this.delayFrames = delayFrames;

    // ★ 2. 動きの状態
    this.dirX = this.pos.x > 0 ? -1 : 1; // 1:右向き, -1:左向き
    this.dirY = this.pos.y > 0 ? -1 : 1; // 1:下向き, -1:上向き

    this.isMovingX = true; // X軸（水平）方向に移動中か
    this.targetAmplitude = height / 4;

    this.prevTurnTime = 0;
    this.turnCooldown = 300; // 300ms
  }

  // 画面外の開始位置をランダムに決定
  _getRandomStartPosition() {
    const margin = width * 0.7;
    const isLeft = random() < 0.5;

    return createVector(
      isLeft ? -margin : margin,
      random(-height / 2, height / 2),
      random(-300, 300)
    );
  }

  toggleDirection() {
    // 外部トリガーでY軸方向の目標を反転させる
    this.dirY *= -1;
  }

  update(avgVolume, highLevel) {
    if (this.delayFrames > 0) {
      this.delayFrames--;
      return;
    }

    const timeNow = millis();
    this.maxSpeed = map(avgVolume, 50, 100, 5, 20, true);

    let shouldTurn = false;

    // --- 1. ターン判定 ---
    if (this.isMovingX) {
      // X軸方向の移動中: 画面の特定エリアに到達したらY軸へ直角ターン
      if (
        abs(this.pos.x) < width * 0.25 &&
        timeNow - this.prevTurnTime > this.turnCooldown
      ) {
        shouldTurn = true;
      }
    } else {
      // Y軸方向の移動中: Y座標が目標範囲を超えたらX軸へ直角ターン
      if (
        abs(this.pos.y) > this.targetAmplitude &&
        timeNow - this.prevTurnTime > this.turnCooldown
      ) {
        shouldTurn = true;
      }
    }

    // --- 2. ターン処理 ---
    if (shouldTurn) {
      // ★ 2-1. ターンする瞬間の正確な位置を記録 (この点が角になる)
      this.history.push(this.pos.copy());

      // ★ 2-2. 軸を反転
      this.isMovingX = !this.isMovingX;

      // ★ 2-3. 方向を調整 (ターン後の動きを定義)
      // X軸方向の移動に切り替える場合
      if (this.isMovingX) {
        this.dirY = this.pos.y > 0 ? -1 : 1; // Y軸を中央に戻る向きにリセット
      }
      // Y軸方向の移動に切り替える場合 (dirXはそのまま)

      this.prevTurnTime = timeNow;
    }

    // --- 3. 移動処理 ---
    let moveVector;
    if (this.isMovingX) {
      // X軸方向へ単純に移動
      moveVector = createVector(this.dirX * this.maxSpeed, 0, 0);
    } else {
      // Y軸方向へ単純に移動
      moveVector = createVector(0, this.dirY * this.maxSpeed, 0);
    }

    // ★ 曲線を生むステアリング演算を排除し、単純なベクトル加算で直線移動
    this.pos.add(moveVector);

    // --- 4. 軌跡の保存とリセット ---
    this.history.push(this.pos.copy());
    if (this.history.length > this.historyLength) {
      this.history.splice(0, 1);
    }

    // 画面外リセット
    const margin = width * 0.7;
    if (abs(this.pos.x) > margin * 1.5) {
      this.pos = this._getRandomStartPosition();
      this.history = [];
      this.isMovingX = true;
      this.dirX = this.pos.x > 0 ? -1 : 1;
    }
  }

  draw(bassLevel, palette) {
    if (this.history.length < 2) return;

    // 音量によって線の太さを変更
    strokeWeight(map(bassLevel, 100, 150, 1, 8, true));
    noFill();

    // ★ 直線の連続として描画
    beginShape();

    for (let i = 0; i < this.history.length; i++) {
      const v = this.history[i];

      const colorPos = map(
        v.x,
        -width / 2,
        width / 2,
        0,
        palette.length - 1,
        true
      );
      const index = floor(colorPos);

      let strokeCol = palette[index % palette.length];
      const alpha = map(i, 0, this.historyLength, 30, 255, true);

      strokeCol.setAlpha(alpha);
      stroke(strokeCol);

      vertex(v.x, v.y, v.z);
    }
    endShape();
  }
}
