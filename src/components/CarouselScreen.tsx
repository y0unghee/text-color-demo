import { useEffect, useRef, useState, type ChangeEvent, type CSSProperties, type DragEvent, type PointerEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import iconExit from '../assets/figma/text-color/exit.svg';
import iconChevronDown from '../assets/figma/text-color/chevron-down-page.svg';
import iconTheme from '../assets/figma/carousel/theme.svg';
import iconUndo from '../assets/figma/carousel/undo.svg';
import iconRedo from '../assets/figma/carousel/redo.svg';
import iconMirroring from '../assets/figma/carousel/mirroring.svg';
import iconDesktop from '../assets/figma/carousel/desktop.svg';
import iconMobile from '../assets/figma/carousel/mobile.svg';
import iconArrowLeft from '../assets/figma/carousel/arrow-left.svg';
import iconArrowRight from '../assets/figma/carousel/arrow-right.svg';
import iconOverflow from '../assets/figma/carousel/overflow.svg';
import iconChevronRightEdge from '../assets/figma/carousel/chevron-right-edge.svg';
import iconChevronRight from '../assets/figma/carousel/chevron-right.svg';
import iconImageFilled from '../assets/figma/carousel/image-filled.svg';
import iconReorderDot from '../assets/figma/carousel/reorder-dot.svg';
import iconLayout from '../assets/figma/carousel/layout.svg';
import iconError from '../assets/figma/carousel/error.svg';
import iconBack from '../assets/figma/carousel/back.svg';
import iconDeleteSlide from '../assets/figma/carousel/delete-slide.svg';
import iconImage from '../assets/figma/carousel/image.svg';
import iconPalette from '../assets/figma/carousel/palette.svg';
import iconLayer from '../assets/figma/carousel/layer.svg';
import iconSync from '../assets/figma/carousel/sync.svg';
import iconFocalPoint from '../assets/figma/carousel/focal-point.svg';
import iconDelete from '../assets/figma/carousel/delete.svg';
import iconAi from '../assets/figma/carousel/ai.svg';
import iconSwitchOn from '../assets/figma/carousel/switch-on.svg';
import iconDirectionRow from '../assets/figma/carousel/direction-row.svg';
import iconDirectionColumn from '../assets/figma/carousel/direction-column.svg';
import iconChevronDownPanel from '../assets/figma/text-color/chevron-down-panel.svg';
import iconChevronRightPanel from '../assets/figma/text-color/chevron-right.svg';
import mediaChecker from '../assets/figma/carousel/media-checker.png';
import colorPreview from '../assets/figma/carousel/color-preview.png';
import slideOvenToaster from '../assets/slides/oven-toaster.webp';
import slideOvenToasterMobile from '../assets/slides/oven-toaster-mobile.webp';
import slideVacuumDesktop from '../assets/slides/vacuum-desktop.webp';
import slideVacuumMobile from '../assets/slides/vacuum-mobile.webp';
import slideHumidifierDesktop from '../assets/slides/humidifier-desktop.webp';
import slideHumidifierMobile from '../assets/slides/humidifier-mobile.webp';
import slideLanternDesktop from '../assets/slides/lantern-desktop.webp';
import slideLanternMobile from '../assets/slides/lantern-mobile.webp';
import slideBlanket from '../assets/slides/blanket.jpg';
import slideEcoHeater from '../assets/slides/eco-heater.jpg';
import slideFreeVoltHair from '../assets/slides/free-volt-hair.jpg';
import slideFoldingLantern from '../assets/slides/folding-lantern.jpg';
import slideGrinder from '../assets/slides/grinder.jpg';
import slideCarbonHeater from '../assets/slides/carbon-heater.webp';

// 브라우저 크롬(browser/desktop, 88px)을 제외한 편집 영역 크기
export const CAROUSEL_SCREEN_WIDTH = 1512;
export const CAROUSEL_SCREEN_HEIGHT = 894;

const DM_SANS: CSSProperties = { fontVariationSettings: '"opsz" 14' };
const MAX_SLIDES = 10;

// ---------------------------------------------------------------- 데이터

// scheme: 'light' = 밝은 색상(흰 글자), 'dark' = 어두운 색상(검은 글자)
type Scheme = 'light' | 'dark';
type SlideButton = { label: string; link: string };
type Slide = {
  id: number;
  title: string; // 빈 문자열이면 타이틀 없음
  description: string;
  buttons: SlideButton[]; // 슬라이드마다 버튼 개수가 다를 수 있음 (문구·링크는 슬라이드별)
  image: string | null; // null이면 배경 없음
  mobileImage?: string; // 모바일 전용 이미지. 없으면 image를 같이 사용
  imagePosition?: string; // 사진 보이는 위치 (CSS object-position). 없으면 가운데
  mobileImagePosition?: string; // 모바일에서만 다른 위치가 필요할 때. 없으면 imagePosition 사용
  fileName: string;
  mediaType: 'image' | 'video';
  overlay: number; // 오버레이 불투명도(%)
  scheme: Scheme;
  link: string;
};

type SlideContent = Pick<Slide, 'title' | 'description' | 'image' | 'mobileImage' | 'imagePosition' | 'mobileImagePosition'> & { buttons: string[] };

function makeSlide(id: number, content: SlideContent): Slide {
  const buttons = content.buttons.map((label) => ({ label, link: '' }));
  return { id, ...content, buttons, fileName: 'fileName.png', mediaType: 'image', overlay: 20, scheme: 'light', link: '' };
}

// 시코몰(cicomall.com) 상품을 참고한 슬라이드 문구와 받은 상품 이미지
const SLIDE_CONTENTS: SlideContent[] = [
  { title: 'HEXAR UL3 랜턴', description: '걸고, 세우고, 붙여서\n손바닥만 한 크기로 어디서나 밝혀요', buttons: ['자세히 보기', '전체 보기'], image: slideLanternDesktop, mobileImage: slideLanternMobile },
  { title: '포근한 잠자리', description: '부드러운 촉감과 은은한 온기\n탄소 블랭킷이 선사하는 기분 좋은 수면', buttons: ['구입하기'], image: slideBlanket },
  { title: '비박, 캠핑, 등산 어디든', description: '가볍고 작게, 오랜시간 쓸만한 광량\n전문 산악인이 만든 랜턴의 디테일을 확인해 보세요', buttons: ['자세히 보기', '구입하기'], image: slideFoldingLantern },
  { title: '간절기에서 혹한기까지', description: '100W부터 따듯함이 느껴지는\n절전의 대명사 리플렉트 에코히터', buttons: ['구입하기', '자세히 보기'], image: slideEcoHeater, mobileImagePosition: 'right center' },
  { title: '식빵 1장 단 1분', description: '예열 없이 바로 굽는 토스트\n바쁜 아침 준비가 1분이면 끝나요', buttons: ['자세히 보기', '구입하기'], image: slideOvenToaster, mobileImage: slideOvenToasterMobile },
  { title: '수량이 얼마 안남았어요', description: '스타일과 기능을 모두 겸비한\n시코의 주방컬렉션으로 추석을 준비해요', buttons: ['구입하기', '전체 보기'], image: slideGrinder, imagePosition: 'center 70%' },
  { title: '스팀 가습기 H220', description: '따뜻한 스팀으로 촉촉하게\n건조한 겨울 실내 공기를 바꿔보세요', buttons: ['자세히 보기'], image: slideHumidifierDesktop, mobileImage: slideHumidifierMobile },
  { title: '무선청소기 G040', description: '가볍게 들고 어디든\n핸디와 스틱을 오가는 2in1 청소기', buttons: ['자세히 보기'], image: slideVacuumDesktop, mobileImage: slideVacuumMobile },
  { title: '리플렉트 카본히터 REH-700', description: '매서운 한파에도 빠르게 공간을 데워주는\n강력한 카본 히터', buttons: ['구입하기'], image: slideCarbonHeater, mobileImagePosition: '66% center' },
  { title: '일본, 북미 여행 필수품', description: '어디에서든 스타일은 포기할 수 없죠\n글로벌 프리볼트로 안심 사용', buttons: ['전체 보기'], image: slideFreeVoltHair },
];

const INITIAL_SLIDES: Slide[] = SLIDE_CONTENTS.map((content, index) => makeSlide(index + 1, content));

// 한글은 DM Sans에 없으므로 Pretendard로 표시
const SITE_FONT = "font-['DM_Sans',_'Pretendard']";

// ---------------------------------------------------------------- 공통 UI 조각

function Divider() {
  return <div className="h-[16px] w-px shrink-0 bg-[rgba(51,62,76,0.16)]" />;
}

// 버튼 hover 시 깔리는 4% 오버레이
const HOVER_LAYER = 'hover:bg-[rgba(24,29,37,0.04)]';

function Toolbar() {
  return (
    <div className="absolute top-0 right-0 left-0 z-10 flex h-[55px] items-center border-b border-[rgba(51,62,76,0.1)] bg-white pt-[9px] pr-[12px] pb-[10px] pl-[10px]">
      <div className="relative flex w-full items-center justify-between">
        <div className="flex items-center gap-[8px]">
          <button type="button" className={`flex size-[32px] items-center justify-center rounded-[8px] ${HOVER_LAYER}`}>
            <img src={iconExit} alt="" width={16} height={16} />
          </button>
          <div className="flex items-center gap-[4px]">
            <Divider />
            <button type="button" className={`flex items-center gap-[4px] rounded-[8px] py-[7px] pr-[12px] pl-[8px] ${HOVER_LAYER}`}>
              <img src={iconTheme} alt="" width={16} height={16} />
              <span className="font-['Pretendard'] text-[12px] leading-[18px] font-medium whitespace-nowrap text-black">스타일</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-[12px]">
          <div className="flex items-center">
            <button type="button" className={`flex size-[32px] items-center justify-center rounded-[8px] ${HOVER_LAYER}`}>
              <img src={iconUndo} alt="" width={20} height={20} />
            </button>
            <button type="button" className={`flex size-[32px] items-center justify-center rounded-[8px] ${HOVER_LAYER}`}>
              <img src={iconRedo} alt="" width={20} height={20} />
            </button>
          </div>
          <div className="flex items-center gap-[4px]">
            <Divider />
            <button type="button" className={`flex h-[32px] items-center gap-[4px] rounded-[8px] py-[3px] pr-[12px] pl-[8px] ${HOVER_LAYER}`}>
              <img src={iconMirroring} alt="" width={16} height={16} />
              <span className="font-['Pretendard'] text-[12px] leading-[18px] font-medium whitespace-nowrap text-black">미러링</span>
            </button>
            <Divider />
            <button type="button" className={`flex h-[32px] items-center justify-center rounded-[8px] px-[12px] py-[7px] ${HOVER_LAYER}`}>
              <span className="font-['Pretendard'] text-[12px] leading-[18px] font-medium whitespace-nowrap text-black">미리보기</span>
            </button>
            <button type="button" className="flex h-[32px] w-[68px] min-w-[64px] items-center justify-center rounded-[8px] bg-[#181d25] px-[12px] py-[6px]">
              <span className="font-['Pretendard'] text-[12px] leading-[18px] font-medium whitespace-nowrap text-white">업데이트</span>
            </button>
          </div>
        </div>

        <div className="absolute top-1/2 left-[calc(50%+1px)] flex -translate-x-1/2 -translate-y-1/2 items-center">
          <div className="flex w-[200px] items-center gap-[8px] rounded-[8px] bg-[#f6f7f9] py-[7px] pr-[8px] pl-[12px]">
            <span className="flex-1 font-['Pretendard'] text-[12px] leading-[18px] font-medium text-black">Home</span>
            <img src={iconChevronDown} alt="" width={16} height={16} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ViewportBar({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex w-full shrink-0 items-center gap-[4px] overflow-hidden rounded-[4px] bg-[#f6f7f9] px-[10px] py-[9px]">
      <img src={icon} alt="" width={14} height={14} />
      <span className="font-['Pretendard'] text-[11px] leading-[14px] font-medium whitespace-nowrap text-[#414e61]">{label}</span>
    </div>
  );
}

// ---------------------------------------------------------------- 캔버스(사이트 미리보기)

const HEADER_TEXT = "font-['DM_Sans'] font-normal uppercase whitespace-nowrap text-[#372320] leading-[1.6]";

function DesktopHeader() {
  const nav = ['Shop', 'About', 'Journal', 'Info', 'The Story'];
  const utilities = ['Search', 'Sign in', 'Bag [0]'];
  return (
    <div className="absolute top-0 left-0 flex h-[25.875px] w-[920px] items-center bg-white px-[7.667px]">
      <div className="relative flex h-full flex-1 items-center justify-between">
        {[nav, utilities].map((items, groupIndex) => (
          <div key={groupIndex} className="flex h-full items-center gap-[5.75px]">
            {items.map((label) => (
              <span key={label} className={`px-[3.833px] text-[6.708px] ${HEADER_TEXT}`} style={DM_SANS}>
                {label}
              </span>
            ))}
          </div>
        ))}
        <span className="absolute top-1/2 left-[calc(50%-17.1px)] -translate-y-1/2 font-['Inter'] text-[9.583px] leading-[13.417px] font-semibold text-[#372320]">
          BRAND
        </span>
      </div>
    </div>
  );
}

function MobileHeader() {
  return (
    <div className="absolute top-0 left-0 flex h-[28.923px] w-[188px] items-center justify-between bg-white px-[7.713px]">
      <span className={`text-[6.267px] ${HEADER_TEXT}`} style={DM_SANS}>
        Menu
      </span>
      <span className={`text-[6.267px] ${HEADER_TEXT}`} style={DM_SANS}>
        Bag [0]
      </span>
      <span className="absolute top-[calc(50%-1.21px)] left-[calc(50%-17.11px)] -translate-y-1/2 font-['Inter'] text-[9.641px] leading-[13.497px] font-semibold text-[#372320]">
        BRAND
      </span>
    </div>
  );
}

// ---------------------------------------------------------------- 모든 슬라이드에 공통으로 적용되는 디자인 설정

type Device = 'desktop' | 'mobile';
// none: 아무것도 선택 안 됨(패널 없음)
type Selected = 'none' | 'section' | 'title' | 'description' | 'buttons';

// 캔버스는 실제 화면을 줄여서 보여줌 → 캔버스 1px이 실제 몇 px인지 (데스크탑 1920px, 모바일 393px 기준)
const REAL_PER_CANVAS: Record<Device, number> = { desktop: 1920 / 920, mobile: 393 / 188 };

// 간격 값은 실제 사이트 기준 px (핸들을 드래그할 때 이 숫자가 보임)
type Spacing = { titleDesc: number; textButtons: number; buttonGap: number; bottom: number };

// 텍스트 스타일: 캔버스에서의 글자 크기(px)
const TEXT_STYLES = [
  { id: '제목 1', desktop: 34.5, mobile: 23, heading: true },
  { id: '제목 2', desktop: 28.75, mobile: 20.5, heading: true },
  { id: '제목 3', desktop: 24.917, mobile: 18, heading: true },
  { id: '제목 4', desktop: 19.167, mobile: 14.5, heading: true },
  { id: '본문 1', desktop: 9.583, mobile: 8.4, heading: false },
  { id: '본문 2', desktop: 8.625, mobile: 7.7, heading: false },
  { id: '본문 3', desktop: 7.667, mobile: 7, heading: false },
] as const;
type TextStyleId = (typeof TEXT_STYLES)[number]['id'];

// value가 null이면 슬라이드 색상(밝은/어두운) 기본값을 따름
const TEXT_COLORS: { name: string; value: string | null }[] = [
  { name: '색상 테마 기본', value: null },
  { name: '흰색', value: '#ffffff' },
  { name: '검정', value: '#111111' },
  { name: '웜 베이지', value: '#e9dcc9' },
  { name: '포인트 블루', value: '#2e97ff' },
];

type ButtonStyle = '강조 버튼' | '보조 버튼';
type ButtonSize = '작게' | '보통' | '크게';
type Direction = 'row' | 'column';
const BUTTON_SCALE: Record<ButtonSize, number> = { 작게: 0.85, 보통: 1, 크게: 1.2 };

type Design = {
  titleStyle: TextStyleId;
  descStyle: TextStyleId;
  titleColor: string | null;
  descColor: string | null;
  buttonStyles: [ButtonStyle, ButtonStyle];
  buttonSize: Record<Device, ButtonSize>;
  buttonDirection: Record<Device, Direction>;
  buttonFill: boolean; // 가로 영역 채우기: 모바일에만 있는 설정
  spacing: Record<Device, Spacing>;
};

// 기본값 = 피그마 시안 값 (간격은 캔버스 값을 실제 px로 환산)
const INITIAL_DESIGN: Design = {
  titleStyle: '제목 3',
  descStyle: '본문 3',
  titleColor: null,
  descColor: null,
  buttonStyles: ['강조 버튼', '보조 버튼'],
  buttonSize: { desktop: '보통', mobile: '보통' },
  buttonDirection: { desktop: 'row', mobile: 'row' },
  buttonFill: false,
  spacing: {
    desktop: { titleDesc: 12, textButtons: 36, buttonGap: 8, bottom: 64 },
    mobile: { titleDesc: 12, textButtons: 32, buttonGap: 8, bottom: 64 },
  },
};

function textStyle(id: TextStyleId) {
  return TEXT_STYLES.find((style) => style.id === id) ?? TEXT_STYLES[2];
}

// 밝은 색상 = 흰 글자 / 어두운 색상 = 검은 글자
function schemeColors(scheme: Scheme) {
  return scheme === 'light'
    ? { strong: '#fff', soft: 'rgba(255,255,255,0.8)', filledBg: '#fff', filledText: '#111', line: '#fff', arrow: '' }
    : { strong: '#111', soft: 'rgba(17,17,17,0.8)', filledBg: '#111', filledText: '#fff', line: '#111', arrow: 'invert(1)' };
}

// 데스크탑·모바일 고정 크기 값 (캔버스 px)
type SlideMetrics = {
  padTop: number;
  padX: number;
  button: number;
  buttonPad: { filled: [number, number]; outlined: [number, number] }; // [세로, 가로]
  buttonBorder: number;
  indicatorPad: string;
  indicatorHeight: number;
  barGap: number;
  barPad: number;
  bar: [number, number];
  outline: string;
};

const DESKTOP_METRICS: SlideMetrics = {
  padTop: 30.667,
  padX: 17.25,
  button: 6.229,
  buttonPad: { filled: [6.708, 12.937], outlined: [6.229, 12.458] },
  buttonBorder: 0.479,
  indicatorPad: '11.5px 19.167px',
  indicatorHeight: 30.667,
  barGap: 3.833,
  barPad: 2.875,
  bar: [17.25, 0.958],
  outline: '#09f',
};

const MOBILE_METRICS: SlideMetrics = {
  padTop: 19.282,
  padX: 7.713,
  button: 6.267,
  buttonPad: { filled: [6.749, 13.015], outlined: [6.749, 13.015] },
  buttonBorder: 0.482,
  indicatorPad: '11.569px 19.282px',
  indicatorHeight: 30.851,
  barGap: 3.856,
  barPad: 2.892,
  bar: [17.354, 0.964],
  outline: '#80ccff',
};

const METRICS: Record<Device, SlideMetrics> = { desktop: DESKTOP_METRICS, mobile: MOBILE_METRICS };

// ---------------------------------------------------------------- 간격 핸들 (피그마 spacing: 기본 / hover / pressed & drag)

// 마우스를 따라다니는 안내(시안 snackbar 모양). 슬라이드 밖으로 나가도 잘리지 않게 화면 맨 위 레이어에 그림
const CURSOR_LAYER_ID = 'carousel-cursor-layer';
const CURSOR_OFFSET = 16; // 커서 아래로 띄우는 거리

function CursorSnackbar({ label, clientX, clientY }: { label: string; clientX: number; clientY: number }) {
  const layer = document.getElementById(CURSOR_LAYER_ID);
  if (!layer) return null;
  const rect = layer.getBoundingClientRect();
  const scale = rect.width / layer.offsetWidth || 1;
  return createPortal(
    <div
      className="pointer-events-none absolute flex -translate-x-1/2 items-center justify-center overflow-hidden rounded-[4px] bg-[#333e4c] px-[8px] py-[6px]"
      style={{ left: (clientX - rect.left) / scale, top: (clientY - rect.top) / scale + CURSOR_OFFSET }}
    >
      <span className="font-['Pretendard'] text-[10px] leading-[14px] font-normal whitespace-nowrap text-white">{label}</span>
    </div>,
    layer,
  );
}

// direction: vertical = 위아래 간격(가로 막대), horizontal = 버튼 사이 간격(세로 막대)
function SpacingHandle({
  direction = 'vertical',
  value,
  factor,
  onChange,
  onStart,
  className,
  style,
}: {
  direction?: 'vertical' | 'horizontal';
  value: number;
  factor: number;
  onChange: (value: number) => void;
  onStart?: () => void;
  className: string;
  style?: CSSProperties;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  // 안내를 띄울 마우스 위치(화면 좌표)
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);
  const start = useRef<{ x: number; y: number; value: number; scale: number } | null>(null);
  const isHorizontal = direction === 'horizontal';

  const handleDown = (event: PointerEvent<HTMLDivElement>) => {
    event.stopPropagation();
    const element = event.currentTarget;
    element.setPointerCapture(event.pointerId);
    // 화면 전체가 창 너비에 맞춰 확대·축소돼 있으므로 실제 픽셀 → 캔버스 px로 환산
    const scale = element.getBoundingClientRect().width / element.offsetWidth || 1;
    start.current = { x: event.clientX, y: event.clientY, value, scale };
    setIsDragging(true);
    onStart?.();
  };

  const handleMove = (event: PointerEvent<HTMLDivElement>) => {
    setPointer({ x: event.clientX, y: event.clientY });
    const from = start.current;
    if (!from) return;
    // 위로(버튼 사이는 오른쪽으로) 끌수록 간격이 넓어짐
    const moved = isHorizontal ? event.clientX - from.x : from.y - event.clientY;
    const next = Math.round(from.value + (moved / from.scale) * factor);
    onChange(Math.min(200, Math.max(0, next)));
  };

  const handleUp = () => {
    start.current = null;
    setIsDragging(false);
  };

  return (
    <div
      className={`absolute z-20 flex touch-none items-center justify-center ${isHorizontal ? 'cursor-ew-resize' : 'cursor-ns-resize'} ${className}`}
      // hover·pressed: 간격 영역 전체에 분홍 10%
      style={{ ...style, background: isHovered || isDragging ? 'rgba(255,16,204,0.1)' : undefined }}
      onPointerDown={handleDown}
      onPointerMove={handleMove}
      onPointerUp={handleUp}
      onPointerCancel={handleUp}
      onPointerEnter={(event) => {
        setIsHovered(true);
        setPointer({ x: event.clientX, y: event.clientY });
      }}
      onPointerLeave={() => setIsHovered(false)}
      onClick={(event) => event.stopPropagation()}
    >
      <span className={`rounded-[16px] bg-[#ff10cc] ${isHorizontal ? 'h-[16px] w-[2px]' : 'h-[2px] w-[16px]'}`} />
      {/* Hover: '모든 슬라이드에 적용돼요' / 드래그 중: 간격 숫자 — 둘 다 마우스를 따라감 */}
      {pointer && (isDragging || isHovered) && (
        <CursorSnackbar label={isDragging ? String(value) : '모든 슬라이드에 적용돼요'} clientX={pointer.x} clientY={pointer.y} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------- 캔버스(사이트 미리보기)

// 선택된 요소: 진하게 / 선택 안 된 요소: hover 시 연하게(50%) 표시
function Outline({ color, isSelected }: { color: string; isSelected: boolean }) {
  return (
    <span
      className={`pointer-events-none absolute -inset-px border border-solid ${isSelected ? '' : 'opacity-0 group-hover:opacity-50'}`}
      style={{ borderColor: color }}
    />
  );
}

// 캔버스 텍스트: 선택된 텍스트를 한 번 더 클릭하면 그 자리에 커서가 놓이고 바로 편집
// 제목·설명 모두: Enter는 줄바꿈, 바깥 클릭으로 저장 / Esc: 취소
type TextKind = 'title' | 'description';
type EditingText = { kind: TextKind; device: Device } | null;

function EditableText({
  text,
  isEditing,
  multiline,
  className,
  style,
  outline,
  onClick,
  onDone,
}: {
  text: string;
  isEditing: boolean;
  multiline: boolean;
  className: string;
  style: CSSProperties;
  outline: ReactNode;
  onClick: () => void;
  onDone: (value: string | null) => void;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const clickPoint = useRef<{ x: number; y: number } | null>(null);
  const isDone = useRef(false);
  // 편집이 끝날 때마다 새로 그려서 브라우저가 바꾼 DOM을 React 상태로 되돌림
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!isEditing) return;
    isDone.current = false;
    const element = ref.current;
    if (!element) return;
    element.focus();
    const point = clickPoint.current;
    let range = point ? document.caretRangeFromPoint?.(point.x, point.y) : null;
    if (!range || !element.contains(range.startContainer)) {
      range = document.createRange();
      range.selectNodeContents(element);
      range.collapse(false);
    }
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  }, [isEditing]);

  const finish = (isCancel: boolean) => {
    if (isDone.current) return;
    isDone.current = true;
    const value = (ref.current?.innerText ?? text).replace(/\n+$/, '');
    onDone(isCancel ? null : value);
    setVersion((current) => current + 1);
  };

  return (
    <span
      className="group relative inline-block"
      onClick={(event) => {
        event.stopPropagation();
        clickPoint.current = { x: event.clientX, y: event.clientY };
        onClick();
      }}
    >
      <span
        key={version}
        ref={ref}
        contentEditable={isEditing}
        suppressContentEditableWarning
        // block: 바깥 span(기본 16px·줄간격 24px)의 줄 높이를 따라가지 않고 텍스트 스타일의 줄간격을 그대로 사용
        className={`block ${className} ${isEditing ? 'cursor-text outline-none select-text' : 'cursor-default'}`}
        style={style}
        onBlur={() => isEditing && finish(false)}
        onKeyDown={(event) => {
          if (!isEditing) return;
          if (event.key === 'Escape') {
            event.preventDefault();
            finish(true);
          } else if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
            event.preventDefault();
            if (multiline) document.execCommand('insertLineBreak');
            else finish(false);
          }
        }}
      >
        {text}
      </span>
      {outline}
    </span>
  );
}

type SlideViewProps = {
  slide: Slide;
  index: number;
  count: number;
  device: Device;
  design: Design;
  selected: Selected;
  onSelect: (selected: Selected) => void;
  onSpacingChange: (device: Device, patch: Partial<Spacing>) => void;
  onSpacingStart: () => void;
  editing: EditingText;
  onTextClick: (kind: TextKind, device: Device) => void;
  onTextDone: (kind: TextKind, value: string | null) => void;
};

function SlideView({ slide, index, count, device, design, selected, onSelect, onSpacingChange, onSpacingStart, editing, onTextClick, onTextDone }: SlideViewProps) {
  const metrics = METRICS[device];
  const isDesktop = device === 'desktop';
  const colors = schemeColors(slide.scheme);
  const image = slide.image && (isDesktop ? slide.image : (slide.mobileImage ?? slide.image));
  const factor = REAL_PER_CANVAS[device];
  const spacing = design.spacing[device];
  const toCanvas = (real: number) => real / factor;
  const setSpacing = (patch: Partial<Spacing>) => onSpacingChange(device, patch);

  const titleStyle = textStyle(design.titleStyle);
  const descStyle = textStyle(design.descStyle);
  const textClass = (heading: boolean) => `${SITE_FONT} ${heading ? 'leading-[1.3] font-medium' : 'leading-[1.5] font-normal'} whitespace-pre-line`;

  const isSection = selected === 'section';
  // 간격 핸들은 피그마 시안대로 데스크탑 캔버스에만 표시
  const showSectionHandles = isSection && isDesktop;
  // 간격 영역이 좁아도 잡을 수 있게 최소 8px (시안의 제목↔설명 마커 높이)
  const handleSize = (real: number) => Math.max(toCanvas(real), 8);
  const buttonScale = BUTTON_SCALE[design.buttonSize[device]];
  const isFill = !isDesktop && design.buttonFill;
  const direction = design.buttonDirection[device];
  const isRow = direction === 'row';

  // 요소 사이 간격 + (섹션 선택 시) 간격 핸들
  const gapSpacer = (key: keyof Spacing) => (
    <div className="relative w-full shrink-0" style={{ height: toCanvas(spacing[key]) }}>
      {showSectionHandles && (
        <SpacingHandle
          onStart={onSpacingStart}
          value={spacing[key]}
          factor={factor}
          onChange={(value) => setSpacing({ [key]: value })}
          className="top-1/2 -translate-y-1/2"
          style={{ left: -metrics.padX, right: -metrics.padX, height: handleSize(spacing[key]) }}
        />
      )}
    </div>
  );

  return (
    <div
      className="absolute inset-0 flex flex-col items-center overflow-hidden"
      style={{ padding: `${metrics.padTop}px ${metrics.padX}px ${toCanvas(spacing.bottom)}px` }}
      onClick={(event) => {
        event.stopPropagation();
        onSelect('section');
      }}
    >
      {/* 배경: 이미지가 없으면 회색 */}
      <div className="absolute inset-0 overflow-hidden bg-white">
        {image ? (
          <img
            src={image}
            alt=""
            className="absolute inset-0 size-full max-w-none object-cover"
            style={{ objectPosition: isDesktop ? slide.imagePosition : (slide.mobileImagePosition ?? slide.imagePosition) }}
          />
        ) : (
          <div className="absolute inset-0 bg-[rgba(0,0,0,0.25)]" />
        )}
      </div>
      <div className="absolute inset-0 bg-black" style={{ opacity: slide.overlay / 100 }} />

      <div className="relative flex min-h-px w-full flex-1 flex-col items-center justify-end">
        <div className="flex w-full flex-col items-center text-center break-words break-keep">
          {slide.title && (
            <p className="w-full">
              <EditableText
                text={slide.title}
                isEditing={editing?.kind === 'title' && editing.device === device}
                multiline
                className={textClass(titleStyle.heading)}
                style={{ ...DM_SANS, fontSize: titleStyle[device], color: design.titleColor ?? colors.strong }}
                outline={<Outline color={metrics.outline} isSelected={selected === 'title'} />}
                onClick={() => onTextClick('title', device)}
                onDone={(value) => onTextDone('title', value)}
              />
            </p>
          )}
          {slide.title && slide.description && gapSpacer('titleDesc')}
          {slide.description && (
            <p className="w-full">
              <EditableText
                text={slide.description}
                isEditing={editing?.kind === 'description' && editing.device === device}
                multiline
                className={textClass(descStyle.heading)}
                style={{ ...DM_SANS, fontSize: descStyle[device], color: design.descColor ?? colors.soft }}
                outline={<Outline color={metrics.outline} isSelected={selected === 'description'} />}
                onClick={() => onTextClick('description', device)}
                onDone={(value) => onTextDone('description', value)}
              />
            </p>
          )}
        </div>

        {slide.buttons.length > 0 && gapSpacer('textButtons')}

        {slide.buttons.length > 0 && (
          <div
            className={`group relative flex cursor-default ${isRow ? 'flex-row items-start' : 'flex-col items-center'} ${isFill ? 'w-full items-stretch' : ''}`}
            onClick={(event) => {
              event.stopPropagation();
              onSelect('buttons');
            }}
          >
            {slide.buttons.map((button, buttonIndex) => {
              const isFilled = design.buttonStyles[buttonIndex] === '강조 버튼';
              const [padY, padX] = isFilled ? metrics.buttonPad.filled : metrics.buttonPad.outlined;
              return (
                <div key={buttonIndex} className={`contents`}>
                  {buttonIndex > 0 && (
                    <div className="relative shrink-0 self-stretch" style={isRow ? { width: toCanvas(spacing.buttonGap) } : { height: toCanvas(spacing.buttonGap) }}>
                      {selected === 'buttons' && isDesktop && (
                        <SpacingHandle
                          direction={isRow ? 'horizontal' : 'vertical'}
                          value={spacing.buttonGap}
                          factor={factor}
                          onChange={(value) => setSpacing({ buttonGap: value })}
                          className={isRow ? 'top-0 bottom-0 left-1/2 -translate-x-1/2' : 'top-1/2 right-0 left-0 -translate-y-1/2'}
                          style={isRow ? { width: handleSize(spacing.buttonGap) } : { height: handleSize(spacing.buttonGap) }}
                        />
                      )}
                    </div>
                  )}
                  <span
                    className={`flex items-center justify-center rounded-[1.917px] border-solid ${SITE_FONT} leading-[1.2] font-medium whitespace-nowrap ${
                      isFill && isRow ? 'flex-1' : ''
                    }`}
                    style={{
                      ...DM_SANS,
                      fontSize: metrics.button * buttonScale,
                      padding: `${padY * buttonScale}px ${padX * buttonScale}px`,
                      borderWidth: metrics.buttonBorder,
                      borderColor: isFilled ? 'transparent' : colors.line,
                      background: isFilled ? colors.filledBg : 'transparent',
                      color: isFilled ? colors.filledText : colors.strong,
                    }}
                  >
                    {button.label}
                  </span>
                </div>
              );
            })}
            <Outline color={metrics.outline} isSelected={selected === 'buttons'} />
          </div>
        )}
      </div>

      {/* 인디케이터: 슬라이드 개수만큼, 현재 슬라이드만 진하게 */}
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 flex w-full -translate-x-1/2 items-center justify-center"
        style={{ height: metrics.indicatorHeight, padding: metrics.indicatorPad }}
      >
        <div className="flex max-w-full items-start" style={{ gap: metrics.barGap, padding: metrics.barPad }}>
          {Array.from({ length: count }, (_, barIndex) => (
            <span
              key={barIndex}
              className="min-w-[4px] shrink rounded-[0.479px] transition-opacity duration-200"
              style={{ width: metrics.bar[0], height: metrics.bar[1], background: colors.line, opacity: barIndex === index ? 1 : 0.4 }}
            />
          ))}
        </div>
      </div>

      {/* 섹션 아래 여백 핸들: 시안처럼 버튼 바로 아래 12px 영역 */}
      {showSectionHandles && (
        <SpacingHandle
          onStart={onSpacingStart}
          value={spacing.bottom}
          factor={factor}
          onChange={(value) => setSpacing({ bottom: value })}
          className="right-0 left-0 h-[12px]"
          style={{ bottom: toCanvas(spacing.bottom) - 12 }}
        />
      )}

      {/* 좌우 화살표: 이번 버전에선 클릭으로 넘기지 않음 */}
      {isDesktop && (
        <div className="pointer-events-none absolute top-1/2 left-1/2 flex w-[885.5px] -translate-x-1/2 -translate-y-1/2 items-center justify-between">
          {[iconArrowLeft, iconArrowRight].map((icon) => (
            <span key={icon} className="flex size-[19.167px] items-center justify-center rounded-[1.917px]">
              <img src={icon} alt="" width={11.5} height={11.5} style={{ filter: colors.arrow }} />
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

type CanvasProps = Omit<SlideViewProps, 'device'>;

function Canvas(props: CanvasProps) {
  const isSection = props.selected === 'section';
  return (
    // 슬라이드 밖(회색 배경, 헤더, 기기 이름 바 등)을 누르면 선택 해제 → 패널 숨김
    <div className="absolute top-[55px] left-0 h-[839px] w-[1512px]" onClick={() => props.onSelect('none')}>
      <div className="absolute top-[40px] left-[40px] flex h-[799px] w-[920px] flex-col gap-[12px]">
        <ViewportBar icon={iconDesktop} label="데스크탑" />
        <div className="relative min-h-px w-full flex-1 overflow-hidden bg-white">
          <DesktopHeader />
          <div className="absolute top-[25.88px] left-0 h-[517.5px] w-[920px]">
            <SlideView {...props} device="desktop" />
          </div>
          {isSection && <div className="pointer-events-none absolute top-[26px] left-0 h-[517px] w-[920px] border border-solid border-[#09f]" />}
        </div>
      </div>

      <div className="absolute top-[40px] left-[980px] flex h-[799px] w-[188px] flex-col gap-[12px] overflow-hidden">
        <ViewportBar icon={iconMobile} label="모바일" />
        <div className="relative min-h-px w-full flex-1 overflow-hidden bg-white">
          <MobileHeader />
          <div className="absolute top-[28.92px] left-0 h-[406.851px] w-[188px]">
            <SlideView {...props} device="mobile" />
          </div>
          {isSection && <div className="pointer-events-none absolute top-[29px] left-0 h-[407px] w-[188px] border border-solid border-[#80ccff]" />}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- 패널 공통

const PANEL_CLASS = 'absolute top-[75px] right-[20px] z-10 w-[280px] overflow-hidden rounded-[12px] bg-white shadow-[0px_4px_10px_0px_rgba(65,78,97,0.08)]';

function PanelHeader({ title, onBack, right }: { title: string; onBack?: () => void; right?: ReactNode }) {
  return (
    <div className={`flex h-[52px] shrink-0 items-center gap-[8px] py-[16px] pr-[16px] ${onBack ? 'pl-[16px]' : 'pl-[20px]'}`}>
      {onBack && (
        <button type="button" aria-label="뒤로" onClick={onBack} className="flex size-[18px] shrink-0 cursor-pointer items-center justify-center">
          <img src={iconBack} alt="" width={18} height={18} />
        </button>
      )}
      <p className="min-w-px flex-1 font-['Pretendard'] text-[14px] leading-[20px] font-semibold whitespace-nowrap text-black">{title}</p>
      {right}
    </div>
  );
}

// 아이콘 + 이름 + > 로 된 메뉴 항목 (레이아웃, 배경, 색상 등)
function MenuItem({ icon, iconSize = 16, label, onClick }: { icon: string; iconSize?: number; label: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-[246px] cursor-pointer items-center gap-[4px] overflow-hidden rounded-[6px] border border-solid border-[rgba(51,62,76,0.1)] p-[10px] text-left ${HOVER_LAYER}`}
    >
      <span className="flex min-w-px flex-1 items-center gap-[8px]">
        <span className="flex size-[32px] shrink-0 items-center justify-center rounded-[6px] bg-[#f6f7f9] p-[6px]">
          <img src={icon} alt="" width={iconSize} height={iconSize} />
        </span>
        <span className="font-['Pretendard'] text-[12px] leading-[18px] font-medium whitespace-nowrap text-black">{label}</span>
      </span>
      <img src={iconChevronRight} alt="" width={16} height={16} />
    </button>
  );
}

// ---------------------------------------------------------------- 1. 슬라이드 목록 패널

type ListPanelProps = {
  slides: Slide[];
  onOpen: (index: number) => void;
  onReorder: (from: number, to: number) => void;
};

function SlideListPanel({ slides, onOpen, onReorder }: ListPanelProps) {
  const dragFrom = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const handleDrop = (event: DragEvent, to: number) => {
    event.preventDefault();
    if (dragFrom.current !== null && dragFrom.current !== to) onReorder(dragFrom.current, to);
    dragFrom.current = null;
    setDragOver(null);
  };

  return (
    <div className={`${PANEL_CLASS} flex max-h-[799px] flex-col`}>
      <PanelHeader
        title="슬라이드"
        right={
          <button type="button" aria-label="더보기" className={`flex size-[24px] items-center justify-center rounded-[4px] ${HOVER_LAYER}`}>
            <img src={iconOverflow} alt="" width={16} height={16} />
          </button>
        }
      />

      <div className="flex min-h-0 w-[280px] flex-1 flex-col gap-[12px] border-b border-solid border-[rgba(51,62,76,0.1)] pt-[8px] pb-px">
        <div className="flex h-[18px] shrink-0 items-baseline gap-[4px] px-[20px] font-['Pretendard'] text-[12px] leading-[18px] whitespace-nowrap">
          <span className="font-semibold text-[#333e4c]">진열 중인 슬라이드</span>
          <span className="font-normal text-[#667080]">
            {slides.length}/{MAX_SLIDES}
          </span>
        </div>

        <div className="flex min-h-0 w-[280px] flex-col overflow-x-hidden overflow-y-auto pb-[14px]">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              role="button"
              tabIndex={0}
              draggable
              onClick={() => onOpen(index)}
              onKeyDown={(event) => event.key === 'Enter' && onOpen(index)}
              onDragStart={(event) => {
                dragFrom.current = index;
                event.dataTransfer.effectAllowed = 'move';
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setDragOver(index);
              }}
              onDragLeave={() => setDragOver((prev) => (prev === index ? null : prev))}
              onDrop={(event) => handleDrop(event, index)}
              onDragEnd={() => {
                dragFrom.current = null;
                setDragOver(null);
              }}
              className={`group relative flex w-full shrink-0 cursor-pointer flex-col px-[20px] py-[6px] ${HOVER_LAYER} ${
                dragOver === index ? 'shadow-[inset_0_2px_0_0_#1a66ff]' : ''
              }`}
            >
              <div className="flex w-full items-center gap-[8px]">
                <div className="relative size-[40px] shrink-0 overflow-hidden rounded-[4px] bg-[#eff1f4]">
                  {slide.image ? (
                    <img src={slide.image} alt="" className="absolute inset-0 size-full max-w-none rounded-[0.958px] object-cover" />
                  ) : (
                    <img src={iconImageFilled} alt="" width={20} height={20} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  )}
                </div>
                <p
                  className={`min-w-px flex-1 truncate font-['Pretendard'] text-[12px] leading-[18px] font-normal ${
                    slide.title ? 'text-black' : 'text-[#99a0aa]'
                  }`}
                >
                  {slide.title || `(슬라이드 ${index + 1})`}
                </p>
                <img src={iconChevronRightEdge} alt="" width={16} height={16} />
              </div>
              {/* hover 시 순서 변경 아이콘 */}
              <img
                src={iconReorderDot}
                alt=""
                width={18}
                height={18}
                className="absolute top-1/2 left-0 -translate-y-1/2 cursor-grab opacity-0 group-hover:opacity-100"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex w-[280px] shrink-0 flex-col gap-[12px] pt-[20px]">
        <div className="flex flex-col gap-[4px] px-[20px] whitespace-nowrap">
          <p className="font-['Pretendard'] text-[12px] leading-[18px] font-semibold text-[#333e4c]">공통 설정</p>
          <p className="font-['Pretendard'] text-[11px] leading-[14px] font-normal text-[#667080]">모든 슬라이드에 동일하게 적용돼요</p>
        </div>
        <div className="flex flex-col items-center gap-[8px] px-[16px] pb-[16px]">
          <MenuItem icon={iconLayout} label="레이아웃" />
          <MenuItem icon={iconError} iconSize={14.222} label="애니메이션" />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- 2. 슬라이드 상세 패널

function SlideDetailPanel({ index, onBack, onDelete, onOpenMenu }: { index: number; onBack: () => void; onDelete: () => void; onOpenMenu: (menu: 'background' | 'color') => void }) {
  return (
    <div className={PANEL_CLASS}>
      <PanelHeader
        title={`슬라이드 ${index + 1}`}
        onBack={onBack}
        right={
          <button type="button" aria-label="슬라이드 삭제" onClick={onDelete} className={`flex size-[24px] cursor-pointer items-center justify-center rounded-[4px] ${HOVER_LAYER}`}>
            <img src={iconDeleteSlide} alt="" width={16} height={16} />
          </button>
        }
      />
      <div className="flex w-[280px] flex-col items-center gap-[8px] px-[16px] pt-[8px] pb-[16px]">
        <MenuItem icon={iconImage} label="배경" onClick={() => onOpenMenu('background')} />
        <MenuItem icon={iconPalette} label="색상" onClick={() => onOpenMenu('color')} />
        {/* 구성 요소 패널은 이번 데모 범위 밖 */}
        <MenuItem icon={iconLayer} label="구성 요소" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- 3-1. 배경 패널

function OverlaySlider({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  const trackRef = useRef<HTMLDivElement>(null);

  const update = (event: PointerEvent) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / rect.width;
    onChange(Math.round(Math.min(1, Math.max(0, ratio)) * 100));
  };

  return (
    <div
      ref={trackRef}
      className="relative h-[20px] min-w-px flex-1 cursor-pointer touch-none"
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        update(event);
      }}
      onPointerMove={(event) => event.currentTarget.hasPointerCapture(event.pointerId) && update(event)}
    >
      <div className="absolute top-1/2 right-0 left-0 h-[2px] -translate-y-1/2 rounded-[100px] bg-[#e4e6e9]" />
      <div className="absolute top-1/2 left-0 h-[2px] -translate-y-1/2 rounded-[100px] bg-[#181d25]" style={{ width: `${value}%` }} />
      <div
        className="absolute top-1/2 size-[10px] -translate-x-1/2 -translate-y-1/2 rounded-[100px] bg-[#181d25] shadow-[0px_1px_8px_0px_rgba(65,78,97,0.16),0px_2px_24px_0px_rgba(65,78,97,0.2)]"
        style={{ left: `${value}%` }}
      />
    </div>
  );
}

function TextButton({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`flex h-[24px] cursor-pointer items-center justify-center rounded-[4px] px-[6px] py-[3px] ${HOVER_LAYER}`}>
      <span className="font-['Pretendard'] text-[12px] leading-[18px] font-medium whitespace-nowrap text-[#333e4c]">{label}</span>
    </button>
  );
}

function BackgroundPanel({ slide, onBack, onChange }: { slide: Slide; onBack: () => void; onChange: (patch: Partial<Slide>) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // 새 이미지는 데스크탑·모바일에 함께 적용
    if (file) onChange({ image: URL.createObjectURL(file), mobileImage: undefined, fileName: file.name });
    event.target.value = '';
  };

  return (
    <div className={PANEL_CLASS}>
      <PanelHeader title="배경" onBack={onBack} />

      <div className="flex w-[280px] flex-col gap-[12px] border-b border-solid border-[rgba(51,62,76,0.1)] px-[20px] pt-[5px] pb-[20px]">
        <div className="flex w-full flex-col gap-[9px]">
          <div className="flex w-full items-center justify-between">
            <p className="font-['Pretendard'] text-[12px] leading-[18px] font-semibold whitespace-nowrap text-[#333e4c]">콘텐츠</p>
            <button type="button" aria-label="데스크탑·모바일 동기화" className="flex items-center justify-center rounded-[4px] bg-[#f5f8ff] p-[4px]">
              <img src={iconSync} alt="" width={16} height={16} />
            </button>
          </div>
          <div className="flex h-[36px] w-full items-center rounded-[8px] bg-[#f6f7f9] p-[4px]">
            {(['image', 'video'] as const).map((type) => {
              const isActive = slide.mediaType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => onChange({ mediaType: type })}
                  className={`flex h-[28px] min-w-px flex-1 cursor-pointer items-center justify-center rounded-[6px] px-[12px] py-[5px] font-['Pretendard'] text-[12px] leading-[18px] whitespace-nowrap ${
                    isActive
                      ? 'bg-white font-medium text-black drop-shadow-[0px_1px_0.5px_rgba(65,78,97,0.08)] drop-shadow-[0px_2px_4px_rgba(65,78,97,0.16)]'
                      : 'font-normal text-[#667080]'
                  }`}
                >
                  {type === 'image' ? '이미지' : '동영상'}
                </button>
              );
            })}
          </div>
        </div>

        {/* 미디어 카드 */}
        <div className="flex w-full flex-col overflow-hidden rounded-[6px] border border-solid border-[rgba(51,62,76,0.1)] bg-white p-px">
          <div
            className="flex aspect-[238/134] w-full items-center justify-center overflow-hidden bg-top-left"
            style={{ backgroundImage: `url("${mediaChecker}")`, backgroundSize: '258px 126.097px' }}
          >
            {slide.image ? (
              <img src={slide.image} alt="" className="size-[134px] max-w-none object-cover" />
            ) : (
              <img src={iconImageFilled} alt="" width={20} height={20} />
            )}
          </div>
          <div className="flex w-full flex-col gap-[16px] px-[9px] pt-[11px] pb-[8px]">
            <p className="truncate pl-[6px] font-['Pretendard'] text-[11px] leading-[14px] font-normal text-[#667080]">
              {slide.image ? slide.fileName : '이미지 없음'}
            </p>
            <div className="flex h-[24px] w-full items-center justify-between">
              <div className="flex items-center gap-[4px]">
                <TextButton label={slide.image ? '변경' : '추가'} onClick={() => fileRef.current?.click()} />
                <div className="h-[12px] w-px bg-[rgba(0,0,0,0.12)]" />
                <TextButton label="편집" />
              </div>
              <div className="flex items-center gap-[4px]">
                <button type="button" aria-label="초점" className={`flex size-[24px] items-center justify-center rounded-[4px] ${HOVER_LAYER}`}>
                  <img src={iconFocalPoint} alt="" width={16} height={16} />
                </button>
                <button
                  type="button"
                  aria-label="이미지 삭제"
                  onClick={() => onChange({ image: null, mobileImage: undefined })}
                  className={`flex size-[24px] cursor-pointer items-center justify-center rounded-[4px] ${HOVER_LAYER}`}
                >
                  <img src={iconDelete} alt="" width={16} height={16} />
                </button>
              </div>
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>

        {/* 오버레이 */}
        <div className="flex w-full flex-col gap-[6px] py-[6px]">
          <div className="flex w-full items-center justify-between">
            <p className="font-['Pretendard'] text-[11px] leading-[14px] font-medium whitespace-nowrap text-[#667080]">오버레이</p>
            <div className="flex min-w-[34px] items-center justify-end gap-[2px] rounded-[6px] px-[4px] py-[2px]">
              <span className="text-right font-['Pretendard'] text-[11px] leading-[14px] font-normal text-[#333e4c]">{slide.overlay}</span>
              <span className="font-['Pretendard'] text-[11px] leading-[14px] font-medium text-[#667080]">%</span>
            </div>
          </div>
          <div className="flex w-full items-center gap-[8px]">
            <div className="flex size-[20px] shrink-0 items-center justify-center overflow-hidden rounded-[4px] border border-solid border-[rgba(51,62,76,0.16)] p-px">
              <div className="size-full rounded-[3px] bg-black" />
            </div>
            <OverlaySlider value={slide.overlay} onChange={(overlay) => onChange({ overlay })} />
          </div>
        </div>
      </div>

      {/* 링크 */}
      <div className="flex w-[280px] flex-col gap-[12px] p-[20px]">
        <p className="font-['Pretendard'] text-[12px] leading-[18px] font-semibold text-[#333e4c]">링크</p>
        <input
          value={slide.link}
          onChange={(event) => onChange({ link: event.target.value })}
          placeholder="페이지 선택 혹은 URL 주소 입력"
          className="h-[34px] w-full rounded-[6px] bg-[#f6f7f9] px-[12px] py-[8px] font-['Pretendard'] text-[12px] leading-[18px] font-normal text-black outline-none placeholder:text-[#99a0aa] focus:shadow-[inset_0_0_0_1px_#1a66ff]"
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- 3-2. 색상 패널

const SCHEME_OPTIONS: { value: Scheme; title: string; description: string }[] = [
  { value: 'light', title: '밝은 색상', description: '어두운 이미지 위에서 잘 보여요' },
  { value: 'dark', title: '어두운 색상', description: '밝은 이미지 위에서 잘 보여요' },
];

function ColorPanel({ slide, onBack, onChange }: { slide: Slide; onBack: () => void; onChange: (patch: Partial<Slide>) => void }) {
  return (
    <div className={PANEL_CLASS}>
      <PanelHeader title="색상" onBack={onBack} />
      <div className="flex w-full flex-col gap-[20px] px-[20px] pt-[8px] pb-[20px]">
        <div className="flex w-[240px] flex-col gap-[8px]">
          {SCHEME_OPTIONS.map((option) => {
            const isSelected = slide.scheme === option.value;
            const isLight = option.value === 'light';
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange({ scheme: option.value })}
                className={`flex w-full cursor-pointer flex-col rounded-[6px] p-[2px] text-left ${
                  isSelected ? 'border-[1.5px] border-solid border-[#1a66ff]' : ''
                }`}
              >
                <span
                  className={`relative flex w-full items-center gap-[16px] overflow-hidden rounded-[6px] border border-solid border-[rgba(51,62,76,0.16)] px-[12px] py-[13px] ${
                    isLight ? 'bg-white' : 'bg-[#eff1f4]'
                  }`}
                >
                  <span className="pointer-events-none absolute top-[calc(50%-64.5px)] left-[calc(50%+0.5px)] h-[357px] w-[235px] -translate-x-1/2 -translate-y-1/2">
                    <img src={colorPreview} alt="" className="absolute inset-0 size-full max-w-none object-cover" />
                    <span className={`absolute inset-0 ${isLight ? 'bg-[rgba(0,0,0,0.8)]' : 'bg-[rgba(255,255,255,0.2)]'}`} />
                  </span>
                  <span className="relative flex items-center gap-[6px]">
                    <span className={`size-[16px] shrink-0 rounded-[100px] ${isLight ? 'bg-white' : 'bg-[#1a1715]'}`} />
                    <span className={`font-['Pretendard'] text-[12px] leading-[18px] font-medium whitespace-nowrap ${isLight ? 'text-white' : 'text-black'}`}>
                      Aa
                    </span>
                  </span>
                  <span className="relative flex flex-col gap-[2px] whitespace-nowrap">
                    <span className={`font-['Pretendard'] text-[12px] leading-[18px] font-semibold ${isLight ? 'text-white' : 'text-black'}`}>{option.title}</span>
                    <span className={`font-['Pretendard'] text-[11px] leading-[14px] font-normal ${isLight ? 'text-[rgba(255,255,255,0.8)]' : 'text-[#414e61]'}`}>
                      {option.description}
                    </span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        <p className="w-full font-['Pretendard'] text-[11px] leading-[14px] font-normal text-[#667080]">
          {'{Color Scheme}은 '}
          <span className="underline">사이트 스타일</span>
          에서 수정 가능해요.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- 4. 요소 패널 공통 조각

// 드롭다운 목록이 패널 밖으로 나올 수 있어야 하므로 overflow-hidden 없음
const ELEMENT_PANEL_CLASS = 'absolute top-[75px] right-[20px] z-10 w-[280px] rounded-[12px] bg-white shadow-[0px_4px_10px_0px_rgba(65,78,97,0.08)]';
const SECTION_CLASS = 'flex w-full flex-col gap-[12px] border-b border-solid border-[rgba(51,62,76,0.1)] p-[20px]';
const SECTION_TITLE_CLASS = "font-['Pretendard'] text-[12px] leading-[18px] font-semibold text-[#333e4c]";
const FIELD_LABEL_CLASS = "font-['Pretendard'] text-[11px] leading-[14px] font-medium text-[#667080]";
const NOTE_CLASS = "font-['Pretendard'] text-[11px] leading-[14px] font-normal text-[#667080]";

function Dropdown<T extends string>({
  value,
  options,
  onChange,
  renderLabel = (option) => option,
}: {
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
  renderLabel?: (option: T) => ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex h-[34px] w-full cursor-pointer items-center gap-[6px] rounded-[6px] border border-solid border-[rgba(51,62,76,0.1)] py-[9px] pr-[9px] pl-[12px] text-left hover:bg-[rgba(24,29,37,0.02)]"
      >
        <span className="flex min-w-px flex-1 items-center font-['Pretendard'] text-[12px] leading-[18px] font-normal text-black">{renderLabel(value)}</span>
        <img src={iconChevronDownPanel} alt="" width={16} height={16} className={isOpen ? 'rotate-180' : ''} />
      </button>
      {isOpen && (
        <>
          {/* 바깥을 누르면 닫힘 */}
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div className="absolute top-[38px] right-0 left-0 z-40 flex flex-col rounded-[8px] bg-white p-[4px] shadow-[0px_1px_8px_0px_rgba(65,78,97,0.16),0px_2px_24px_0px_rgba(65,78,97,0.2)]">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
                className={`flex h-[32px] w-full cursor-pointer items-center rounded-[6px] px-[8px] text-left font-['Pretendard'] text-[12px] leading-[18px] text-black hover:bg-[#f6f7f9] ${
                  option === value ? 'font-semibold' : 'font-normal'
                }`}
              >
                {renderLabel(option)}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Switch({ isOn, onChange }: { isOn: boolean; onChange: (isOn: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={isOn} onClick={() => onChange(!isOn)} className="relative h-[16px] w-[28px] shrink-0 cursor-pointer">
      {isOn ? (
        <img src={iconSwitchOn} alt="" width={28} height={16} className="block" />
      ) : (
        <span className="absolute inset-0 rounded-[8px] bg-[#e4e6e9]">
          <span className="absolute top-[2px] left-[2px] size-[12px] rounded-full bg-white" />
        </span>
      )}
    </button>
  );
}

function TextInput({ value, onChange, placeholder, maxLength }: { value: string; onChange: (value: string) => void; placeholder?: string; maxLength?: number }) {
  return (
    <div className="flex h-[34px] w-full items-center gap-[6px] rounded-[6px] bg-[#f6f7f9] px-[12px] py-[8px] focus-within:shadow-[inset_0_0_0_1px_#1a66ff]">
      <input
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="min-w-px flex-1 bg-transparent font-['Pretendard'] text-[12px] leading-[18px] font-normal text-black outline-none placeholder:text-[#99a0aa]"
      />
      {maxLength && (
        <span className="font-['Pretendard'] text-[11px] leading-[14px] font-normal whitespace-nowrap text-[#667080]">
          {value.length}/{maxLength}
        </span>
      )}
    </div>
  );
}

function Segmented<T extends string>({ value, options, onChange }: { value: T; options: { value: T; label: string }[]; onChange: (value: T) => void }) {
  return (
    <div className="flex h-[36px] w-full items-center rounded-[8px] bg-[#f6f7f9] p-[4px]">
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`flex h-[28px] min-w-px flex-1 cursor-pointer items-center justify-center rounded-[6px] px-[12px] py-[5px] font-['Pretendard'] text-[12px] leading-[18px] whitespace-nowrap ${
              isActive ? 'bg-white font-medium text-black shadow-[0px_1px_0.5px_rgba(65,78,97,0.08),0px_2px_4px_rgba(65,78,97,0.16)]' : 'font-normal text-[#667080]'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------- 4-1. 텍스트 패널

function ColorChip({ color }: { color: string }) {
  return <span className="size-[18px] shrink-0 rounded-[4px] border border-solid border-[rgba(51,62,76,0.16)]" style={{ background: color }} />;
}

function TextPanel({ kind, design, defaultColor, onDesign }: { kind: 'title' | 'description'; design: Design; defaultColor: string; onDesign: (patch: Partial<Design>) => void }) {
  const styleKey = kind === 'title' ? 'titleStyle' : 'descStyle';
  const colorKey = kind === 'title' ? 'titleColor' : 'descColor';
  const colorName = (name: string) => TEXT_COLORS.find((color) => color.name === name);
  const currentColor = TEXT_COLORS.find((color) => color.value === design[colorKey]) ?? TEXT_COLORS[0];

  return (
    <div className={ELEMENT_PANEL_CLASS}>
      <PanelHeader
        title="텍스트"
        right={
          <button type="button" aria-label="데스크탑·모바일 동기화" className="flex items-center justify-center rounded-[4px] bg-[#f5f8ff] p-[4px]">
            <img src={iconSync} alt="" width={16} height={16} />
          </button>
        }
      />

      <div className="flex w-full flex-col gap-[12px] border-b border-solid border-[rgba(51,62,76,0.1)] px-[20px] pt-[8px] pb-[20px]">
        <p className={SECTION_TITLE_CLASS}>내용</p>
        <button
          type="button"
          className="flex h-[34px] w-[240px] cursor-pointer items-center gap-[6px] rounded-[6px] border border-solid border-[#1b4efe] bg-gradient-to-r from-[rgba(27,78,254,0.03)] to-[rgba(165,77,255,0.03)] p-[8px] hover:bg-[rgba(24,29,37,0.04)]"
        >
          <span className="flex min-w-px flex-1 items-center gap-[4px]">
            <img src={iconAi} alt="" width={18} height={18} />
            <span className="font-['Pretendard'] text-[12px] leading-[18px] font-medium whitespace-nowrap text-black">AI 도움받기</span>
          </span>
          <img src={iconChevronRightPanel} alt="" width={16} height={16} />
        </button>
      </div>

      <div className={SECTION_CLASS}>
        <div className="flex w-full flex-col gap-[6px]">
          <p className={SECTION_TITLE_CLASS}>스타일</p>
          <p className={NOTE_CLASS}>모든 슬라이드에 동일하게 적용됩니다</p>
        </div>
        <Dropdown value={design[styleKey]} options={TEXT_STYLES.map((style) => style.id)} onChange={(id) => onDesign({ [styleKey]: id })} />
      </div>

      <div className="flex w-full flex-col gap-[12px] p-[20px]">
        <p className={SECTION_TITLE_CLASS}>색상</p>
        <Dropdown
          value={currentColor.name}
          options={TEXT_COLORS.map((color) => color.name)}
          onChange={(name) => onDesign({ [colorKey]: colorName(name)?.value ?? null })}
          renderLabel={(name) => (
            <span className="flex min-w-px items-center gap-[6px]">
              <ColorChip color={colorName(name)?.value ?? defaultColor} />
              <span className="truncate">{name}</span>
            </span>
          )}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- 4-2. 버튼 패널

const BUTTON_LABEL_MAX = 15;

function ButtonPanel({
  slide,
  design,
  onDesign,
  onSlide,
}: {
  slide: Slide;
  design: Design;
  onDesign: (patch: Partial<Design>) => void;
  onSlide: (patch: Partial<Slide>) => void;
}) {
  const [tab, setTab] = useState<'button' | 'layout'>('button');
  // 크기 및 배치 탭에서 설정 중인 기기
  const [layoutDevice, setLayoutDevice] = useState<Device>('desktop');

  const updateButton = (buttonIndex: number, patch: Partial<SlideButton>) => {
    onSlide({ buttons: slide.buttons.map((button, index) => (index === buttonIndex ? { ...button, ...patch } : button)) });
  };
  const setButtonStyle = (buttonIndex: number, style: ButtonStyle) => {
    const next: [ButtonStyle, ButtonStyle] = [...design.buttonStyles];
    next[buttonIndex] = style;
    onDesign({ buttonStyles: next });
  };
  const hasSecond = slide.buttons.length > 1;

  const buttonFields = (buttonIndex: number) => {
    const button = slide.buttons[buttonIndex];
    return (
      <div className="flex w-full flex-col gap-[20px]">
        <div className="flex w-full flex-col gap-[6px]">
          <p className={FIELD_LABEL_CLASS}>버튼 문구</p>
          <TextInput value={button.label} maxLength={BUTTON_LABEL_MAX} onChange={(label) => updateButton(buttonIndex, { label })} />
        </div>
        <div className="flex w-full flex-col gap-[6px]">
          <p className={FIELD_LABEL_CLASS}>링크</p>
          <TextInput value={button.link} placeholder="페이지 선택 혹은 URL 주소 입력" onChange={(link) => updateButton(buttonIndex, { link })} />
        </div>
        <div className="flex w-full flex-col gap-[6px]">
          {/* 텍스트 패널 '스타일'과 같은 구성: 이름 아래 안내 문구 → 드롭다운 */}
          <div className="mb-[6px] flex w-full flex-col gap-[6px]">
            <p className={FIELD_LABEL_CLASS}>스타일</p>
            <p className={NOTE_CLASS}>모든 슬라이드에 동일하게 적용됩니다</p>
          </div>
          <Dropdown value={design.buttonStyles[buttonIndex]} options={['강조 버튼', '보조 버튼'] as const} onChange={(style) => setButtonStyle(buttonIndex, style)} />
        </div>
      </div>
    );
  };

  return (
    <div className={ELEMENT_PANEL_CLASS}>
      <PanelHeader title="버튼" />

      <div className="flex h-[34px] w-[280px] items-start gap-[16px] border-b border-solid border-[rgba(51,62,76,0.1)] px-[20px]">
        {(
          [
            { value: 'button', label: '버튼' },
            { value: 'layout', label: '크기 및 배치' },
          ] as const
        ).map((item) => {
          const isActive = tab === item.value;
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => setTab(item.value)}
              className={`flex h-[34px] min-w-px flex-1 cursor-pointer items-center justify-center font-['Pretendard'] text-[12px] leading-[18px] ${
                isActive ? 'border-b-2 border-solid border-black font-medium text-black' : 'font-normal text-[#667080]'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {tab === 'button' ? (
        <div className="flex w-full flex-col">
          <div className={SECTION_CLASS}>
            <p className={SECTION_TITLE_CLASS}>버튼 1</p>
            {buttonFields(0)}
          </div>
          {/* 보조 버튼은 슬라이드마다 켜고 끌 수 있음 */}
          <div className={`${SECTION_CLASS} border-b-0`}>
            <div className="flex w-full items-center justify-between">
              <p className={SECTION_TITLE_CLASS}>버튼 2</p>
              <Switch
                isOn={hasSecond}
                onChange={(isOn) =>
                  onSlide({ buttons: isOn ? [...slide.buttons, { label: 'Button Label', link: '' }] : slide.buttons.slice(0, 1) })
                }
              />
            </div>
            {hasSecond && buttonFields(1)}
          </div>
        </div>
      ) : (
        // 크기 및 배치: 데스크탑·모바일을 골라서 각각 설정 (가로 영역 채우기는 모바일만)
        <div className="flex w-full flex-col gap-[20px] px-[20px] pt-[12px] pb-[20px]">
          <div className="flex w-[240px] flex-col gap-[12px]">
            <Segmented
              value={layoutDevice}
              options={[
                { value: 'desktop', label: '데스크탑' },
                { value: 'mobile', label: '모바일' },
              ]}
              onChange={setLayoutDevice}
            />
            <p className={NOTE_CLASS}>모든 슬라이드에 동일하게 적용됩니다</p>
          </div>
          <div className="flex w-full flex-col gap-[20px]">
            <div className="flex w-full flex-col gap-[6px]">
              <p className={FIELD_LABEL_CLASS}>크기</p>
              <Dropdown
                value={design.buttonSize[layoutDevice]}
                options={['작게', '보통', '크게'] as const}
                onChange={(size) => onDesign({ buttonSize: { ...design.buttonSize, [layoutDevice]: size } })}
              />
            </div>
            <div className="flex w-full items-center gap-[8px]">
              <p className={`min-w-px flex-1 ${FIELD_LABEL_CLASS}`}>배치 방향</p>
              <div className="flex shrink-0 items-center rounded-[8px] bg-[#f6f7f9] p-[4px]">
                {(
                  [
                    { value: 'row', icon: iconDirectionRow, label: '가로 배치' },
                    { value: 'column', icon: iconDirectionColumn, label: '세로 배치' },
                  ] as const
                ).map((option) => {
                  const isActive = design.buttonDirection[layoutDevice] === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-label={option.label}
                      onClick={() => onDesign({ buttonDirection: { ...design.buttonDirection, [layoutDevice]: option.value } })}
                      className={`flex cursor-pointer items-center justify-center rounded-[4px] px-[10px] py-[2px] ${
                        isActive ? 'bg-white shadow-[0px_1px_0.5px_rgba(65,78,97,0.08),0px_2px_4px_rgba(65,78,97,0.16)]' : ''
                      }`}
                    >
                      <img src={option.icon} alt="" width={16} height={16} />
                    </button>
                  );
                })}
              </div>
            </div>
            {layoutDevice === 'mobile' && (
              <div className="flex w-full items-center gap-[8px]">
                <p className={`min-w-px flex-1 ${FIELD_LABEL_CLASS}`}>가로 영역 채우기</p>
                <Switch isOn={design.buttonFill} onChange={(buttonFill) => onDesign({ buttonFill })} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- 화면

type PanelView = 'list' | 'detail' | 'background' | 'color';

// [Carousel 슬라이드 편집] 데모 화면
export function CarouselScreen() {
  const [slides, setSlides] = useState(INITIAL_SLIDES);
  // 캔버스에 보이는 슬라이드. 패널을 닫아도(목록으로 돌아가도) 그대로 유지
  const [activeIndex, setActiveIndex] = useState(0);
  const [panel, setPanel] = useState<PanelView>('list');
  // 캔버스에서 선택한 요소. section이면 슬라이드 패널(목록·상세 등), 그 외엔 요소 패널
  const [selected, setSelected] = useState<Selected>('section');
  // 모든 슬라이드에 공통으로 적용되는 스타일·배치·간격
  const [design, setDesign] = useState(INITIAL_DESIGN);
  // 캔버스에서 글자를 고치는 중인 텍스트(데스크탑·모바일 중 클릭한 쪽)
  const [editing, setEditing] = useState<EditingText>(null);

  const activeSlide = slides[activeIndex];

  const updateActive = (patch: Partial<Slide>) => {
    setSlides((prev) => prev.map((slide, index) => (index === activeIndex ? { ...slide, ...patch } : slide)));
  };
  const updateDesign = (patch: Partial<Design>) => setDesign((prev) => ({ ...prev, ...patch }));
  const updateSpacing = (device: Device, patch: Partial<Spacing>) =>
    setDesign((prev) => ({ ...prev, spacing: { ...prev.spacing, [device]: { ...prev.spacing[device], ...patch } } }));

  const reorder = (from: number, to: number) => {
    setSlides((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    // 보고 있던 슬라이드를 계속 따라감
    setActiveIndex((current) => {
      if (current === from) return to;
      if (from < current && to >= current) return current - 1;
      if (from > current && to <= current) return current + 1;
      return current;
    });
  };

  const deleteActive = () => {
    if (slides.length <= 1) return;
    setSlides((prev) => prev.filter((_, index) => index !== activeIndex));
    setActiveIndex((current) => Math.max(0, Math.min(current, slides.length - 2)));
    setPanel('list');
    setSelected('section');
  };

  const colors = schemeColors(activeSlide.scheme);

  // 처음 클릭 = 선택, 선택된 텍스트를 다시 클릭 = 편집 시작
  const handleTextClick = (kind: TextKind, device: Device) => {
    if (editing?.kind === kind && editing.device === device) return;
    if (selected === kind) setEditing({ kind, device });
    else setSelected(kind);
  };
  // 빈 문자열이면 요소가 사라지므로 저장하지 않음 (데스크탑·모바일은 같은 문구)
  const handleTextDone = (kind: TextKind, value: string | null) => {
    if (value !== null && value.trim()) updateActive({ [kind]: value });
    setEditing(null);
  };

  return (
    <div className="relative h-[894px] w-[1512px] overflow-hidden bg-[#e4e6e9] select-none">
      <Canvas
        slide={activeSlide}
        index={activeIndex}
        count={slides.length}
        design={design}
        selected={selected}
        onSelect={(next) => {
          // 편집 중에 다른 곳을 누르면 먼저 편집을 끝내서(저장) 고친 글자가 데스크탑·모바일에 반영되게 함
          if (editing && document.activeElement instanceof HTMLElement) document.activeElement.blur();
          setSelected(next);
          // 선택을 해제하면 다음에 슬라이드를 다시 눌렀을 때 '슬라이드' 목록 패널부터 보여줌
          if (next === 'none') setPanel('list');
        }}
        onSpacingChange={updateSpacing}
        onSpacingStart={() => {
          // 간격을 조절하면 그 슬라이드의 패널(슬라이드 N)을 띄움
          setSelected('section');
          setPanel('detail');
        }}
        editing={editing}
        onTextClick={handleTextClick}
        onTextDone={handleTextDone}
      />
      <Toolbar />

      {selected === 'section' && (
        <>
          {panel === 'list' && (
            <SlideListPanel
              slides={slides}
              onReorder={reorder}
              onOpen={(index) => {
                setActiveIndex(index);
                setPanel('detail');
              }}
            />
          )}
          {panel === 'detail' && (
            <SlideDetailPanel index={activeIndex} onBack={() => setPanel('list')} onDelete={deleteActive} onOpenMenu={(menu) => setPanel(menu)} />
          )}
          {panel === 'background' && <BackgroundPanel slide={activeSlide} onBack={() => setPanel('detail')} onChange={updateActive} />}
          {panel === 'color' && <ColorPanel slide={activeSlide} onBack={() => setPanel('detail')} onChange={updateActive} />}
        </>
      )}
      {(selected === 'title' || selected === 'description') && (
        <TextPanel
          key={selected}
          kind={selected}
          design={design}
          defaultColor={selected === 'title' ? colors.strong : colors.soft}
          onDesign={updateDesign}
        />
      )}
      {selected === 'buttons' && <ButtonPanel slide={activeSlide} design={design} onDesign={updateDesign} onSlide={updateActive} />}
      {/* 간격 핸들 안내가 그려지는 맨 위 레이어 */}
      <div id={CURSOR_LAYER_ID} className="pointer-events-none absolute inset-0 z-50" />
    </div>
  );
}
