<script>
  import p5 from 'p5';
  import { onMount } from 'svelte';
  import { fade, scale } from 'svelte/transition';
  import { supabase } from './supabaseClient';

  let canvas;
  let p5Instance;
  let controlsContainer;
  let topControlsContainer;

  let currentColor = '#000000';
  let currentWeight = 8;

  let paths = [];
  let currentPath = {};

  let showModal = false;
  let modelList = [];
  let isLoadingModels = false;
  let bgLayer;

  const tableName = new URLSearchParams(window.location.search).get('table') || 'drawings';

  function centerPaths(originalPaths) {
    if (!originalPaths || originalPaths.length === 0) return [];
    if (!p5Instance) return originalPaths;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const path of originalPaths) {
      for (const point of path.points) {
        if (point.x < minX) minX = point.x;
        if (point.x > maxX) maxX = point.x;
        if (point.y < minY) minY = point.y;
        if (point.y > maxY) maxY = point.y;
      }
    }
    const modelWidth = maxX - minX;
    const modelHeight = maxY - minY;

    if (!isFinite(modelWidth) || !isFinite(modelHeight)) return originalPaths;

    const modelCenterX = minX + modelWidth / 2;
    const modelCenterY = minY + modelHeight / 2;
    const canvasCenterX = p5Instance.width / 2;
    const canvasCenterY = p5Instance.height / 2;
    const offsetX = canvasCenterX - modelCenterX;
    const offsetY = canvasCenterY - modelCenterY;

    return originalPaths.map(path => {
      return {
        ...path,
        points: path.points.map(pt => ({ x: pt.x + offsetX, y: pt.y + offsetY }))
      };
    });
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

  async function submitDrawing() {
    if (paths.length === 0) {
      alert("何か描いてから送信してください！");
      return;
    }
    const { width, height } = calculateBoundingBox(paths);
    try {
      const { error } = await supabase
        .from(tableName)
        .insert([{ path_data: paths, width: width, height: height }]);
      if (error) throw error;
      alert("送信しました！");
      clearCanvas();
    } catch (error) {
      console.error("送信エラー:", error);
      alert("送信に失敗しました。");
    }
  }

  async function openModelModal() {
    showModal = true;
    isLoadingModels = true;
    modelList = [];
    try {
      const { data, error } = await supabase
        .from('models')
        .select('*')
        .order('id', { ascending: true });
      if (error) throw error;
      modelList = data || [];
    } catch (err) {
      console.error(err);
      alert("見本リストの取得に失敗しました");
      showModal = false;
    } finally {
      isLoadingModels = false;
    }
  }

  function selectModel(modelData) {
    if (paths.length > 0) {
      if (!confirm("現在の描画内容は消えますが、読み込みますか？")) return;
    }
    paths = centerPaths(modelData.path_data);
    currentPath = {};
    redrawAllPathsToBuffer();
    showModal = false;
  }

  function getSvgPoints(points) {
    return points.map(p => `${p.x},${p.y}`).join(' ');
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

      p.strokeJoin('round');
      p.strokeCap('round');
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
      if (topControlsContainer) {
        const rect = topControlsContainer.getBoundingClientRect();
        if (p.mouseX > rect.left && p.mouseX < rect.right && p.mouseY > rect.top && p.mouseY < rect.bottom) return;
      }
      const nav = document.querySelector('nav');
      if (nav) {
        const rect = nav.getBoundingClientRect();
        if (p.mouseX > rect.left && p.mouseX < rect.right && p.mouseY > rect.top && p.mouseY < rect.bottom) return;
      }
      if (showModal) return;

      currentPath = { points: [], color: currentColor, weight: currentWeight };
    }

    p.mouseDragged = () => {
      if (!currentPath.points) return;

      const point = { x: p.mouseX, y: p.mouseY };
      currentPath.points.push(point);
    }

    p.mouseReleased = () => {
      if (currentPath.points && currentPath.points.length > 0) {
        paths.push(currentPath);
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

  function clearCanvas() {
    if(confirm('キャンバスをクリアしますか？')) {
        paths = [];
        currentPath = {};
        if (bgLayer) bgLayer.clear();
    }
  }

  function getSvgViewBox(paths) {
    if (!paths || paths.length === 0) return "0 0 100 100";
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const path of paths) {
      for (const point of path.points) {
        if (point.x < minX) minX = point.x;
        if (point.x > maxX) maxX = point.x;
        if (point.y < minY) minY = point.y;
        if (point.y > maxY) maxY = point.y;
      }
    }
    if (!isFinite(minX)) return "0 0 100 100";

    const padding = 20;
    return `${minX - padding} ${minY - padding} ${(maxX - minX) + (padding * 2)} ${(maxY - minY) + (padding * 2)}`;
  }

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
  <title>お絵描き投稿 | {tableName}</title>
</svelte:head>

<div class="canvas-container" bind:this={canvas}></div>

<div class="top-controls" bind:this={topControlsContainer}>
  <button class="mode-btn" on:click={openModelModal}>
    塗り絵モード
  </button>
</div>

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

  <button class="send-btn" on:click={submitDrawing} title="送信">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
    <span class="btn-text">完成</span>
  </button>
</div>

{#if showModal}
  <div class="modal-overlay" transition:fade={{ duration: 200 }} on:click|self={() => showModal = false}>
    <div class="modal-content" transition:scale={{ duration: 200, start: 0.9 }}>

      <div class="modal-header">
        <h2>塗り絵を選択</h2>
        <button class="close-btn" on:click={() => showModal = false}>×</button>
      </div>

      <div class="modal-body">
        {#if isLoadingModels}
          <p>読み込み中...</p>
        {:else if modelList.length === 0}
          <p>登録されている見本がありません。</p>
        {:else}
          <div class="grid-container">
            {#each modelList as model}
              <button class="model-card" on:click={() => selectModel(model)}>
                <div class="svg-preview">
                  <svg viewBox={getSvgViewBox(model.path_data)} preserveAspectRatio="xMidYMid meet">
                    {#each model.path_data as path}
                      <polyline
                        points={getSvgPoints(path.points)}
                        fill="none"
                        stroke="#333"
                        stroke-width="5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      {/each}
                  </svg>
                </div>
                <div class="model-label">No.{model.id}</div>
              </button>
            {/each}
          </div>
        {/if}
      </div>

    </div>
  </div>
{/if}

<style>
  :global(body, html) {
    height: 100dvh; margin: 0; padding: 0; overflow: hidden; font-family: sans-serif;
  }
  .canvas-container { width: 100vw; height: 100dvh; touch-action: none; }

  .controls, .top-controls {
    position: absolute; left: 50%; transform: translateX(-50%); z-index: 10;
    display: flex; align-items: center;
    background-color: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(5px);
    border-radius: 30px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  }

  .controls {
    bottom: 20px;
    padding: 10px 20px;
    gap: 20px 10px;
    max-width: 95vw;
  }

  .top-controls {
    top: 20px;
    padding: 8px 20px;
  }

  .tool-group, .action-group { display: flex; align-items: center; gap: 10px; }
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

  .send-btn {
    background-color: #e91e63; color: white; border: none;
    border-radius: 30px; padding: 8px 20px;
    font-size: 14px; font-weight: bold; cursor: pointer;
    display: flex; justify-content: center; align-items: center; gap: 8px;
    transition: all 0.2s; white-space: nowrap;
  }
  .send-btn:hover { background-color: #c2185b; transform: translateY(-2px); }
  .send-btn svg { width: 18px; height: 18px; stroke: currentColor; }

  .mode-btn {
    background: transparent; border: none; font-size: 14px; font-weight: bold; color: #333;
    display: flex; align-items: center; gap: 6px; cursor: pointer; transition: background 0.2s;
  }
  .mode-btn:hover { opacity: 0.7; }

  .modal-overlay {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.5); z-index: 100;
    display: flex; align-items: center; justify-content: center;
  }
  .modal-content {
    background: white; width: 90%; max-width: 600px; max-height: 80vh; margin: auto;
    border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    display: flex; flex-direction: column; overflow: hidden;
  }
  .modal-header {
    padding: 15px 20px; border-bottom: 1px solid #eee;
    display: flex; justify-content: space-between; align-items: center;
  }
  .modal-header h2 { margin: 0; font-size: 18px; color: #333; }
  .close-btn { background: none; border: none; font-size: 24px; cursor: pointer; color: #999; }
  .modal-body { padding: 20px; overflow-y: auto; flex: 1; }

  .grid-container {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 15px;
  }
  .model-card {
    background: #f9f9f9; border: 2px solid #eee; border-radius: 10px; cursor: pointer; padding: 10px;
    display: flex; flex-direction: column; align-items: center; transition: all 0.2s;
  }
  .model-card:hover { border-color: #e91e63; transform: translateY(-3px); box-shadow: 0 4px 10px rgba(0,0,0,0.1); }

  .svg-preview {
    width: 100%; aspect-ratio: 1/1;
    display: flex; align-items: center; justify-content: center; margin-bottom: 8px;
  }
  .svg-preview svg { width: 100%; height: 100%; overflow: visible; }
  .model-label { margin-top: auto; font-size: 12px; font-weight: bold; color: #555; }

  @media (max-width: 600px) {
    .controls { flex-direction: column; gap: 15px; padding: 15px; }
    .desktop-only { display: none; }
    .send-btn { width: 100%; }
    .grid-container { grid-template-columns: repeat(2, 1fr); }
  }
</style>