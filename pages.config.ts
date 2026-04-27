import type { Config } from '@cloudflare/pages';

export default {
  build: {
    cwd: 'frontend',
    command: 'npm install && npm run build',
    root_dir: 'dist'
  },
  env: {
    production: {
      env: {
        VITE_API_URL: 'https://api.aba-child.pages.dev'
      }
    }
  }
} satisfies Config;
