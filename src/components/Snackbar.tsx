type SnackbarProps = {
  message: string;
  visible: boolean;
  // 고정 너비(px). 없으면 문구 길이에 맞춤
  width?: number;
};

export function Snackbar({ message, visible, width }: SnackbarProps) {
  return (
    <div
      className={`pointer-events-none fixed top-[16px] left-1/2 z-50 -translate-x-1/2 transition-all duration-200 ${
        visible ? 'translate-y-0 opacity-100' : '-translate-y-1 opacity-0'
      }`}
      style={{ width }}
    >
      <div className="flex min-h-[56px] items-center rounded-[8px] bg-[#333e4c] p-[16px] shadow-[0px_1px_8px_0px_rgba(65,78,97,0.16),0px_2px_24px_0px_rgba(65,78,97,0.2)]">
        <p className="min-w-px flex-1 truncate font-['Pretendard'] text-[14px] leading-[20px] font-normal whitespace-nowrap text-white">
          {message}
        </p>
      </div>
    </div>
  );
}
