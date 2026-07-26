/* Minimal static server for the storyboard.
 *
 * Range support is not optional here: Chromium refuses to seek a <video> whose
 * server answers 200-with-full-body instead of 206, and the whole renderer is
 * built on per-frame seeking. Getting this wrong shows up as every frame
 * displaying t=0 of the clip.
 *
 *   node serve.mjs [port]     → serve ../ for manual preview
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, '..');

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.webm': 'video/webm',
  '.mp4':  'video/mp4',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg':  'image/svg+xml',
  '.woff2':'font/woff2',
  '.json': 'application/json'
};

export function startServer({ root = ROOT, port = 0 } = {}) {
  const server = http.createServer((req, res) => {
    let rel = decodeURIComponent(req.url.split('?')[0]);
    if (rel === '/') rel = '/storyboard.html';
    const file = path.join(root, path.normalize(rel).replace(/^(\.\.[/\\])+/, ''));

    if (!file.startsWith(root) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('not found: ' + rel);
    }

    const stat = fs.statSync(file);
    const type = TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream';
    const range = req.headers.range;

    if (range) {
      const m = /bytes=(\d*)-(\d*)/.exec(range);
      if (m) {
        const start = m[1] ? parseInt(m[1], 10) : 0;
        const end   = m[2] ? parseInt(m[2], 10) : stat.size - 1;
        if (start < stat.size && end < stat.size && start <= end) {
          res.writeHead(206, {
            'Content-Type': type,
            'Content-Range': `bytes ${start}-${end}/${stat.size}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': end - start + 1,
            'Cache-Control': 'no-store'
          });
          return fs.createReadStream(file, { start, end }).pipe(res);
        }
      }
    }

    res.writeHead(200, {
      'Content-Type': type,
      'Content-Length': stat.size,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'no-store'
    });
    fs.createReadStream(file).pipe(res);
  });

  return new Promise(resolve => {
    server.listen(port, '127.0.0.1', () => {
      resolve({ server, port: server.address().port, close: () => server.close() });
    });
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = parseInt(process.argv[2] || '8080', 10);
  const { port: p } = await startServer({ port });
  console.log(`storyboard → http://127.0.0.1:${p}/storyboard.html`);
  console.log(`render view → http://127.0.0.1:${p}/storyboard.html?render=1`);
}
