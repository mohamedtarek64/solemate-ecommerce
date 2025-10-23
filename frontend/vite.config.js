import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      'vue': 'vue/dist/vue.esm-bundler.js',
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@views': resolve(__dirname, 'src/views'),
      '@stores': resolve(__dirname, 'src/stores'),
      '@composables': resolve(__dirname, 'src/composables'),
      '@services': resolve(__dirname, 'src/services'),
      '@assets': resolve(__dirname, 'src/assets'),
      '@data': resolve(__dirname, 'src/data'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@types': resolve(__dirname, 'src/types'),
      '@constants': resolve(__dirname, 'src/constants'),
      '@config': resolve(__dirname, 'src/config'),
      '@plugins': resolve(__dirname, 'src/plugins'),
      '@directives': resolve(__dirname, 'src/directives'),
      '@mixins': resolve(__dirname, 'src/mixins'),
      '@filters': resolve(__dirname, 'src/filters'),
      '@validators': resolve(__dirname, 'src/validators'),
      '@helpers': resolve(__dirname, 'src/helpers'),
      '@hooks': resolve(__dirname, 'src/hooks'),
      '@middleware': resolve(__dirname, 'src/middleware'),
      '@guards': resolve(__dirname, 'src/guards'),
      '@layouts': resolve(__dirname, 'src/layouts'),
      '@pages': resolve(__dirname, 'src/pages'),
      '@modules': resolve(__dirname, 'src/modules'),
      '@features': resolve(__dirname, 'src/features'),
      '@shared': resolve(__dirname, 'src/shared'),
      '@core': resolve(__dirname, 'src/core'),
      '@ui': resolve(__dirname, 'src/components/ui'),
      '@forms': resolve(__dirname, 'src/components/forms'),
      '@modals': resolve(__dirname, 'src/components/modals'),
      '@sections': resolve(__dirname, 'src/components/sections'),
      '@layout': resolve(__dirname, 'src/components/layout')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/assets/styles/variables.css";`
      }
    }
  },
  server: {
    port: 3000,
    host: 'localhost',
    open: true,
    cors: true,
    hmr: {
      port: 3000,
      host: 'localhost'
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      },
      mangle: {
        safari10: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'pinia'],
          router: ['vue-router'],
          ui: ['@heroicons/vue'],
          utils: ['vue-lazyload', 'vue-toastification']
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    },
    target: 'es2015',
    cssCodeSplit: true,
    reportCompressedSize: false
  },
  optimizeDeps: {
    include: [
      'vue',
      'pinia',
      'vue-router',
      'vue-lazyload',
      'vue-toastification',
      '@heroicons/vue'
    ]
  },
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false
  },
  esbuild: {
    target: 'es2015'
  }
})
