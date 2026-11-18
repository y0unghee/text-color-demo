import { useEffect, useState, type ComponentType } from 'react';
import {
  TextColorScreen,
  TEXT_COLOR_SCREEN_WIDTH,
  TEXT_COLOR_SCREEN_HEIGHT,
} from './components/TextColorScreen';
import { CarouselScreen, CAROUSEL_SCREEN_WIDTH, CAROUSEL_SCREEN_HEIGHT } from './components/CarouselScreen';
import { CarouselScreenV2 } from './components/CarouselScreenV2';
import { CarouselScreenV3 } from './components/CarouselScreenV3';
import iconTooltipTip from './assets/figma/carousel/tooltip-tip.svg';

// Carousel 버튼 순서: 모드 1 = 기존 시안(일괄 변경), 모드 2 = CarouselScreenV3(개별 변경), 테스트 안 = CarouselScreenV2
function CarouselDemo({ mode }: { mode: number }) {
  if (mode === 2) return <CarouselScreenV3 />;
  if (mode === 3) return <CarouselScreenV2 />;
  return <CarouselScreen />;
}

// modes: 이 화면에서 전환할 수 있는 시안(모드) 개수. 없으면 전환 없음
// modeLabels: 모드 버튼 이름 (없으면 '모드 N')
// modeHints: 모드 버튼에 마우스를 올렸을 때 보여줄 설명 (모드 번호 → 문구)
type ScreenConfig = {
  Screen: ComponentType<{ mode: number }>;
  width: number;
  height: number;
  modes?: number;
  modeLabels?: Record<number, string>;
  modeHints?: Record<number, string>;
};

// 주소 해시(#/...)별 화면. 해시가 없거나 모르는 값이면 첫 번째 화면을 보여줌
const SCREENS: Record<string, ScreenConfig> = {
  'text-color': { Screen: TextColorScreen, width: TEXT_COLOR_SCREEN_WIDTH, height: TEXT_COLOR_SCREEN_HEIGHT, modes: 2 },
  carousel: {
    Screen: CarouselDemo,
    width: CAROUSEL_SCREEN_WIDTH,
    height: CAROUSEL_SCREEN_HEIGHT,
    modes: 3,
    modeLabels: { 3: '테스트 안' },
    modeHints: { 1: "텍스트, 버튼 일부 설정과 간격이 '일괄 변경'되는 안", 2: '모든 설정이 개별 변경되는 안' },
  },
};
const DEFAULT_SCREEN = 'text-color';

// '#/text-color?mode=2' → { key: 'text-color', mode: 2 }
function getRoute() {
  const [path, query = ''] = window.location.hash.replace(/^#\/?/, '').split('?');
  const key = path in SCREENS ? path : DEFAULT_SCREEN;
  const modes = SCREENS[key].modes ?? 1;
  const mode = Number(new URLSearchParams(query).get('mode'));
  return { key, mode: Number.isInteger(mode) && mode >= 1 && mode <= modes ? mode : 1 };
}

function setRoute(key: string, mode: number) {
  window.location.hash = mode === 1 ? `/${key}` : `/${key}?mode=${mode}`;
}

// 시안(모드) 전환 버튼. 화면 확대·축소와 상관없이 브라우저 창 아래 가운데에 고정
function ModeSwitcher({
  modes,
  mode,
  labels,
  hints,
  onChange,
}: {
  modes: number;
  mode: number;
  labels?: Record<number, string>;
  hints?: Record<number, string>;
  onChange: (mode: number) => void;
}) {
  return (
    <div className="fixed bottom-[16px] left-1/2 z-50 -translate-x-1/2 rounded-[10px] bg-white p-[4px] shadow-[0px_0px_1px_0px_rgba(65,78,97,0.08),0px_8px_24px_0px_rgba(65,78,97,0.16)]">
      <div className="flex items-center rounded-[8px] bg-[#f6f7f9] p-[4px]">
        {Array.from({ length: modes }, (_, index) => index + 1).map((value) => {
          const isActive = value === mode;
          const hint = hints?.[value];
          return (
            <button
              key={value}
              type="button"
              onClick={() => onChange(value)}
              className={`group relative flex h-[28px] cursor-pointer items-center justify-center rounded-[6px] px-[12px] font-['Pretendard'] text-[12px] leading-[18px] whitespace-nowrap ${
                isActive
                  ? 'bg-white font-medium text-black shadow-[0px_1px_0.5px_rgba(65,78,97,0.08),0px_2px_4px_rgba(65,78,97,0.16)]'
                  : 'font-normal text-[#667080]'
              }`}
            >
              {labels?.[value] ?? `모드 ${value}`}
              {/* hover 툴팁: 버튼 위 가운데, 아래쪽 꼬리 */}
              {hint && (
                <span className="pointer-events-none invisible absolute bottom-[calc(100%+10px)] left-1/2 flex -translate-x-1/2 flex-col items-center group-hover:visible">
                  <span className="rounded-[4px] bg-[#181d25] p-[8px] font-['Pretendard'] text-[12px] leading-[18px] font-medium whitespace-nowrap text-white">
                    {hint}
                  </span>
                  <img src={iconTooltipTip} alt="" width={10} height={4} className="block rotate-180" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function App() {
  const [route, setRouteState] = useState(getRoute);
  const [viewportWidth, setViewportWidth] = useState(() => document.documentElement.clientWidth);

  useEffect(() => {
    function handleHashChange() {
      setRouteState(getRoute());
    }
    function handleResize() {
      setViewportWidth(document.documentElement.clientWidth);
    }
    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const { Screen, width, height, modes, modeLabels, modeHints } = SCREENS[route.key];
  // 화면 너비에 맞춰 확대/축소 (1920px 기준 약 1.27배)
  const scale = viewportWidth / width;

  return (
    <div className="w-full overflow-hidden bg-[#e4e6e9]">
      <div style={{ width: width * scale, height: height * scale }}>
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
          {/* 모드를 바꾸면 화면 상태(선택·색상 등)를 처음부터 시작 */}
          <Screen key={`${route.key}-${route.mode}`} mode={route.mode} />
        </div>
      </div>
      {modes && modes > 1 && <ModeSwitcher modes={modes} mode={route.mode} labels={modeLabels} hints={modeHints} onChange={(mode) => setRoute(route.key, mode)} />}
    </div>
  );
}

export default App;
