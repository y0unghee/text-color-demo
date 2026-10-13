import { useEffect, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode, type RefObject } from 'react';
import iconExit from '../assets/figma/text-color/exit.svg';
import iconTheme from '../assets/figma/text-color/theme.svg';
import iconUndo from '../assets/figma/text-color/undo.svg';
import iconRedo from '../assets/figma/text-color/redo.svg';
import iconMirroring from '../assets/figma/text-color/mirroring.svg';
import iconChevronDownPage from '../assets/figma/text-color/chevron-down-page.svg';
import iconChevronDownPanel from '../assets/figma/text-color/chevron-down-panel.svg';
import iconChevronRightEdge from '../assets/figma/text-color/chevron-right-edge.svg';
import iconMobile from '../assets/figma/text-color/mobile.svg';
import thumbnail from '../assets/figma/text-color/thumbnail.png';
import iconDesktop from '../assets/figma/text-color/desktop.svg';
import tooltipTip from '../assets/figma/text-color/tooltip-tip.svg';
import iconLink from '../assets/figma/text-color/link.svg';
import iconLinkDisabled from '../assets/figma/text-color/link-disabled.svg';
import { Snackbar } from './Snackbar';
import alphaTrackChecker from '../assets/figma/text-color/alpha-track-checker.png';
import iconAi from '../assets/figma/text-color/ai.svg';
import iconSync from '../assets/figma/text-color/sync.svg';
import iconChevronRight from '../assets/figma/text-color/chevron-right.svg';

// 브라우저 크롬(browser/desktop, 88px)을 제외한 편집 영역 크기
export const TEXT_COLOR_SCREEN_WIDTH = 1512;
export const TEXT_COLOR_SCREEN_HEIGHT = 894;

const DM_SANS_OPSZ = { fontVariationSettings: '"opsz" 14' } as const;

function Divider() {
  return <div className="h-[16px] w-px shrink-0 bg-[rgba(51,62,76,0.16)]" />;
}

function Toolbar() {
  return (
    <div className="absolute top-0 right-0 left-0 flex h-[55px] flex-col items-center justify-center border-b border-[rgba(51,62,76,0.1)] bg-white pt-[9px] pr-[12px] pb-[10px] pl-[10px]">
      <div className="relative flex w-full items-center justify-between">
        <div className="flex items-center gap-[8px]">
          <div className="flex size-[32px] items-center justify-center rounded-[8px] p-[8px]">
            <img src={iconExit} alt="" width={16} height={16} />
          </div>
          <div className="flex items-center gap-[4px]">
            <Divider />
            <div className="flex items-center gap-[4px] rounded-[8px] py-[7px] pr-[12px] pl-[8px]">
              <img src={iconTheme} alt="" width={16} height={16} />
              <span className="font-['Pretendard'] text-[12px] leading-[18px] font-medium whitespace-nowrap text-black">
                스타일
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-[12px]">
          <div className="flex items-center">
            <div className="flex size-[32px] items-center justify-center rounded-[8px]">
              <img src={iconUndo} alt="" width={20} height={20} />
            </div>
            <div className="flex size-[32px] items-center justify-center rounded-[8px]">
              <img src={iconRedo} alt="" width={20} height={20} />
            </div>
          </div>
          <div className="flex items-center gap-[4px]">
            <Divider />
            <div className="flex h-[32px] items-center gap-[4px] rounded-[8px] py-[3px] pr-[12px] pl-[8px]">
              <img src={iconMirroring} alt="" width={16} height={16} />
              <span className="font-['Pretendard'] text-[12px] leading-[18px] font-medium whitespace-nowrap text-black">
                미러링
              </span>
            </div>
            <Divider />
            <div className="flex h-[32px] items-center justify-center rounded-[8px] px-[12px] py-[7px]">
              <span className="font-['Pretendard'] text-[12px] leading-[18px] font-medium whitespace-nowrap text-black">
                미리보기
              </span>
            </div>
            <div className="flex h-[32px] w-[68px] min-w-[64px] items-center justify-center rounded-[8px] bg-[#181d25] px-[12px] py-[6px]">
              <span className="font-['Pretendard'] text-[12px] leading-[18px] font-medium whitespace-nowrap text-white">
                업데이트
              </span>
            </div>
          </div>
        </div>

        <div className="absolute top-1/2 left-[calc(50%+1px)] flex -translate-x-1/2 -translate-y-1/2 items-center gap-[8px]">
          <div className="flex w-[200px] items-center gap-[8px] rounded-[8px] bg-[#f6f7f9] py-[7px] pr-[8px] pl-[12px]">
            <span className="flex-1 font-['Pretendard'] text-[12px] leading-[18px] font-medium text-black">Home</span>
            <img src={iconChevronDownPage} alt="" width={16} height={16} />
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
      <span className="font-['Pretendard'] text-[11px] leading-[14px] font-medium whitespace-nowrap text-[#414e61]">
        {label}
      </span>
    </div>
  );
}

const DESKTOP_NAV = ['Shop', 'About', 'Journal', 'Info', 'The Story'];
const DESKTOP_UTILITIES = ['Search', 'Sign in', 'Bag (0)'];

function DesktopNavItem({ label }: { label: string }) {
  return (
    <div className="flex h-full flex-col justify-center px-[3.833px]">
      <span className="font-['Inter'] text-[6.23px] leading-normal font-normal whitespace-nowrap text-black">{label}</span>
    </div>
  );
}

// 색상을 바꿀 수 있는 요소: 텍스트(글자색) / 아이템(배경색)
type ItemIndex = 1 | 2 | 3;
type ElementId =
  | 'eyebrow'
  | 'heading'
  | 'body'
  | 'storyEyebrow'
  | 'storyTitle'
  | 'storyBody'
  | `item${ItemIndex}`
  | `item${ItemIndex}Title`
  | `item${ItemIndex}Body`;

// styleLabel: 패널 스타일 드롭다운, commonName/commonColor: 공통 스타일 색상 이름·값
type ElementConfig =
  | { kind: 'text'; styleLabel: string; commonName: string; commonColor: string }
  | { kind: 'item'; commonName: string; commonColor: string };

const ITEM_ELEMENT: ElementConfig = { kind: 'item', commonName: '아이템 - 배경', commonColor: '#f3f3f2' };
const ITEM_TITLE_ELEMENT: ElementConfig = { kind: 'text', styleLabel: '제목 1', commonName: '아이템 - 제목', commonColor: '#111' };
const ITEM_BODY_ELEMENT: ElementConfig = { kind: 'text', styleLabel: '본문 3', commonName: '아이템 - 설명', commonColor: '#6b6b6b' };

const ELEMENTS: Record<ElementId, ElementConfig> = {
  eyebrow: { kind: 'text', styleLabel: '본문 3', commonName: '텍스트 - 제목 위 문구', commonColor: '#808387' },
  heading: { kind: 'text', styleLabel: '제목 3', commonName: '텍스트 - 제목', commonColor: '#111' },
  body: { kind: 'text', styleLabel: '본문 3', commonName: '텍스트 - 설명', commonColor: '#34302b' },
  storyEyebrow: { kind: 'text', styleLabel: '본문 3', commonName: '텍스트 - 섹션 라벨', commonColor: '#111' },
  storyTitle: { kind: 'text', styleLabel: '제목 2', commonName: '텍스트 - 제목', commonColor: '#111' },
  storyBody: { kind: 'text', styleLabel: '본문 3', commonName: '텍스트 - 섹션 설명', commonColor: 'rgba(17, 17, 17, 0.6)' },
  item1: ITEM_ELEMENT,
  item2: ITEM_ELEMENT,
  item3: ITEM_ELEMENT,
  item1Title: ITEM_TITLE_ELEMENT,
  item2Title: ITEM_TITLE_ELEMENT,
  item3Title: ITEM_TITLE_ELEMENT,
  item1Body: ITEM_BODY_ELEMENT,
  item2Body: ITEM_BODY_ELEMENT,
  item3Body: ITEM_BODY_ELEMENT,
};

// 텍스트 일부를 드래그로 선택한 상태: 요소 안 글자 위치(start~end)
// overrideId: 이 범위에 별도 색상(override)이 적용돼 있으면 그 id
// unlinked: 모드 2에서 공통 스타일과 연결을 끊었지만 아직 색을 고르지 않은 상태
type DragSelection = { id: ElementId; element: HTMLElement; start: number; end: number; overrideId?: string; unlinked?: boolean };

type PreviewProps = {
  elementColors: Record<ElementId, string>;
  selectedId: ElementId | null;
  onSelect: (id: ElementId | null) => void;
  onDragSelect: (selection: DragSelection) => void;
  onTextEdit: () => void;
  // 글자 편집(커서) 중인 요소. 선택된 텍스트를 한 번 더 클릭하면 편집 시작
  editingId: ElementId | null;
  onStartEdit: (id: ElementId) => void;
};

// 클릭한 화면 위치에 커서를 놓음
function placeCaretAt(x: number, y: number) {
  const range = document.caretRangeFromPoint?.(x, y);
  if (!range) return;
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}

// 현재 브라우저 선택 영역이 root 안에만 있으면 root 기준 글자 위치로 변환
function getDragOffsets(root: HTMLElement) {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed || selection.rangeCount === 0) return null;
  const range = selection.getRangeAt(0);
  if (!root.contains(range.startContainer) || !root.contains(range.endContainer)) return null;
  const before = document.createRange();
  before.selectNodeContents(root);
  before.setEnd(range.startContainer, range.startOffset);
  const start = before.toString().length;
  const end = start + range.toString().length;
  return end > start ? { start, end } : null;
}

// ---- 드래그 범위 색상 override: <span data-override="id">로 감싸서 글자색 지정 ----
function unwrap(node: Element) {
  node.replaceWith(...node.childNodes);
}

function getOffsetsOf(root: HTMLElement, node: Node) {
  const before = document.createRange();
  before.selectNodeContents(root);
  before.setEndBefore(node);
  const start = before.toString().length;
  return { start, end: start + (node.textContent?.length ?? 0) };
}

// 범위와 정확히 같은 override span이 있으면 그 id
function findOverrideAt(root: HTMLElement, start: number, end: number) {
  const spans = [...root.querySelectorAll<HTMLElement>('[data-override]')];
  const match = spans.find((span) => {
    const offsets = getOffsetsOf(root, span);
    return offsets.start === start && offsets.end === end;
  });
  return match?.dataset.override;
}

// root의 start~end를 새 override span으로 감쌈 (안쪽의 기존 override는 풀어서 새 색이 적용되게)
function wrapOverride(root: HTMLElement, start: number, end: number, overrideId: string) {
  const range = rangeFromOffsets(root, start, end);
  const fragment = range.extractContents();
  fragment.querySelectorAll('[data-override]').forEach(unwrap);
  const span = document.createElement('span');
  span.dataset.override = overrideId;
  span.appendChild(fragment);
  range.insertNode(span);
  root.querySelectorAll('[data-override]').forEach((node) => {
    if (!node.textContent) node.remove();
  });
}

// 글자 위치(start~end) → DOM Range
function rangeFromOffsets(root: HTMLElement, start: number, end: number) {
  const range = document.createRange();
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let offset = 0;
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const length = node.textContent?.length ?? 0;
    if (start >= offset && start <= offset + length) range.setStart(node, start - offset);
    if (end >= offset && end <= offset + length) {
      range.setEnd(node, end - offset);
      break;
    }
    offset += length;
  }
  return range;
}

type SelectableTextProps = PreviewProps & {
  id: ElementId;
  outlineColor: string;
  className: string;
  style?: CSSProperties;
  children: ReactNode;
};

// 클릭하면 선택되고, 선택된 동안 요소 테두리에 선택 표시
function SelectableText({ id, elementColors, selectedId, onSelect, onDragSelect, onTextEdit, editingId, onStartEdit, outlineColor, className, style, children }: SelectableTextProps) {
  const isEditing = editingId === id;
  // 드래그로 끝난 mouseup 뒤에 따라오는 click은 일반 선택으로 처리하지 않음
  const justDragged = useRef(false);
  const editableRef = useRef<HTMLDivElement>(null);

  return (
    <div
      onMouseUp={() => {
        // 글자 일부를 드래그했으면 드래그 선택으로 처리
        const editable = editableRef.current;
        const offsets = editable ? getDragOffsets(editable) : null;
        justDragged.current = offsets !== null;
        if (editable && offsets) onDragSelect({ id, element: editable, ...offsets });
      }}
      onClick={(event) => {
        event.stopPropagation();
        if (justDragged.current) {
          justDragged.current = false;
          return;
        }
        // 첫 클릭: 텍스트 박스만 선택 / 선택된 텍스트를 다시 클릭: 편집 시작(커서 표시)
        if (selectedId !== id) {
          onSelect(id);
        } else if (!isEditing) {
          const { clientX, clientY } = event;
          onStartEdit(id);
          // 편집 가능해진 뒤(렌더 후) 클릭한 위치에 커서
          requestAnimationFrame(() => {
            editableRef.current?.focus();
            placeCaretAt(clientX, clientY);
          });
        }
      }}
      className={`relative ${className}`}
      style={{ ...style, color: elementColors[id] }}
    >
      {/* 글자는 직접 입력·수정 가능 (React는 처음 내용만 그리고, 이후 내용은 DOM이 관리) */}
      <div
        ref={editableRef}
        data-element-id={id}
        contentEditable={isEditing}
        suppressContentEditableWarning
        spellCheck={false}
        onInput={(event) => {
          // 데스크탑·모바일의 같은 요소에 같은 내용 반영
          document.querySelectorAll<HTMLElement>(`[data-element-id="${id}"]`).forEach((node) => {
            if (node !== event.currentTarget) node.innerHTML = event.currentTarget.innerHTML;
          });
          onTextEdit();
        }}
        onKeyDown={(event) => {
          // Enter는 줄바꿈(<br>)만 넣음
          if (event.key === 'Enter') {
            event.preventDefault();
            document.execCommand('insertLineBreak');
          }
        }}
        onPaste={(event) => {
          // 서식 없이 글자만 붙여넣기
          event.preventDefault();
          document.execCommand('insertText', false, event.clipboardData.getData('text/plain'));
        }}
        className={`outline-none selection:bg-[rgba(26,102,255,0.2)] ${isEditing ? 'cursor-text' : 'cursor-default'}`}
      >
        {children}
      </div>
      {selectedId === id && (
        // 요소 상자보다 0.5px씩 바깥에 그림 (Figma 선택 표시가 요소를 정수 픽셀로 감싼 크기와 가깝게)
        <span className="pointer-events-none absolute -inset-[0.5px] border border-solid" style={{ borderColor: outlineColor }} />
      )}
    </div>
  );
}

type SelectableItemProps = PreviewProps & {
  id: ElementId;
  outlineColor: string;
  className: string;
  children: ReactNode;
};

// 클릭하면 선택되는 아이템(카드). 색상은 배경에 적용
function SelectableItem({ id, elementColors, selectedId, onSelect, outlineColor, className, children }: SelectableItemProps) {
  return (
    <div
      onClick={(event) => {
        event.stopPropagation();
        onSelect(id);
      }}
      className={`relative cursor-pointer ${className}`}
      style={{ backgroundColor: elementColors[id] }}
    >
      {children}
      {selectedId === id && (
        <span className="pointer-events-none absolute -inset-[0.5px] border border-solid" style={{ borderColor: outlineColor }} />
      )}
    </div>
  );
}

const STAT_ITEMS: { index: ItemIndex; value: string }[] = [
  { index: 1, value: '15K+' },
  { index: 2, value: '32' },
  { index: 3, value: '9.5' },
];

// aboutSection/textCover (데스크탑)
function DesktopAboutSection(props: PreviewProps) {
  return (
    <div className="flex w-[920px] flex-col items-center px-[14.375px] py-[57.5px]">
      <div className="flex w-full flex-col items-start gap-[13.417px] pb-[28.75px]">
        <div className="flex w-full flex-col items-start gap-[5.75px]">
          <SelectableText {...props} id="storyEyebrow" outlineColor="#09f" className="h-[10px] max-w-full font-['DM_Sans'] text-[6.708px] leading-[9.583px] font-normal" style={DM_SANS_OPSZ}>
            Our Story
          </SelectableText>
          <SelectableText {...props} id="storyTitle" outlineColor="#09f" className="max-w-full font-['DM_Sans'] text-[23px] leading-[23px] font-medium tracking-[-0.0958px]" style={DM_SANS_OPSZ}>
            Depth Over Speed
          </SelectableText>
        </div>
        <SelectableText {...props} id="storyBody" outlineColor="#09f" className="max-w-full font-['Pretendard'] text-[6.708px] leading-[11.5px] font-normal tracking-[-0.0958px]">
          보이지 않는 디테일까지 고민하는 과정은 결국 결과의 완성도를 넘어, 경험의 차이를 만듭니다.
          <br />
          사람들은 모든 요소를 기억하지는 않지만, 그 안에 담긴 감각과 인상은 오래 남습니다.
        </SelectableText>
      </div>
      <div className="flex w-full items-center gap-[2.875px]">
        {STAT_ITEMS.map(({ index, value }) => (
          <SelectableItem
            key={index}
            {...props}
            id={`item${index}`}
            outlineColor="#09f"
            className="flex min-w-px flex-1 flex-col items-start rounded-[2.875px] px-[19.167px] py-[23.958px]"
          >
            <div className="flex w-full flex-col items-start gap-[9.583px]">
              <SelectableText {...props} id={`item${index}Title`} outlineColor="#09f" className="h-[50px] max-w-full font-['DM_Sans'] text-[38.333px] leading-[1.3] font-medium tracking-[-0.0958px] capitalize" style={DM_SANS_OPSZ}>
                {value}
              </SelectableText>
              <SelectableText {...props} id={`item${index}Body`} outlineColor="#09f" className="max-w-full font-['Pretendard'] text-[6.708px] leading-[11.5px] font-medium tracking-[-0.0958px]">
                생각의 깊이가 더 오래 남는다고 믿습니다. 빠르게 결과를 만들어내는
                <br />
                시대일수록, 완성의 속도가 아닌 과정의 밀도가 중요해집니다.
              </SelectableText>
            </div>
          </SelectableItem>
        ))}
      </div>
    </div>
  );
}

// aboutSection/textCover (모바일)
function MobileAboutSection(props: PreviewProps) {
  return (
    <div className="flex w-[188px] flex-col items-center bg-white px-[7.654px] py-[28.702px]">
      <div className="flex w-full flex-col items-start gap-[7.654px] pb-[15.308px]">
        <div className="flex w-full flex-col items-start gap-[2.87px]">
          <SelectableText {...props} id="storyEyebrow" outlineColor="#80ccff" className="h-[10px] max-w-full font-['DM_Sans'] text-[6.697px] leading-[9.567px] font-normal" style={DM_SANS_OPSZ}>
            Our Story
          </SelectableText>
          <SelectableText {...props} id="storyTitle" outlineColor="#80ccff" className="h-[23px] max-w-full font-['DM_Sans'] text-[15.308px] leading-[22.962px] font-medium" style={DM_SANS_OPSZ}>
            Depth Over Speed
          </SelectableText>
        </div>
        <SelectableText {...props} id="storyBody" outlineColor="#80ccff" className="h-[35px] max-w-full font-['Pretendard'] text-[6.697px] leading-[11.481px] font-normal tracking-[-0.0957px]">
          보이지 않는 디테일까지 고민하는 과정은 결국 결과의 완성도를
          <br />
          넘어, 경험의 차이를 만듭니다. 사람들은 모든 요소를 기억하지는
          <br />
          않지만, 그 안에 담긴 감각과 인상은 오래 남습니다.
        </SelectableText>
      </div>
      <div className="flex w-full flex-col items-start justify-center gap-[7.654px]">
        {STAT_ITEMS.map(({ index, value }) => (
          <SelectableItem
            key={index}
            {...props}
            id={`item${index}`}
            outlineColor="#80ccff"
            className="flex w-full flex-col items-start rounded-[1.913px] px-[11.481px] py-[15.308px]"
          >
            <div className="flex w-full flex-col items-start gap-[9.567px]">
              <SelectableText {...props} id={`item${index}Title`} outlineColor="#80ccff" className="h-[27px] max-w-full font-['DM_Sans'] text-[21.048px] leading-[1.3] font-medium tracking-[-0.0957px] capitalize" style={DM_SANS_OPSZ}>
                {value}
              </SelectableText>
              <SelectableText {...props} id={`item${index}Body`} outlineColor="#80ccff" className="h-[35px] max-w-full font-['Pretendard'] text-[6.697px] leading-[11.481px] font-medium tracking-[-0.0957px]">
                우리는 생각의 깊이가 더 오래 남는다고 믿습니다. 빠르게 결과를 만들어내는 시대일수록, 완성의 속도가 아닌 과정의 밀도가
                중요해집니다.
              </SelectableText>
            </div>
          </SelectableItem>
        ))}
      </div>
    </div>
  );
}

function DesktopPreview(props: PreviewProps) {
  return (
    <div className="absolute top-[40px] left-[40px] flex w-[920px] flex-col gap-[12px]">
      <ViewportBar icon={iconDesktop} label="데스크탑" />
      <div onClick={() => props.onSelect(null)} className="relative w-full overflow-hidden bg-white">
        {/* header */}
        <div className="relative flex h-[30.667px] w-[920px] items-center px-[14.375px]">
          <div className="relative flex h-full flex-1 items-center justify-between">
            <div className="flex h-full gap-[5.75px]">
              {DESKTOP_NAV.map((label) => (
                <DesktopNavItem key={label} label={label} />
              ))}
            </div>
            <div className="flex h-full justify-end gap-[5.75px]">
              {DESKTOP_UTILITIES.map((label) => (
                <DesktopNavItem key={label} label={label} />
              ))}
            </div>
            <span className="absolute top-[calc(50%+0.24px)] left-[calc(50%-16.77px)] -translate-y-1/2 font-['Inter'] text-[11.5px] leading-[16.1px] font-semibold whitespace-nowrap text-black">
              BRAND
            </span>
          </div>
        </div>

        {/* variant2: image + content */}
        <div className="flex w-[920px] items-center bg-white">
          <div className="relative aspect-square w-[460px] shrink-0 overflow-hidden">
            <img src={thumbnail} alt="" className="absolute inset-0 size-full max-w-none object-cover" />
          </div>
          <div className="flex aspect-square w-[460px] shrink-0 flex-col items-center justify-center bg-white px-[57.5px]">
            <div className="flex w-full flex-col items-center gap-[17.25px]">
              <div className="flex w-full flex-col items-center gap-[5.75px] text-center">
                <SelectableText {...props} id="eyebrow" outlineColor="#09f" className="max-w-full font-['DM_Sans'] text-[6.71px] leading-[1.6] font-normal" style={DM_SANS_OPSZ}>
                  Our Philosophy
                </SelectableText>
                <SelectableText {...props} id="heading" outlineColor="#09f" className="font-['DM_Sans'] text-[19.17px] leading-[1.4] font-medium whitespace-nowrap" style={DM_SANS_OPSZ}>
                  New Standard in Quality
                </SelectableText>
                <SelectableText {...props} id="body" outlineColor="#09f" className="max-w-full font-['Pretendard'] text-[6.71px] leading-[1.6] font-normal">
                  쉽게 지나칠 수 있는 디테일까지 고민하는 일은 결과의 완성도를 높이고, 더 나은 경험을 만듭니다.
                </SelectableText>
              </div>
              <div className="flex items-center justify-center overflow-hidden rounded-[1.917px] border-[0.479px] border-solid border-[rgba(17,17,17,0)] bg-[#111] px-[12.937px] py-[6.708px]">
                <span className="font-['DM_Sans'] text-[6.23px] leading-[1.2] font-medium whitespace-nowrap text-white" style={DM_SANS_OPSZ}>
                  Learn more
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-[0.333px]">
          <DesktopAboutSection {...props} />
        </div>
      </div>
    </div>
  );
}

function MobilePreview(props: PreviewProps) {
  return (
    <div className="absolute top-[40px] left-[980px] flex w-[188px] flex-col gap-[12px] overflow-hidden">
      <ViewportBar icon={iconMobile} label="모바일" />
      <div onClick={() => props.onSelect(null)} className="relative w-full overflow-hidden bg-white">
        {/* header */}
        <div className="relative flex h-[28.923px] w-[188px] items-center justify-between bg-white px-[7.713px]">
          <div className="flex h-[23.138px] min-w-[23.138px] items-center">
            <span className="font-['DM_Sans'] text-[6.27px] leading-[1.6] font-normal whitespace-nowrap text-[#372320] uppercase" style={DM_SANS_OPSZ}>
              Menu
            </span>
          </div>
          <div className="flex h-[23.138px] min-w-[23.138px] items-center justify-end">
            <span className="font-['DM_Sans'] text-[6.27px] leading-[1.6] font-normal whitespace-nowrap text-[#372320] uppercase" style={DM_SANS_OPSZ}>
              Bag [0]
            </span>
          </div>
          <span className="absolute top-1/2 left-[calc(50%-16.87px)] -translate-y-1/2 font-['Inter'] text-[9.64px] leading-[13.5px] font-semibold whitespace-nowrap text-[#372320]">
            BRAND
          </span>
        </div>

        {/* variant2: image + content */}
        <div className="flex w-[188px] flex-col bg-white">
          <div className="relative aspect-square w-full shrink-0 overflow-hidden">
            <img src={thumbnail} alt="" className="absolute inset-0 size-full max-w-none object-cover" />
          </div>
          <div className="flex w-full flex-col items-center justify-center gap-[15.426px] overflow-hidden bg-white px-[15.426px] py-[23.138px]">
            <div className="flex w-full flex-col items-center gap-[5.785px] text-center">
              <SelectableText {...props} id="eyebrow" outlineColor="#80ccff" className="max-w-full font-['DM_Sans'] text-[6.75px] leading-[1.6] font-normal" style={DM_SANS_OPSZ}>
                Our Philosophy
              </SelectableText>
              <SelectableText {...props} id="heading" outlineColor="#80ccff" className="font-['DM_Sans'] text-[11.57px] leading-[1.4] font-medium whitespace-nowrap" style={DM_SANS_OPSZ}>
                New Standard in Quality
              </SelectableText>
              <SelectableText {...props} id="body" outlineColor="#80ccff" className="max-w-full font-['Pretendard'] text-[6.75px] leading-[1.6] font-normal">
                쉽게 지나칠 수 있는 디테일까지 고민하는 일은 결과의
                <br />
                완성도를 높이고, 더 나은 경험을 만듭니다.
              </SelectableText>
            </div>
            <div className="flex items-center justify-center overflow-hidden rounded-[1.928px] border-[0.482px] border-solid border-[rgba(17,17,17,0)] bg-[#111] px-[13.015px] py-[6.749px]">
              <span className="font-['DM_Sans'] text-[6.27px] leading-[1.2] font-medium whitespace-nowrap text-white" style={DM_SANS_OPSZ}>
                Learn more
              </span>
            </div>
          </div>
          <MobileAboutSection {...props} />
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="m-0 w-full font-['Pretendard'] text-[12px] leading-[18px] font-semibold text-[#333e4c]">{children}</p>
  );
}

type ColorSectionProps = {
  element: ElementConfig;
  customColor: CustomColor | null;
  isColorMenuOpen: boolean;
  onToggleColorMenu: () => void;
};

// 패널의 색상 섹션 (텍스트·아이템 패널 공용)
function ColorSection({ element, customColor, isColorMenuOpen, onToggleColorMenu }: ColorSectionProps) {
  return (
    <div className="flex w-[280px] flex-col gap-[12px] border-b border-solid border-[rgba(51,62,76,0.1)] px-[20px] pt-[20px] pb-[19px]">
      <SectionLabel>색상</SectionLabel>
      {customColor ? (
        // 커스텀 색상 적용 상태: HEX + 불투명도 표시
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleColorMenu();
          }}
          className={`flex h-[34px] w-[240px] cursor-pointer items-center gap-[10px] overflow-hidden rounded-[6px] border border-solid bg-white p-[7px] text-left ${
            isColorMenuOpen ? 'border-[#1a66ff]' : 'border-[rgba(51,62,76,0.1)]'
          }`}
        >
          <div className="flex min-w-px flex-1 items-center gap-[6px]">
            <div className="size-[18px] shrink-0 rounded-[4px] border border-solid border-[#e0e2e6]" style={{ backgroundColor: toCssColor(customColor) }} />
            <span className="shrink-0 truncate font-['Pretendard'] text-[12px] leading-[18px] font-normal whitespace-nowrap text-black">
              {customColor.hex.toUpperCase()}
            </span>
          </div>
          <div className="h-[34px] w-px shrink-0 bg-[rgba(51,62,76,0.1)]" />
          <div className="flex h-full shrink-0 items-center justify-end gap-[2px] py-[8px] font-['Pretendard'] font-normal">
            <span className="w-[20px] text-[12px] leading-[18px] text-[#333e4c]">{customColor.opacity}</span>
            <span className="w-[10px] text-[11px] leading-[14px] text-[#99a0aa]">%</span>
          </div>
        </button>
      ) : (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleColorMenu();
          }}
          className={`flex h-[34px] w-[240px] cursor-pointer items-center justify-center gap-[6px] overflow-hidden rounded-[6px] border border-solid bg-white px-[8px] py-[9px] text-left ${
            isColorMenuOpen ? 'border-[#1a66ff]' : 'border-[rgba(51,62,76,0.1)]'
          }`}
        >
          <div className="flex min-w-px flex-1 items-center gap-[6px]">
            <div
              className="size-[18px] shrink-0 rounded-[4px] border border-solid border-[#e0e2e6]"
              style={{ backgroundColor: element.commonColor }}
            />
            <span className="min-w-px flex-1 truncate font-['Pretendard'] text-[12px] leading-[18px] font-normal text-black">
              {element.commonName}
            </span>
          </div>
        </button>
      )}
    </div>
  );
}

type PanelProps = Omit<ColorSectionProps, 'element'> & {
  elementId: ElementId;
  mode?: number;
  // 모드 2: 공통 스타일 연결 여부
  isLinked?: boolean;
  onToggleLink?: () => void;
};

const PANEL_CLASS =
  'absolute top-[75px] right-[20px] flex w-[280px] flex-col overflow-hidden rounded-[12px] bg-white drop-shadow-[0px_4px_5px_rgba(65,78,97,0.08)]';

type LinkableColorSectionProps = ColorSectionProps & { isLinked: boolean; onToggleLink: () => void };

// 모드 2 색상: 기본은 공통 스타일과 연결(흐리게, 수정 불가).
// 연결 버튼을 누르면 연결이 끊기고, 이 요소에만 별도 색상을 설정할 수 있음
function LinkableColorSection({ element, customColor, isColorMenuOpen, onToggleColorMenu, isLinked, onToggleLink }: LinkableColorSectionProps) {
  const linkLabel = isLinked ? '공통 스타일과 연결 끊기' : '공통 스타일과 연결하기';
  return (
    <div className="flex w-full flex-col gap-[12px] p-[20px]">
      <SectionLabel>색상</SectionLabel>
      <div className="flex w-full flex-col items-start gap-[8px]">
        <div
          onClick={(event) => {
            event.stopPropagation();
            if (!isLinked) onToggleColorMenu();
          }}
          className={`flex h-[34px] w-full items-center justify-center gap-[6px] rounded-[6px] border border-solid px-[7px] py-[9px] ${
            isColorMenuOpen ? 'border-[#1a66ff]' : 'border-[rgba(51,62,76,0.16)]'
          } ${isLinked ? '' : 'cursor-pointer'}`}
        >
          <div className="flex min-w-px flex-1 items-center gap-[6px]">
            <div
              className={`size-[18px] shrink-0 rounded-[4px] border border-solid border-[#e0e2e6] ${isLinked ? 'opacity-50' : ''}`}
              style={{ backgroundColor: customColor ? toCssColor(customColor) : element.commonColor }}
            />
            <span
              className={`min-w-px flex-1 truncate font-['Pretendard'] text-[12px] leading-[18px] font-normal ${
                isLinked ? 'text-[#99a0aa]' : 'text-black'
              }`}
            >
              {customColor ? customColor.hex.toUpperCase() : element.commonName}
            </span>
          </div>
          <div className="group/link relative shrink-0">
            <button
              type="button"
              aria-label={linkLabel}
              onClick={(event) => {
                event.stopPropagation();
                onToggleLink();
              }}
              className={`flex size-[20px] cursor-pointer items-center justify-center rounded-[4px] p-[2px] ${isLinked ? 'bg-[rgba(26,102,255,0.1)]' : ''}`}
            >
              <img src={isLinked ? iconLink : iconLinkDisabled} alt="" width={16} height={16} />
            </button>
            <Tooltip
              label={linkLabel}
              align="end"
              className="invisible absolute top-[calc(100%+4px)] right-0 z-10 group-hover/link:visible"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function TextPanel({ elementId, mode = 1, isLinked = true, onToggleLink = () => {}, ...colorProps }: PanelProps) {
  const element = ELEMENTS[elementId];
  if (element.kind !== 'text') return null;
  return (
    // 모드 2: 색상 툴팁이 패널 아래로 나갈 수 있게 overflow 해제
    <div className={mode === 2 ? PANEL_CLASS.replace('overflow-hidden ', '') : PANEL_CLASS}>
      {/* header */}
      <div className="flex h-[52px] w-full items-center gap-[8px] py-[16px] pr-[16px] pl-[20px]">
        <p className="m-0 min-w-px flex-1 font-['Pretendard'] text-[14px] leading-[20px] font-semibold whitespace-nowrap text-black">
          텍스트
        </p>
        <div className="flex items-center justify-center overflow-hidden rounded-[4px] bg-[#f5f8ff] p-[4px]">
          <img src={iconSync} alt="" width={16} height={16} />
        </div>
      </div>

      {/* 내용 */}
      <div className="flex w-full flex-col gap-[12px] border-b border-solid border-[rgba(51,62,76,0.1)] px-[20px] pt-[8px] pb-[19px]">
        <SectionLabel>내용</SectionLabel>
        <div className="flex h-[34px] w-[240px] items-center justify-center gap-[6px] overflow-hidden rounded-[6px] border border-solid border-[#1b4efe] bg-gradient-to-r from-[rgba(27,78,254,0.03)] to-[rgba(165,77,255,0.03)] p-[8px]">
          <div className="flex min-w-px flex-1 items-center gap-[4px]">
            <img src={iconAi} alt="" width={24} height={24} className="size-[18px] shrink-0" />
            <span className="font-['Pretendard'] text-[12px] leading-[18px] font-medium whitespace-nowrap text-black">
              AI 도움받기
            </span>
          </div>
          <img src={iconChevronRight} alt="" width={16} height={16} />
        </div>
      </div>

      {/* 스타일 */}
      <div className="flex w-full flex-col gap-[12px] border-b border-solid border-[rgba(51,62,76,0.1)] px-[20px] pt-[20px] pb-[19px]">
        <SectionLabel>스타일</SectionLabel>
        <div className="flex h-[34px] w-full items-center justify-center gap-[6px] overflow-hidden rounded-[6px] border border-solid border-[rgba(51,62,76,0.1)] py-[9px] pr-[9px] pl-[12px]">
          <span className="min-w-px flex-1 font-['Pretendard'] text-[12px] leading-[18px] font-normal text-black">{element.styleLabel}</span>
          <img src={iconChevronDownPanel} alt="" width={16} height={16} />
        </div>
      </div>

      {/* 색상 */}
      {mode === 2 ? (
        <LinkableColorSection element={element} isLinked={isLinked} onToggleLink={onToggleLink} {...colorProps} />
      ) : (
        <ColorSection element={element} {...colorProps} />
      )}
    </div>
  );
}

const FONT_WEIGHT_LABELS: Record<string, string> = { '400': 'Regular', '500': 'Medium', '600': 'SemiBold', '700': 'Bold' };

type DragPanelProps = Omit<ColorSectionProps, 'element'> &
  Pick<PanelProps, 'mode' | 'isLinked' | 'onToggleLink'> & { selection: DragSelection };

// 텍스트 일부를 드래그했을 때의 패널: 굵기 / 색상 / 링크
function DragPanel({ selection, mode = 1, isLinked = true, onToggleLink = () => {}, ...colorProps }: DragPanelProps) {
  const weight = getComputedStyle(selection.element).fontWeight;
  return (
    // 모드 2: 색상 툴팁이 패널 아래로 나갈 수 있게 overflow 해제
    <div onClick={(event) => event.stopPropagation()} className={mode === 2 ? PANEL_CLASS.replace('overflow-hidden ', '') : PANEL_CLASS}>
      <div className="flex h-[52px] w-full items-center gap-[8px] py-[16px] pr-[16px] pl-[20px]">
        <p className="m-0 min-w-px flex-1 font-['Pretendard'] text-[14px] leading-[20px] font-semibold whitespace-nowrap text-black">
          텍스트
        </p>
      </div>

      {/* 굵기 */}
      <div className="flex w-full flex-col gap-[12px] border-b border-solid border-[rgba(51,62,76,0.1)] px-[20px] pt-[12px] pb-[19px]">
        <SectionLabel>굵기</SectionLabel>
        <div className="flex h-[34px] w-full items-center justify-center gap-[6px] overflow-hidden rounded-[6px] border border-solid border-[rgba(51,62,76,0.1)] py-[9px] pr-[9px] pl-[12px]">
          <span className="min-w-px flex-1 font-['Pretendard'] text-[12px] leading-[18px] font-normal text-black">
            {FONT_WEIGHT_LABELS[weight] ?? weight}
          </span>
          <img src={iconChevronDownPanel} alt="" width={16} height={16} />
        </div>
      </div>

      {/* 색상: 기본은 텍스트의 공통 스타일, 커스텀이면 드래그한 부분에만 적용 */}
      {mode === 2 ? (
        <LinkableColorSection element={ELEMENTS[selection.id]} isLinked={isLinked} onToggleLink={onToggleLink} {...colorProps} />
      ) : (
        <ColorSection element={ELEMENTS[selection.id]} {...colorProps} />
      )}

      {/* 링크 */}
      <div className="flex w-full flex-col gap-[12px] border-b border-solid border-[rgba(51,62,76,0.1)] px-[20px] pt-[20px] pb-[19px]">
        <SectionLabel>링크</SectionLabel>
        <div className="flex h-[34px] w-full items-center rounded-[6px] bg-[#f6f7f9] px-[12px] py-[8px]">
          <span className="min-w-px flex-1 truncate font-['Pretendard'] text-[12px] leading-[18px] font-normal text-[#99a0aa]">
            페이지 선택 혹은 URL 주소 입력
          </span>
        </div>
      </div>
    </div>
  );
}

// 아이템 패널: 헤더 + 색상(배경)
function ItemPanel({ elementId, mode = 1, isLinked = true, onToggleLink = () => {}, ...colorProps }: PanelProps) {
  const element = ELEMENTS[elementId];
  return (
    // 모드 2: 색상 툴팁이 패널 아래로 나갈 수 있게 overflow 해제
    <div className={mode === 2 ? PANEL_CLASS.replace('overflow-hidden ', '') : PANEL_CLASS}>
      <div className="flex h-[52px] w-full items-center gap-[8px] py-[16px] pr-[16px] pl-[20px]">
        <p className="m-0 min-w-px flex-1 font-['Pretendard'] text-[14px] leading-[20px] font-semibold whitespace-nowrap text-black">
          아이템
        </p>
      </div>
      {/* 모드 2: 텍스트와 같이 공통 스타일 연결/연결 끊기 */}
      {mode === 2 ? (
        <LinkableColorSection element={element} isLinked={isLinked} onToggleLink={onToggleLink} {...colorProps} />
      ) : (
        <ColorSection element={element} {...colorProps} />
      )}
    </div>
  );
}

// 커스텀 색상: hex는 '#rrggbb'(소문자), opacity는 0~100
type CustomColor = { hex: string; opacity: number };

// 커스텀 탭에서 아직 색을 정하지 않았을 때 보여줄 기본값
const DEFAULT_CUSTOM_COLOR: CustomColor = { hex: '#000000', opacity: 100 };

// 'ABC' → '#aabbcc', 'A1B2C3' → '#a1b2c3', 그 외는 null
function normalizeHex(input: string): string | null {
  const value = input.trim().replace(/^#/, '');
  if (/^[0-9a-f]{6}$/i.test(value)) return `#${value.toLowerCase()}`;
  if (/^[0-9a-f]{3}$/i.test(value)) {
    return `#${value
      .split('')
      .map((char) => char + char)
      .join('')
      .toLowerCase()}`;
  }
  return null;
}

function toCssColor({ hex, opacity }: CustomColor) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
}

// '#rrggbb' → HSV (h: 0~360, s·v: 0~1). 무채색은 h를 0(빨강)으로 둠
function hexToHsv(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const delta = max - Math.min(r, g, b);
  let h = 0;
  if (delta > 0) {
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h = (h * 60 + 360) % 360;
  }
  return { h, s: max === 0 ? 0 : delta / max, v: max };
}

type Hsv = { h: number; s: number; v: number };

function hsvToHex({ h, s, v }: Hsv) {
  const channel = (n: number) => {
    const k = (n + h / 60) % 6;
    const value = v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
    return Math.round(value * 255)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${channel(5)}${channel(3)}${channel(1)}`;
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

// 누른 채로 움직이는 동안 target 영역 안에서의 위치(0~1)를 onMove로 전달
function dragProps(target: RefObject<HTMLElement | null>, onMove: (x: number, y: number) => void) {
  const emit = (event: PointerEvent<HTMLElement>) => {
    const rect = target.current?.getBoundingClientRect();
    if (!rect) return;
    onMove(clamp01((event.clientX - rect.left) / rect.width), clamp01((event.clientY - rect.top) / rect.height));
  };
  return {
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      event.currentTarget.setPointerCapture(event.pointerId);
      emit(event);
    },
    onPointerMove: (event: PointerEvent<HTMLElement>) => {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) emit(event);
    },
  };
}

// align='end': 오른쪽 끝을 맞추고 꼬리는 지름 20px 버튼 가운데(오른쪽에서 5px)에 둠
function Tooltip({ label, align = 'center', className = '' }: { label: string; align?: 'center' | 'end'; className?: string }) {
  return (
    <div className={`pointer-events-none flex flex-col ${align === 'end' ? 'items-end' : 'items-center'} ${className}`}>
      <img src={tooltipTip} alt="" width={10} height={4} className={`block shrink-0 ${align === 'end' ? 'mr-[5px]' : ''}`} />
      <div className="flex flex-col items-center rounded-[4px] bg-[#181d25] p-[8px]">
        <span className="font-['Pretendard'] text-[12px] leading-[18px] font-medium whitespace-nowrap text-white">{label}</span>
      </div>
    </div>
  );
}

// 색상 메뉴는 패널 왼쪽, 색상 필드와 같은 높이(화면 좌표)에 띄움
const COLOR_MENU_LEFT = 988;
const COLOR_MENU_TOP: Record<ElementConfig['kind'], number> = { text: 373, item: 177 };
// 드래그 패널의 색상 필드 높이 (헤더 52 + 굵기 96 + 섹션 위쪽 50)
const DRAG_COLOR_MENU_TOP = 273;

type ColorMenuTab = 'common' | 'custom';

// Figma 색상(hue) 트랙의 색 지점: [오른쪽 끝에서의 위치 %, RGB]
// 색 간격이 균일하지 않아서, 핸들 위치는 이 지점들 사이를 보간해 구함
const HUE_TRACK_STOPS: [number, [number, number, number]][] = [
  [0, [240, 0, 0]],
  [4.6875, [255, 0, 94]],
  [4.6975, [252, 0, 114]],
  [8.8542, [234, 0, 250]],
  [8.8642, [224, 0, 251]],
  [13.021, [154, 0, 255]],
  [18.229, [49, 0, 255]],
  [18.239, [45, 1, 255]],
  [23.438, [6, 12, 255]],
  [23.448, [4, 49, 255]],
  [28.125, [0, 124, 255]],
  [33.333, [0, 142, 255]],
  [38.542, [34, 139, 222]],
  [43.229, [0, 219, 255]],
  [47.917, [0, 245, 255]],
  [53.646, [0, 255, 181]],
  [58.333, [0, 255, 104]],
  [64.063, [0, 255, 34]],
  [69.271, [42, 255, 0]],
  [73.958, [172, 255, 0]],
  [78.646, [240, 246, 0]],
  [83.333, [255, 195, 0]],
  [88.542, [255, 129, 0]],
  [94.792, [255, 79, 0]],
  [100, [255, 0, 0]],
];

const HUE_TRACK_GRADIENT = `linear-gradient(-90deg, ${HUE_TRACK_STOPS.map(([pos, [r, g, b]]) => `rgb(${r}, ${g}, ${b}) ${pos}%`).join(', ')})`;

// 트랙 왼쪽 끝부터의 비율(0~1)과 그 지점의 hue(0~360)
const HUE_TRACK_POINTS = HUE_TRACK_STOPS.map(([pos, [r, g, b]]) => ({
  ratio: 1 - pos / 100,
  hue: hexToHsv(`#${[r, g, b].map((value) => value.toString(16).padStart(2, '0')).join('')}`).h,
})).reverse();
HUE_TRACK_POINTS[0].hue = 0;
HUE_TRACK_POINTS[HUE_TRACK_POINTS.length - 1].hue = 360;

// 두 값 사이를 보간: from 축 값 → to 축 값
function interpolateHueTrack(value: number, from: 'hue' | 'ratio', to: 'hue' | 'ratio') {
  for (let i = 1; i < HUE_TRACK_POINTS.length; i++) {
    const prev = HUE_TRACK_POINTS[i - 1];
    const next = HUE_TRACK_POINTS[i];
    if (value <= next[from]) {
      const t = next[from] === prev[from] ? 0 : (value - prev[from]) / (next[from] - prev[from]);
      return prev[to] + (next[to] - prev[to]) * t;
    }
  }
  return HUE_TRACK_POINTS[HUE_TRACK_POINTS.length - 1][to];
}

const hueToTrackRatio = (hue: number) => interpolateHueTrack(hue, 'hue', 'ratio');
const trackRatioToHue = (ratio: number) => interpolateHueTrack(ratio, 'ratio', 'hue');

const COLOR_SET = ['#ebe0a3', '#585d61', '#37231f', '#f7f5f1', '#a9afb1'];

const HANDLE_CLASS =
  'absolute size-[12px] rounded-full border-2 border-solid border-white shadow-[0px_1px_1px_0px_rgba(65,78,97,0.08),0px_2px_8px_0px_rgba(65,78,97,0.16)]';

function ColorChip({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-w-[40px] cursor-pointer items-center justify-center rounded-[6px] px-[8px] py-[4px] ${isActive ? 'bg-[#f6f7f9]' : ''}`}
    >
      <span
        className={`font-['Pretendard'] text-[12px] leading-[18px] whitespace-nowrap ${
          isActive ? 'font-medium text-[#333e4c]' : 'font-normal text-[#667080]'
        }`}
      >
        {label}
      </span>
    </button>
  );
}

type CommonStyleContentProps = {
  name: string;
  color: string;
  isSelected: boolean;
  onSelect: () => void;
};

function CommonStyleContent({ name, color, isSelected, onSelect }: CommonStyleContentProps) {
  return (
    <div className="flex w-full flex-col items-center gap-[8px] pt-[12px]">
      <div className="flex w-full flex-wrap content-start items-start gap-[8px] px-[16px] py-[4px]">
        <div onClick={onSelect} className="group/option relative shrink-0 cursor-pointer">
          <div
            className={`flex size-[32px] items-center overflow-hidden rounded-full border-2 border-solid p-[2px] ${
              isSelected ? 'border-[#1a66ff]' : 'border-transparent'
            }`}
          >
            <div className="h-full min-w-px flex-1 overflow-hidden rounded-full" style={{ backgroundColor: color }} />
          </div>
          <Tooltip
            label={name}
            className="invisible absolute top-[calc(100%+4px)] left-1/2 z-10 -translate-x-1/2 group-hover/option:visible"
          />
        </div>
      </div>
      <div className="group relative flex w-full cursor-pointer items-center justify-center gap-[16px] overflow-hidden rounded-b-[7px] border-t border-solid border-[rgba(51,62,76,0.1)] bg-white px-[12px] pt-[11px] pb-[11px]">
        <div className="absolute inset-[-1px_0_0_0] bg-[#181d25] opacity-0 group-hover:opacity-[0.04]" />
        <div className="relative flex min-w-px flex-1 items-center gap-[6px]">
          <span className="min-w-px flex-1 truncate font-['Pretendard'] text-[12px] leading-[18px] font-normal text-black">
            공통 스타일 편집
          </span>
          <img src={iconChevronRightEdge} alt="" width={18} height={18} />
        </div>
      </div>
    </div>
  );
}

// 입력 중인 글자는 따로 들고 있다가, 올바른 값일 때만 적용
function useDraft(value: string) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  return [draft, setDraft] as const;
}

const INPUT_CLASS =
  "min-w-px flex-1 bg-transparent p-0 font-['Pretendard'] text-[12px] leading-[18px] font-normal text-[#333e4c] outline-none";

type CustomColorContentProps = {
  color: CustomColor | null;
  onChange: (color: CustomColor) => void;
  onSelectSwatch: (hex: string) => void;
};

function CustomColorContent({ color, onChange, onSelectSwatch }: CustomColorContentProps) {
  const current = color ?? DEFAULT_CUSTOM_COLOR;
  const [hexDraft, setHexDraft] = useDraft(current.hex.slice(1).toUpperCase());
  const [opacityDraft, setOpacityDraft] = useDraft(String(current.opacity));

  // 핸들 위치는 HSV로 따로 들고 있음 (검정·회색은 HEX만으로 hue/채도를 알 수 없어 드래그 중 튀지 않게)
  const [hsv, setHsv] = useState<Hsv>(() => hexToHsv(current.hex));
  const emittedHex = useRef(current.hex);
  useEffect(() => {
    // HEX 입력·컬러 세트 등 바깥에서 색이 바뀐 경우에만 HSV를 다시 계산 (무채색이면 hue 유지)
    if (current.hex === emittedHex.current) return;
    emittedHex.current = current.hex;
    const next = hexToHsv(current.hex);
    setHsv((prev) => (next.s === 0 || next.v === 0 ? { ...next, h: prev.h } : next));
  }, [current.hex]);

  function applyHsv(next: Hsv) {
    setHsv(next);
    const hex = hsvToHex(next);
    emittedHex.current = hex;
    onChange({ ...current, hex });
  }

  const surfaceRef = useRef<HTMLDivElement>(null);
  const hueTrackRef = useRef<HTMLDivElement>(null);
  const alphaTrackRef = useRef<HTMLDivElement>(null);

  // 슬라이더 트랙 너비 206px(좌우 16px 여백), 색상 영역 206×134px, 핸들 지름 12px
  const { h, s, v } = hsv;
  const hueHandleLeft = 16 + 206 * hueToTrackRatio(h) - 6;
  const alphaHandleLeft = 16 + (206 * current.opacity) / 100 - 6;

  function commitHex() {
    const hex = normalizeHex(hexDraft);
    if (hex) onChange({ ...current, hex });
    else setHexDraft(current.hex.slice(1).toUpperCase());
  }

  function commitOpacity() {
    const value = parseInt(opacityDraft, 10);
    if (Number.isNaN(value)) setOpacityDraft(String(current.opacity));
    else onChange({ ...current, opacity: Math.min(100, Math.max(0, value)) });
  }

  return (
    <div className="flex w-full flex-col items-start overflow-hidden rounded-b-[7px]">
      {/* colorArea: 채도/명도 + 색상(hue) 슬라이더 */}
      <div className="flex h-[198px] w-full flex-col">
        <div className="flex min-h-px w-full flex-1 p-[16px]">
          <div
            ref={surfaceRef}
            {...dragProps(surfaceRef, (x, y) => applyHsv({ h, s: x, v: 1 - y }))}
            className="relative h-full min-w-px flex-1 cursor-pointer touch-none rounded-[4px] select-none"
          >
            <div className="absolute inset-0 rounded-[4px]" style={{ backgroundColor: `hsl(${h} 100% 50%)` }} />
            <div className="absolute inset-0 rounded-[4px] bg-[linear-gradient(90deg,#fff_0%,rgba(255,255,255,0)_100%)]" />
            <div className="absolute inset-0 rounded-[4px] bg-gradient-to-t from-black to-[rgba(0,0,0,0)]" />
            <div
              className={HANDLE_CLASS}
              style={{ left: s * 206 - 6, top: (1 - v) * 134 - 6, backgroundColor: current.hex }}
            />
          </div>
        </div>
        <div
          {...dragProps(hueTrackRef, (x) => applyHsv({ h: trackRatioToHue(x), s, v }))}
          className="relative flex w-full shrink-0 cursor-pointer touch-none flex-col items-center px-[16px] pt-[4px] pb-[20px] select-none"
        >
          <div ref={hueTrackRef} className="h-[8px] w-full rounded-full" style={{ backgroundImage: HUE_TRACK_GRADIENT }} />
          <div className={`${HANDLE_CLASS} top-[2px]`} style={{ left: hueHandleLeft, backgroundColor: `hsl(${h} 100% 50%)` }} />
        </div>
      </div>

      {/* 투명도(alpha) 슬라이더 */}
      <div
        {...dragProps(alphaTrackRef, (x) => onChange({ ...current, opacity: Math.round(x * 100) }))}
        className="relative flex w-full shrink-0 cursor-pointer touch-none flex-col items-center px-[16px] pt-[4px] pb-[20px] select-none"
      >
        <div
          ref={alphaTrackRef}
          className="h-[8px] w-full rounded-full"
          style={{
            // 오른쪽 끝은 현재 색, 왼쪽 끝은 투명 → 아래 격자무늬가 비쳐 보임
            backgroundImage: `linear-gradient(-90deg, ${current.hex} 0%, ${current.hex}00 100%), url("${alphaTrackChecker}")`,
            backgroundSize: 'auto, 5.5px 5.5px',
            backgroundPosition: 'top left',
          }}
        />
        {/* 핸들: 현재 불투명도가 적용된 색 + 격자무늬 (트랙의 해당 지점 색과 같게) */}
        <div
          className={`${HANDLE_CLASS} top-[2px] bg-white`}
          style={{
            left: alphaHandleLeft,
            backgroundImage: `linear-gradient(${toCssColor(current)}, ${toCssColor(current)}), url("${alphaTrackChecker}")`,
            backgroundSize: 'auto, 5.5px 5.5px',
          }}
        />
      </div>

      {/* inputArea: HEX + 불투명도 */}
      <div className="flex w-full flex-col items-center border-b border-solid border-[rgba(51,62,76,0.1)] pb-[15px]">
        <div className="flex w-full items-center gap-[16px] px-[16px]">
          <span className="font-['Pretendard'] text-[12px] leading-[18px] font-semibold whitespace-nowrap text-[#333e4c]">HEX</span>
          <div className="flex min-w-px flex-1 items-center rounded-[8px] border border-solid border-white bg-[#f6f7f9] focus-within:border-[#1a66ff]">
            <label className="flex min-w-px flex-1 cursor-text items-center gap-[2px] px-[8px] py-[7px]">
              <span className="font-['Pretendard'] text-[12px] leading-[18px] font-normal whitespace-nowrap text-[#99a0aa]">#</span>
              <input
                value={hexDraft}
                maxLength={7}
                spellCheck={false}
                aria-label="HEX 색상 코드"
                onChange={(event) => {
                  const next = event.target.value.replace(/[^0-9a-f#]/gi, '').toUpperCase();
                  setHexDraft(next);
                  // 6자리를 다 입력하면 바로 적용
                  const hex = next.replace('#', '').length === 6 ? normalizeHex(next) : null;
                  if (hex) onChange({ ...current, hex });
                }}
                onBlur={commitHex}
                onKeyDown={(event) => event.key === 'Enter' && event.currentTarget.blur()}
                className={INPUT_CLASS}
              />
            </label>
            <div className="w-px shrink-0 self-stretch bg-white" />
            <label className="flex w-[64px] shrink-0 cursor-text items-center justify-end gap-[2px] py-[7px] pr-[8px] pl-[10px] font-['Pretendard'] text-[12px] leading-[18px] font-normal">
              <input
                value={opacityDraft}
                maxLength={3}
                inputMode="numeric"
                aria-label="불투명도"
                onChange={(event) => {
                  const next = event.target.value.replace(/[^0-9]/g, '');
                  setOpacityDraft(next);
                  const value = parseInt(next, 10);
                  if (!Number.isNaN(value) && value <= 100) onChange({ ...current, opacity: value });
                }}
                onBlur={commitOpacity}
                onKeyDown={(event) => event.key === 'Enter' && event.currentTarget.blur()}
                className={INPUT_CLASS}
              />
              <span className="whitespace-nowrap text-[#99a0aa]">%</span>
            </label>
          </div>
        </div>
      </div>

      {/* 컬러 세트 */}
      <div className="flex w-full flex-col items-start gap-[12px] p-[16px]">
        <p className="m-0 w-full font-['Pretendard'] text-[11px] leading-[14px] font-medium text-[#667080]">컬러 세트</p>
        <div className="flex w-[152px] flex-wrap content-start items-start gap-[5.903px]">
          {COLOR_SET.map((swatch) => {
            // 컬러 세트는 불투명도 100% 색이라, 불투명도를 바꾸면 선택 해제
            const isSelected = swatch === color?.hex && color.opacity === 100;
            // 선택된 색: 파란 링 / 마우스를 올리면 회색 링 (Figma 시안의 selected, hover 상태)
            // 소수점 두께가 반올림되지 않도록 border 대신 inset box-shadow 사용
            return (
              <div
                key={swatch}
                onClick={() => onSelectSwatch(swatch)}
                className={`group/swatch flex size-[23.612px] shrink-0 cursor-pointer items-center rounded-full ${
                  isSelected
                    ? 'p-[2.952px] shadow-[inset_0_0_0_1.476px_#1a66ff]'
                    : 'p-0 hover:p-[2.952px] hover:shadow-[inset_0_0_0_1.476px_rgba(51,62,76,0.32)]'
                }`}
              >
                <div
                  className={`h-full min-w-px flex-1 rounded-full ${
                    isSelected ? '' : 'shadow-[inset_0_0_0_0.738px_rgba(51,62,76,0.16)] group-hover/swatch:shadow-none'
                  }`}
                  style={{ backgroundColor: swatch }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

type ColorMenuProps = {
  elementId: ElementId;
  top?: number;
  customColor: CustomColor | null;
  onChangeColor: (color: CustomColor | null) => void;
  onClose: () => void;
};

function ColorMenu({ elementId, top, customColor, onChangeColor, onClose }: ColorMenuProps) {
  const element = ELEMENTS[elementId];
  const [tab, setTab] = useState<ColorMenuTab>(customColor ? 'custom' : 'common');

  return (
    <div
      onClick={(event) => event.stopPropagation()}
      style={{ top: top ?? COLOR_MENU_TOP[element.kind], left: COLOR_MENU_LEFT }}
      className="absolute flex w-[240px] flex-col items-center justify-end rounded-[8px] border border-solid border-[rgba(51,62,76,0.1)] bg-white shadow-[0px_0px_1px_0px_rgba(65,78,97,0.08),0px_16px_64px_0px_rgba(65,78,97,0.16)]"
    >
      {/* chipGroup */}
      <div className="flex w-full items-start gap-[6px] overflow-hidden px-[12px] pt-[12px]">
        <ColorChip label="공통 스타일" isActive={tab === 'common'} onClick={() => setTab('common')} />
        <ColorChip label="커스텀" isActive={tab === 'custom'} onClick={() => setTab('custom')} />
      </div>

      {tab === 'common' ? (
        <CommonStyleContent
          name={element.commonName}
          color={element.commonColor}
          isSelected={customColor === null}
          onSelect={() => {
            onChangeColor(null);
            onClose();
          }}
        />
      ) : (
        <CustomColorContent
          color={customColor}
          onChange={onChangeColor}
          onSelectSwatch={(hex) => {
            // 컬러 세트는 고르면 바로 적용하고 메뉴를 닫음 (불투명도는 100%로 초기화)
            onChangeColor({ hex, opacity: 100 });
            onClose();
          }}
        />
      )}
    </div>
  );
}

const INITIAL_COLORS: Record<ElementId, CustomColor | null> = {
  eyebrow: null,
  heading: null,
  body: null,
  storyEyebrow: null,
  storyTitle: null,
  storyBody: null,
  item1: null,
  item2: null,
  item3: null,
  item1Title: null,
  item2Title: null,
  item3Title: null,
  item1Body: null,
  item2Body: null,
  item3Body: null,
};

// ---- 캔버스 확대·축소 / 이동 ----
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 1.2; // +/- 버튼 배율
const WHEEL_ZOOM_SPEED = 0.01; // ctrl(⌘)+휠·핀치: 휠 1px당 확대 비율(지수)

type CanvasView = { zoom: number; x: number; y: number };
const INITIAL_VIEW: CanvasView = { zoom: 1, x: 0, y: 0 };

const clampZoom = (zoom: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));

// point(캔버스 화면 좌표)를 기준으로 확대해도 그 지점이 제자리에 있도록 이동값 보정
function zoomAt(view: CanvasView, nextZoom: number, px: number, py: number): CanvasView {
  const zoom = clampZoom(nextZoom);
  const ratio = zoom / view.zoom;
  return { zoom, x: px - (px - view.x) * ratio, y: py - (py - view.y) * ratio };
}

function ZoomOutIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="10.5" cy="10.5" r="6.9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M15.6 15.6L20.5 20.5M7.5 10.5H13.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function ZoomInIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="10.5" cy="10.5" r="6.9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M15.6 15.6L20.5 20.5M7.5 10.5H13.5M10.5 7.5V13.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

const HUD_BUTTON_CLASS = 'flex h-[36px] cursor-pointer items-center justify-center px-[10px] text-black disabled:cursor-default disabled:opacity-30';

// 툴바 아래 캔버스 영역. 휠로 이동, ctrl(⌘)+휠·핀치로 커서 기준 확대/축소
function CanvasViewport({ children }: { children: ReactNode }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState(INITIAL_VIEW);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    // 브라우저 확대·스크롤을 막아야 해서 passive가 아닌 리스너로 등록
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = viewport.getBoundingClientRect();
      // 화면 전체가 창 너비에 맞춰 scale 되어 있으므로 실제 픽셀 → 캔버스 좌표로 환산
      const scale = rect.width / viewport.offsetWidth;
      const unit = event.deltaMode === 1 ? 16 : 1; // 줄 단위 스크롤 대응
      const dx = (event.deltaX * unit) / scale;
      const dy = (event.deltaY * unit) / scale;
      if (event.ctrlKey || event.metaKey) {
        const px = (event.clientX - rect.left) / scale;
        const py = (event.clientY - rect.top) / scale;
        setView((prev) => zoomAt(prev, prev.zoom * Math.exp(-dy * WHEEL_ZOOM_SPEED), px, py));
      } else if (event.shiftKey && dx === 0) {
        setView((prev) => ({ ...prev, x: prev.x - dy }));
      } else {
        setView((prev) => ({ ...prev, x: prev.x - dx, y: prev.y - dy }));
      }
    };
    viewport.addEventListener('wheel', handleWheel, { passive: false });
    return () => viewport.removeEventListener('wheel', handleWheel);
  }, []);

  // +/- 버튼은 캔버스 가운데를 기준으로 확대/축소
  const zoomByStep = (factor: number) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    setView((prev) => zoomAt(prev, prev.zoom * factor, viewport.offsetWidth / 2, viewport.offsetHeight / 2));
  };

  return (
    <div ref={viewportRef} className="absolute top-[55px] right-0 bottom-0 left-0 overflow-hidden">
      <div
        className="absolute top-0 left-0 w-[1512px] origin-top-left"
        style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.zoom})` }}
      >
        {children}
      </div>

      {/* 확대/축소 HUD */}
      <div
        onClick={(event) => event.stopPropagation()}
        className="absolute bottom-[16px] left-[16px] flex items-center rounded-[6px] border border-solid border-[#c5c5c5] bg-white shadow-[0px_2px_8px_0px_rgba(65,78,97,0.12)]"
      >
        <button type="button" aria-label="축소" disabled={view.zoom <= MIN_ZOOM} onClick={() => zoomByStep(1 / ZOOM_STEP)} className={HUD_BUTTON_CLASS}>
          <ZoomOutIcon />
        </button>
        <button type="button" aria-label="확대" disabled={view.zoom >= MAX_ZOOM} onClick={() => zoomByStep(ZOOM_STEP)} className={HUD_BUTTON_CLASS}>
          <ZoomInIcon />
        </button>
        <span className="h-[16px] w-px bg-[#e3e3e3]" />
        <button
          type="button"
          title="화면에 맞추기"
          onClick={() => setView(INITIAL_VIEW)}
          className={`${HUD_BUTTON_CLASS} gap-[2px] font-['Pretendard'] text-[14px] font-normal`}
        >
          <span className="min-w-[38px] text-right">{Math.round(view.zoom * 100)}%</span>
          <span className="flex size-[24px] items-center justify-center">
            <img src={iconChevronDownPage} alt="" width={16} height={16} />
          </span>
        </button>
      </div>
    </div>
  );
}

// [텍스트 색상 조정] 데모 화면
// mode: 시안 번호 (1 = 현재 시안, 2 = 새 시안 — 지금은 1과 같음)
export function TextColorScreen({ mode = 1 }: { mode?: number }) {
  const [selectedId, setSelectedId] = useState<ElementId | null>('heading');
  const [isColorMenuOpen, setIsColorMenuOpen] = useState(false);
  // 요소별 색상: null이면 공통 스타일, 값이 있으면 커스텀 색상
  const [customColors, setCustomColors] = useState(INITIAL_COLORS);

  const elementColors = Object.fromEntries(
    (Object.keys(ELEMENTS) as ElementId[]).map((id) => {
      const custom = customColors[id];
      return [id, custom ? toCssColor(custom) : ELEMENTS[id].commonColor];
    }),
  ) as Record<ElementId, string>;

  const [dragSelection, setDragSelection] = useState<DragSelection | null>(null);
  const [editingId, setEditingId] = useState<ElementId | null>(null);
  // 모드 2: 공통 스타일과 연결을 끊은 요소
  const [unlinkedIds, setUnlinkedIds] = useState<ElementId[]>([]);
  const [toastMessage, setToastMessage] = useState('');
  const [isToastVisible, setIsToastVisible] = useState(false);
  const toastTimer = useRef<number | undefined>(undefined);

  function showToast(message: string) {
    setToastMessage(message);
    setIsToastVisible(true);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setIsToastVisible(false), 2500);
  }

  // 드래그한 범위의 공통 스타일 연결 토글 (모드 2)
  function toggleDragLink() {
    if (!dragSelection) return;
    const isLinked = !dragSelection.overrideId && !dragSelection.unlinked;
    if (isLinked) {
      setDragSelection({ ...dragSelection, unlinked: true });
      showToast('해당 섹션에만 별도 색상을 설정할 수 있어요');
    } else {
      // 다시 연결: 드래그 범위의 별도 색상을 지움
      applyDragColor(null);
      setDragSelection((prev) => (prev ? { ...prev, unlinked: false } : prev));
      setIsColorMenuOpen(false);
    }
  }

  function toggleLink(id: ElementId) {
    if (unlinkedIds.includes(id)) {
      // 다시 연결: 별도 색상을 지우고 공통 스타일로
      setUnlinkedIds((ids) => ids.filter((value) => value !== id));
      setCustomColors((colors) => ({ ...colors, [id]: null }));
      setIsColorMenuOpen(false);
    } else {
      setUnlinkedIds((ids) => [...ids, id]);
      showToast('해당 섹션에만 별도 색상을 설정할 수 있어요');
    }
  }
  // 드래그 범위별 별도 색상 (override id → 색)
  const [overrideColors, setOverrideColors] = useState<Record<string, CustomColor>>({});
  const overrideCount = useRef(0);

  // 드래그한 범위에 색 적용. null이면 override를 지워 공통 스타일(텍스트 색)을 따름
  function applyDragColor(color: CustomColor | null) {
    if (!dragSelection) return;
    const { id, element, start, end } = dragSelection;
    let overrideId = dragSelection.overrideId;
    if (color === null) {
      if (overrideId) document.querySelectorAll(`[data-override="${overrideId}"]`).forEach(unwrap);
      setDragSelection({ ...dragSelection, overrideId: undefined });
      return;
    }
    if (!overrideId) {
      overrideId = `override-${++overrideCount.current}`;
      // 데스크탑·모바일 중 글자가 같은 쪽에 같은 범위로 적용
      document.querySelectorAll<HTMLElement>(`[data-element-id="${id}"]`).forEach((node) => {
        if (node === element || node.textContent === element.textContent) wrapOverride(node, start, end, overrideId!);
      });
    }
    document.querySelectorAll<HTMLElement>(`[data-override="${overrideId}"]`).forEach((span) => {
      span.style.color = toCssColor(color);
    });
    setOverrideColors((colors) => ({ ...colors, [overrideId!]: color }));
    // DOM이 바뀌었으니 하이라이트를 다시 그리도록 새 객체로 갱신
    setDragSelection({ ...dragSelection, overrideId });
  }

  // 드래그한 범위를 하이라이트 (CSS Custom Highlight). 브라우저 기본 선택은 지움
  useEffect(() => {
    if (!dragSelection || typeof CSS === 'undefined' || !('highlights' in CSS)) return;
    const range = rangeFromOffsets(dragSelection.element, dragSelection.start, dragSelection.end);
    // 캔버스 글자의 기본 선택만 지움 (HEX 입력칸 등 다른 곳의 커서는 유지)
    const selection = window.getSelection();
    if (selection?.anchorNode && dragSelection.element.contains(selection.anchorNode)) selection.removeAllRanges();
    CSS.highlights.set('text-drag', new Highlight(range));
    return () => {
      CSS.highlights.delete('text-drag');
    };
  }, [dragSelection]);

  const previewProps: PreviewProps = {
    elementColors,
    selectedId,
    onSelect: (id) => {
      setSelectedId(id);
      setDragSelection(null);
      setIsColorMenuOpen(false);
      // 다른 요소·빈 곳을 누르면 글자 편집(커서)도 끝냄
      setEditingId(null);
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    },
    editingId,
    onStartEdit: (id) => {
      setEditingId(id);
      setDragSelection(null);
      setIsColorMenuOpen(false);
    },
    // 글자를 고치면 드래그 범위가 달라지므로 드래그 선택 해제
    onTextEdit: () => setDragSelection(null),
    onDragSelect: (selection) => {
      setSelectedId(selection.id);
      // 같은 범위에 이미 별도 색상이 있으면 이어서 편집
      setDragSelection({ ...selection, overrideId: findOverrideAt(selection.element, selection.start, selection.end) });
      setIsColorMenuOpen(false);
    },
  };

  return (
    <div data-mode={mode} onClick={() => setIsColorMenuOpen(false)} className="relative h-[894px] w-[1512px] overflow-hidden bg-[#e4e6e9]">
      <Toolbar />
      <CanvasViewport>
        <DesktopPreview {...previewProps} />
        <MobilePreview {...previewProps} />
      </CanvasViewport>
      {dragSelection && (
        <DragPanel
          selection={dragSelection}
          mode={mode}
          isLinked={!dragSelection.overrideId && !dragSelection.unlinked}
          onToggleLink={toggleDragLink}
          customColor={dragSelection.overrideId ? (overrideColors[dragSelection.overrideId] ?? null) : null}
          isColorMenuOpen={isColorMenuOpen}
          onToggleColorMenu={() => setIsColorMenuOpen((open) => !open)}
        />
      )}
      {selectedId &&
        !dragSelection &&
        (() => {
          const panelProps: PanelProps = {
            elementId: selectedId,
            mode,
            isLinked: !unlinkedIds.includes(selectedId),
            onToggleLink: () => toggleLink(selectedId),
            customColor: customColors[selectedId],
            isColorMenuOpen,
            onToggleColorMenu: () => setIsColorMenuOpen((open) => !open),
          };
          return ELEMENTS[selectedId].kind === 'item' ? <ItemPanel {...panelProps} /> : <TextPanel {...panelProps} />;
        })()}
      {dragSelection && isColorMenuOpen && (
        <ColorMenu
          key={`drag-${dragSelection.id}-${dragSelection.start}-${dragSelection.end}`}
          elementId={dragSelection.id}
          top={DRAG_COLOR_MENU_TOP}
          customColor={dragSelection.overrideId ? (overrideColors[dragSelection.overrideId] ?? null) : null}
          onChangeColor={applyDragColor}
          onClose={() => setIsColorMenuOpen(false)}
        />
      )}
      {selectedId && !dragSelection && isColorMenuOpen && (
        <ColorMenu
          key={selectedId}
          elementId={selectedId}
          customColor={customColors[selectedId]}
          onChangeColor={(color) => setCustomColors((colors) => ({ ...colors, [selectedId]: color }))}
          onClose={() => setIsColorMenuOpen(false)}
        />
      )}
      <Snackbar message={toastMessage} visible={isToastVisible} width={320} />
    </div>
  );
}
