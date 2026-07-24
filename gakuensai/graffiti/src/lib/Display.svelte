<script>
  import { onMount } from 'svelte';
  import p5 from 'p5';
  import { supabase } from './supabaseClient.js';
  import QRCode from 'qrcode';

  let canvas;
  let p5Instance;
  let allDrawings = [];
  let qrCodeDataUrl = '';
  let tableName = 'drawings';

  const SPEED_FACTOR = 2;
  const SCALE_FACTOR = 0.4;

  function createCachedImage(p, drawing) {
    const w = drawing.data.width || 100;
    const h = drawing.data.height || 100;
    const padding = 20;
    const pg = p.createGraphics(w + padding * 2, h + padding * 2);

    pg.noFill();
    pg.strokeJoin('round');
    pg.strokeCap('round');
    pg.push();
    pg.translate(-drawing.minX + padding, -drawing.minY + padding);

    for (const path of drawing.data.path_data) {
      if (!path.points || path.points.length < 1) continue;

      pg.stroke(path.color);
      pg.strokeWeight(path.weight);
      pg.beginShape();
      for (const point of path.points) {
        pg.vertex(point.x, point.y);
      }
      pg.endShape();
    }
    pg.pop();

    return pg;
  }

  const sketch = (p) => {
    p.setup = () => {
      p.createCanvas(p.windowWidth, p.windowHeight);
      p.background(240);
    };

    p.draw = () => {
      p.background(240);

      for (let i = 0; i < allDrawings.length; i++) {
        const drawing = allDrawings[i];

        if (!drawing.cachedImg) {
          drawing.cachedImg = createCachedImage(p, drawing);
        }

        drawing.x += drawing.vx;
        drawing.y += drawing.vy;

        const imgW = drawing.cachedImg.width * SCALE_FACTOR;
        const imgH = drawing.cachedImg.height * SCALE_FACTOR;

        if (drawing.x < 0) {
          drawing.x = 0;
          drawing.vx *= -1;
        }
        if (drawing.x + imgW > p.width) {
          drawing.x = p.width - imgW;
          drawing.vx *= -1;
        }
        if (drawing.y < 0) {
          drawing.y = 0;
          drawing.vy *= -1;
        }
        if (drawing.y + imgH > p.height) {
          drawing.y = p.height - imgH;
          drawing.vy *= -1;
        }

        p.image(drawing.cachedImg, drawing.x, drawing.y, imgW, imgH);
      }
    };

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
    };
  };

  function addAnimationProperties(drawingData) {
    let minX = Infinity;
    let minY = Infinity;

    if (drawingData.path_data && drawingData.path_data.length > 0) {
      for (const path of drawingData.path_data) {
        for (const point of path.points) {
          if (point.x < minX) minX = point.x;
          if (point.y < minY) minY = point.y;
        }
      }
    } else {
      minX = 0; minY = 0;
    }
    if (!isFinite(minX)) minX = 0;
    if (!isFinite(minY)) minY = 0;

    const realWidth = (drawingData.width || 100) * SCALE_FACTOR;
    const realHeight = (drawingData.height || 100) * SCALE_FACTOR;

    return {
      id: drawingData.id,
      data: drawingData,
      minX: minX,
      minY: minY,
      cachedImg: null,

      x: Math.random() * (window.innerWidth - realWidth),
      y: Math.random() * (window.innerHeight - realHeight),

      vx: (Math.random() - 0.5) * SPEED_FACTOR,
      vy: (Math.random() - 0.5) * SPEED_FACTOR
    };
  }

  onMount(() => {
    p5.disableFriendlyErrors = true;
    p5Instance = new p5(sketch, canvas);

    const urlTable = new URLSearchParams(window.location.search).get('table');
    if (urlTable) tableName = urlTable;

    (async () => {
      const origin = window.location.origin;
      const searchParams = window.location.search;
      const targetUrl = `${origin}/${searchParams}`;
      console.log('QR Code Target URL:', targetUrl);

      try {
        qrCodeDataUrl = await QRCode.toDataURL(targetUrl, {
          width: 200,
          margin: 2,
          color: { dark: '#333333', light: '#ffffff' }
        });
      } catch (err) {
        console.error(err);
      }
    })();

    async function fetchInitialDrawings() {
      const { data, error } = await supabase
        .from(tableName)
        .select('path_data, width, height, id');

      if (data) {
        allDrawings = data.map(addAnimationProperties);
      }
    }
    fetchInitialDrawings();

    const channel = supabase
      .channel('drawings_changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: tableName },
        (payload) => {
          const newDrawing = addAnimationProperties(payload.new);
          allDrawings = [...allDrawings, newDrawing];
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: tableName },
        (payload) => {
          const deletedId = payload.old.id;

          const target = allDrawings.find(d => d.id === deletedId);
          if (target && target.cachedImg) {
            target.cachedImg.remove();
          }

          allDrawings = allDrawings.filter(d => d.id !== deletedId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);

      if (p5Instance) {
        p5Instance.remove();
        p5Instance = null;
      }

      allDrawings.forEach(d => {
        if (d.cachedImg) d.cachedImg.remove();
      });
      allDrawings = [];
    };
  });
</script>

<svelte:head>
  <title>みんなの作品 | {tableName}</title>
</svelte:head>

<div class="display-container" bind:this={canvas}></div>

{#if qrCodeDataUrl}
  <div class="qr-container">
    <p class="qr-title">スマホでスキャンして<br>お絵描きに参加！</p>
    <img src={qrCodeDataUrl} alt="Scan to join" class="qr-image" />
  </div>
{/if}

<style>
  :global(body, html) {
    margin: 0;
    padding: 0;
    overflow: hidden;
    font-family: "Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", sans-serif;
  }
  .display-container {
    width: 100vw;
    height: 100vh;
  }

  .qr-container {
    position: absolute;
    bottom: 30px;
    left: 30px;
    z-index: 100;
    background-color: rgba(255, 255, 255, 0.9);
    padding: 20px;
    border-radius: 20px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    text-align: center;
  }

  @media (max-width: 768px) {
    .qr-container {
      display: none;
    }
  }

  .qr-title {
    margin: 0 0 15px 0;
    font-weight: bold;
    color: #333;
    line-height: 1.4;
  }

  .qr-image {
    display: block;
    width: 150px;
    height: auto;
    border-radius: 5px;
  }
</style>