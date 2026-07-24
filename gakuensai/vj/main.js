const USE_MIC = true;
let mic,
  fft,
  isMicActive = false,
  song,
  myFont,
  my3DModel;
let currentImage;
const FFT_SIZE = 1024;
const CUT_LOW_FREQ = 24;
let effects = [];
let activeIndex1 = 0,
  activeIndex2 = 1;
let lastSwitchTime = 0;
let colorManager;
const SWITCH_INTERVAL = 180000;
let palette1 = { name: 'default', colors: [] };
let palette2 = { name: 'default', colors: [] };
let smoothedAudio = {
  volume: 0,
  bass: 0,
  mid: 0,
  high: 0,
  bassImpact: 0,
};
const lerpAmount = 0.08;
let stats;

let logoEffectInstance = null;
let isLogoOverlayActive = false;

function preload() {
  if (!USE_MIC) {
    song = loadSound('./assets/bgm.mp3');
  }
  myFont = loadFont('./assets/Knewave-Regular.ttf');
  my3DModel = loadModel('./assets/obj/12140_Skull_v3_L2.obj', true);
  colorManager = new ColorManager();
}

function setup() {
  stats = Stats();
  stats.showPanel(0);
  document.body.append(stats.dom);

  createCanvas(windowWidth, windowHeight, WEBGL);
  fft = new p5.FFT(0.9, FFT_SIZE);

  if (USE_MIC) {
    mic = new p5.AudioIn();
    fft.setInput(mic);
  } else {
    fft.setInput();
  }

  // --- エフェクトの追加 ---
  effects.push(new EffectArrowStream());
  effects.push(new EffectIcicleDrop());
  effects.push(new EffectBars());
  effects.push(new EffectCircularRipple());
  effects.push(new EffectCityScape());
  effects.push(new EffectDancers());
  effects.push(new EffectJengaStack());
  effects.push(new EffectEqualizerGrid());
  effects.push(new EffectEyesGrid());
  effects.push(new EffectFlame());
  effects.push(new EffectFloaters());
  effects.push(new EffectFlowField());
  effects.push(new EffectFractalTree());
  effects.push(new EffectGeometricNoise());
  effects.push(new EffectGridMovers());
  effects.push(new EffectHappyPlace());
  effects.push(new EffectHyperSpiral());
  effects.push(new EffectIcosahedron());
  effects.push(new EffectKaleidoscope());
  effects.push(new EffectLightning());
  effects.push(new EffectLineTrails());
  effects.push(new EffectLissajous());
  effects.push(new EffectMatrix());
  effects.push(new EffectModelWarp());
  effects.push(new EffectNoiseRibbons());
  effects.push(new EffectOrbitingBoxes());
  effects.push(new EffectParticleFlock());
  effects.push(new EffectSingleSnake());
  effects.push(new EffectPetalFall());
  effects.push(new EffectProceduralFlower());
  effects.push(new EffectPathWeaver());
  effects.push(new EffectPulseCluster());
  effects.push(new EffectPulsingRings());
  effects.push(new EffectRecursiveSplit());
  effects.push(new EffectRotatingCircles());
  effects.push(new EffectSeaAnemone());
  effects.push(new EffectSnake());
  effects.push(new EffectSnowmen());
  effects.push(new EffectStarfish());
  effects.push(new EffectSunburst());
  effects.push(new EffectSwarm());
  effects.push(new EffectTextEmote());
  effects.push(new EffectTextRing());
  effects.push(new EffectTorusSpiral());
  effects.push(new EffectParticlePlanes());
  effects.push(new EffectParticleSparks());
  effects.push(new EffectParticleTriangles());
  effects.push(new EffectTunnel());
  effects.push(new EffectTypewriter());
  effects.push(new EffectStarForm());
  effects.push(new EffectWaveformCircular());

  logoEffectInstance = new SchoolLogo();
  if (logoEffectInstance) {
    console.log('SchoolLogo found and ready for overlay.');
  } else {
    console.warn(
      'SchoolLogo could not be instantiated! Overlay feature disabled.'
    );
  }
  pickTwoRandomEffects();
}

function draw() {
  stats.begin();

  if (!isMicActive) {
    background(0);
    textFont(myFont);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(24);
    text('CLICK TO START', 0, 0);
    stats.end();
    return;
  }

  background(0);
  blendMode(SCREEN);
  drawingContext.depthMask(false);

  if (millis() - lastSwitchTime > SWITCH_INTERVAL) {
    pickTwoRandomEffects();
  }

  const fullSpectrum = fft.analyze();
  const spectrum = fullSpectrum.slice(CUT_LOW_FREQ);

  let totalVolume = 0;
  for (let v of spectrum) totalVolume += v;
  const currentAvgVolume = totalVolume / spectrum.length;

  let bass = 0;
  const bassEnd = 80;
  for (let i = 0; i < bassEnd; i++) {
    bass += spectrum[i] || 0;
  }
  const currentBassLevel = bass / bassEnd;

  let mid = 0;
  const midEnd = 250;
  for (let i = bassEnd; i < midEnd; i++) {
    mid += spectrum[i] || 0;
  }
  const currentMidLevel = mid / (midEnd - bassEnd);

  let high = 0;
  const highEnd = 500;
  for (let i = midEnd; i < highEnd; i++) {
    high += spectrum[i] || 0;
  }
  const currentHighLevel = high / (highEnd - midEnd);

  if (smoothedAudio.bass === 0) {
    smoothedAudio.bass = currentBassLevel;
  }

  smoothedAudio.volume = lerp(
    smoothedAudio.volume,
    currentAvgVolume,
    lerpAmount
  );
  smoothedAudio.bass = lerp(
    smoothedAudio.bass,
    currentBassLevel,
    lerpAmount * 0.1
  );
  smoothedAudio.mid = lerp(smoothedAudio.mid, currentMidLevel, lerpAmount);
  smoothedAudio.high = lerp(smoothedAudio.high, currentHighLevel, lerpAmount);
  smoothedAudio.bassImpact = currentBassLevel / (smoothedAudio.bass + 1);

  console.log(
    'smoothedAudio:',
    smoothedAudio.volume.toFixed(2),
    smoothedAudio.bass.toFixed(2),
    smoothedAudio.mid.toFixed(2),
    smoothedAudio.high.toFixed(2),
    smoothedAudio.bassImpact.toFixed(2)
  );

  const effect1 = effects[activeIndex1];
  const effect2 = effects[activeIndex2];

  if (effect1) {
    effect1.draw(spectrum, palette1.colors, smoothedAudio);
  }
  if (effect2) {
    effect2.draw(spectrum, palette2.colors, smoothedAudio);
  }

  if (isLogoOverlayActive && logoEffectInstance) {
    logoEffectInstance.draw(spectrum, palette1.colors, smoothedAudio);
  }

  drawingContext.depthMask(true);
  blendMode(BLEND);
  stats.end();
}

function mousePressed() {
  if (!isMicActive) {
    getAudioContext()
      .resume()
      .then(() => {
        console.log('AudioContext resumed!');
        if (USE_MIC) {
          mic.start();
          console.log('Microphone started!');
        } else {
          if (song && song.isLoaded()) {
            song.loop();
            console.log('MP3 playback started!');
          } else {
            console.error('MP3 not loaded yet!');
          }
        }
        isMicActive = true;
        lastSwitchTime = millis();
      });
  }
}

function pickTwoRandomEffects() {
  if (effects.length === 0) return;

  const index1 = floor(random(effects.length));
  let index2 = floor(random(effects.length));
  while (effects.length > 1 && index1 === index2) {
    index2 = floor(random(effects.length));
  }
  activeIndex1 = index1;
  activeIndex2 = index2;

  lastSwitchTime = millis();

  palette1 = colorManager.getRandomPalette();
  palette2 = colorManager.getRandomPalette();

  while (
    colorManager.colorSchemes.length > 1 &&
    palette1.name === palette2.name
  ) {
    palette2 = colorManager.getRandomPalette();
  }

  console.log(
    'Current Combination:',
    effects[activeIndex1] ? effects[activeIndex1].constructor.name : 'None',
    ' (Palette:',
    palette1.name,
    ') +',
    effects[activeIndex2] ? effects[activeIndex2].constructor.name : 'None',
    ' (Palette:',
    palette2.name,
    ')'
  );
}

function keyPressed() {
  if (
    key === 'ArrowRight' ||
    key === 'ArrowLeft' ||
    key === '[' ||
    key === ']'
  ) {
    pickTwoRandomEffects();
  }

  if (key === 't' || key === 'T') {
    if (!logoEffectInstance) return;

    isLogoOverlayActive = !isLogoOverlayActive;

    if (isLogoOverlayActive) {
      console.log('VJ OVERLAY ACTIVATED: SchoolLogo');
    } else {
      console.log('VJ OVERLAY DEACTIVATED');
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
