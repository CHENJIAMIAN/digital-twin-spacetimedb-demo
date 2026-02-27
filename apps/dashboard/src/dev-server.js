import http from 'http';
import { readFileSync } from 'fs';
import { join } from 'path';

const html = readFileSync(join(process.cwd(), 'src/index.html'), 'utf8');
http.createServer((_req, res) => {
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
  res.end(html);
}).listen(5173, () => console.log('[dashboard] http://localhost:5173'));
