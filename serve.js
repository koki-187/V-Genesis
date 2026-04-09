const http = require('http');
const fs   = require('fs');
const path = require('path');
const { exec } = require('child_process');

// ── .env 読み込み（複数パスを順番に探す）──────────────────────────
const ENV_PATHS = [
  path.join(__dirname, '.env'),
  'H:/マイドライブ/★★★プライベート用★★★/V-Genesis/.env/V-Genesis.env',
  'H:/マイドライブ/★★★プライベート用★★★/V-Genesis/.env',
  path.join(process.env.USERPROFILE || '', '.env'),
];

function loadEnv() {
  for (const p of ENV_PATHS) {
    try {
      const raw = fs.readFileSync(p, 'utf8');
      const env = {};
      raw.split(/\r?\n/).forEach(line => {
        const m = line.match(/^\s*([^#=\s]+)\s*=\s*"?([^"\r\n]*)"?\s*$/);
        if (m) env[m[1]] = m[2];
      });
      if (env.ANTHROPIC_API_KEY) {
        console.log(`[ENV] Loaded from: ${p}`);
        return env;
      }
    } catch (_) {}
  }
  console.warn('[ENV] No .env found — API key injection skipped');
  return {};
}

const ENV = loadEnv();

// ── VOICEVOX ショートカットパス ─────────────────────────────────────
const VOICEVOX_LNK = 'H:\\マイドライブ\\★★★プライベート用★★★\\V-Genesis\\VOICEVOX.lnk';

// ── HTML に設定を注入する ────────────────────────────────────────
function injectConfig(html) {
  const inject = `<script id="vp4-env-inject">
(function(){
  var cfg = {
    apiKey:   ${JSON.stringify(ENV.ANTHROPIC_API_KEY   || '')},
    proxyUrl: ${JSON.stringify(ENV.ANTHROPIC_PROXY_URL || 'http://localhost:3001/v1/messages')},
    outputDir:${JSON.stringify(ENV.VP4_OUTPUT_DIR      || 'C:\\\\VideoProduction')},
    brand:    ${JSON.stringify(ENV.VP4_DEFAULT_BRAND   || '')},
    soraDeadline: ${JSON.stringify(ENV.SORA_DEADLINE   || '2026-04-26T23:59:59+09:00')}
  };
  if(cfg.apiKey && !localStorage.getItem('vp4_api_key'))
    localStorage.setItem('vp4_api_key', cfg.apiKey);
  if(cfg.proxyUrl && !localStorage.getItem('vp4_proxy_url'))
    localStorage.setItem('vp4_proxy_url', cfg.proxyUrl);
  if(cfg.outputDir)
    localStorage.setItem('vp4_output_dir', cfg.outputDir);
  window.__VP4_ENV = cfg;
  console.log('[VP4] ENV injected — API key:', cfg.apiKey ? 'SET' : 'NOT SET',
              '| Proxy:', cfg.proxyUrl);
})();
</script>`;
  return html.replace('</head>', inject + '\n</head>');
}

// ── MIME タイプ ─────────────────────────────────────────────────────
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.png':  'image/png',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.webmanifest': 'application/manifest+json',
};

// ── HTTP サーバー ────────────────────────────────────────────────
const PORT = process.env.PORT || 8765;

const server = http.createServer((req, res) => {
  // CORS headers for API endpoints
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // ── API: ヘルスチェック ──
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      port: PORT,
      apiKey: ENV.ANTHROPIC_API_KEY ? 'SET' : 'NOT SET',
      proxy: ENV.ANTHROPIC_PROXY_URL || 'http://localhost:3001/v1/messages',
      videoDir: ENV.VP4_OUTPUT_DIR || 'C:\\VideoProduction',
      time: new Date().toISOString()
    }));
    return;
  }

  // ── API: VOICEVOX 起動 ──
  if (req.url === '/api/launch-voicevox' && req.method === 'POST') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    // .lnk ファイル存在チェック
    if (!fs.existsSync(VOICEVOX_LNK)) {
      res.end(JSON.stringify({ ok: false, error: 'VOICEVOX.lnk not found: ' + VOICEVOX_LNK }));
      return;
    }
    // Windows start コマンドでショートカットを実行
    exec(`start "" "${VOICEVOX_LNK}"`, { shell: 'cmd.exe' }, (err) => {
      if (err) {
        console.error('[VOICEVOX] Launch error:', err.message);
        res.end(JSON.stringify({ ok: false, error: err.message }));
      } else {
        console.log('[VOICEVOX] Launch command sent');
        res.end(JSON.stringify({ ok: true, message: 'VOICEVOX launch initiated' }));
      }
    });
    return;
  }

  // ── 静的ファイル配信 (PWA対応) ──
  let urlPath = req.url.split('?')[0];
  if (urlPath === '/' || urlPath === '/index.html') {
    // メインHTML — ENV注入付き
    const file = path.join(__dirname, 'index.html');
    fs.readFile(file, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading index.html: ' + err.message);
        return;
      }
      const html = injectConfig(data);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
    });
    return;
  }

  // manifest.json, sw.js, icons etc.
  const safePath = path.normalize(urlPath).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(__dirname, safePath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════╗');
  console.log('║  VIDEO PIPELINE v5  —  V-Genesis     ║');
  console.log(`║  http://localhost:${PORT}               ║`);
  console.log(`║  Health: http://localhost:${PORT}/health ║`);
  console.log('╠══════════════════════════════════════╣');
  console.log('║  VOICEVOX: /api/launch-voicevox      ║');
  console.log('║  PWA:     manifest.json + sw.js      ║');
  console.log('╚══════════════════════════════════════╝');
  console.log('');
  console.log(`API Key : ${ENV.ANTHROPIC_API_KEY ? '✅ SET' : '❌ NOT SET'}`);
  console.log(`Proxy   : ${ENV.ANTHROPIC_PROXY_URL || 'http://localhost:3001/v1/messages (default)'}`);
  console.log(`Output  : ${ENV.VP4_OUTPUT_DIR || 'C:\\VideoProduction (default)'}`);
  console.log(`VOICEVOX: ${fs.existsSync(VOICEVOX_LNK) ? '✅ LNK found' : '❌ LNK not found'}`);
  console.log('');
});
