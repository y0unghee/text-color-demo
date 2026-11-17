// [Carousel 시안 3] 시안 2(CarouselScreenV2.tsx) 피드백 반영용. 시안 1·2 파일은 건드리지 않음
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
import iconBack from '../assets/figma/carousel/back.svg';
import iconDeleteSlide from '../assets/figma/carousel/delete-slide.svg';
import iconImage from '../assets/figma/carousel/image.svg';
import iconLayer from '../assets/figma/carousel/layer.svg';
import iconSync from '../assets/figma/carousel/sync.svg';
import iconFocalPoint from '../assets/figma/carousel/focal-point.svg';
import iconDelete from '../assets/figma/carousel/delete.svg';
import iconAi from '../assets/figma/carousel/ai.svg';
import iconSwitchOn from '../assets/figma/carousel/switch-on.svg';
import iconChevronLeftWhite from '../assets/figma/carousel/chevron-left-white.svg';
import iconChevronRightWhite from '../assets/figma/carousel/chevron-right-white.svg';
import iconChevronRightSmall from '../assets/figma/carousel/chevron-right-small.svg';
import iconLayout from '../assets/figma/carousel/layout.svg';
import iconPlusFilled from '../assets/figma/carousel/plus-filled.svg';
import iconInformation from '../assets/figma/carousel/information.svg';
import iconError from '../assets/figma/carousel/error.svg';
import iconSlide from '../assets/figma/carousel/slide.svg';
import iconPlusSmall from '../assets/figma/carousel/plus-small.svg';
import iconPlusFilled18 from '../assets/figma/carousel/plus-filled-18.svg';
import iconTypography from '../assets/figma/carousel/typography.svg';
import iconLink from '../assets/figma/carousel/link.svg';
import iconTooltipTip from '../assets/figma/carousel/tooltip-tip.svg';
import imgOpacityTrack from '../assets/figma/carousel/opacity-track.png';
import iconButtonStyleAa from '../assets/figma/carousel/button-style-aa.svg';
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
  layout: Record<Device, LayoutId>; // 시안 2: 레이아웃은 슬라이드마다 따로 설정
  titleStyle: TextStyleId; // 시안 2: 텍스트 스타일도 슬라이드마다
  descStyle: TextStyleId;
  titleColor: TextColor | null; // 시안 3: 텍스트 색도 슬라이드마다 (null = 공통 스타일)
  descColor: TextColor | null;
  // 시안 3: 오버라인 (구성 요소 > 오버라인 추가로 표시)
  overline: string;
  overlineStyle: TextStyleId;
  overlineColor: TextColor | null;
  // 시안 3: 구성 요소 표시 여부. 지우면(Delete) false, 다시 추가하면 true (문구는 그대로 보관)
  visible: Record<ElementKey, boolean>;
  spacing: Record<Device, Spacing>; // 시안 3: 간격도 슬라이드마다
  // 시안 2: 버튼 스타일·크기·배치도 슬라이드마다
  buttonStyles: [ButtonStyle, ButtonStyle];
  buttonSize: Record<Device, ButtonSize>;
  buttonDirection: Record<Device, Direction>;
  buttonFill: boolean; // 가로 영역 채우기: 모바일에만 있는 설정
};

// 구성 요소 패널에서 추가·삭제할 수 있는 요소
type ElementKey = 'overline' | 'title' | 'description' | 'buttons';

type SlideContent = Pick<Slide, 'title' | 'description' | 'image' | 'mobileImage' | 'imagePosition' | 'mobileImagePosition'> & { buttons: string[] };

function makeSlide(id: number, content: SlideContent): Slide {
  const buttons = content.buttons.map((label) => ({ label, link: '' }));
  return {
    id,
    ...content,
    buttons,
    fileName: 'fileName.png',
    mediaType: 'image',
    overlay: 0,
    scheme: 'light',
    link: '',
    layout: { desktop: 'bottom-center', mobile: 'bottom-center' },
    titleStyle: '제목 3',
    descStyle: '본문 3',
    titleColor: null,
    descColor: null,
    overline: '오버라인',
    overlineStyle: '본문 2',
    overlineColor: null,
    visible: { overline: false, title: true, description: true, buttons: true },
    // 기본값 = 피그마 시안 값 (캔버스 값을 실제 px로 환산)
    spacing: {
      desktop: { overlineTitle: 12, titleDesc: 12, textButtons: 36, buttonGap: 8, bottom: 64 },
      mobile: { overlineTitle: 12, titleDesc: 12, textButtons: 32, buttonGap: 8, bottom: 64 },
    },
    buttonStyles: ['강조 버튼', '보조 버튼'],
    buttonSize: { desktop: '보통', mobile: '보통' },
    buttonDirection: { desktop: 'row', mobile: 'row' },
    buttonFill: false,
  };
}

// 시코몰(cicomall.com) 상품을 참고한 슬라이드 문구와 받은 상품 이미지
const SLIDE_CONTENTS: SlideContent[] = [
  {
    title: 'HEXAR UL3 랜턴',
    description: '걸고, 세우고, 붙여서\n손바닥만 한 크기로 어디서나 밝혀요',
    buttons: ['자세히 보기', '전체 보기'],
    image: slideLanternDesktop,
    mobileImage: slideLanternMobile,
  },
  {
    title: '포근한 잠자리',
    description: '부드러운 촉감과 은은한 온기\n탄소 블랭킷이 선사하는 기분 좋은 수면',
    buttons: ['구입하기'],
    image: slideBlanket,
  },
  {
    title: '비박, 캠핑, 등산 어디든',
    description: '가볍고 작게, 오랜시간 쓸만한 광량\n전문 산악인이 만든 랜턴의 디테일을 확인해 보세요',
    buttons: ['자세히 보기', '구입하기'],
    image: slideFoldingLantern,
  },
  {
    title: '간절기에서 혹한기까지',
    description: '100W부터 따듯함이 느껴지는\n절전의 대명사 리플렉트 에코히터',
    buttons: ['구입하기', '자세히 보기'],
    image: slideEcoHeater,
    mobileImagePosition: 'right center',
  },
  {
    title: '식빵 1장 단 1분',
    description: '예열 없이 바로 굽는 토스트\n바쁜 아침 준비가 1분이면 끝나요',
    buttons: ['자세히 보기', '구입하기'],
    image: slideOvenToaster,
    mobileImage: slideOvenToasterMobile,
  },
  {
    title: '수량이 얼마 안남았어요',
    description: '스타일과 기능을 모두 겸비한\n시코의 주방컬렉션으로 추석을 준비해요',
    buttons: ['구입하기', '전체 보기'],
    image: slideGrinder,
    imagePosition: 'center 70%',
  },
  {
    title: '스팀 가습기 H220',
    description: '따뜻한 스팀으로 촉촉하게\n건조한 겨울 실내 공기를 바꿔보세요',
    buttons: ['자세히 보기'],
    image: slideHumidifierDesktop,
    mobileImage: slideHumidifierMobile,
  },
  {
    title: '무선청소기 G040',
    description: '가볍게 들고 어디든\n핸디와 스틱을 오가는 2in1 청소기',
    buttons: ['자세히 보기'],
    image: slideVacuumDesktop,
    mobileImage: slideVacuumMobile,
  },
  {
    title: '리플렉트 카본히터 REH-700',
    description: '매서운 한파에도 빠르게 공간을 데워주는\n강력한 카본 히터',
    buttons: ['구입하기'],
    image: slideCarbonHeater,
    mobileImagePosition: '66% center',
  },
  {
    title: '일본, 북미 여행 필수품',
    description: '어디에서든 스타일은 포기할 수 없죠\n글로벌 프리볼트로 안심 사용',
    buttons: ['전체 보기'],
    image: slideFreeVoltHair,
  },
];

const INITIAL_SLIDES: Slide[] = SLIDE_CONTENTS.map((content, index) => makeSlide(index + 1, content));

// 새 슬라이드: 배경 없음(회색) + 밝은 색상 + 고칠 수 있는 기본 문구 + 기본 버튼 'Button' (기획서 '슬라이드 추가' 기준)
function makeEmptySlide(id: number): Slide {
  return makeSlide(id, {
    title: '슬라이드 제목',
    description: '설명을 입력해 주세요',
    buttons: ['Button'],
    image: null,
  });
}

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
type Selected = 'none' | 'section' | 'overline' | 'title' | 'description' | 'buttons';

// 캔버스는 실제 화면을 줄여서 보여줌 → 캔버스 1px이 실제 몇 px인지 (데스크탑 1920px, 모바일 393px 기준)
const REAL_PER_CANVAS: Record<Device, number> = {
  desktop: 1920 / 920,
  mobile: 393 / 188,
};

// 간격 값은 실제 사이트 기준 px (핸들을 드래그할 때 이 숫자가 보임)
type Spacing = {
  overlineTitle: number; // 시안 3: 오버라인 ↔ 제목(제목이 없으면 설명)
  titleDesc: number;
  textButtons: number;
  buttonGap: number;
  bottom: number;
};

// 텍스트 스타일: 캔버스에서의 글자 크기(px)
// menu: 스타일 선택 메뉴(피그마 menu/textStyle)의 'Ag 스타일명' 글자 크기
// 시안 3에서 추가한 제목 5·본문 4·캡션 1·2의 캔버스 크기는 앞 단계에 맞춰 이어서 정함
const TEXT_STYLES = [
  { id: '제목 1', desktop: 34.5, mobile: 23, heading: true, menu: 24 },
  { id: '제목 2', desktop: 28.75, mobile: 20.5, heading: true, menu: 21.6 },
  { id: '제목 3', desktop: 24.917, mobile: 18, heading: true, menu: 19.5 },
  { id: '제목 4', desktop: 19.167, mobile: 14.5, heading: true, menu: 17.6 },
  { id: '제목 5', desktop: 15.333, mobile: 12.5, heading: true, menu: 16.2 },
  { id: '본문 1', desktop: 9.583, mobile: 8.4, heading: false, menu: 16.2 },
  { id: '본문 2', desktop: 8.625, mobile: 7.7, heading: false, menu: 15.1 },
  { id: '본문 3', desktop: 7.667, mobile: 7, heading: false, menu: 14.4 },
  { id: '본문 4', desktop: 7.188, mobile: 6.6, heading: false, menu: 13.7 },
  { id: '캡션 1', desktop: 6.708, mobile: 6.2, heading: false, menu: 12.9 },
  { id: '캡션 2', desktop: 6.229, mobile: 5.8, heading: false, menu: 12 },
] as const;
type TextStyleId = (typeof TEXT_STYLES)[number]['id'];

// 시안 3 텍스트 색상 메뉴의 '색상 세트' (피그마 menu/color 순서)
// 텍스트 색 값이 null이면 '공통 스타일' = 슬라이드 색상(밝은/어두운)의 기본 전경색
const COLOR_SET = ['#ebe0a3', '#585d61', '#37231f', '#f7f5f1', '#a9afb1'];

// 텍스트 색 (커스텀은 불투명도까지)
type TextColor = { hex: string; opacity: number };

function textColorCss({ hex, opacity }: TextColor) {
  if (opacity >= 100) return hex;
  const value = parseInt(hex.slice(1), 16);
  return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${opacity / 100})`;
}

function sameColor(a: TextColor | null, b: TextColor | null) {
  if (!a || !b) return a === b;
  return a.hex.toLowerCase() === b.hex.toLowerCase() && a.opacity === b.opacity;
}

type Hsv = { h: number; s: number; v: number };

function hexToHsv(hex: string): Hsv {
  const value = parseInt(hex.slice(1), 16);
  const r = ((value >> 16) & 255) / 255;
  const g = ((value >> 8) & 255) / 255;
  const b = (value & 255) / 255;
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  let h = 0;
  if (d) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h = (h * 60 + 360) % 360;
  }
  return { h, s: max ? d / max : 0, v: max };
}

function hsvToHex({ h, s, v }: Hsv) {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return Math.round((v - v * s * Math.max(0, Math.min(k, 4 - k, 1))) * 255);
  };
  return `#${[f(5), f(3), f(1)].map((n) => n.toString(16).padStart(2, '0')).join('')}`;
}

// 레이아웃: 글 묶음의 위치 (피그마 panel/layout 옵션 순서)
type LayoutId = 'bottom-center' | 'center' | 'bottom-left';
const LAYOUT_OPTIONS: LayoutId[] = ['bottom-center', 'center', 'bottom-left'];
// 모바일 탭은 피그마 순서대로 왼쪽 아래 → 아래 가운데 → 가운데
const MOBILE_LAYOUT_OPTIONS: LayoutId[] = ['bottom-left', 'bottom-center', 'center'];

type ButtonStyle = '강조 버튼' | '보조 버튼';
type ButtonSize = '작게' | '보통' | '크게';
type Direction = 'row' | 'column';
const BUTTON_SCALE: Record<ButtonSize, number> = {
  작게: 0.85,
  보통: 1,
  크게: 1.2,
};

type Design = {
  customColors: TextColor[]; // 텍스트 색상 메뉴 > 커스텀에서 추가한 색 (모든 텍스트 공용)
  animation: Animation; // 슬라이드 패널 > 공통 설정 탭
  slideMode: SlideMode; // 슬라이드 패널 > 공통 설정 탭
  ratio: Record<Device, string>; // 공통 설정 > 레이아웃의 비율 (모든 슬라이드 공통)
};

// 시안 3: 레이아웃 비율 선택지. value = 가로/세로 (null = 풀스크린, 지금 캔버스 크기 그대로)
const RATIO_OPTIONS: Record<Device, { label: string; value: number | null }[]> = {
  desktop: [
    { label: '풀스크린', value: null },
    { label: '2:1', value: 2 },
    { label: '21:9', value: 21 / 9 },
    { label: '3:1', value: 3 },
    { label: '4:1', value: 4 },
  ],
  mobile: [
    { label: '풀스크린', value: null },
    { label: '9:16', value: 9 / 16 },
    { label: '5:8', value: 5 / 8 },
    { label: '4:5', value: 4 / 5 },
  ],
};

// 캔버스 슬라이드 크기 (풀스크린 = 피그마 시안 크기)
const SLIDE_BOX: Record<Device, { width: number; fullHeight: number }> = {
  desktop: { width: 920, fullHeight: 517.5 },
  mobile: { width: 188, fullHeight: 406.851 },
};

function slideHeight(device: Device, ratio: string) {
  const value = ratioValue(device, ratio);
  return value === null ? SLIDE_BOX[device].fullHeight : SLIDE_BOX[device].width / value;
}

const ANIMATIONS = ['Slide In', 'Fade In', '효과 없음'] as const;
type Animation = (typeof ANIMATIONS)[number];
type SlideMode = 'auto' | 'manual';

// 기본값 = 피그마 시안 값 (간격은 캔버스 값을 실제 px로 환산)
const INITIAL_DESIGN: Design = {
  customColors: [],
  animation: 'Slide In',
  slideMode: 'auto',
  ratio: { desktop: '풀스크린', mobile: '풀스크린' },
};

function textStyle(id: TextStyleId) {
  return TEXT_STYLES.find((style) => style.id === id) ?? TEXT_STYLES[2];
}

// 밝은 색상 = 흰 글자 / 어두운 색상 = 검은 글자
function schemeColors(scheme: Scheme) {
  return scheme === 'light'
    ? {
        strong: '#fff',
        soft: 'rgba(255,255,255,0.8)',
        filledBg: '#fff',
        filledText: '#111',
        line: '#fff',
        arrow: '',
      }
    : {
        strong: '#111',
        soft: 'rgba(17,17,17,0.8)',
        filledBg: '#111',
        filledText: '#fff',
        line: '#111',
        arrow: 'invert(1)',
      };
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

const METRICS: Record<Device, SlideMetrics> = {
  desktop: DESKTOP_METRICS,
  mobile: MOBILE_METRICS,
};

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
      style={{
        left: (clientX - rect.left) / scale,
        top: (clientY - rect.top) / scale + CURSOR_OFFSET,
      }}
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
  onEnd,
  className,
  style,
}: {
  direction?: 'vertical' | 'horizontal';
  value: number;
  factor: number;
  onChange: (value: number) => void;
  onStart?: () => void;
  onEnd?: () => void; // 드래그를 끝냈을 때 (간격 일괄 반영 안내용)
  className: string;
  style?: CSSProperties;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  // 안내를 띄울 마우스 위치(화면 좌표)
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);
  const start = useRef<{
    x: number;
    y: number;
    value: number;
    scale: number;
  } | null>(null);
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
    const wasDragging = start.current !== null;
    start.current = null;
    setIsDragging(false);
    if (wasDragging) onEnd?.();
  };

  return (
    <div
      className={`absolute z-20 flex touch-none items-center justify-center ${isHorizontal ? 'cursor-ew-resize' : 'cursor-ns-resize'} ${className}`}
      // hover·pressed: 간격 영역 전체에 분홍 10%
      style={{
        ...style,
        background: isHovered || isDragging ? 'rgba(255,16,204,0.1)' : undefined,
      }}
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
      {/* 드래그 중: 간격 숫자가 마우스를 따라감 (hover 설명은 시안 3에서 뺌) */}
      {pointer && isDragging && <CursorSnackbar label={String(value)} clientX={pointer.x} clientY={pointer.y} />}
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
type TextKind = 'overline' | 'title' | 'description';

// 텍스트 요소별 슬라이드 필드·이름
const TEXT_FIELDS = {
  overline: { style: 'overlineStyle', color: 'overlineColor', name: '오버라인' },
  title: { style: 'titleStyle', color: 'titleColor', name: '제목' },
  description: { style: 'descStyle', color: 'descColor', name: '설명' },
} as const;
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
  onSpacingEnd: () => void; // 간격 드래그를 끝냈을 때
  editing: EditingText;
  onTextClick: (kind: TextKind, device: Device) => void;
  onTextDone: (kind: TextKind, value: string | null) => void;
};

function SlideView({
  slide,
  index,
  count,
  device,
  selected,
  onSelect,
  onSpacingChange,
  onSpacingStart,
  onSpacingEnd,
  editing,
  onTextClick,
  onTextDone,
}: SlideViewProps) {
  const metrics = METRICS[device];
  const isDesktop = device === 'desktop';
  const colors = schemeColors(slide.scheme);
  const image = slide.image && (isDesktop ? slide.image : (slide.mobileImage ?? slide.image));
  const factor = REAL_PER_CANVAS[device];
  const spacing = slide.spacing[device];
  const toCanvas = (real: number) => real / factor;
  const setSpacing = (patch: Partial<Spacing>) => onSpacingChange(device, patch);

  const titleStyle = textStyle(slide.titleStyle);
  const descStyle = textStyle(slide.descStyle);
  const overlineStyle = textStyle(slide.overlineStyle);
  // 구성 요소에서 지운 요소는 그리지 않음
  const showOverline = slide.visible.overline && !!slide.overline;
  const showTitle = slide.visible.title && !!slide.title;
  const showDesc = slide.visible.description && !!slide.description;
  const showButtons = slide.visible.buttons && slide.buttons.length > 0;
  const textClass = (heading: boolean) => `${SITE_FONT} ${heading ? 'leading-[1.3] font-medium' : 'leading-[1.5] font-normal'} whitespace-pre-line`;

  const isSection = selected === 'section';
  // 간격 핸들은 피그마 시안대로 데스크탑 캔버스에만 표시
  const showSectionHandles = isSection && isDesktop;
  // 간격 영역이 좁아도 잡을 수 있게 최소 8px (시안의 제목↔설명 마커 높이)
  const handleSize = (real: number) => Math.max(toCanvas(real), 8);
  const buttonScale = BUTTON_SCALE[slide.buttonSize[device]];
  const isFill = !isDesktop && slide.buttonFill;
  const layout = slide.layout[device];
  const isLeft = layout === 'bottom-left';
  const direction = slide.buttonDirection[device];
  const isRow = direction === 'row';

  // 요소 사이 간격 + (섹션 선택 시) 간격 핸들
  const gapSpacer = (key: keyof Spacing) => (
    <div className="relative w-full shrink-0" style={{ height: toCanvas(spacing[key]) }}>
      {showSectionHandles && (
        <SpacingHandle
          onStart={onSpacingStart}
          onEnd={onSpacingEnd}
          value={spacing[key]}
          factor={factor}
          onChange={(value) => setSpacing({ [key]: value })}
          className="top-1/2 -translate-y-1/2"
          style={{
            left: -metrics.padX,
            right: -metrics.padX,
            height: handleSize(spacing[key]),
          }}
        />
      )}
    </div>
  );

  return (
    <div
      className="absolute inset-0 flex flex-col items-center overflow-hidden"
      style={{
        padding: `${metrics.padTop}px ${metrics.padX}px ${toCanvas(spacing.bottom)}px`,
      }}
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
            style={{
              objectPosition: isDesktop ? slide.imagePosition : (slide.mobileImagePosition ?? slide.imagePosition),
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-[rgba(0,0,0,0.25)]" />
        )}
      </div>
      <div className="absolute inset-0 bg-black" style={{ opacity: slide.overlay / 100 }} />

      <div
        className={`relative flex min-h-px w-full flex-1 flex-col ${isLeft ? 'items-start' : 'items-center'} ${layout === 'center' ? 'justify-center' : 'justify-end'}`}
      >
        <div className={`flex w-full flex-col break-words break-keep ${isLeft ? 'items-start text-left' : 'items-center text-center'}`}>
          {/* 시안 3: 오버라인 (피그마 textBlock overline). 아래 글과는 고정 간격 */}
          {showOverline && (
            <p className="w-full">
              <EditableText
                text={slide.overline}
                isEditing={editing?.kind === 'overline' && editing.device === device}
                multiline
                className={textClass(overlineStyle.heading)}
                style={{
                  ...DM_SANS,
                  fontSize: overlineStyle[device],
                  color: slide.overlineColor ? textColorCss(slide.overlineColor) : colors.soft,
                }}
                outline={<Outline color={metrics.outline} isSelected={selected === 'overline'} />}
                onClick={() => onTextClick('overline', device)}
                onDone={(value) => onTextDone('overline', value)}
              />
            </p>
          )}
          {showOverline && (showTitle || showDesc) && gapSpacer('overlineTitle')}
          {showTitle && (
            <p className="w-full">
              <EditableText
                text={slide.title}
                isEditing={editing?.kind === 'title' && editing.device === device}
                multiline
                className={textClass(titleStyle.heading)}
                style={{
                  ...DM_SANS,
                  fontSize: titleStyle[device],
                  color: slide.titleColor ? textColorCss(slide.titleColor) : colors.strong,
                }}
                outline={<Outline color={metrics.outline} isSelected={selected === 'title'} />}
                onClick={() => onTextClick('title', device)}
                onDone={(value) => onTextDone('title', value)}
              />
            </p>
          )}
          {showTitle && showDesc && gapSpacer('titleDesc')}
          {showDesc && (
            <p className="w-full">
              <EditableText
                text={slide.description}
                isEditing={editing?.kind === 'description' && editing.device === device}
                multiline
                className={textClass(descStyle.heading)}
                style={{
                  ...DM_SANS,
                  fontSize: descStyle[device],
                  color: slide.descColor ? textColorCss(slide.descColor) : colors.soft,
                }}
                outline={<Outline color={metrics.outline} isSelected={selected === 'description'} />}
                onClick={() => onTextClick('description', device)}
                onDone={(value) => onTextDone('description', value)}
              />
            </p>
          )}
        </div>

        {showButtons && (showOverline || showTitle || showDesc) && gapSpacer('textButtons')}

        {showButtons && (
          <div
            className={`group relative flex cursor-default ${isRow ? 'flex-row items-start' : `flex-col ${isLeft ? 'items-start' : 'items-center'}`} ${isFill ? 'w-full items-stretch' : ''}`}
            onClick={(event) => {
              event.stopPropagation();
              onSelect('buttons');
            }}
          >
            {slide.buttons.map((button, buttonIndex) => {
              const isFilled = slide.buttonStyles[buttonIndex] === '강조 버튼';
              const [padY, padX] = isFilled ? metrics.buttonPad.filled : metrics.buttonPad.outlined;
              return (
                <div key={buttonIndex} className={`contents`}>
                  {buttonIndex > 0 && (
                    <div
                      className="relative shrink-0 self-stretch"
                      style={isRow ? { width: toCanvas(spacing.buttonGap) } : { height: toCanvas(spacing.buttonGap) }}
                    >
                      {selected === 'buttons' && isDesktop && (
                        <SpacingHandle
                          direction={isRow ? 'horizontal' : 'vertical'}
                          value={spacing.buttonGap}
                          factor={factor}
                          onChange={(value) => setSpacing({ buttonGap: value })}
                          onEnd={onSpacingEnd}
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
        style={{
          height: metrics.indicatorHeight,
          padding: metrics.indicatorPad,
        }}
      >
        <div className="flex max-w-full items-start" style={{ gap: metrics.barGap, padding: metrics.barPad }}>
          {Array.from({ length: count }, (_, barIndex) => (
            <span
              key={barIndex}
              className="min-w-[4px] shrink rounded-[0.479px] transition-opacity duration-200"
              style={{
                width: metrics.bar[0],
                height: metrics.bar[1],
                background: colors.line,
                opacity: barIndex === index ? 1 : 0.4,
              }}
            />
          ))}
        </div>
      </div>

      {/* 섹션 아래 여백 핸들: 시안처럼 버튼 바로 아래 12px 영역. 가운데 정렬 레이아웃에서는 숨김 */}
      {showSectionHandles && layout !== 'center' && (
        <SpacingHandle
          onStart={onSpacingStart}
          onEnd={onSpacingEnd}
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

// dimDevice: 레이아웃 미리보기 hover 중인 기기. 그 슬라이드 위에 흰색 40% scrim
type CanvasProps = Omit<SlideViewProps, 'device'> & { onStep: (step: -1 | 1) => void; dimDevice?: Device | null };

// 슬라이드 선택 시 보라색 프레임 + 오른쪽 위 이전/다음 버튼 (시안 2)
function SlideFrame({ className, style, onStep }: { className: string; style?: CSSProperties; onStep: (step: -1 | 1) => void }) {
  const stepButton = (step: -1 | 1) => (
    <button
      type="button"
      aria-label={step === -1 ? '이전 슬라이드' : '다음 슬라이드'}
      onClick={(event) => {
        event.stopPropagation();
        onStep(step);
      }}
      className="pointer-events-auto flex size-[19.167px] shrink-0 cursor-pointer items-center justify-center bg-[#90f] hover:bg-[#7a00cc]"
    >
      <img src={step === -1 ? iconChevronLeftWhite : iconChevronRightWhite} alt="" width={11.5} height={11.5} />
    </button>
  );
  return (
    <div className={`pointer-events-none absolute left-0 border-2 border-solid border-[#90f] ${className}`} style={style}>
      <div className="absolute top-[-2px] right-[-2px] flex items-center">
        {stepButton(-1)}
        {stepButton(1)}
      </div>
    </div>
  );
}

function Canvas({ onStep, dimDevice, ...props }: CanvasProps) {
  const isSection = props.selected === 'section';
  // 공통 설정 > 레이아웃에서 고른 비율에 맞춘 슬라이드 높이
  const desktopH = slideHeight('desktop', props.design.ratio.desktop);
  const mobileH = slideHeight('mobile', props.design.ratio.mobile);
  return (
    // 슬라이드 밖(회색 배경, 헤더, 기기 이름 바 등)을 누르면 선택 해제 → 패널 숨김
    <div className="absolute top-[55px] left-0 h-[839px] w-[1512px]" onClick={() => props.onSelect('none')}>
      <div className="absolute top-[40px] left-[40px] flex h-[799px] w-[920px] flex-col gap-[12px]">
        <ViewportBar icon={iconDesktop} label="데스크탑" />
        <div className="relative min-h-px w-full flex-1 overflow-hidden bg-white">
          <DesktopHeader />
          <div className="absolute top-[25.88px] left-0 w-[920px]" style={{ height: desktopH }}>
            <SlideView {...props} device="desktop" />
            {dimDevice === 'desktop' && <div className="pointer-events-none absolute inset-0 bg-[rgba(255,255,255,0.4)]" />}
          </div>
          {isSection && (
            <div className="pointer-events-none absolute top-[26px] left-0 w-[920px] border border-solid border-[#09f]" style={{ height: desktopH - 0.5 }} />
          )}
          {isSection && <SlideFrame className="top-[26px] w-[920px]" style={{ height: desktopH + 0.5 }} onStep={onStep} />}
        </div>
      </div>

      <div className="absolute top-[40px] left-[980px] flex h-[799px] w-[188px] flex-col gap-[12px] overflow-hidden">
        <ViewportBar icon={iconMobile} label="모바일" />
        <div className="relative min-h-px w-full flex-1 overflow-hidden bg-white">
          <MobileHeader />
          <div className="absolute top-[28.92px] left-0 w-[188px]" style={{ height: mobileH }}>
            <SlideView {...props} device="mobile" />
            {dimDevice === 'mobile' && <div className="pointer-events-none absolute inset-0 bg-[rgba(255,255,255,0.4)]" />}
          </div>
          {isSection && (
            <div className="pointer-events-none absolute top-[29px] left-0 w-[188px] border border-solid border-[#80ccff]" style={{ height: mobileH }} />
          )}
          {isSection && <SlideFrame className="top-[29px] w-[188px]" style={{ height: mobileH }} onStep={onStep} />}
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
// thumbnail이 있으면 아이콘 대신 실제 이미지를 보여줌 (배경 진입점)
function MenuItem({
  icon,
  iconSize = 16,
  label,
  description,
  iconBox,
  onClick,
  thumbnail,
}: {
  icon: string;
  iconSize?: number;
  label: string;
  description?: string; // 라벨 아래 작은 회색 글 (예: 색상 메뉴의 '밝은 색상')
  iconBox?: CSSProperties; // 아이콘 칸 스타일 덮어쓰기 (예: 색상 메뉴의 검은 칸)
  onClick?: () => void;
  thumbnail?: string | null;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-[246px] cursor-pointer items-center gap-[4px] overflow-hidden rounded-[6px] border border-solid border-[rgba(51,62,76,0.1)] p-[10px] text-left ${HOVER_LAYER}`}
    >
      <span className="flex min-w-px flex-1 items-center gap-[8px]">
        {thumbnail ? (
          <img src={thumbnail} alt="" className="size-[32px] shrink-0 rounded-[6px] object-cover" />
        ) : (
          <span className="flex size-[32px] shrink-0 items-center justify-center rounded-[6px] bg-[#f6f7f9] p-[6px]" style={iconBox}>
            <img src={icon} alt="" width={iconSize} height={iconSize} />
          </span>
        )}
        {description ? (
          <span className="flex min-w-px flex-1 flex-col justify-center">
            <span className="font-['Pretendard'] text-[12px] leading-[18px] font-medium whitespace-nowrap text-black">{label}</span>
            <span className="font-['Pretendard'] text-[11px] leading-[14px] font-normal text-[#667080]">{description}</span>
          </span>
        ) : (
          <span className="font-['Pretendard'] text-[12px] leading-[18px] font-medium whitespace-nowrap text-black">{label}</span>
        )}
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
  onAdd: () => void;
  tab: ListTab;
  onTab: (tab: ListTab) => void;
  onOpenCommonLayout: () => void;
  onOpenAnimation: () => void;
  onOpenSlideMode: () => void;
};

type ListTab = 'content' | 'common';

// 패널 상단 탭 (콘텐츠 / 공통 설정)
function PanelTabs<T extends string>({ value, options, onChange }: { value: T; options: { value: T; label: string }[]; onChange: (value: T) => void }) {
  return (
    <div className="flex h-[34px] w-[280px] shrink-0 items-start gap-[16px] border-b border-solid border-[rgba(51,62,76,0.1)] px-[20px]">
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`flex h-[34px] min-w-px flex-1 cursor-pointer items-center justify-center font-['Pretendard'] text-[12px] leading-[18px] ${
              isActive ? 'border-b-2 border-solid border-black font-medium text-black' : 'font-normal text-[#667080] hover:text-black'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

// 공통 설정 탭: 모든 슬라이드에 함께 적용되는 설정으로 들어가는 메뉴 목록
// (각 메뉴의 하위 패널은 디자인을 받으면 연결)
function CommonSettings({
  count,
  onOpenLayout,
  onOpenAnimation,
  onOpenSlideMode,
}: {
  count: number;
  onOpenLayout: () => void;
  onOpenAnimation: () => void;
  onOpenSlideMode: () => void;
}) {
  return (
    <div className="flex w-full flex-col">
      <div className="flex w-full flex-col px-[20px] pt-[20px] pb-[12px]">
        <div className="flex w-full items-center gap-[8px] rounded-[8px] bg-[#f6f7f9] px-[6px] py-[8px]">
          <img src={iconInformation} alt="" width={16} height={16} />
          <p className="min-w-px flex-1 font-['Pretendard'] text-[11px] leading-[14px] font-normal text-[#667080]">슬라이드 {count}개에 일괄 적용돼요</p>
        </div>
      </div>
      <div className="flex w-[280px] flex-col items-center gap-[8px] px-[16px] pb-[16px]">
        <MenuItem icon={iconLayout} label="레이아웃" onClick={onOpenLayout} />
        <MenuItem icon={iconError} iconSize={14.222} label="애니메이션" onClick={onOpenAnimation} />
        <MenuItem icon={iconSlide} label="슬라이드 방식" onClick={onOpenSlideMode} />
      </div>
    </div>
  );
}

function SlideListPanel({ slides, onOpen, onReorder, onAdd, tab, onTab, onOpenCommonLayout, onOpenAnimation, onOpenSlideMode }: ListPanelProps) {
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
      <PanelTabs
        value={tab}
        options={[
          { value: 'content', label: '콘텐츠' },
          { value: 'common', label: '공통 설정' },
        ]}
        onChange={onTab}
      />

      {tab === 'common' && (
        <CommonSettings count={slides.length} onOpenLayout={onOpenCommonLayout} onOpenAnimation={onOpenAnimation} onOpenSlideMode={onOpenSlideMode} />
      )}
      {tab === 'content' && (
        <div className="flex min-h-0 w-[280px] flex-1 flex-col gap-[12px] pt-[20px] pb-px">
          <div className="flex h-[18px] shrink-0 items-baseline gap-[4px] px-[20px] font-['Pretendard'] text-[12px] leading-[18px] whitespace-nowrap">
            <span className="font-semibold text-[#333e4c]">아이템</span>
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
            {/* 최대 개수보다 적을 때만 목록 맨 아래에 추가 버튼 */}
            {slides.length < MAX_SLIDES && (
              <div className="flex w-full shrink-0 items-baseline px-[20px] py-[12px]">
                <button type="button" onClick={onAdd} className="flex cursor-pointer items-center justify-center gap-[4px] hover:opacity-80">
                  <img src={iconPlusFilled} alt="" width={16} height={16} />
                  <span className="font-['Pretendard'] text-[12px] leading-[18px] font-medium whitespace-nowrap text-[#1a66ff]">슬라이드 추가</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- 1-1. 레이아웃 패널 (공통 설정)

// 레이아웃 옵션 미리보기 (피그마 panel/layout/option 의 축소 화면 그대로)
// height: 비율 칩에 맞춘 미리보기 높이 (기본 = 풀스크린)
function LayoutPreview({ layout, height = 132.75 }: { layout: LayoutId; height?: number }) {
  const isLeft = layout === 'bottom-left';
  return (
    <div className="relative flex w-[236px] flex-col items-center justify-center overflow-hidden px-[4.425px] py-[7.867px]" style={{ height }}>
      <div className="absolute inset-0 bg-[#ddd]" />
      <div className="absolute inset-0 bg-[rgba(0,0,0,0.2)]" />
      <div
        className={`relative flex min-h-px w-full flex-1 flex-col gap-[4.425px] overflow-hidden ${isLeft ? 'items-start' : 'items-center'} ${
          layout === 'center' ? 'justify-center' : 'justify-end'
        }`}
      >
        <div className={`flex w-full flex-col gap-[1.475px] font-['DM_Sans'] ${isLeft ? 'items-start text-left' : 'items-center text-center'}`} style={DM_SANS}>
          <p className="w-full text-[1.721px] leading-[1.6] font-normal text-[rgba(255,255,255,0.8)]">Lorem ipsum</p>
          <p className="w-full text-[6.392px] leading-[1.3] font-medium text-white">Lorem ipsum dolor sit amet</p>
          <p className="w-full text-[1.967px] leading-[1.5] font-normal text-[rgba(255,255,255,0.8)]">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Graecis praetorem, consuetudinum, maiores, tribus saluti reprehensa.
          </p>
        </div>
        <div className="flex items-start gap-[0.983px] font-['DM_Sans'] text-[1.598px] leading-[1.2] font-medium whitespace-nowrap" style={DM_SANS}>
          <span className="rounded-[0.492px] border-[0.123px] border-solid border-transparent bg-white px-[3.319px] py-[1.721px] text-[#111]">
            Button Label
          </span>
          <span className="rounded-[0.492px] border-[0.123px] border-solid border-white px-[3.196px] py-[1.598px] text-white">Button Label</span>
        </div>
      </div>
    </div>
  );
}

// 모바일 레이아웃 옵션 미리보기 (피그마 모바일 panel/layout/option 의 세로 축소 화면)
function MobileLayoutPreview({ layout, height = 233.723 }: { layout: LayoutId; height?: number }) {
  const isLeft = layout === 'bottom-left';
  return (
    <div className="relative flex w-[108px] flex-col items-center justify-center overflow-hidden px-[4.431px] py-[11.077px]" style={{ height }}>
      <div className="absolute inset-0 bg-[#ddd]" />
      <div className="absolute inset-0 bg-[rgba(0,0,0,0.2)]" />
      <div
        className={`relative flex min-h-px w-full flex-1 flex-col gap-[8.862px] overflow-hidden ${isLeft ? 'items-start' : 'items-center'} ${
          layout === 'center' ? 'justify-center' : 'justify-end'
        }`}
      >
        <div className={`flex w-full flex-col gap-[3.323px] font-['DM_Sans'] ${isLeft ? 'items-start text-left' : 'items-center text-center'}`} style={DM_SANS}>
          <p className="w-full text-[3.877px] leading-[1.6] font-normal text-[rgba(255,255,255,0.8)]">Lorem ipsum</p>
          <p className="w-full text-[11.077px] leading-[1.3] font-medium text-white">Lorem ipsum dolor sit amet</p>
          <p className="w-full text-[4.154px] leading-[1.5] font-normal text-[rgba(255,255,255,0.8)]">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Graecis praetorem, consuetudinum, maiores, tribus saluti reprehensa.
          </p>
        </div>
        <div className="flex items-start gap-[2.215px] font-['DM_Sans'] text-[3.6px] leading-[1.2] font-medium whitespace-nowrap" style={DM_SANS}>
          <span className="rounded-[1.108px] border-[0.277px] border-solid border-transparent bg-white px-[7.477px] py-[3.877px] text-[#111]">
            Button Label
          </span>
          <span className="rounded-[1.108px] border-[0.277px] border-solid border-white px-[7.477px] py-[3.877px] text-white">Button Label</span>
        </div>
      </div>
    </div>
  );
}

// 미리보기 크기: 너비는 고정, 높이는 비율에 맞춤 (풀스크린 = 피그마 시안 높이)
const PREVIEW_BOX: Record<Device, { width: number; fullHeight: number }> = {
  desktop: { width: 236, fullHeight: 132.75 },
  mobile: { width: 108, fullHeight: 233.723 },
};

function ratioValue(device: Device, ratio: string) {
  return RATIO_OPTIONS[device].find((option) => option.label === ratio)?.value ?? null;
}

function previewHeight(device: Device, ratio: string) {
  const value = ratioValue(device, ratio);
  return value === null ? PREVIEW_BOX[device].fullHeight : PREVIEW_BOX[device].width / value;
}

// 캔버스에 잠깐 보여줄 레이아웃 (미리보기에 마우스를 올린 동안)
type LayoutPeek = { device: Device; ratio: string; layout: LayoutId };

// 시안 3: 공통 설정 > 레이아웃. 모든 슬라이드에 한 번에 적용 (변경 안내 없음)
// - 비율 칩: 아래 미리보기 높이만 바꿈. 캔버스는 그대로
// - 미리보기 hover: 캔버스에 그 비율·레이아웃을 미리 보여줌 / 클릭: 비율 + 레이아웃 적용
function CommonLayoutPanel({
  slides,
  ratio,
  onApply,
  onPeek,
  onBack,
}: {
  slides: Slide[];
  ratio: Record<Device, string>;
  onApply: (device: Device, ratio: string, layout: LayoutId) => void;
  onPeek: (peek: LayoutPeek | null) => void;
  onBack: () => void;
}) {
  const [device, setDevice] = useState<Device>('desktop');
  // 칩으로 보고 있는 비율 (처음엔 지금 적용된 비율)
  const [viewRatio, setViewRatio] = useState(ratio);
  // 패널이 닫히면 미리보기도 끝냄
  useEffect(() => () => onPeek(null), [onPeek]);
  // 모든 슬라이드가 같은 레이아웃이고, 보고 있는 비율이 적용된 비율일 때만 선택 표시
  const sharedLayout = slides.every((slide) => slide.layout[device] === slides[0].layout[device]) ? slides[0].layout[device] : null;
  const selectedLayout = viewRatio[device] === ratio[device] ? sharedLayout : null;
  const height = previewHeight(device, viewRatio[device]);
  return (
    <div className={PANEL_CLASS}>
      <PanelHeader title="레이아웃" onBack={onBack} />
      <PanelTabs
        value={device}
        options={[
          { value: 'desktop', label: '데스크탑' },
          { value: 'mobile', label: '모바일' },
        ]}
        onChange={setDevice}
      />
      {/* 비율 칩 */}
      <div className="flex w-full items-start gap-[6px] px-[20px] pt-[20px]">
        {RATIO_OPTIONS[device].map((option) => {
          const isSelected = viewRatio[device] === option.label;
          return (
            <button
              key={option.label}
              type="button"
              onClick={() => setViewRatio((prev) => ({ ...prev, [device]: option.label }))}
              className={`flex min-w-[40px] shrink-0 cursor-pointer items-center justify-center rounded-[6px] px-[8px] py-[4px] font-['Pretendard'] text-[12px] leading-[18px] whitespace-nowrap ${
                isSelected ? 'bg-[#181d25] font-semibold text-white' : 'bg-[#f6f7f9] font-normal text-[#667080] hover:bg-[#eceef1]'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      <div
        className={`flex w-full gap-[12px] p-[20px] ${device === 'desktop' ? 'flex-col' : 'flex-wrap content-start items-start'}`}
        onMouseLeave={() => onPeek(null)}
      >
        {(device === 'desktop' ? LAYOUT_OPTIONS : MOBILE_LAYOUT_OPTIONS).map((option) => (
          <button
            key={option}
            type="button"
            onMouseEnter={() => onPeek({ device, ratio: viewRatio[device], layout: option })}
            onClick={() => onApply(device, viewRatio[device], option)}
            className={`flex ${device === 'desktop' ? 'w-[240px]' : 'w-[114px]'} cursor-pointer flex-col rounded-[6px] border-[1.5px] border-solid p-[2px] ${
              selectedLayout === option ? 'border-[#1a66ff]' : 'border-transparent'
            }`}
          >
            <span className="flex w-full overflow-hidden rounded-[6px] border border-solid border-[rgba(51,62,76,0.16)] bg-white p-px">
              {device === 'desktop' ? <LayoutPreview layout={option} height={height} /> : <MobileLayoutPreview layout={option} height={height} />}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// 시안 3: 공통 설정 > 애니메이션. 슬라이드 전환 효과 선택 (캔버스 동작은 구현하지 않음)
function AnimationPanel({ value, onChange, onBack }: { value: Animation; onChange: (animation: Animation) => void; onBack: () => void }) {
  return (
    <div className={ELEMENT_PANEL_CLASS}>
      <PanelHeader title="애니메이션" onBack={onBack} />
      <div className="flex w-[280px] flex-col gap-[12px] border-b border-solid border-[rgba(51,62,76,0.1)] p-[20px]">
        <p className="font-['Pretendard'] text-[12px] leading-[18px] font-semibold text-[#333e4c]">애니메이션</p>
        <Dropdown value={value} options={ANIMATIONS} onChange={onChange} />
      </div>
    </div>
  );
}

// 시안 3: 공통 설정 > 슬라이드 방식. 시안 2 공통 설정 탭의 슬라이드 방식과 같음 (캔버스 동작은 구현하지 않음)
function SlideModePanel({ value, onChange, onBack }: { value: SlideMode; onChange: (slideMode: SlideMode) => void; onBack: () => void }) {
  return (
    <div className={PANEL_CLASS}>
      <PanelHeader title="슬라이드 방식" onBack={onBack} />
      <div className="flex w-[280px] flex-col gap-[12px] p-[20px]">
        <p className="font-['Pretendard'] text-[12px] leading-[18px] font-semibold text-[#333e4c]">슬라이드 방식</p>
        <Segmented
          value={value}
          options={[
            { value: 'auto', label: '자동 전환' },
            { value: 'manual', label: '직접 넘기기' },
          ]}
          onChange={onChange}
        />
      </div>
    </div>
  );
}

// 시안 3: 슬라이드 N > 구성 요소. 텍스트(오버라인·제목·설명) / 동작(버튼)
// 있는 요소: 누르면 캔버스에서 선택 + 요소 패널 / 없는(지운) 요소: 파란 '{이름} 추가' → 누르면 다시 표시
function ComponentsPanel({
  slide,
  onBack,
  onSelect,
  onAdd,
}: {
  slide: Slide;
  onBack: () => void;
  onSelect: (target: ElementKey) => void;
  onAdd: (target: ElementKey) => void;
}) {
  const groupTitle = (title: string) => (
    <p className="flex h-[34px] w-full items-center px-[20px] font-['Pretendard'] text-[12px] leading-[18px] font-normal text-[#667080]">{title}</p>
  );
  const item = (key: ElementKey, icon: string, name: string) => {
    const isShown = slide.visible[key];
    return (
      <button
        key={key}
        type="button"
        onClick={() => (isShown ? onSelect(key) : onAdd(key))}
        className={`flex h-[38px] w-full cursor-pointer items-center gap-[8px] px-[12px] py-[10px] text-left ${HOVER_LAYER}`}
      >
        <img src={isShown ? icon : iconPlusFilled18} alt="" width={18} height={18} />
        <span className={`min-w-px flex-1 truncate font-['Pretendard'] text-[12px] leading-[18px] font-normal ${isShown ? 'text-black' : 'text-[#1a66ff]'}`}>
          {isShown ? name : `${name} 추가`}
        </span>
      </button>
    );
  };
  return (
    <div className={PANEL_CLASS}>
      <PanelHeader title="구성 요소" onBack={onBack} />
      <div className="flex w-full flex-col border-b border-solid border-[rgba(51,62,76,0.1)] pb-[8px]">
        {groupTitle('텍스트')}
        <div className="flex w-full flex-col px-[8px]">
          {(['overline', 'title', 'description'] as const).map((key) => item(key, iconTypography, TEXT_FIELDS[key].name))}
        </div>
      </div>
      <div className="flex w-full flex-col pb-[8px]">
        {groupTitle('동작')}
        <div className="flex w-full flex-col px-[8px]">{item('buttons', iconLink, '버튼')}</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- 2. 슬라이드 상세 패널

function SlideDetailPanel({
  index,
  slide,
  onBack,
  onDelete,
  onOpenMenu,
}: {
  index: number;
  slide: Slide;
  onBack: () => void;
  onDelete: () => void;
  onOpenMenu: (menu: 'background' | 'color' | 'components') => void;
}) {
  return (
    <div className={PANEL_CLASS}>
      <PanelHeader
        title={`슬라이드 ${index + 1}`}
        onBack={onBack}
        right={
          <button
            type="button"
            aria-label="슬라이드 삭제"
            onClick={onDelete}
            className={`flex size-[24px] cursor-pointer items-center justify-center rounded-[4px] ${HOVER_LAYER}`}
          >
            <img src={iconDeleteSlide} alt="" width={16} height={16} />
          </button>
        }
      />
      <div className="flex w-[280px] flex-col items-center gap-[8px] px-[16px] pt-[8px] pb-[16px]">
        {/* 배경: 실제 배경 이미지를 썸네일로 보여줌 (없으면 아이콘) */}
        <MenuItem icon={iconImage} label="배경" thumbnail={slide.image} onClick={() => onOpenMenu('background')} />
        {/* 시안 3: 색상 메뉴 다시 제공 (선택 화면 = 시안 1 색상 패널). 어두운 색상이면 아이콘 칸을 반전 */}
        <MenuItem
          icon={iconButtonStyleAa}
          iconSize={18}
          label="색상"
          description={SCHEME_OPTIONS.find((option) => option.value === slide.scheme)?.title}
          iconBox={{ background: 'black', filter: slide.scheme === 'dark' ? 'invert(1)' : undefined }}
          onClick={() => onOpenMenu('color')}
        />
        {/* 구성 요소 패널은 이번 데모 범위 밖 */}
        <MenuItem icon={iconLayer} label="구성 요소" onClick={() => onOpenMenu('components')} />
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
    <button
      type="button"
      onClick={onClick}
      className={`flex h-[24px] cursor-pointer items-center justify-center rounded-[4px] px-[6px] py-[3px] ${HOVER_LAYER}`}
    >
      <span className="font-['Pretendard'] text-[12px] leading-[18px] font-medium whitespace-nowrap text-[#333e4c]">{label}</span>
    </button>
  );
}

function BackgroundPanel({ slide, onBack, onChange }: { slide: Slide; onBack: () => void; onChange: (patch: Partial<Slide>) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // 새 이미지는 데스크탑·모바일에 함께 적용
    if (file)
      onChange({
        image: URL.createObjectURL(file),
        mobileImage: undefined,
        fileName: file.name,
      });
    event.target.value = '';
  };

  return (
    // 색상 메뉴가 패널 아래로 조금 나올 수 있어서 overflow-hidden 없는 패널 사용
    <div className={ELEMENT_PANEL_CLASS}>
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
            style={{
              backgroundImage: `url("${mediaChecker}")`,
              backgroundSize: '258px 126.097px',
            }}
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
  {
    value: 'light',
    title: '밝은 색상',
    description: '어두운 이미지 위에서 잘 보여요',
  },
  {
    value: 'dark',
    title: '어두운 색상',
    description: '밝은 이미지 위에서 잘 보여요',
  },
];

// 밝은/어두운 색상 옵션 카드 (색상 패널·배경 패널 메뉴 공용)
function SchemeOptionCard({
  option,
  isSelected,
  onClick,
  lightDim = 0.8,
}: {
  option: (typeof SCHEME_OPTIONS)[number];
  isSelected: boolean;
  onClick: () => void;
  lightDim?: number; // 밝은 색상 카드의 어두운 덮개 진하기 (배경 메뉴 시안은 0.6)
}) {
  const isLight = option.value === 'light';
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full cursor-pointer flex-col rounded-[6px] p-[2px] text-left ${isSelected ? 'border-[1.5px] border-solid border-[#1a66ff]' : ''}`}
    >
      <span
        className={`relative flex w-full items-center gap-[16px] overflow-hidden rounded-[6px] border border-solid border-[rgba(51,62,76,0.16)] px-[12px] py-[13px] ${
          isLight ? 'bg-white' : 'bg-[#eff1f4]'
        }`}
      >
        <span className="pointer-events-none absolute top-[calc(50%-64.5px)] left-[calc(50%+0.5px)] h-[357px] w-[235px] -translate-x-1/2 -translate-y-1/2">
          <img src={colorPreview} alt="" className="absolute inset-0 size-full max-w-none object-cover" />
          <span className="absolute inset-0" style={{ background: isLight ? `rgba(0,0,0,${lightDim})` : 'rgba(255,255,255,0.2)' }} />
        </span>
        <span className="relative flex items-center gap-[6px]">
          <span className={`size-[16px] shrink-0 rounded-[100px] ${isLight ? 'bg-white' : 'bg-[#1a1715]'}`} />
          <span className={`font-['Pretendard'] text-[12px] leading-[18px] font-medium whitespace-nowrap ${isLight ? 'text-white' : 'text-black'}`}>Aa</span>
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
}

function ColorPanel({ slide, onBack, onChange }: { slide: Slide; onBack: () => void; onChange: (patch: Partial<Slide>) => void }) {
  return (
    <div className={PANEL_CLASS}>
      <PanelHeader title="색상" onBack={onBack} />
      <div className="flex w-full flex-col gap-[20px] px-[20px] pt-[8px] pb-[20px]">
        <div className="flex w-[240px] flex-col gap-[8px]">
          {SCHEME_OPTIONS.map((option) => (
            <SchemeOptionCard
              key={option.value}
              option={option}
              isSelected={slide.scheme === option.value}
              onClick={() => onChange({ scheme: option.value })}
            />
          ))}
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

function TextInput({
  value,
  onChange,
  placeholder,
  maxLength,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
}) {
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
              isActive
                ? 'bg-white font-medium text-black shadow-[0px_1px_0.5px_rgba(65,78,97,0.08),0px_2px_4px_rgba(65,78,97,0.16)]'
                : 'font-normal text-[#667080]'
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

// 색상 옵션 아래 툴팁 (피그마 tooltip: 위쪽 꼬리 + 검은 말풍선). 부모 group에 hover 시 표시
function OptionTooltip({ label }: { label: string }) {
  return (
    <span className="pointer-events-none invisible absolute top-[calc(100%+4px)] left-1/2 z-10 flex -translate-x-1/2 flex-col items-center group-hover:visible">
      <img src={iconTooltipTip} alt="" width={10} height={4} className="block" />
      <span className="rounded-[4px] bg-[#181d25] p-[8px] font-['Pretendard'] text-[12px] leading-[18px] font-medium whitespace-nowrap text-white">
        {label}
      </span>
    </span>
  );
}

// 드래그 공용: 누른 자리부터 손을 뗄 때까지 0~1 비율(x, y)을 알려 줌
function useDragRatio(onMove: (x: number, y: number) => void) {
  // 드래그 중에도 항상 최신 상태로 계산하도록 (첫 변경에 만든 커스텀 색 자리를 계속 고치게)
  const latest = useRef(onMove);
  latest.current = onMove;
  return {
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      const target = event.currentTarget;
      target.setPointerCapture(event.pointerId);
      const move = (clientX: number, clientY: number) => {
        const rect = target.getBoundingClientRect();
        latest.current(Math.min(1, Math.max(0, (clientX - rect.left) / rect.width)), Math.min(1, Math.max(0, (clientY - rect.top) / rect.height)));
      };
      move(event.clientX, event.clientY);
      const handleMove = (moveEvent: globalThis.PointerEvent) => move(moveEvent.clientX, moveEvent.clientY);
      const handleUp = () => {
        target.removeEventListener('pointermove', handleMove);
        target.removeEventListener('pointerup', handleUp);
      };
      target.addEventListener('pointermove', handleMove);
      target.addEventListener('pointerup', handleUp);
    },
  };
}

const PICKER_HANDLE_CLASS =
  'pointer-events-none absolute size-[12px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-solid border-white shadow-[0px_1px_1px_0px_rgba(65,78,97,0.08),0px_2px_8px_0px_rgba(65,78,97,0.16)]';

// 시안 3: 커스텀 색상 피커 (피그마 menu/color/custom). 색 영역 + 색조 + 불투명도 + HEX/불투명도 입력
function CustomColorPicker({ color, onChange }: { color: TextColor; onChange: (color: TextColor) => void }) {
  // 손잡이 위치는 HSV로 따로 들고 있음 (검정·회색은 HEX만으로 색조를 알 수 없어서)
  const [hsv, setHsv] = useState(() => hexToHsv(color.hex));
  const [hexDraft, setHexDraft] = useState(color.hex.slice(1).toUpperCase());
  const [opacityDraft, setOpacityDraft] = useState(String(color.opacity));
  useEffect(() => {
    setHexDraft(color.hex.slice(1).toUpperCase());
    setOpacityDraft(String(color.opacity));
  }, [color.hex, color.opacity]);

  const applyHsv = (next: Hsv) => {
    setHsv(next);
    onChange({ hex: hsvToHex(next), opacity: color.opacity });
  };
  const areaDrag = useDragRatio((x, y) => applyHsv({ ...hsv, s: x, v: 1 - y }));
  const hueDrag = useDragRatio((x) => applyHsv({ ...hsv, h: x * 360 }));
  const opacityDrag = useDragRatio((x) => onChange({ hex: color.hex, opacity: Math.round(x * 100) }));

  const commitHex = (draft: string) => {
    const clean = draft.replace(/[^0-9a-fA-F]/g, '');
    const full = clean.length === 3 ? clean.replace(/./g, (c) => c + c) : clean;
    if (full.length !== 6) return setHexDraft(color.hex.slice(1).toUpperCase());
    const hex = `#${full.toLowerCase()}`;
    const next = hexToHsv(hex);
    setHsv(next.s === 0 || next.v === 0 ? { ...next, h: hsv.h } : next);
    onChange({ hex, opacity: color.opacity });
  };
  const commitOpacity = (draft: string) => {
    const value = Number(draft);
    if (draft.trim() === '' || Number.isNaN(value)) return setOpacityDraft(String(color.opacity));
    onChange({ hex: color.hex, opacity: Math.round(Math.min(100, Math.max(0, value))) });
  };
  const hueColor = `hsl(${hsv.h}, 100%, 50%)`;

  return (
    <div className="absolute top-0 right-[calc(100%+4px)] flex w-[238px] flex-col items-center overflow-hidden rounded-[12px] border border-solid border-[rgba(51,62,76,0.1)] bg-white p-px shadow-[0px_4px_10px_0px_rgba(65,78,97,0.08)]">
      {/* 채도·명도 영역 */}
      <div className="flex h-[185px] w-full p-[16px]">
        <div {...areaDrag} className="relative h-full min-w-px flex-1 cursor-crosshair touch-none rounded-[4px]" style={{ background: hueColor }}>
          <div className="absolute inset-0 rounded-[4px] bg-gradient-to-r from-white to-[rgba(255,255,255,0)]" />
          <div className="absolute inset-0 rounded-[4px] bg-gradient-to-t from-black to-[rgba(0,0,0,0)]" />
          <span className={PICKER_HANDLE_CLASS} style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%`, background: color.hex }} />
        </div>
      </div>
      {/* 색조 */}
      <div className="w-full px-[16px] pt-[4px] pb-[8px]">
        <div
          {...hueDrag}
          className="relative h-[8px] w-full cursor-pointer touch-none rounded-full"
          style={{ background: 'linear-gradient(90deg, #f00, #ff0 16.67%, #0f0 33.33%, #0ff 50%, #00f 66.67%, #f0f 83.33%, #f00)' }}
        >
          <span className={`${PICKER_HANDLE_CLASS} top-1/2`} style={{ left: `${(hsv.h / 360) * 100}%`, background: hueColor }} />
        </div>
      </div>
      {/* 불투명도 */}
      <div className="w-full px-[16px] pt-[4px] pb-[20px]">
        <div
          {...opacityDrag}
          className="relative h-[8px] w-full cursor-pointer touch-none rounded-full"
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(0,0,0,0), ${color.hex}), url(${imgOpacityTrack})`,
            backgroundSize: 'auto, 5.5px 5.5px',
          }}
        >
          <span className={`${PICKER_HANDLE_CLASS} top-1/2`} style={{ left: `${color.opacity}%`, background: textColorCss(color) }} />
        </div>
      </div>
      {/* HEX / 불투명도 입력 */}
      <div className="flex w-full items-center gap-[8px] px-[16px] pb-[16px]">
        <span className="font-['Pretendard'] text-[12px] leading-[18px] font-medium whitespace-nowrap text-[#333e4c]">HEX</span>
        <div className="flex min-w-px flex-1 items-stretch rounded-[6px] bg-[#f6f7f9] font-['Pretendard'] text-[12px] leading-[18px] font-normal">
          <label className="flex min-w-px flex-1 items-center gap-[2px] p-[8px]">
            <span className="text-[#99a0aa]">#</span>
            <input
              value={hexDraft}
              maxLength={6}
              onChange={(event) => {
                setHexDraft(event.target.value.toUpperCase());
                if (/^[0-9a-fA-F]{6}$/.test(event.target.value)) commitHex(event.target.value);
              }}
              onBlur={(event) => commitHex(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && commitHex(event.currentTarget.value)}
              className="w-full min-w-px bg-transparent p-0 text-[#333e4c] outline-none"
            />
          </label>
          <span className="w-px shrink-0 bg-[rgba(51,62,76,0.1)]" />
          <label className="flex items-center justify-end gap-[2px] py-[8px] pr-[8px] pl-[10px]">
            <input
              value={opacityDraft}
              inputMode="numeric"
              onChange={(event) => setOpacityDraft(event.target.value.replace(/[^0-9]/g, '').slice(0, 3))}
              onBlur={(event) => commitOpacity(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && commitOpacity(event.currentTarget.value)}
              className="w-[26px] bg-transparent p-0 text-[#333e4c] outline-none"
            />
            <span className="text-[#99a0aa]">%</span>
          </label>
        </div>
      </div>
    </div>
  );
}

// 시안 3: 텍스트 색상 메뉴 (피그마 menu/color). 공통 스타일 / 색상 세트 / 커스텀
// 커스텀 +: 왼쪽에 피커가 열리고, 색을 바꾸는 순간 + 옆에 새 색이 생겨 실시간으로 반영됨
function TextColorMenu({
  value,
  commonColor,
  slotName,
  customColors,
  onSelect,
  onLiveChange,
  onCustomColors,
  onClose,
  onOpenSlideColor,
}: {
  value: TextColor | null;
  commonColor: string;
  slotName: string; // 공통 스타일 hover 툴팁 (컬러 슬롯명, 예: 텍스트 - 제목)
  customColors: TextColor[];
  onSelect: (color: TextColor | null) => void; // 고르고 메뉴 닫기
  onLiveChange: (color: TextColor) => void; // 피커 조작 중 실시간 반영 (메뉴 유지)
  onCustomColors: (colors: TextColor[]) => void;
  onClose: () => void;
  onOpenSlideColor: () => void; // 안내 문구의 '색상 메뉴' → 슬라이드 N > 색상 패널
}) {
  const ref = useRef<HTMLDivElement>(null);
  // 커스텀 피커: index = 지금 만들고 있는 커스텀 색 자리 (아직 안 바꿨으면 null)
  const [picker, setPicker] = useState<{ index: number | null; color: TextColor } | null>(null);
  // 메뉴 밖(색상 칸 제외)을 누르면 닫힘
  useEffect(() => {
    const handleDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (ref.current?.contains(target) || ref.current?.parentElement?.firstElementChild?.contains(target)) return;
      onClose();
    };
    document.addEventListener('mousedown', handleDown);
    return () => document.removeEventListener('mousedown', handleDown);
  }, [onClose]);

  const handlePickerChange = (color: TextColor) => {
    let index = picker?.index ?? null;
    if (index === null) {
      index = customColors.length;
      onCustomColors([...customColors, color]);
    } else {
      onCustomColors(customColors.map((item, i) => (i === index ? color : item)));
    }
    setPicker({ index, color });
    onLiveChange(color);
  };

  // hover: 회색 링(선택 시엔 파란 링) + 아래 툴팁. 피커가 열려 있는 동안은 + 만 선택 표시
  const option = (color: TextColor | null, label: string, key: string) => {
    const isSelected = !picker && sameColor(value, color);
    return (
      <span key={key} className="group relative shrink-0">
        <button
          type="button"
          aria-label={label}
          onClick={() => onSelect(color)}
          className={`flex size-[36px] cursor-pointer items-center overflow-hidden rounded-full ${
            isSelected ? 'border-2 border-solid border-[#1a66ff] p-[4px]' : 'hover:border-2 hover:border-solid hover:border-[rgba(51,62,76,0.16)] hover:p-[4px]'
          }`}
        >
          <span
            className={`block h-full min-w-px flex-1 rounded-full ${isSelected ? '' : 'border border-solid border-[rgba(51,62,76,0.16)] group-hover:border-0'}`}
            style={{ background: color ? textColorCss(color) : commonColor }}
          />
        </button>
        <OptionTooltip label={label} />
      </span>
    );
  };
  const groupTitle = (title: string) => <p className="w-full font-['Pretendard'] text-[11px] leading-[14px] font-medium text-[#667080]">{title}</p>;

  return (
    <div
      ref={ref}
      className="absolute top-[calc(100%+4px)] left-0 z-30 flex w-[240px] flex-col rounded-[8px] border border-solid border-[rgba(51,62,76,0.1)] bg-white px-px pt-[13px] pb-px shadow-[0px_0px_1px_0px_rgba(65,78,97,0.08),0px_16px_64px_0px_rgba(65,78,97,0.16)]"
    >
      {picker && <CustomColorPicker color={picker.color} onChange={handlePickerChange} />}
      <div className="w-full px-[12px] pb-[12px]">
        <div className="flex w-full items-center gap-[8px] rounded-[8px] bg-[#f6f7f9] px-[8px] py-[12px]">
          <img src={iconInformation} alt="" width={16} height={16} />
          <p className="min-w-px flex-1 font-['Pretendard'] text-[11px] leading-[14px] font-normal text-[#667080]">
            슬라이드 위 모든 요소의 색상은
            <br />
            <button type="button" onClick={onOpenSlideColor} className="cursor-pointer underline hover:text-[#333e4c]">
              색상 메뉴
            </button>
            에서 한 번에 수정할 수 있어요
          </p>
        </div>
      </div>
      <div className="flex w-full flex-col gap-[8px] px-[12px] pb-[20px]">
        {groupTitle('공통 스타일')}
        <div className="flex w-full flex-wrap gap-[8px]">{option(null, slotName, 'common')}</div>
      </div>
      <div className="flex w-full flex-col gap-[8px] px-[12px] pb-[20px]">
        {groupTitle('색상 세트')}
        <div className="flex w-full flex-wrap gap-[8px]">{COLOR_SET.map((hex) => option({ hex, opacity: 100 }, hex.toUpperCase(), `set-${hex}`))}</div>
      </div>
      <div className="flex w-full flex-col gap-[8px] px-[12px] pb-[20px]">
        {groupTitle('커스텀')}
        <div className="flex w-full flex-wrap gap-[8px]">
          <span className="group relative shrink-0">
            <button
              type="button"
              aria-label="새로운 색상 추가"
              onClick={() => setPicker(picker ? null : { index: null, color: { hex: '#000000', opacity: 100 } })}
              className={`flex size-[36px] cursor-pointer items-center justify-center rounded-full border-solid ${
                picker ? 'border-2 border-[#1a66ff]' : 'border border-[rgba(51,62,76,0.16)] hover:border-2'
              }`}
            >
              <img src={iconPlusSmall} alt="" width={16} height={16} />
            </button>
            <OptionTooltip label="새로운 색상 추가" />
          </span>
          {customColors.map((color, index) => option(color, color.hex.toUpperCase(), `custom-${index}`))}
        </div>
      </div>
      <button
        type="button"
        className={`flex w-full cursor-pointer items-center gap-[12px] rounded-b-[7px] border-t border-solid border-[rgba(51,62,76,0.1)] px-[12px] pt-[12px] pb-[10px] text-left ${HOVER_LAYER}`}
      >
        <span className="min-w-px flex-1 truncate font-['Pretendard'] text-[12px] leading-[18px] font-normal text-black">공통 스타일 편집</span>
        <img src={iconChevronRightEdge} alt="" width={18} height={18} />
      </button>
    </div>
  );
}

// 시안 3: 텍스트 스타일 선택 (피그마 menu/textStyle). 'Ag 스타일명'을 실제 크기 차이로 보여 줌
function TextStyleSelect({ value, onChange }: { value: TextStyleId; onChange: (id: TextStyleId) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  // 바깥을 누르면 닫힘
  useEffect(() => {
    if (!isOpen) return;
    const handleDown = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleDown);
    return () => document.removeEventListener('mousedown', handleDown);
  }, [isOpen]);

  const item = (style: (typeof TEXT_STYLES)[number]) => (
    <button
      key={style.id}
      type="button"
      onClick={() => {
        onChange(style.id);
        setIsOpen(false);
      }}
      className={`flex h-[38px] w-full shrink-0 cursor-pointer items-center gap-[8px] overflow-hidden px-[12px] py-[10px] text-left leading-none whitespace-nowrap text-black ${
        style.id === value ? 'bg-[#f5f8ff]' : HOVER_LAYER
      } ${style.heading ? 'font-bold tracking-[-0.0667px]' : 'font-normal'}`}
      style={{ fontSize: style.menu }}
    >
      <span className="font-['DM_Sans']" style={DM_SANS}>
        Ag
      </span>
      <span className="min-w-px flex-1 truncate font-['Pretendard']">{style.id}</span>
    </button>
  );

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className={`flex h-[34px] w-full cursor-pointer items-center gap-[6px] rounded-[6px] border border-solid py-[9px] pr-[9px] pl-[12px] text-left ${
          isOpen ? 'border-[#1a66ff]' : 'border-[rgba(51,62,76,0.1)] hover:bg-[rgba(24,29,37,0.02)]'
        }`}
      >
        <span className="min-w-px flex-1 font-['Pretendard'] text-[12px] leading-[18px] font-normal text-black">{value}</span>
        <img src={iconChevronDownPanel} alt="" width={16} height={16} className={isOpen ? 'rotate-180' : ''} />
      </button>
      {isOpen && (
        <div className="absolute top-[calc(100%+4px)] left-0 z-30 flex w-[240px] flex-col items-center overflow-hidden rounded-[8px] border border-solid border-[rgba(51,62,76,0.1)] bg-white p-px shadow-[0px_0px_1px_0px_rgba(65,78,97,0.08),0px_16px_64px_0px_rgba(65,78,97,0.16)]">
          {/* 목록이 화면 아래로 잘리지 않게 높이를 제한하고 스크롤 (피그마 list: overflow-y-auto) */}
          <div className="flex max-h-[360px] w-full flex-col items-center overflow-x-hidden overflow-y-auto pt-[16px]">
            {TEXT_STYLES.filter((style) => style.heading).map(item)}
            {TEXT_STYLES.filter((style) => !style.heading).map(item)}
          </div>
          {/* 커스텀·공통 스타일 편집은 이번 범위 밖 (모양만) */}
          <button
            type="button"
            className={`flex h-[38px] w-[238px] shrink-0 cursor-pointer items-center px-[12px] py-[10px] text-left font-['Pretendard'] text-[12px] leading-[18px] font-normal text-black ${HOVER_LAYER}`}
          >
            커스텀
          </button>
          <button
            type="button"
            className={`flex w-full cursor-pointer items-center gap-[12px] border-t border-solid border-[rgba(51,62,76,0.1)] px-[12px] pt-[12px] pb-[10px] text-left ${HOVER_LAYER}`}
          >
            <span className="min-w-px flex-1 truncate font-['Pretendard'] text-[12px] leading-[18px] font-normal text-black">공통 스타일 편집</span>
            <img src={iconChevronRightEdge} alt="" width={18} height={18} />
          </button>
        </div>
      )}
    </div>
  );
}

// 변경 안내 카드 안 'Ag 스타일명' = 스타일 메뉴 글자 크기의 약 0.526배 (피그마: 제목 1 24 → 12.632)
const STYLE_PREVIEW_RATIO = 12.632 / 24;

// 변경 안내 카드: 'Ag 스타일명'을 그 스타일 크기 + 그 글자색으로
function ChangePreviewCard({ style, label, name, color }: { style: TextStyleId; label: string; name: string; color?: string }) {
  const config = TEXT_STYLES.find((item) => item.id === style);
  const size = (config?.menu ?? 12) * STYLE_PREVIEW_RATIO;
  return (
    <div className="flex min-w-px flex-1 flex-col items-center gap-[8px]">
      <div className="flex h-[32px] w-full items-center justify-center overflow-hidden rounded-[6px]">
        <span
          className={`flex items-center gap-[4.211px] leading-none tracking-[-0.0351px] whitespace-nowrap ${config?.heading ? 'font-bold' : 'font-medium'}`}
          style={{ fontSize: size, color: color ?? 'black' }}
        >
          <span className="font-['DM_Sans']" style={DM_SANS}>
            Ag
          </span>
          <span className="font-['Pretendard']">{name}</span>
        </span>
      </div>
      <p className={NOTICE_LABEL_CLASS}>{label}</p>
    </div>
  );
}

type ChangePreview = { key: string; before: { style: TextStyleId; name: string; color?: string }; after: { style: TextStyleId; name: string; color?: string } };

// 시안 3: 텍스트 변경 안내 (피그마 panel/text 하단). 변경 전 › 변경 후 (스타일·색상 함께) + 모든 슬라이드에 반영
// 텍스트·버튼 변경 안내 공용 스타일
const NOTICE_WRAP_CLASS =
  'flex w-full shrink-0 flex-col items-center gap-[12px] rounded-b-[12px] border-t border-solid border-[rgba(51,62,76,0.1)] bg-white px-[16px] pt-[17px] pb-[16px] shadow-[0px_4px_16px_0px_rgba(65,78,97,0.2),0px_4px_16px_0px_rgba(65,78,97,0.08)]';
const NOTICE_BOX_CLASS = 'flex w-[248px] items-center gap-[8px] overflow-hidden rounded-[8px] bg-[rgba(0,0,0,0.25)] px-[16px]';
const NOTICE_LABEL_CLASS = "font-['Pretendard'] text-[11px] leading-[14px] font-normal whitespace-nowrap text-[rgba(255,255,255,0.8)]";
const NOTICE_APPLY_CLASS =
  "flex h-[34px] w-full cursor-pointer items-center justify-center rounded-[8px] bg-[#181d25] px-[16px] py-[8px] font-['Pretendard'] text-[12px] leading-[18px] font-medium whitespace-nowrap text-white hover:bg-[#2f343b]";

function TextChangeNotice({ changes, onApply }: { changes: ChangePreview[]; onApply: () => void }) {
  return (
    <div className={NOTICE_WRAP_CLASS}>
      {changes.map((change) => (
        <div key={change.key} className={`h-[78px] ${NOTICE_BOX_CLASS}`}>
          <ChangePreviewCard {...change.before} label="변경 전" />
          <div className="flex h-full flex-col justify-center pb-[26px]">
            <img src={iconChevronRightSmall} alt="→" width={16} height={16} />
          </div>
          <ChangePreviewCard {...change.after} label="변경 후" />
        </div>
      ))}
      <button type="button" onClick={onApply} className={NOTICE_APPLY_CLASS}>
        모든 슬라이드에 반영
      </button>
    </div>
  );
}

function TextPanel({
  kind,
  slide,
  design,
  defaultColor,
  onDesign,
  onSlide,
  onApplyAll,
  onOpenSlideColor,
}: {
  kind: TextKind;
  onOpenSlideColor: () => void;
  slide: Slide;
  design: Design;
  defaultColor: string;
  onDesign: (patch: Partial<Design>) => void;
  onSlide: (patch: Partial<Slide>) => void;
  onApplyAll: (patch: Partial<Slide>) => void;
}) {
  const styleKey = TEXT_FIELDS[kind].style;
  // 시안 2: 스타일은 슬라이드별. 패널을 열었을 때(또는 마지막으로 모두 반영했을 때) 값 = before
  const [beforeStyle, setBeforeStyle] = useState(slide[styleKey]);
  const afterStyle = slide[styleKey];
  const colorKey = TEXT_FIELDS[kind].color;
  // 시안 3: 색상도 슬라이드별 + 바뀌면 변경 안내
  const [beforeColor, setBeforeColor] = useState(slide[colorKey]);
  const colorValue = slide[colorKey];
  // 공통 스타일 이름 = 컬러 슬롯명 (색상 칸·툴팁 공용)
  const commonName = `텍스트 - ${TEXT_FIELDS[kind].name}`;
  const [isColorMenuOpen, setColorMenuOpen] = useState(false);

  // 변경 안내: 카드 한 쌍에 스타일(크기)과 색상(글자색)을 함께 보여 줌
  const colorCss = (color: TextColor | null) => (color ? textColorCss(color) : defaultColor);
  const changes: ChangePreview[] =
    beforeStyle !== afterStyle || !sameColor(beforeColor, colorValue)
      ? [
          {
            key: 'text',
            before: { style: beforeStyle, name: beforeStyle, color: colorCss(beforeColor) },
            after: { style: afterStyle, name: afterStyle, color: colorCss(colorValue) },
          },
        ]
      : [];

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

      {/* 시안 2: 색상 → 스타일 순서 */}
      <div className={SECTION_CLASS}>
        <p className={SECTION_TITLE_CLASS}>색상</p>
        <div className="relative w-full">
          {/* 공통 스타일이면 슬롯명, 색을 골랐으면 HEX + 불투명도 */}
          <button
            type="button"
            onClick={() => setColorMenuOpen((open) => !open)}
            className={`flex h-[34px] w-full cursor-pointer items-center overflow-hidden rounded-[6px] border border-solid bg-white text-left ${
              isColorMenuOpen ? 'border-[#1a66ff]' : 'border-[rgba(51,62,76,0.1)] hover:border-[rgba(51,62,76,0.2)]'
            }`}
          >
            <span className="flex min-w-px flex-1 items-center gap-[6px] px-[8px] py-[7px]">
              <ColorChip color={colorValue ? textColorCss(colorValue) : defaultColor} />
              <span className="min-w-px flex-1 truncate font-['Pretendard'] text-[12px] leading-[18px] font-normal text-black">
                {colorValue ? colorValue.hex.slice(1).toUpperCase() : commonName}
              </span>
            </span>
            {colorValue && (
              <>
                <span className="h-full w-px shrink-0 bg-[rgba(51,62,76,0.1)]" />
                <span className="flex h-full shrink-0 items-center justify-end gap-[2px] px-[8px] font-['Pretendard'] font-normal">
                  <span className="w-[20px] text-right text-[12px] leading-[18px] text-[#333e4c]">{colorValue.opacity}</span>
                  <span className="text-[11px] leading-[14px] text-[#99a0aa]">%</span>
                </span>
              </>
            )}
          </button>
          {isColorMenuOpen && (
            <TextColorMenu
              value={colorValue}
              commonColor={defaultColor}
              slotName={commonName}
              customColors={design.customColors}
              onSelect={(color) => {
                onSlide({ [colorKey]: color });
                setColorMenuOpen(false);
              }}
              onLiveChange={(color) => onSlide({ [colorKey]: color })}
              onCustomColors={(customColors) => onDesign({ customColors })}
              onClose={() => setColorMenuOpen(false)}
              onOpenSlideColor={onOpenSlideColor}
            />
          )}
        </div>
      </div>

      <div className="flex w-full flex-col gap-[12px] p-[20px]">
        <p className={SECTION_TITLE_CLASS}>스타일</p>
        <TextStyleSelect value={afterStyle} onChange={(id) => onSlide({ [styleKey]: id })} />
      </div>

      {changes.length > 0 && (
        <TextChangeNotice
          changes={changes}
          onApply={() => {
            onApplyAll({ [styleKey]: afterStyle, [colorKey]: colorValue });
            setBeforeStyle(afterStyle);
            setBeforeColor(colorValue);
          }}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------- 4-2. 버튼 패널

const BUTTON_LABEL_MAX = 15;

type ButtonSettings = Pick<Slide, 'buttonStyles' | 'buttonSize' | 'buttonDirection' | 'buttonFill'>;
const DIRECTION_LABEL: Record<Direction, string> = { row: '가로 배치', column: '세로 배치' };
const DEVICE_LABEL: Record<Device, string> = { desktop: '데스크탑', mobile: '모바일' };

// 버튼 설정에서 바뀐 항목들 (변경 안내 줄 + 다른 슬라이드에 반영할 값)
function buttonChanges(before: ButtonSettings, after: ButtonSettings, hasSecond: boolean) {
  const rows: { key: string; label: string; before: string; after: string }[] = [];
  const apply: ((target: Slide) => Partial<Slide>)[] = [];
  ([0, 1] as const).forEach((index) => {
    if (index === 1 && !hasSecond) return;
    if (before.buttonStyles[index] === after.buttonStyles[index]) return;
    rows.push({ key: `style-${index}`, label: `버튼 ${index + 1}`, before: before.buttonStyles[index], after: after.buttonStyles[index] });
    apply.push((target) => {
      const next: [ButtonStyle, ButtonStyle] = [...target.buttonStyles];
      next[index] = after.buttonStyles[index];
      return { buttonStyles: next };
    });
  });
  (['desktop', 'mobile'] as const).forEach((device) => {
    if (before.buttonSize[device] !== after.buttonSize[device]) {
      rows.push({ key: `size-${device}`, label: `${DEVICE_LABEL[device]} 크기`, before: before.buttonSize[device], after: after.buttonSize[device] });
      apply.push((target) => ({ buttonSize: { ...target.buttonSize, [device]: after.buttonSize[device] } }));
    }
    if (before.buttonDirection[device] !== after.buttonDirection[device]) {
      rows.push({
        key: `direction-${device}`,
        label: `${DEVICE_LABEL[device]} 배치 방향`,
        before: DIRECTION_LABEL[before.buttonDirection[device]],
        after: DIRECTION_LABEL[after.buttonDirection[device]],
      });
      apply.push((target) => ({ buttonDirection: { ...target.buttonDirection, [device]: after.buttonDirection[device] } }));
    }
  });
  if (before.buttonFill !== after.buttonFill) {
    rows.push({ key: 'fill', label: '모바일 가로 영역 채우기', before: before.buttonFill ? '켜짐' : '꺼짐', after: after.buttonFill ? '켜짐' : '꺼짐' });
    apply.push(() => ({ buttonFill: after.buttonFill }));
  }
  // 슬라이드 하나에 바뀐 항목을 모두 적용
  const applyTo = (target: Slide) => apply.reduce<Slide>((acc, fn) => ({ ...acc, ...fn(acc) }), target);
  return { rows, applyTo };
}

// 변경 안내용 버튼 묶음 미니 미리보기 (피그마 panel/button 하단): 스타일·크기·배치 방향·가로 채우기
// 버튼 1개면 크게(문구 12px), 2개면 작게(문구 6px) 보여 줌
const PREVIEW_SINGLE: Record<ButtonSize, { width: number; height: number; font: number }> = {
  작게: { width: 64, height: 26, font: 10 },
  보통: { width: 80, height: 32, font: 12 },
  크게: { width: 92, height: 40, font: 12 },
};
const PREVIEW_PAIR: Record<ButtonSize, { width: number; height: number; font: number }> = {
  작게: { width: 40, height: 16, font: 6 },
  보통: { width: 44, height: 22, font: 6 },
  크게: { width: 44, height: 26, font: 7 },
};

function ButtonGroupPreview({ settings, count, device }: { settings: ButtonSettings; count: number; device: Device }) {
  const size = settings.buttonSize[device];
  const isColumn = count > 1 && settings.buttonDirection[device] === 'column';
  const isFill = device === 'mobile' && settings.buttonFill;
  const base = count > 1 ? PREVIEW_PAIR[size] : PREVIEW_SINGLE[size];
  // 세로 배치는 높이 40 안에 두 줄이 들어가게 줄이고, 가로는 꽉 채움
  const height = isColumn ? Math.round(base.height * 0.75) : base.height;
  const width = isColumn || (isFill && count === 1) ? 92 : isFill ? 44 : base.width;
  return (
    <div className={`flex h-[40px] w-full items-center justify-center gap-[4px] ${isColumn ? 'flex-col' : ''}`}>
      {Array.from({ length: count }, (_, index) => {
        const isFilled = settings.buttonStyles[index] === '강조 버튼';
        return (
          <span
            key={index}
            className={`flex shrink-0 items-center justify-center overflow-hidden rounded-[3px] border-solid font-['Pretendard'] leading-none font-medium whitespace-nowrap ${
              isFilled ? 'border border-[rgba(51,62,76,0.16)] bg-black text-white' : 'border-[0.5px] border-[rgba(51,62,76,0.16)] text-black'
            }`}
            style={{ width, height, fontSize: base.font }}
          >
            버튼 문구
          </span>
        );
      })}
    </div>
  );
}

// 시안 3: 버튼 변경 안내. 변경 전 › 변경 후 버튼 묶음 + 모든 슬라이드에 반영 (텍스트 안내와 같은 모양)
function ButtonChangeNotice({
  before,
  after,
  count,
  device,
  onApply,
}: {
  before: ButtonSettings;
  after: ButtonSettings;
  count: number;
  device: Device;
  onApply: () => void;
}) {
  const card = (settings: ButtonSettings, label: string) => (
    <div className="flex min-w-px flex-1 flex-col items-center gap-[8px]">
      <ButtonGroupPreview settings={settings} count={count} device={device} />
      <p className={NOTICE_LABEL_CLASS}>{label}</p>
    </div>
  );
  return (
    <div className={NOTICE_WRAP_CLASS}>
      <div className={`pt-[20px] pb-[16px] ${NOTICE_BOX_CLASS}`}>
        {card(before, '변경 전')}
        <div className="flex flex-col justify-center self-stretch pb-[22px]">
          <img src={iconChevronRightSmall} alt="→" width={16} height={16} />
        </div>
        {card(after, '변경 후')}
      </div>
      <button type="button" onClick={onApply} className={NOTICE_APPLY_CLASS}>
        모든 슬라이드에 반영
      </button>
    </div>
  );
}

function ButtonPanel({
  slide,
  onSlide,
  onApplyAll,
  onOpenSlideColor,
}: {
  slide: Slide;
  onSlide: (patch: Partial<Slide>) => void;
  onApplyAll: (applyTo: (target: Slide) => Slide) => void;
  onOpenSlideColor: () => void; // 안내의 '색상' → 슬라이드 N > 색상 패널
}) {
  const [tab, setTab] = useState<'button' | 'layout'>('button');
  // 크기 및 배치 탭에서 설정 중인 기기
  const [layoutDevice, setLayoutDevice] = useState<Device>('desktop');
  // 패널을 열었을 때(또는 마지막으로 모두 반영했을 때)의 버튼 설정 = before
  const pick = (target: Slide): ButtonSettings => ({
    buttonStyles: target.buttonStyles,
    buttonSize: target.buttonSize,
    buttonDirection: target.buttonDirection,
    buttonFill: target.buttonFill,
  });
  const [before, setBefore] = useState<ButtonSettings>(() => pick(slide));

  const updateButton = (buttonIndex: number, patch: Partial<SlideButton>) => {
    onSlide({
      buttons: slide.buttons.map((button, index) => (index === buttonIndex ? { ...button, ...patch } : button)),
    });
  };
  const setButtonStyle = (buttonIndex: number, style: ButtonStyle) => {
    const next: [ButtonStyle, ButtonStyle] = [...slide.buttonStyles];
    next[buttonIndex] = style;
    onSlide({ buttonStyles: next });
  };
  const hasSecond = slide.buttons.length > 1;
  const changes = buttonChanges(before, pick(slide), hasSecond);

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
          <p className={FIELD_LABEL_CLASS}>스타일</p>
          <Dropdown
            value={slide.buttonStyles[buttonIndex]}
            options={['강조 버튼', '보조 버튼'] as const}
            onChange={(style) => setButtonStyle(buttonIndex, style)}
          />
        </div>
      </div>
    );
  };

  return (
    // 피그마처럼 패널 높이는 최대 799px: 탭 아래 내용만 스크롤되고 변경 안내는 맨 아래 고정
    <div className={`${ELEMENT_PANEL_CLASS} flex max-h-[799px] flex-col`}>
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

      <div className="min-h-0 w-full flex-1 overflow-y-auto">
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
                    onSlide({
                      buttons: isOn ? [...slide.buttons, { label: 'Button Label', link: '' }] : slide.buttons.slice(0, 1),
                    })
                  }
                />
              </div>
              {hasSecond && buttonFields(1)}
            </div>
            {/* 버튼 색상은 슬라이드 색상 메뉴에서 */}
            <div className="w-full px-[20px] pb-[12px]">
              <div className="flex w-full items-center gap-[6px] rounded-[8px] bg-[#f6f7f9] p-[8px]">
                <img src={iconInformation} alt="" width={16} height={16} />
                <p className="font-['Pretendard'] text-[11px] leading-[14px] font-normal whitespace-nowrap text-[#667080]">
                  버튼 색상은{' '}
                  <button type="button" onClick={onOpenSlideColor} className="cursor-pointer underline hover:text-[#333e4c]">
                    색상
                  </button>
                  에서 수정할 수 있어요
                </p>
              </div>
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
            </div>
            <div className="flex w-full flex-col gap-[20px]">
              <div className="flex w-full flex-col gap-[6px]">
                <p className={FIELD_LABEL_CLASS}>크기</p>
                <Dropdown
                  value={slide.buttonSize[layoutDevice]}
                  options={['작게', '보통', '크게'] as const}
                  onChange={(size) =>
                    onSlide({
                      buttonSize: { ...slide.buttonSize, [layoutDevice]: size },
                    })
                  }
                />
              </div>
              <div className="flex w-full items-center gap-[8px]">
                <p className={`min-w-px flex-1 ${FIELD_LABEL_CLASS}`}>배치 방향</p>
                <div className="flex shrink-0 items-center rounded-[8px] bg-[#f6f7f9] p-[4px]">
                  {(
                    [
                      {
                        value: 'row',
                        icon: iconDirectionRow,
                        label: '가로 배치',
                      },
                      {
                        value: 'column',
                        icon: iconDirectionColumn,
                        label: '세로 배치',
                      },
                    ] as const
                  ).map((option) => {
                    const isActive = slide.buttonDirection[layoutDevice] === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        aria-label={option.label}
                        onClick={() =>
                          onSlide({
                            buttonDirection: {
                              ...slide.buttonDirection,
                              [layoutDevice]: option.value,
                            },
                          })
                        }
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
                  <Switch isOn={slide.buttonFill} onChange={(buttonFill) => onSlide({ buttonFill })} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {changes.rows.length > 0 && (
        <ButtonChangeNotice
          before={before}
          after={pick(slide)}
          count={slide.buttons.length}
          // 모바일 설정만 바뀌었으면 모바일 기준으로, 아니면 데스크탑 기준으로 보여 줌
          device={changes.rows.every((row) => row.key.endsWith('mobile') || row.key === 'fill') ? 'mobile' : 'desktop'}
          onApply={() => {
            onApplyAll(changes.applyTo);
            setBefore(pick(slide));
          }}
        />
      )}
    </div>
  );
}

// 시안 3: 스낵바 (피그마 snackbar: 편집 화면 위 가운데, 위에서 11px). 버튼이 있으면 간격 일괄 반영 안내, 없으면 알림
// 공용 Snackbar는 화면 기준(fixed)이라 축소된 편집 화면에서 가운데가 어긋나서, 시안 3은 편집 화면 기준으로 둠
function ActionSnackbar({ message, actionLabel, visible, onAction }: { message: string; actionLabel?: string; visible: boolean; onAction?: () => void }) {
  return (
    <div
      className={`absolute top-[11px] left-1/2 z-50 -translate-x-1/2 transition-all duration-200 ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-1 opacity-0'
      }`}
    >
      <div
        className={`flex min-h-[56px] items-center gap-[8px] rounded-[8px] bg-[#333e4c] px-[16px] shadow-[0px_1px_8px_0px_rgba(65,78,97,0.16),0px_2px_24px_0px_rgba(65,78,97,0.2)] ${actionLabel ? 'py-[6px]' : 'py-[16px]'}`}
      >
        <p className="font-['Pretendard'] text-[14px] leading-[20px] font-normal whitespace-nowrap text-white">{message}</p>
        {actionLabel && (
          <button
            type="button"
            onClick={onAction}
            className="flex h-[40px] shrink-0 cursor-pointer items-center justify-center rounded-[8px] px-[12px] py-[8px] font-['Pretendard'] text-[14px] leading-[20px] font-semibold whitespace-nowrap text-white hover:bg-[rgba(255,255,255,0.12)]"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- 화면

type PanelView = 'list' | 'detail' | 'background' | 'color' | 'common-layout' | 'animation' | 'slide-mode' | 'components';

// [Carousel 슬라이드 편집] 데모 화면
export function CarouselScreenV3() {
  const [slides, setSlides] = useState(INITIAL_SLIDES);
  // 캔버스에 보이는 슬라이드. 패널을 닫아도(목록으로 돌아가도) 그대로 유지
  const [activeIndex, setActiveIndex] = useState(0);
  const [panel, setPanel] = useState<PanelView>('list');
  // 슬라이드 패널 탭. 상세로 들어갔다 돌아와도 보던 탭 유지
  const [listTab, setListTab] = useState<ListTab>('content');
  // 화면 위 토스트 (예: 레이아웃 모두 반영)
  const [toast, setToast] = useState({ message: '', visible: false });
  const toastTimer = useRef<number | undefined>(undefined);
  const showToast = (message: string) => {
    setToast({ message, visible: true });
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 2000);
  };
  // 캔버스에서 선택한 요소. section이면 슬라이드 패널(목록·상세 등), 그 외엔 요소 패널
  const [selected, setSelected] = useState<Selected>('section');
  // 모든 슬라이드에 공통으로 적용되는 스타일·배치·간격
  const [design, setDesign] = useState(INITIAL_DESIGN);
  // 캔버스에서 글자를 고치는 중인 텍스트(데스크탑·모바일 중 클릭한 쪽)
  const [editing, setEditing] = useState<EditingText>(null);

  const activeSlide = slides[activeIndex];
  // 공통 설정 > 레이아웃 미리보기에 마우스를 올린 동안 캔버스에만 잠깐 보여줄 비율·레이아웃
  const [peek, setPeek] = useState<LayoutPeek | null>(null);
  const canvasDesign = peek ? { ...design, ratio: { ...design.ratio, [peek.device]: peek.ratio } } : design;
  const canvasSlide = peek ? { ...activeSlide, layout: { ...activeSlide.layout, [peek.device]: peek.layout } } : activeSlide;

  const updateActive = (patch: Partial<Slide>) => {
    setSlides((prev) => prev.map((slide, index) => (index === activeIndex ? { ...slide, ...patch } : slide)));
  };
  const updateDesign = (patch: Partial<Design>) => setDesign((prev) => ({ ...prev, ...patch }));
  // 시안 3: 간격은 지금 보고 있는 슬라이드에만 적용. 드래그를 시작할 때 값 = before (끝나면 비교해서 일괄 반영 안내)
  const spacingBefore = useRef<Record<Device, Spacing> | null>(null);
  const updateSpacing = (device: Device, patch: Partial<Spacing>) => {
    if (!spacingBefore.current) spacingBefore.current = activeSlide.spacing;
    setSlides((prev) =>
      prev.map((slide, index) =>
        index === activeIndex ? { ...slide, spacing: { ...slide.spacing, [device]: { ...slide.spacing[device], ...patch } } } : slide,
      ),
    );
  };

  // 간격 일괄 반영 스낵바: 이번 드래그로 바뀐 간격만 (기기별)
  const [spacingOffer, setSpacingOffer] = useState<{ patch: Partial<Record<Device, Partial<Spacing>>>; visible: boolean }>({
    patch: {},
    visible: false,
  });
  const spacingOfferTimer = useRef<number | undefined>(undefined);
  const handleSpacingEnd = () => {
    const before = spacingBefore.current;
    spacingBefore.current = null;
    if (!before) return;
    const patch: Partial<Record<Device, Partial<Spacing>>> = {};
    (['desktop', 'mobile'] as const).forEach((device) => {
      (Object.keys(before[device]) as (keyof Spacing)[]).forEach((key) => {
        const after = activeSlide.spacing[device][key];
        if (after !== before[device][key]) patch[device] = { ...patch[device], [key]: after };
      });
    });
    if (!patch.desktop && !patch.mobile) return;
    setSpacingOffer({ patch, visible: true });
    window.clearTimeout(spacingOfferTimer.current);
    spacingOfferTimer.current = window.setTimeout(() => setSpacingOffer((prev) => ({ ...prev, visible: false })), 8000);
  };
  const applySpacingToAll = () => {
    const { patch } = spacingOffer;
    setSlides((prev) =>
      prev.map((slide) =>
        slide.id === activeSlide.id
          ? slide
          : {
              ...slide,
              spacing: {
                desktop: { ...slide.spacing.desktop, ...patch.desktop },
                mobile: { ...slide.spacing.mobile, ...patch.mobile },
              },
            },
      ),
    );
    window.clearTimeout(spacingOfferTimer.current);
    setSpacingOffer((prev) => ({ ...prev, visible: false }));
    showToast(`다른 슬라이드 ${slides.length - 1}개에 반영했어요`);
  };

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

  const addSlide = () => {
    if (slides.length >= MAX_SLIDES) return;
    const nextId = Math.max(0, ...slides.map((slide) => slide.id)) + 1;
    setSlides((prev) => [...prev, makeEmptySlide(nextId)]);
    // 새 슬라이드로 캔버스를 옮기고 그 슬라이드 패널을 보여줌
    setActiveIndex(slides.length);
    setSelected('section');
    setPanel('detail');
  };

  const deleteActive = () => {
    if (slides.length <= 1) return;
    setSlides((prev) => prev.filter((_, index) => index !== activeIndex));
    setActiveIndex((current) => Math.max(0, Math.min(current, slides.length - 2)));
    setPanel('list');
    setSelected('section');
  };

  const colors = schemeColors(activeSlide.scheme);

  // 시안 3: 캔버스에서 요소를 고른 상태로 Delete(맥 delete = Backspace)를 누르면 그 요소를 지움
  // 지운 뒤에는 구성 요소 패널을 보여 줘서 '{이름} 추가'로 바뀐 걸 확인할 수 있게 함
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key !== 'Delete' && event.key !== 'Backspace') return;
      if (editing) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
      if (selected !== 'overline' && selected !== 'title' && selected !== 'description' && selected !== 'buttons') return;
      event.preventDefault();
      const key = selected;
      setSlides((prev) => prev.map((slide, index) => (index === activeIndex ? { ...slide, visible: { ...slide.visible, [key]: false } } : slide)));
      setSelected('section');
      setPanel('components');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selected, editing, activeIndex]);

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
        dimDevice={peek?.device ?? null}
        slide={canvasSlide}
        index={activeIndex}
        count={slides.length}
        design={canvasDesign}
        selected={selected}
        // 이전/다음: 끝에서 넘기면 반대쪽 끝으로. 열려 있던 패널(목록·상세·배경 등)은 그대로 두고 보는 슬라이드만 바뀜
        onStep={(step) => setActiveIndex((current) => (current + step + slides.length) % slides.length)}
        onSelect={(next) => {
          // 편집 중에 다른 곳을 누르면 먼저 편집을 끝내서(저장) 고친 글자가 데스크탑·모바일에 반영되게 함
          if (editing && document.activeElement instanceof HTMLElement) document.activeElement.blur();
          // '슬라이드' 목록 패널이 떠 있는 상태에서 슬라이드를 한 번 더 누르면 그 슬라이드 패널(슬라이드 N)로 이동
          if (next === 'section' && selected === 'section' && panel === 'list') setPanel('detail');
          setSelected(next);
          // 선택을 해제하면 다음에 슬라이드를 다시 눌렀을 때 '슬라이드' 목록 패널부터 보여줌
          if (next === 'none') setPanel('list');
        }}
        onSpacingChange={updateSpacing}
        onSpacingEnd={handleSpacingEnd}
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
      <ActionSnackbar message={toast.message} visible={toast.visible} />
      <ActionSnackbar
        message="변경한 간격을 다른 슬라이드에도 일괄 반영할까요?"
        actionLabel="변경"
        visible={spacingOffer.visible && !toast.visible}
        onAction={applySpacingToAll}
      />

      {selected === 'section' && (
        <>
          {panel === 'list' && (
            <SlideListPanel
              slides={slides}
              onReorder={reorder}
              onAdd={addSlide}
              tab={listTab}
              onTab={setListTab}
              onOpenCommonLayout={() => setPanel('common-layout')}
              onOpenAnimation={() => setPanel('animation')}
              onOpenSlideMode={() => setPanel('slide-mode')}
              onOpen={(index) => {
                setActiveIndex(index);
                setPanel('detail');
              }}
            />
          )}
          {panel === 'detail' && (
            <SlideDetailPanel
              index={activeIndex}
              slide={activeSlide}
              onBack={() => setPanel('list')}
              onDelete={deleteActive}
              onOpenMenu={(menu) => setPanel(menu)}
            />
          )}
          {panel === 'components' && (
            <ComponentsPanel
              slide={activeSlide}
              onBack={() => setPanel('detail')}
              onSelect={(target) => {
                setSelected(target);
                // 요소 패널에서 슬라이드를 다시 누르면 슬라이드 N 패널로
                setPanel('detail');
              }}
              onAdd={(target) => updateActive({ visible: { ...activeSlide.visible, [target]: true } })}
            />
          )}
          {panel === 'background' && <BackgroundPanel slide={activeSlide} onBack={() => setPanel('detail')} onChange={updateActive} />}
          {panel === 'color' && <ColorPanel slide={activeSlide} onBack={() => setPanel('detail')} onChange={updateActive} />}
          {panel === 'slide-mode' && (
            <SlideModePanel value={design.slideMode} onChange={(slideMode) => updateDesign({ slideMode })} onBack={() => setPanel('list')} />
          )}
          {panel === 'animation' && (
            <AnimationPanel value={design.animation} onChange={(animation) => updateDesign({ animation })} onBack={() => setPanel('list')} />
          )}
          {panel === 'common-layout' && (
            <CommonLayoutPanel
              slides={slides}
              ratio={design.ratio}
              onApply={(device, ratio, layout) => {
                setDesign((prev) => ({ ...prev, ratio: { ...prev.ratio, [device]: ratio } }));
                setSlides((prev) => prev.map((item) => ({ ...item, layout: { ...item.layout, [device]: layout } })));
              }}
              onPeek={setPeek}
              onBack={() => setPanel('list')}
            />
          )}
        </>
      )}
      {(selected === 'overline' || selected === 'title' || selected === 'description') && (
        <TextPanel
          key={`${selected}-${activeSlide.id}`}
          kind={selected}
          slide={activeSlide}
          design={design}
          defaultColor={selected === 'title' ? colors.strong : colors.soft}
          onDesign={updateDesign}
          onSlide={updateActive}
          onApplyAll={(patch) => {
            setSlides((prev) => prev.map((item) => ({ ...item, ...patch })));
            showToast(`다른 슬라이드 ${slides.length - 1}개에 반영했어요`);
          }}
          // 색상 메뉴 안내의 '색상 메뉴' → 지금 슬라이드의 색상 패널 (뒤로 가면 슬라이드 N)
          onOpenSlideColor={() => {
            setSelected('section');
            setPanel('color');
          }}
        />
      )}
      {selected === 'buttons' && (
        <ButtonPanel
          key={activeSlide.id}
          slide={activeSlide}
          onSlide={updateActive}
          onApplyAll={(applyTo) => {
            setSlides((prev) => prev.map((item) => (item.id === activeSlide.id ? item : applyTo(item))));
            showToast(`다른 슬라이드 ${slides.length - 1}개에 반영했어요`);
          }}
          onOpenSlideColor={() => {
            setSelected('section');
            setPanel('color');
          }}
        />
      )}
      {/* 간격 핸들 안내가 그려지는 맨 위 레이어 */}
      <div id={CURSOR_LAYER_ID} className="pointer-events-none absolute inset-0 z-50" />
    </div>
  );
}
