import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5175,      // Thêm dòng này để ép Admin chạy cổng 5175
    strictPort: true, // Nếu cổng 5175 bị chiếm thì báo lỗi luôn chứ không tự nhảy sang cổng khác
    host: true,
    allowedHosts: true 
  }
})