import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import {handleSharedApplicants} from './server/sharedApplicants';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  process.env.CLICKUP_API_TOKEN = env.CLICKUP_API_TOKEN;
  process.env.CLICKUP_LIST_ID = env.CLICKUP_LIST_ID;
  return {
    plugins: [
      react(),
      {
        name: 'shared-applicants-api',
        configureServer(server) {
          server.middlewares.use('/api/applicants', (req, res) => {
            void handleSharedApplicants(req, res);
          });
        },
      },
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
