// 모드 2 전용 빌드: npx vite build --config vite.mode2.config.ts
// 결과: docs/mode2/ (mode2.html → index.html로 이름 변경은 빌드 후 처리)
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
  build: {
    outDir: 'docs/mode2',
    emptyOutDir: true,
    rollupOptions: { input: 'mode2.html' },
  },
});
