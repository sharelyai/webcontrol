import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  envDir: path.resolve(__dirname, '../../'),
  resolve: {
    // Enable HMR for workspace packages
    conditions: ['development', 'browser'],
  },
})
