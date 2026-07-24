<script>
  import p5 from 'p5';
  import { onMount } from 'svelte';
  import { supabase } from './supabaseClient';

  let canvas;
  let p5Instance;
  let controlsContainer;

  let currentColor = '#000000';
  let currentWeight = 8;
  let paths = [];
  let currentPath = {};
  let bgLayer;

  const tableName = 'models';

  async function saveAsModel(modelId) {
    if (paths.length === 0) {
      alert("描画データがありません");
      return;
    }
    const { width, height } = calculateBoundingBox(paths);

    if(!confirm(`現在の絵を「見本 No.${modelId}」として保存しますか？\n（以前のデータは上書きされます）`)) return;

    try {
      const { error } = await supabase
        .from(tableName)
        .upsert({
          id: modelId,
          path_data: paths,
          width,
          height
        });

      if (error) throw error;
      alert(`見本 No.${modelId} を保存しました！`);
    } catch (error) {
      console.error("保存エラー:", error);
      alert("保存に失敗しました。");
    }
  }

  function calculateBoundingBox(paths) {
    if (paths.length === 0) return { width: 0, height: 0 };
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const path of paths) {
      for (const point of path.points) {
        if (point.x < minX) minX = point.x;
        if (point.x > maxX) maxX = point.x;
        if (point.y < minY) minY = point.y;
        if (point.y > maxY) maxY = point.y;
      }
    }
    if (!isFinite(minX)) return { width: 0, height: 0 };
    return { width: Math.round(maxX - minX), height: Math.round(maxY - minY) };
  }

  function undoLastPath() {
    if (paths.length > 0) {
      paths.pop();
      redrawAllPathsToBuffer();
    }
  }

  function clearCanvas() {
    if(confirm('クリアしますか？')) {
        paths = [];
        currentPath = {};
        if (bgLayer) bgLayer.clear();
    }
  }

  function redrawAllPathsToBuffer() {
    if (!bgLayer) return;
    bgLayer.clear();
    for (const path of paths) {
      drawPathToGraphics(path, bgLayer);
    }
  }

  function drawPathToGraphics(path, target) {
    if (!path.points || path.points.length < 1) return;
    target.noFill();
    target.stroke(path.color);
    target.strokeWeight(path.weight);
    target.strokeJoin('round');
    target.strokeCap('round');

    target.beginShape();
    for (const point of path.points) {
      target.vertex(point.x, point.y);
    }
    target.endShape();
  }

  const sketch = (p) => {
    p.setup = () => {
      p.createCanvas(p.windowWidth, p.windowHeight);

      bgLayer = p.createGraphics(p.windowWidth, p.windowHeight);
      bgLayer.clear();

      p.strokeJoin(p.ROUND);
      p.strokeCap(p.ROUND);
    };

    p.draw = () => {
      p.background(240);

      if (bgLayer) {
        p.image(bgLayer, 0, 0);
      }

      if (currentPath.points && currentPath.points.length > 0) {
        drawPath(currentPath);
      }
    };

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
      if (bgLayer) {
        bgLayer.resizeCanvas(p.windowWidth, p.windowHeight);
        redrawAllPathsToBuffer();
      }
    };

    p.mousePressed = () => {
      if (controlsContainer) {
        const rect = controlsContainer.getBoundingClientRect();
        if (p.mouseX > rect.left && p.mouseX < rect.right && p.mouseY > rect.top && p.mouseY < rect.bottom) return;
      }

      const nav = document.querySelector('nav');
      if (nav) {
        const rect = nav.getBoundingClientRect();
        if (
          p.mouseX > rect.left &&
          p.mouseX < rect.right &&
          p.mouseY > rect.top &&
          p.mouseY < rect.bottom
        ) {
          return;
        }
      }

      currentPath = { points: [], color: currentColor, weight: currentWeight };
      paths.push(currentPath);
    }

    p.mouseDragged = () => {
      if (!currentPath.points) return;
      currentPath.points.push({ x: p.mouseX, y: p.mouseY });
    }

    p.mouseReleased = () => {
      if (currentPath.points && currentPath.points.length > 0) {
        drawPathToGraphics(currentPath, bgLayer);
      }
      currentPath = {};
    }

    p.touchStarted = p.mousePressed;
    p.touchEnded = p.mouseReleased;
    p.touchMoved = () => { p.mouseDragged(); return false; }

    function drawPath(path) {
      if (!path.points || path.points.length < 1) return;
      p.beginShape();
      p.noFill();
      p.stroke(path.color);
      p.strokeWeight(path.weight);
      for (const point of path.points) p.vertex(point.x, point.y);
      p.endShape();
    }
  };

  onMount(() => {
    window.scrollTo(0, 0);

    p5.disableFriendlyErrors = true;
    p5Instance = new p5(sketch, canvas);
    return () => {
      if (p5Instance) {
        p5Instance.remove();
        p5Instance = null;
      }
      if (bgLayer) {
        bgLayer.remove();
        bgLayer = null;
      }
    };
  });
</script>

<svelte:head>
  <title>見本作成モード | {tableName}</title>
</svelte:head>

<div class="canvas-container" bind:this={canvas}></div>

<div class="controls" bind:this={controlsContainer}>
  <div class="tool-group">
    <div class="control-item color-wrapper">
      <input type="color" id="colorPicker" bind:value={currentColor}>
    </div>
    <div class="divider"></div>
    <div class="control-item slider-wrapper">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" class="icon-small"><circle cx="12" cy="12" r="12"/></svg>
      <input type="range" id="weightSlider" min="4" max="30" step="1" bind:value={currentWeight}>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="icon-large"><circle cx="12" cy="12" r="12"/></svg>
    </div>
    <div class="divider"></div>
    <div class="action-group">
      <button class="icon-btn undo-btn" on:click={undoLastPath} title="ひとつ戻る">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
      </button>
      <button class="icon-btn delete-btn" on:click={clearCanvas} title="クリア">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
      </button>
    </div>
  </div>

  <div class="divider desktop-only"></div>

  <div class="model-save-group">
    {#each [1, 2, 3, 4, 5, 6] as id}
      <button class="model-btn" on:click={() => saveAsModel(id)}>{id}</button>
    {/each}
  </div>
</div>

<style>
  :global(body, html) { height: 100dvh; margin: 0; padding: 0; overflow: hidden; font-family: sans-serif; }
  .canvas-container { width: 100vw; height: 100dvh; touch-action: none; }

  .controls {
    position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); z-index: 10;
    display: flex; align-items: center;
    background-color: rgba(255, 255, 255, 0.85); backdrop-filter: blur(5px);
    padding: 10px 20px; border-radius: 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    gap: 20px 10px; max-width: 95vw;
  }

  .tool-group, .action-group, .model-save-group { display: flex; align-items: center; gap: 10px; }
  .divider { width: 1px; height: 24px; background-color: #ddd; }

  .control-item { display: flex; align-items: center; gap: 5px; }
  .color-wrapper input[type="color"] { -webkit-appearance: none; border: none; width: 30px; height: 30px; border-radius: 50%; padding: 0; background: none; cursor: pointer; transition: transform 0.2s; }
  .color-wrapper input[type="color"]:hover { transform: scale(1.1); }
  .color-wrapper input[type="color"]::-webkit-color-swatch-wrapper { padding: 0; }
  .color-wrapper input[type="color"]::-webkit-color-swatch { border: none; border-radius: 50%; border: 1px solid rgba(0,0,0,0.1); }

  .slider-wrapper { color: #666; display: flex; align-items: center; gap: 5px; }
  .slider-wrapper svg { fill: #999; }
  .icon-small { width: 12px; height: 12px; }
  .icon-large { width: 20px; height: 20px; }
  input[type="range"] { width: 80px; cursor: pointer; }

  .icon-btn { background: transparent; border: none; cursor: pointer; padding: 6px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.2s; color: #333; }
  .icon-btn svg { width: 24px; height: 24px; stroke-width: 2px; }
  .icon-btn:hover { background-color: rgba(0,0,0,0.05); transform: translateY(-2px); }

  .model-btn {
    background: #333; color: white; border: none; width: 30px; height: 30px;
    border-radius: 50%; cursor: pointer; font-weight: bold;
  }
  .model-btn:hover { background: #555; }

  @media (max-width: 600px) {
    .controls { flex-direction: column; gap: 15px; padding: 15px; }
    .desktop-only { display: none; }
  }
</style>