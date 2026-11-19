// Carousel 모드 2만 따로 게시하기 위한 진입 파일 (mode2.html → docs/mode2/)
// 모드 전환 버튼 없이 CarouselScreenV3 화면만, 기존 App처럼 창 너비에 맞춰 확대·축소
import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { CarouselScreenV3 } from './components/CarouselScreenV3';
import { CAROUSEL_SCREEN_WIDTH, CAROUSEL_SCREEN_HEIGHT } from './components/CarouselScreen';

function Mode2App() {
  const [viewportWidth, setViewportWidth] = useState(() => document.documentElement.clientWidth);
  useEffect(() => {
    const handleResize = () => setViewportWidth(document.documentElement.clientWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const scale = viewportWidth / CAROUSEL_SCREEN_WIDTH;
  return (
    <div className="w-full overflow-hidden bg-[#e4e6e9]">
      <div style={{ width: CAROUSEL_SCREEN_WIDTH * scale, height: CAROUSEL_SCREEN_HEIGHT * scale }}>
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
          <CarouselScreenV3 />
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Mode2App />
  </StrictMode>,
);
