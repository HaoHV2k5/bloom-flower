import { build, createServer, preview } from 'vite';
import { parseArgs } from 'node:util';

const { values } = parseArgs({ options: { port: { type: 'string', default: '5173' } } });
const port = Number(values.port);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Port không hợp lệ.');

const rootPath = process.platform === 'win32' ? process.cwd().slice(2) : process.cwd();
let server;
let watcher;
let shuttingDown = false;

async function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  await watcher?.close();
  if (server?.close) await server.close();
  else await new Promise(resolve => server?.httpServer?.close(resolve) ?? resolve());
  process.exit(0);
}
process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);

if (!rootPath.includes(':')) {
  server = await createServer({ server: { host: '127.0.0.1', port, strictPort: true } });
  await server.listen();
  server.printUrls();
} else {
  // Vite's source-file guard rejects ':' in file paths even within fs.allow.
  // Build-watch + static preview keeps that guard intact and serves the same app.
  console.log('Đường dẫn chứa dấu “:”: đang dùng build-watch + preview. Lưu sửa rồi tải lại trang.');
  watcher = await build({ logLevel: 'warn', build: { watch: {} } });
  let starting = false;
  watcher.on('event', async event => {
    if (event.code === 'ERROR') console.error(event.error);
    if (event.code !== 'END' || server || starting || shuttingDown) return;
    starting = true;
    try {
      server = await preview({ preview: { host: '127.0.0.1', port, strictPort: true } });
      server.printUrls();
    } catch (error) {
      console.error(error);
      await shutdown();
    }
  });
}
