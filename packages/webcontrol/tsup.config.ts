import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: true,
  clean: true,
  treeshake: true,
  sourcemap: true,
  external: ['react', 'react-dom', '@sharely/ui-agent-chat'],
  esbuildOptions(options) {
    options.banner = {
      js: '"use client";',
    }
  },
})
