# 웹빌더 텍스트 색상 조정 데모

웹빌더 에디터의 **텍스트·아이템 색상 조정** 인터랙션 데모입니다. (React + TypeScript + Vite + Tailwind CSS)

## 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:5173` 을 엽니다. 화면은 창 너비에 맞춰 확대·축소됩니다 (1920px 기준).

## 모드

화면 아래 가운데 버튼으로 전환합니다.

| 모드 | 주소 | 내용 |
|---|---|---|
| 모드 1 | `#/text-color` | 공통 스타일 / 커스텀 색상 |
| 모드 2 | `#/text-color?mode=2` | 공통 스타일과 연결된 기본값 → 연결 끊기 후 별도 색상 설정 |

## 주요 인터랙션

- 텍스트·카드 클릭: 선택 + 패널 표시 (텍스트는 한 번 더 클릭하면 편집)
- 색상 메뉴: 공통 스타일 / 커스텀 (컬러 세트, HEX·불투명도 입력, 색상 영역·슬라이더 드래그)
- 텍스트 일부 드래그: 드래그한 범위에만 별도 색상
- 캔버스: 휠로 이동, Ctrl(⌘)+휠·핀치로 확대·축소, 왼쪽 아래 확대/축소 버튼

## 구조

- `src/components/TextColorScreen.tsx` — 데모 화면 전체
- `src/components/Snackbar.tsx` — 토스트
- `src/assets/figma/text-color/` — Figma 에셋
