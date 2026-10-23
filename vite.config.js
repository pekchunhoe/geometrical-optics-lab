import {defineConfig} from 'vite';
export default defineConfig({
  base:'./',
  server:{watch:{ignored:['**/tmp/**','**/.cache/**','**/tests/**','**/docs/**']}},
  build:{rollupOptions:{output:{manualChunks(id){if(id.includes('/node_modules/katex/'))return 'mathematics';if(id.includes('/node_modules/three/'))return 'optical-graphics';}}}}
});
