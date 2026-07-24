import { Routes, Route, Link, useLocation } from 'react-router-dom';
import P5Canvas from './lib/P5Canvas';
import Display from './lib/Display';
import DrawingList from './lib/DrawingList';
import './App.css';

function App() {
  const location = useLocation();
  const searchParams = location.search;

  const getLinkProps = (path) => {
    return {
      to: path + searchParams,
      className: location.pathname === path ? 'active' : ''
    };
  };

  return (
    <main>
      <nav
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="nav-item">
          <Link {...getLinkProps('/')} title="お絵描き画面へ">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.333 16.048L16.57 3.81a2.56 2.56 0 0 1 3.62 3.619L7.951 19.667a2 2 0 0 1-1.022.547L3 21l.786-3.93a2 2 0 0 1 .547-1.022z" /><path d="M14.5 6.5l3 3" /></svg>
          </Link>
        </div>

        <Link {...getLinkProps('/display')} title="表示画面へ">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6z" /><path d="M8 20h8" /></svg>
        </Link>

        <div className="divider"></div>

        <Link {...getLinkProps('/list')} title="管理リスト(List)">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
        </Link>
      </nav>

      <Routes>
        <Route path="/" element={<P5Canvas />} />
        <Route path="/display" element={<Display />} />
        <Route path="/list" element={<DrawingList />} />
      </Routes>
    </main>
  );
}

export default App;
