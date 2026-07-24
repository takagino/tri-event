class EffectModelWarp {
  constructor() {
    this.baseModel = my3DModel;
    this.t = 0;
    this.initialVertices = [];
    this.maxVertices = 5000;

    if (this.baseModel && this.baseModel.vertices.length > 0) {
      const totalVertices = this.baseModel.vertices.length;

      if (totalVertices > this.maxVertices) {
        const sampleRatio = totalVertices / this.maxVertices;

        for (let i = 0; i < totalVertices; i++) {
          if (random() * sampleRatio < 1) {
            this.initialVertices.push(this.baseModel.vertices[i].copy());
          }
        }
        if (this.initialVertices.length > this.maxVertices) {
          this.initialVertices = this.initialVertices.slice(
            0,
            this.maxVertices
          );
        }
      } else {
        this.initialVertices = this.baseModel.vertices.map((v) => v.copy());
      }
    } else {
      console.warn(
        'EffectModelWarp: 3D model not loaded/found. Using sphere as fallback.'
      );
    }
  }

  draw(spectrum, palette, audioLevels) {
    if (!palette || palette.length === 0) {
      palette = [color(255)];
    }

    noStroke();

    const warpAmount = map(audioLevels.bass, 100, 150, 0, 60, true); // 100, 150
    const noiseSpeed = map(audioLevels.mid, 70, 120, 0.005, 0.05, true); // 70, 120
    this.t += noiseSpeed;
    const colorFactor = map(audioLevels.high, 70, 120, 0.5, 1.0, true); // 70, 120

    const totalVerts = this.initialVertices.length;
    const numVerticesToDraw = floor(
      map(audioLevels.volume, 50, 100, totalVerts, totalVerts * 0.5, true)
    ); // 50, 100

    const globalScale = map(audioLevels.volume, 50, 100, 2.0, 3.0, true); // 50, 100

    push();
    translate(0, -20, -200);
    rotateX(-PI / 2);
    rotateY(-PI);
    //rotateZ(-PI);
    scale(globalScale);

    // --- 描画設定 ---
    const colorIndex = floor(
      map(this.t * 0.1, 0, 1, 0, palette.length - 1, true)
    );
    const modelColor = palette[colorIndex % palette.length];

    let finalColor = color(
      hue(modelColor),
      saturation(modelColor) * colorFactor,
      brightness(modelColor)
    );
    finalColor.setAlpha(90 * 2.55);
    fill(finalColor);

    if (this.baseModel && this.initialVertices.length > 0) {
      beginShape(TRIANGLES);
      for (let i = 0; i < numVerticesToDraw; i++) {
        const v = this.initialVertices[i];

        const noiseX = noise(v.x * 0.01, v.y * 0.01, this.t);
        const noiseY = noise(v.y * 0.01, v.z * 0.01, this.t);
        const noiseZ = noise(v.z * 0.01, v.x * 0.01, this.t);

        const distortedX = v.x + map(noiseX, 0, 1, -warpAmount, warpAmount);
        const distortedY = v.y + map(noiseY, 0, 1, -warpAmount, warpAmount);
        const distortedZ = v.z + map(noiseZ, 0, 1, -warpAmount, warpAmount);

        vertex(distortedX, distortedY, distortedZ);
      }
      endShape();
    } else {
      sphere(height * 0.1);
    }

    pop();
  }
}
