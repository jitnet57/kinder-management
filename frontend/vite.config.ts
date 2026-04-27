import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// ============================================================
// 📌 Vite 설정 최적화
// 📋 목적: 번들 크기 최소화 및 성능 개선
// 🎯 목표: gzip 크기 < 300KB
// 📅 작성일: 2026-04-27
// ============================================================
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    // sourcemap: false를 프로덕션에서는 권장 (소스맵은 번들 크기 증가)
    // 개발 중에만 true 설정
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // console.log 제거로 번들 크기 감소
        drop_debugger: true,
      },
    },
    // 청크 크기 경고값 조정
    chunkSizeWarningLimit: 500,

    rollupOptions: {
      output: {
        // ============================================================
        // 📌 고급 코드 분할 전략
        // 📋 목적: 라우트별, 라이브러리별 최적화된 청크 생성
        // 🔧 전략:
        // 1. React 핵심 라이브러리를 별도 청크로 분리
        // 2. 대형 라이브러리(recharts, html2canvas, xlsx)를 독립적으로 로드
        // 3. 공통 컴포넌트는 common 청크에 모음
        // ============================================================
        manualChunks: (id: string) => {
          // React 및 Router 핵심 라이브러리
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
            return 'react-vendor';
          }

          // 차트 및 분석 라이브러리 (lazy load 권장)
          if (id.includes('node_modules/recharts')) {
            return 'charts';
          }

          // 문서 생성 라이브러리 (필요할 때만 로드)
          if (id.includes('node_modules/jspdf') || id.includes('node_modules/html2canvas') || id.includes('node_modules/docx')) {
            return 'documents';
          }

          // 스프레드시트 처리 라이브러리
          if (id.includes('node_modules/xlsx')) {
            return 'spreadsheet';
          }

          // UI 아이콘 라이브러리
          if (id.includes('node_modules/lucide-react')) {
            return 'icons';
          }

          // 기타 node_modules
          if (id.includes('node_modules')) {
            return 'other-vendor';
          }
        },
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    },
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8'
    }
  }
})
