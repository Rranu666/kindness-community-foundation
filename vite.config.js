import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'

// Mirror Netlify's rewrite rules in the Vite dev server so local == production
const netlifyRewrites = [
  { from: '/kindcalmunity', to: '/kindcalmunity.html' },
];

export default defineConfig({
  logLevel: 'error',
  plugins: [
    react(),
    {
      name: 'netlify-rewrite-dev',
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          for (const rule of netlifyRewrites) {
            if (req.url === rule.from || req.url?.startsWith(rule.from + '?')) {
              req.url = rule.to;
              break;
            }
          }
          next();
        });
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
