import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/ai-meeting-bot/' // <--- 加入這行，斜線包圍您的專案名稱
})
