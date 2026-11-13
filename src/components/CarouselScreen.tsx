import { useRef, useState, type ChangeEvent, type CSSProperties, type DragEvent, type PointerEvent, type ReactNode } from 'react';
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
import mediaChecker from '../assets/figma/carousel/media-checker.png';
import colorPreview from '../assets/figma/carousel/color-preview.png';
import slideLemon from '../assets/figma/carousel/slide-lemon.png';
import slidePerson from '../assets/figma/carousel/slide-person.jpg';
import slideRed from '../assets/figma/carousel/slide-red.jpg';

// 브라우저 크롬(browser/desktop, 88px)을 제외한 편집 영역 크기
export const CAROUSEL_SCREEN_WIDTH = 1512;
export const CAROUSEL_SCREEN_HEIGHT = 894;

const DM_SANS: CSSProperties = { fontVariationSettings: '"opsz" 14' };
const MAX_SLIDES = 10;

// ---------------------------------------------------------------- 데이터

// scheme: 'light' = 밝은 색상(흰 글자), 'dark' = 어두운 색상(검은 글자)
type Scheme = 'light' | 'dark';
type Slide = {
  id: number;
  title: string; // 빈 문자열이면 타이틀 없음
  image: string | null; // null이면 배경 없음
  fileName: string;
  mediaType: 'image' | 'video';
  overlay: number; // 오버레이 불투명도(%)
  scheme: Scheme;
  link: string;
};

const DESCRIPTION =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Graecis praetorem, consuetudinum, maiores, tribus saluti reprehensa.';

function makeSlide(id: number, title: string, image: string | null, fileName = 'fileName.png'): Slide {
  return { id, title, image, fileName, mediaType: 'image', overlay: 20, scheme: 'light', link: '' };
}

const INITIAL_SLIDES: Slide[] = [
  makeSlide(1, 'Lorem ipsum dolor sit amet', slideLemon),
  makeSlide(2, 'The Power Of Thought', slidePerson),
  makeSlide(3, '', null),
  ...Array.from({ length: 7 }, (_, index) => makeSlide(4 + index, 'The Power Of Thought', slideRed)),
];

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

// 밝은 색상 = 흰 글자 / 어두운 색상 = 검은 글자
function schemeColors(scheme: Scheme) {
  return scheme === 'light'
    ? { strong: '#fff', soft: 'rgba(255,255,255,0.8)', filledBg: '#fff', filledText: '#111', line: '#fff', arrow: '' }
    : { strong: '#111', soft: 'rgba(17,17,17,0.8)', filledBg: '#111', filledText: '#fff', line: '#111', arrow: 'invert(1)' };
}

// 데스크탑·모바일 공통 크기 값
type SlideMetrics = {
  pad: string;
  gap: number;
  textGap: number;
  overline: number;
  title: number;
  body: number;
  button: number;
  buttonPad: [string, string];
  buttonBorder: number;
  indicatorPad: string;
  indicatorHeight: number;
  barGap: number;
  barPad: number;
  bar: [number, number];
};

const DESKTOP_METRICS: SlideMetrics = {
  pad: '30.667px 17.25px',
  gap: 17.25,
  textGap: 5.75,
  overline: 6.708,
  title: 24.917,
  body: 7.667,
  button: 6.229,
  buttonPad: ['6.708px 12.937px', '6.229px 12.458px'],
  buttonBorder: 0.479,
  indicatorPad: '11.5px 19.167px',
  indicatorHeight: 30.667,
  barGap: 3.833,
  barPad: 2.875,
  bar: [17.25, 0.958],
};

const MOBILE_METRICS: SlideMetrics = {
  pad: '19.282px 7.713px',
  gap: 15.426,
  textGap: 5.785,
  overline: 6.749,
  title: 25.067,
  body: 7.713,
  button: 6.267,
  buttonPad: ['6.749px 13.015px', '6.749px 13.015px'],
  buttonBorder: 0.482,
  indicatorPad: '11.569px 19.282px',
  indicatorHeight: 30.851,
  barGap: 3.856,
  barPad: 2.892,
  bar: [17.354, 0.964],
};

function SlideView({ slide, index, count, metrics, isDesktop }: { slide: Slide; index: number; count: number; metrics: SlideMetrics; isDesktop: boolean }) {
  const colors = schemeColors(slide.scheme);
  return (
    <div className="absolute inset-0 flex flex-col items-center overflow-hidden" style={{ padding: metrics.pad }}>
      {/* 배경: 이미지가 없으면 회색 */}
      <div className="absolute inset-0 overflow-hidden bg-white">
        {slide.image ? (
          <img src={slide.image} alt="" className="absolute inset-0 size-full max-w-none object-cover" />
        ) : (
          <div className="absolute inset-0 bg-[rgba(0,0,0,0.25)]" />
        )}
      </div>
      <div className="absolute inset-0 bg-black" style={{ opacity: slide.overlay / 100 }} />

      <div className="relative flex min-h-px w-full flex-1 flex-col items-center justify-end overflow-hidden" style={{ gap: metrics.gap }}>
        <div className="flex w-full flex-col items-center text-center break-words" style={{ gap: metrics.textGap }}>
          <p className="w-full font-['DM_Sans'] leading-[1.6] font-normal" style={{ ...DM_SANS, fontSize: metrics.overline, color: colors.soft }}>
            Lorem ipsum
          </p>
          {slide.title && (
            <p className="w-full font-['DM_Sans'] leading-[1.3] font-medium" style={{ ...DM_SANS, fontSize: metrics.title, color: colors.strong }}>
              {slide.title}
            </p>
          )}
          <p className="w-full font-['DM_Sans'] leading-[1.5] font-normal" style={{ ...DM_SANS, fontSize: metrics.body, color: colors.soft }}>
            {DESCRIPTION}
          </p>
        </div>
        <div className="flex items-start" style={{ gap: metrics.barGap }}>
          {[0, 1].map((buttonIndex) => {
            const isFilled = buttonIndex === 0;
            return (
              <span
                key={buttonIndex}
                className="flex items-center justify-center rounded-[1.917px] border-solid font-['DM_Sans'] leading-[1.2] font-medium whitespace-nowrap"
                style={{
                  ...DM_SANS,
                  fontSize: metrics.button,
                  padding: metrics.buttonPad[buttonIndex],
                  borderWidth: metrics.buttonBorder,
                  borderColor: isFilled ? 'transparent' : colors.line,
                  background: isFilled ? colors.filledBg : 'transparent',
                  color: isFilled ? colors.filledText : colors.strong,
                }}
              >
                Button Label
              </span>
            );
          })}
        </div>
      </div>

      {/* 인디케이터: 슬라이드 개수만큼, 현재 슬라이드만 진하게 */}
      <div
        className="absolute bottom-0 left-1/2 flex w-full -translate-x-1/2 items-center justify-center"
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

      {/* 좌우 화살표: 이번 버전에선 클릭으로 넘기지 않음 */}
      {isDesktop && (
        <div className="absolute top-1/2 left-1/2 flex w-[885.5px] -translate-x-1/2 -translate-y-1/2 items-center justify-between">
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

function Canvas({ slide, index, count }: { slide: Slide; index: number; count: number }) {
  return (
    <div className="absolute top-[55px] left-0 h-[839px] w-[1512px]">
      <div className="absolute top-[40px] left-[40px] flex h-[799px] w-[920px] flex-col gap-[12px]">
        <ViewportBar icon={iconDesktop} label="데스크탑" />
        <div className="relative min-h-px w-full flex-1 overflow-hidden bg-white">
          <DesktopHeader />
          <div className="absolute top-[25.88px] left-0 h-[517.5px] w-[920px]">
            <SlideView slide={slide} index={index} count={count} metrics={DESKTOP_METRICS} isDesktop />
          </div>
          <div className="pointer-events-none absolute top-[26px] left-0 h-[517px] w-[920px] border border-solid border-[#09f]" />
        </div>
      </div>

      <div className="absolute top-[40px] left-[980px] flex h-[799px] w-[188px] flex-col gap-[12px] overflow-hidden">
        <ViewportBar icon={iconMobile} label="모바일" />
        <div className="relative min-h-px w-full flex-1 overflow-hidden bg-white">
          <MobileHeader />
          <div className="absolute top-[28.92px] left-0 h-[406.851px] w-[188px]">
            <SlideView slide={slide} index={index} count={count} metrics={MOBILE_METRICS} isDesktop={false} />
          </div>
          <div className="pointer-events-none absolute top-[29px] left-0 h-[407px] w-[188px] border border-solid border-[#80ccff]" />
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
    if (file) onChange({ image: URL.createObjectURL(file), fileName: file.name });
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
                  onClick={() => onChange({ image: null })}
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

// ---------------------------------------------------------------- 화면

type PanelView = 'list' | 'detail' | 'background' | 'color';

// [Carousel 슬라이드 편집] 데모 화면
export function CarouselScreen() {
  const [slides, setSlides] = useState(INITIAL_SLIDES);
  // 캔버스에 보이는 슬라이드. 패널을 닫아도(목록으로 돌아가도) 그대로 유지
  const [activeIndex, setActiveIndex] = useState(0);
  const [panel, setPanel] = useState<PanelView>('list');

  const activeSlide = slides[activeIndex];

  const updateActive = (patch: Partial<Slide>) => {
    setSlides((prev) => prev.map((slide, index) => (index === activeIndex ? { ...slide, ...patch } : slide)));
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

  const deleteActive = () => {
    if (slides.length <= 1) return;
    setSlides((prev) => prev.filter((_, index) => index !== activeIndex));
    setActiveIndex((current) => Math.max(0, Math.min(current, slides.length - 2)));
    setPanel('list');
  };

  return (
    <div className="relative h-[894px] w-[1512px] overflow-hidden bg-[#e4e6e9] select-none">
      <Canvas slide={activeSlide} index={activeIndex} count={slides.length} />
      <Toolbar />

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
    </div>
  );
}
