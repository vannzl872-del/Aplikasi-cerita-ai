import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import { defineConfig, Plugin } from 'vite';

function localExportPlugin(): Plugin {
  return {
    name: 'local-export-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (
          req.url?.startsWith('/api/export-local-video') ||
          req.url?.startsWith('/api/render-local-mp4')
        ) {
          try {
            const url = new URL(req.url, 'http://localhost:3000');
            const lang = url.searchParams.get('lang') || 'id';
            const mp4FileName =
              lang === 'en'
                ? 'pramuka_pos_benteng_kosong_16x9_en.mp4'
                : 'pramuka_pos_benteng_kosong_16x9.mp4';
            const filePath = path.resolve(__dirname, 'public', mp4FileName);

            // Re-render if not found
            if (!fs.existsSync(filePath)) {
              await new Promise<void>((resolve, reject) => {
                exec(
                  `python3 scripts/render_movie.py --lang ${lang} --output "${filePath}"`,
                  (err) => {
                    if (err) reject(err);
                    else resolve();
                  }
                );
              });
            }

            const stat = fs.statSync(filePath);
            res.writeHead(200, {
              'Content-Type': 'video/mp4',
              'Content-Length': stat.size,
              'Content-Disposition': `attachment; filename="${mp4FileName}"`,
              'Accept-Ranges': 'bytes',
            });
            const stream = fs.createReadStream(filePath);
            return stream.pipe(res);
          } catch (err: unknown) {
            console.error('Error serving local MP4:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(
              JSON.stringify({ error: (err as Error).message || 'Failed to render MP4' })
            );
          }
        }
        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), localExportPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
