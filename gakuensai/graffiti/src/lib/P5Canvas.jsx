import React, { useRef, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import p5 from 'p5';
import { db } from './firebaseClient';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

function P5Canvas() {
  const containerRef = useRef(null);
  const controlsRef = useRef(null);
  const p5InstanceRef = useRef(null);
  const bgLayerRef = useRef(null);

  const [currentColor, setCurrentColor] = useState('#000000');
  const [currentWeight, setCurrentWeight] = useState(8);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const collectionName = searchParams.get('name') || 'graffiti';

  // These need to be mutable refs so p5 callbacks can access the latest values
  const pathsRef = useRef([]);
  const currentPathRef = useRef({});
  const colorRef = useRef(currentColor);
  const weightRef = useRef(currentWeight);

  useEffect(() => { colorRef.current = currentColor; }, [currentColor]);
  useEffect(() => { weightRef.current = currentWeight; }, [currentWeight]);


  const calculateBoundingBox = (paths) => {
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
  };

  const drawPathToGraphics = (path, target) => {
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
  };

  const redrawAllPathsToBuffer = () => {
    if (!bgLayerRef.current) return;
    bgLayerRef.current.clear();
    for (const path of pathsRef.current) {
      drawPathToGraphics(path, bgLayerRef.current);
    }
  };

  const undoLastPath = () => {
    if (pathsRef.current.length > 0) {
      pathsRef.current.pop();
      redrawAllPathsToBuffer();
    }
  };

  const clearCanvas = () => {
    if (window.confirm('キャンバスをクリアしますか？')) {
      pathsRef.current = [];
      currentPathRef.current = {};
      if (bgLayerRef.current) bgLayerRef.current.clear();
    }
  };

  const submitDrawing = async () => {
    if (pathsRef.current.length === 0) {
      alert("何か描いてから送信してください！");
      return;
    }
    const { width, height } = calculateBoundingBox(pathsRef.current);
    try {
      await addDoc(collection(db, collectionName), {
        path_data: pathsRef.current,
        width,
        height,
        created_at: serverTimestamp()
      });
      alert("送信しました！");
      pathsRef.current = [];
      currentPathRef.current = {};
      if (bgLayerRef.current) bgLayerRef.current.clear();
    } catch (error) {
      console.error("送信エラー:", error);
      alert("送信に失敗しました。");
    }
  };



  useEffect(() => {
    window.scrollTo(0, 0);
    p5.disableFriendlyErrors = true;

    const sketch = (p) => {
      p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight);
        bgLayerRef.current = p.createGraphics(p.windowWidth, p.windowHeight);
        bgLayerRef.current.clear();
        p.strokeJoin('round');
        p.strokeCap('round');
      };

      p.draw = () => {
        p.background(240);
        if (bgLayerRef.current) {
          p.image(bgLayerRef.current, 0, 0);
        }
        if (currentPathRef.current.points && currentPathRef.current.points.length > 0) {
          p.beginShape();
          p.noFill();
          p.stroke(currentPathRef.current.color);
          p.strokeWeight(currentPathRef.current.weight);
          for (const point of currentPathRef.current.points) {
            p.vertex(point.x, point.y);
          }
          p.endShape();
        }
      };

      p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
        if (bgLayerRef.current) {
          bgLayerRef.current.resizeCanvas(p.windowWidth, p.windowHeight);
          redrawAllPathsToBuffer();
        }
      };
    };

    p5InstanceRef.current = new p5(sketch, containerRef.current);

    return () => {
      try {
        if (bgLayerRef.current) {
          bgLayerRef.current.remove();
          bgLayerRef.current = null;
        }
        if (p5InstanceRef.current) {
          p5InstanceRef.current.remove();
          p5InstanceRef.current = null;
        }
      } catch (e) {
        console.error("p5 cleanup error:", e);
      }
    };
  }, []);

  const stopEvent = (e) => e.stopPropagation();

  const handlePointerDown = (e) => {
    currentPathRef.current = { points: [{ x: e.clientX, y: e.clientY }], color: colorRef.current, weight: weightRef.current };
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!currentPathRef.current.points) return;
    const pts = currentPathRef.current.points;
    const last = pts[pts.length - 1];
    if (last && last.x === e.clientX && last.y === e.clientY) return;
    currentPathRef.current.points.push({ x: e.clientX, y: e.clientY });
  };

  const handlePointerUp = (e) => {
    if (currentPathRef.current.points && currentPathRef.current.points.length > 1) {
      pathsRef.current.push(currentPathRef.current);
      if (bgLayerRef.current) drawPathToGraphics(currentPathRef.current, bgLayerRef.current);
    }
    currentPathRef.current = {};
    try { e.target.releasePointerCapture(e.pointerId); } catch (err) { }
  };

  return (
    <>
      <div
        className="canvas-container"
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      ></div>


      <div className="controls" ref={controlsRef}
        onMouseDown={stopEvent} onTouchStart={stopEvent} onPointerDown={stopEvent}
        onMouseMove={stopEvent} onTouchMove={stopEvent} onPointerMove={stopEvent}
      >
        <div className="tool-group">
          <div className="control-item color-wrapper">
            <input type="color" id="colorPicker" value={currentColor} onChange={e => setCurrentColor(e.target.value)} />
          </div>
          <div className="divider"></div>
          <div className="control-item slider-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="icon-small"><circle cx="12" cy="12" r="12" /></svg>
            <input type="range" id="weightSlider" min="4" max="30" step="1" value={currentWeight} onChange={e => setCurrentWeight(Number(e.target.value))} />
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="icon-large"><circle cx="12" cy="12" r="12" /></svg>
          </div>

          <div className="divider"></div>

          <div className="action-group">
            <button className="icon-btn undo-btn" onClick={undoLastPath} title="ひとつ戻る">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6" /><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" /></svg>
            </button>
            <button className="icon-btn delete-btn" onClick={clearCanvas} title="クリア">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>

        <div className="divider desktop-only"></div>

        <button className="send-btn" onClick={submitDrawing} title="送信">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          <span className="btn-text">完成</span>
        </button>
      </div>


      <style>{`
        .canvas-container { width: 100vw; height: 100dvh; touch-action: none; }

        .controls {
          position: absolute; left: 50%; transform: translateX(-50%); z-index: 10;
          display: flex; align-items: center;
          background-color: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(5px);
          border-radius: 30px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          bottom: 20px;
          padding: 10px 20px;
          gap: 20px 10px;
          max-width: 95vw;
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
        .icon-btn svg { width: 24px; height: 24px; strokeWidth: 2px; }
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


        @media (max-width: 600px) {
          .controls { flex-direction: column; gap: 15px; padding: 15px; }
          .desktop-only { display: none; }
          .send-btn { width: 100%; }
        }
      `}</style>
    </>
  );
}

export default P5Canvas;
