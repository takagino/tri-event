class EffectMatrix {
  constructor() {
    this.characters = [];
    this.charSet = '01ABCDFEGH789!@#$%^&*()-_+=[]{}|;:,.<>?/`~';

    for (let i = 0; i < 200; i++) {
      this.characters.push({
        x: random(-width / 2, width / 2),
        y: random(-height / 2, height / 2),
        z: random(-800, 800),
        char: random(this.charSet.split('')),
        initialY: random(-height / 2, height / 2),
        currentRotationZ: random(TWO_PI),
      });
    }
  }

  draw(spectrum, palette, audioLevels) {
    if (!palette || palette.length === 0) {
      palette = [color(120, 100, 100)];
    }

    textFont(myFont);
    textAlign(CENTER, CENTER);

    for (let charData of this.characters) {
      push();

      charData.currentRotationZ += map(
        audioLevels.high,
        70,
        120,
        0.01,
        0.1,
        true
      ); // 70, 120
      rotateZ(charData.currentRotationZ);

      const baseSize = 20;
      const sizeMultiplier = map(audioLevels.volume, 50, 100, 1, 3, true); // 50, 100
      textSize(baseSize * sizeMultiplier);

      translate(charData.x, charData.y, charData.z);

      const colorIndex = floor(
        map(audioLevels.mid, 70, 120, 0, palette.length - 1, true)
      ); // 70, 120
      const charColor = palette[colorIndex % palette.length];

      const brightness = map(
        noise(charData.x * 0.01, charData.y * 0.01 + frameCount * 0.005),
        0,
        1,
        50,
        100,
        true
      );
      const alpha = map(audioLevels.bass, 100, 150, 50, 100, true); // 100, 150

      let finalColor = color(hue(charColor), saturation(charColor), brightness);
      finalColor.setAlpha(alpha * 2.55);
      fill(finalColor);

      text(charData.char, 0, 0);
      pop();

      const speedY = map(audioLevels.high, 70, 120, 1, 5, true); // 70, 120
      charData.y -= speedY;
      const speedZ = map(audioLevels.bass, 100, 150, 0.5, 3, true); // 100, 150
      charData.z -= speedZ;

      if (charData.y < -height / 2 || charData.z < -1000) {
        charData.y = height / 2;
        charData.x = random(-width / 2, width / 2);
        charData.z = random(500, 1000);
        charData.char = random(this.charSet.split(''));
      }
    }
  }
}
