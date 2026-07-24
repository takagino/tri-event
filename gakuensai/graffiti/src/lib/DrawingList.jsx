import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { db } from './firebaseClient';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';

const AnimatedPreview = ({ pathData, isPlaying, onComplete }) => {
  const [progress, setProgress] = useState(isPlaying ? 0 : 1);

  useEffect(() => {
    if (!isPlaying) {
      setProgress(1);
      return;
    }

    if (!pathData || pathData.length === 0) {
      setProgress(1);
      if (onComplete) onComplete();
      return;
    }

    const totalPoints = pathData.reduce((acc, path) => acc + (path.points ? path.points.length : 0), 0);
    if (totalPoints === 0) {
      setProgress(1);
      if (onComplete) onComplete();
      return;
    }

    let current = 0;
    const interval = setInterval(() => {
      current += Math.max(1, Math.floor(totalPoints / 100));
      if (current >= totalPoints) {
        setProgress(1);
        clearInterval(interval);
        if (onComplete) onComplete();
      } else {
        setProgress(current / totalPoints);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [isPlaying, pathData, onComplete]);

  let pointsAllowed = Math.floor(progress * (pathData || []).reduce((acc, path) => acc + (path.points ? path.points.length : 0), 0));
  const visiblePaths = [];

  for (const path of (pathData || [])) {
    if (pointsAllowed <= 0) break;
    if (!path.points) continue;

    if (path.points.length <= pointsAllowed) {
      visiblePaths.push(path);
      pointsAllowed -= path.points.length;
    } else {
      visiblePaths.push({
        ...path,
        points: path.points.slice(0, pointsAllowed)
      });
      pointsAllowed = 0;
    }
  }

  const getSvgViewBox = (paths) => {
    if (!paths || paths.length === 0) return "0 0 100 100";
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const path of paths) {
      if (!path.points) continue;
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
  };

  const getSvgPoints = (points) => {
    return points.map(p => `${p.x},${p.y}`).join(' ');
  };

  return (
    <svg viewBox={getSvgViewBox(pathData)} preserveAspectRatio="xMidYMid meet">
      {visiblePaths.map((path, i) => (
        <polyline
          key={i}
          points={getSvgPoints(path.points)}
          fill="none"
          stroke={path.color || "#333"}
          strokeWidth={path.weight || 5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
};

function DrawingList() {
  const [dataList, setDataList] = useState([]);
  const [playingId, setPlayingId] = useState(null);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const collectionName = searchParams.get('name') || 'graffiti';

  useEffect(() => {
    const q = query(collection(db, collectionName), orderBy('created_at', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = [];
      snapshot.forEach(doc => {
        items.push({ id: doc.id, ...doc.data() });
      });
      setDataList(items);
    }, (error) => {
      console.error(error);
      alert("データの取得に失敗しました");
    });

    return () => unsubscribe();
  }, [collectionName]);

  const handleDelete = async (id) => {
    if (!window.confirm("本当に削除しますか？")) return;
    try {
      await deleteDoc(doc(db, collectionName, id));
    } catch (error) {
      console.error(error);
      alert("削除に失敗しました");
    }
  };



  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return d.toLocaleString('ja-JP');
  };

  return (
    <div className="list-wrapper">
      <div className="list-header">
        <h1>投稿作品一覧 ({collectionName})</h1>
      </div>

      <div className="list-container">
        {dataList.length === 0 ? (
          <p className="no-data">データがありません</p>
        ) : (
          <div className="grid-list">
            {dataList.map(item => (
              <div key={item.id} className="list-item">
                <div className="item-preview">
                  <AnimatedPreview
                    pathData={item.path_data}
                    isPlaying={playingId === item.id}
                    onComplete={() => setPlayingId(null)}
                  />
                </div>
                <div className="item-info">
                  <div className="item-date">{formatDate(item.created_at)}</div>
                  <div className="btn-group">
                    <button className="play-btn-list" onClick={() => setPlayingId(item.id)}>再生</button>
                    <button className="delete-btn-list" onClick={() => handleDelete(item.id)}>削除</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .list-wrapper {
          width: 100vw;
          height: 100vh;
          background-color: #f5f5f5;
          display: flex;
          flex-direction: column;
          padding: 20px;
          box-sizing: border-box;
          overflow: hidden;
        }

        .list-header {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #ddd;
        }

        .list-header h1 {
          margin: 0;
          font-size: 20px;
          color: #333;
        }

        .list-container {
          flex: 1;
          overflow-y: auto;
          background: white;
          border-radius: 10px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }

        .no-data {
          text-align: center;
          color: #888;
          margin-top: 50px;
        }

        .grid-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 20px;
        }

        .list-item {
          background: #f9f9f9;
          border: 1px solid #eee;
          border-radius: 10px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: transform 0.2s;
        }

        .list-item:hover {
          transform: translateY(-3px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .item-preview {
          background: white;
          width: 100%;
          aspect-ratio: 1/1;
          display: flex;
          align-items: center;
          justify-content: center;
          border-bottom: 1px solid #eee;
          padding: 10px;
          box-sizing: border-box;
        }

        .item-preview svg {
          width: 100%;
          height: 100%;
          overflow: visible;
        }

        .item-info {
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .item-date {
          font-size: 12px;
          color: #555;
          margin-bottom: 8px;
        }

        .btn-group {
          display: flex;
          gap: 8px;
        }

        .delete-btn-list, .play-btn-list {
          flex: 1;
          color: white;
          border: none;
          border-radius: 5px;
          padding: 6px;
          cursor: pointer;
          font-weight: bold;
          font-size: 12px;
          transition: background-color 0.2s;
        }

        .delete-btn-list { background-color: #ff5252; }
        .delete-btn-list:hover { background-color: #d32f2f; }
        
        .play-btn-list { background-color: #2196F3; }
        .play-btn-list:hover { background-color: #1976D2; }


      `}</style>
    </div>
  );
}

export default DrawingList;
