import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  root: 'frontend',
  publicDir: 'public',
  build: { outDir: '../../dist', emptyOutDir: true },
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
})
