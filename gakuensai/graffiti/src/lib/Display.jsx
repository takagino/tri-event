import React, { useRef, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import p5 from 'p5';
import QRCode from 'qrcode';
import { db } from './firebaseClient';
import { collection, onSnapshot } from 'firebase/firestore';

const SPEED_FACTOR = 2;
const SCALE_FACTOR = 0.4;

function Display() {
  const containerRef = useRef(null);
  const p5InstanceRef = useRef(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const collectionName = searchParams.get('name') || 'graffiti';

  // Use a ref for allDrawings because p5 draw loop closure needs access to the latest array
  const allDrawingsRef = useRef([]);

  const createCachedImage = (p, drawing) => {
    const w = drawing.data.width || 100;
    const h = drawing.data.height || 100;
    const padding = 20;
    const pg = p.createGraphics(w + padding * 2, h + padding * 2);

    pg.noFill();
    pg.strokeJoin('round');
    pg.strokeCap('round');
    pg.push();
    pg.translate(-drawing.minX + padding, -drawing.minY + padding);

    if (drawing.data.path_data) {
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
    }
    pg.pop();

    return pg;
  };

  const addAnimationProperties = (drawingData) => {
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
  };

  useEffect(() => {
    p5.disableFriendlyErrors = true;

    // QR Code Generation
    (async () => {
      const origin = window.location.origin;
      const searchStr = window.location.search;
      const targetUrl = `${origin}/${searchStr}`;
      try {
        const url = await QRCode.toDataURL(targetUrl, {
          width: 200,
          margin: 2,
          color: { dark: '#333333', light: '#ffffff' }
        });
        setQrCodeDataUrl(url);
      } catch (err) {
        console.error(err);
      }
    })();

    const sketch = (p) => {
      p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight);
        p.background(240);
      };

      p.draw = () => {
        p.background(240);

        for (let i = 0; i < allDrawingsRef.current.length; i++) {
          const drawing = allDrawingsRef.current[i];

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

    p5InstanceRef.current = new p5(sketch, containerRef.current);

    // Firestore subscription
    const unsubscribe = onSnapshot(collection(db, collectionName), (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const newDoc = { id: change.doc.id, ...change.doc.data() };
          // Ignore if we already have it (though onSnapshot might fire for existing initially)
          if (!allDrawingsRef.current.find(d => d.id === newDoc.id)) {
            const newDrawing = addAnimationProperties(newDoc);
            allDrawingsRef.current.push(newDrawing);
          }
        }
        if (change.type === 'removed') {
          const removedId = change.doc.id;
          const target = allDrawingsRef.current.find(d => d.id === removedId);
          if (target && target.cachedImg) {
            target.cachedImg.remove();
          }
          allDrawingsRef.current = allDrawingsRef.current.filter(d => d.id !== removedId);
        }
      });
    });

    return () => {
      unsubscribe();
      try {
        allDrawingsRef.current.forEach(d => {
          if (d.cachedImg) d.cachedImg.remove();
        });
        allDrawingsRef.current = [];
        if (p5InstanceRef.current) {
          p5InstanceRef.current.remove();
          p5InstanceRef.current = null;
        }
      } catch (e) {
        console.error("p5 cleanup error:", e);
      }
    };
  }, [collectionName]);

  return (
    <>
      <div className="display-container" ref={containerRef}></div>
      {qrCodeDataUrl && (
        <div className="qr-container">
          <p className="qr-title">スマホでスキャンして<br />お絵描きに参加！</p>
          <img src={qrCodeDataUrl} alt="Scan to join" className="qr-image" />
        </div>
      )}

      <style>{`
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
          .qr-container { display: none; }
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
      `}</style>
    </>
  );
}

export default Display;
