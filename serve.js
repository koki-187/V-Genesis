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
      time: new Date().toISOString(),
      localIp: (function() {
        const nets = require('os').networkInterfaces();
        for (const n of Object.values(nets)) for (const a of n) if (a.family==='IPv4'&&!a.internal) return a.address;
        return 'localhost';
      })()
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

  // ── API: FFmpeg ワンクリック実行 ──
  if (req.url === '/api/exec' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      let parsed;
      try { parsed = JSON.parse(body); } catch(e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: 'Invalid JSON' }));
        return;
      }
      const cmd = (parsed.cmd || '').trim();
      // セキュリティ: ffmpegコマンドのみ許可
      if (!cmd.startsWith('ffmpeg')) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: 'Only ffmpeg commands are allowed' }));
        return;
      }
      console.log('[FFmpeg] Executing:', cmd.substring(0, 80) + '...');
      exec(cmd, { shell: 'cmd.exe', timeout: 300000 }, (err, stdout, stderr) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        if (err) {
          console.error('[FFmpeg] Error:', err.message);
          res.end(JSON.stringify({ ok: false, error: err.message, stderr: stderr || '' }));
        } else {
          console.log('[FFmpeg] Done:', stdout.substring(0, 100));
          res.end(JSON.stringify({ ok: true, stdout: stdout || 'OK', stderr: stderr || '' }));
        }
      });
    });
    return;
  }

  // ── IOPaint 統合 ───────────────────────────────────────────────────
  const IOPAINT_EXE  = 'C:\\Users\\reale\\Downloads\\IOPaint-v1.1\\installer\\Scripts\\iopaint.exe';
  const IOPAINT_PYEXE = 'C:\\Users\\reale\\Downloads\\IOPaint-v1.1\\installer\\python.exe';
  const IOPAINT_PORT_IOP = 8081;

  function execPromise(cmd, opts) {
    return new Promise((resolve, reject) => {
      exec(cmd, { shell: 'cmd.exe', timeout: 600000, ...opts }, (err, stdout, stderr) => {
        if (err) reject(Object.assign(err, { stdout, stderr }));
        else resolve({ stdout, stderr });
      });
    });
  }

  // IOPaint ステータス確認 GET /api/iopaint/status
  if (req.url === '/api/iopaint/status' && req.method === 'GET') {
    const http2 = require('http');
    const chk = http2.get('http://localhost:' + IOPAINT_PORT_IOP + '/api/v1/server-config', (r) => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end', () => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        try {
          const cfg = JSON.parse(d);
          res.end(JSON.stringify({ running: true, model: cfg.name || cfg.model || 'lama', port: IOPAINT_PORT_IOP }));
        } catch(_) {
          res.end(JSON.stringify({ running: r.statusCode < 400, port: IOPAINT_PORT_IOP }));
        }
      });
    });
    chk.on('error', () => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ running: false, port: IOPAINT_PORT_IOP }));
    });
    chk.setTimeout(3000, () => { chk.destroy(); });
    return;
  }

  // IOPaint 自動起動 POST /api/iopaint/start
  if (req.url === '/api/iopaint/start' && req.method === 'POST') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      let p; try { p = JSON.parse(body); } catch(_) { p = {}; }
      const model  = (p.model  || 'lama').replace(/[^a-zA-Z0-9._-]/g, '');
      const device = (p.device || 'cpu').replace(/[^a-zA-Z0-9]/g, '');
      if (!fs.existsSync(IOPAINT_EXE)) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: 'IOPaint not found: ' + IOPAINT_EXE }));
        return;
      }
      // 既に起動中か確認
      const http2 = require('http');
      const chk = http2.get('http://localhost:' + IOPAINT_PORT_IOP + '/api/v1/server-config', (r) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, message: 'IOPaint already running', port: IOPAINT_PORT_IOP }));
      });
      chk.on('error', () => {
        // 起動していないので起動
        const { spawn } = require('child_process');
        const proc = spawn(IOPAINT_EXE, ['start', '--model', model, '--device', device, '--port', String(IOPAINT_PORT_IOP), '--host', '127.0.0.1'], {
          detached: true,
          stdio: 'ignore',
          windowsHide: true
        });
        proc.unref();
        console.log('[IOPaint] Launched PID:', proc.pid, 'model:', model, 'device:', device);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, message: 'IOPaint starting...', pid: proc.pid, model, device }));
      });
      chk.setTimeout(2000, () => { chk.destroy(); });
    });
    return;
  }

  // IOPaint 単一フレームプロキシ POST /api/iopaint/inpaint (CORS回避)
  if (req.url === '/api/iopaint/inpaint' && req.method === 'POST') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      const postData = body;
      const http2 = require('http');
      const opt = {
        hostname: 'localhost', port: IOPAINT_PORT_IOP,
        path: '/api/v1/inpaint', method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) },
        timeout: 120000
      };
      const iop = http2.request(opt, (iopRes) => {
        const chunks = [];
        iopRes.on('data', c => chunks.push(c));
        iopRes.on('end', () => {
          res.writeHead(iopRes.statusCode, {
            'Content-Type': iopRes.headers['content-type'] || 'image/jpeg',
            'Access-Control-Allow-Origin': '*'
          });
          res.end(Buffer.concat(chunks));
        });
      });
      iop.on('error', err => {
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'IOPaint proxy: ' + err.message }));
      });
      iop.write(postData);
      iop.end();
    });
    return;
  }

  // IOPaint 動画一括処理 POST /api/iopaint/process-video (SSE)
  if (req.url === '/api/iopaint/process-video' && req.method === 'POST') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      let p; try { p = JSON.parse(body); } catch(e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: 'Invalid JSON' }));
        return;
      }

      const videoPath  = (p.videoPath  || '').trim();
      const outputPath = (p.outputPath || videoPath.replace(/(\.[^.]+)?$/, '_clean.mp4')).trim();
      const regions    = Array.isArray(p.regions) ? p.regions : [];
      const fps        = Math.max(1, Math.min(60, Number(p.fps) || 30));
      const quality    = Math.max(10, Math.min(30, Number(p.quality) || 16));
      const model      = (p.model || 'lama').replace(/[^a-zA-Z0-9._-]/g, '');
      const os2        = require('os');

      if (!videoPath) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: 'videoPath required' }));
        return;
      }

      // SSE ヘッダー
      res.writeHead(200, {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
      });

      const sse = (data) => {
        if (!res.writableEnded) res.write('data: ' + JSON.stringify(data) + '\n\n');
      };

      (async () => {
        const tmpBase   = path.join(os2.tmpdir(), 'vp4_iop_' + Date.now());
        const framesDir = path.join(tmpBase, 'frames');
        const masksDir  = path.join(tmpBase, 'masks');
        const outDir    = path.join(tmpBase, 'output');
        try {
          fs.mkdirSync(framesDir, { recursive: true });
          fs.mkdirSync(masksDir,  { recursive: true });
          fs.mkdirSync(outDir,    { recursive: true });

          // ── Step 1: フレーム抽出 ──
          sse({ type: 'progress', step: 1, total: 4, pct: 5, msg: 'フレーム抽出中...' });
          await execPromise(`ffmpeg -i "${videoPath}" -q:v 2 "${path.join(framesDir, 'frame_%04d.png')}" -y`);
          const frames = fs.readdirSync(framesDir).filter(f => f.endsWith('.png')).sort();
          sse({ type: 'progress', step: 1, total: 4, pct: 20, msg: frames.length + 'フレーム抽出完了', frames: frames.length });

          // ── Step 2: Pythonでマスク生成 + IOPaint バッチ ──
          sse({ type: 'progress', step: 2, total: 4, pct: 25, msg: 'AI処理準備中...' });

          // Pythonスクリプト生成
          const regionsJson = JSON.stringify(regions);
          const pyScript = `
import os, sys, io, base64, json, time, urllib.request, urllib.error
from PIL import Image, ImageDraw

FRAMES_DIR = r"${framesDir.replace(/\\/g, '\\\\')}"
MASKS_DIR  = r"${masksDir.replace(/\\/g, '\\\\')}"
OUT_DIR    = r"${outDir.replace(/\\/g, '\\\\')}"
REGIONS    = json.loads(r'${regionsJson.replace(/'/g, "\\'")}')
FPS        = ${fps}
IOP_URL    = "http://localhost:${IOPAINT_PORT_IOP}/api/v1/inpaint"

def make_mask(W, H, t):
    img = Image.new("L", (W, H), 0)
    d   = ImageDraw.Draw(img)
    for r in REGIONS:
        s = float(r.get("startSec", 0))
        e = float(r.get("endSec",   9999))
        if s <= t < e or (s == 0 and e == 9999):
            x,y,w,h = int(r["x"]),int(r["y"]),int(r["w"]),int(r["h"])
            d.rectangle([x, y, min(x+w, W-2), min(y+h, H-2)], fill=255)
    return img

def b64_image(pil_img, fmt="JPEG"):
    buf = io.BytesIO()
    pil_img.save(buf, format=fmt, quality=95)
    return base64.b64encode(buf.getvalue()).decode()

frames = sorted(f for f in os.listdir(FRAMES_DIR) if f.endswith(".png"))
total  = len(frames)
print(f"TOTAL:{total}", flush=True)

for i, fname in enumerate(frames):
    t = i / FPS
    fp = os.path.join(FRAMES_DIR, fname)
    img = Image.open(fp).convert("RGB")
    W, H = img.size
    mask = make_mask(W, H, t)

    # マスクが全黒（除去なし）なら元画像をコピー
    if mask.getbbox() is None:
        img.save(os.path.join(OUT_DIR, fname), "PNG")
        print(f"SKIP:{i+1}/{total}", flush=True)
        continue

    # IOPaint API呼び出し
    payload = json.dumps({"image": b64_image(img), "mask": b64_image(mask)}).encode()
    req = urllib.request.Request(IOP_URL, data=payload, headers={"Content-Type": "application/json"}, method="POST")
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=120) as resp:
                result_bytes = resp.read()
            out_img = Image.open(io.BytesIO(result_bytes)).convert("RGB")
            out_img.save(os.path.join(OUT_DIR, fname), "PNG")
            print(f"DONE:{i+1}/{total}", flush=True)
            break
        except Exception as ex:
            if attempt == 2:
                # フォールバック: 元画像をコピー
                img.save(os.path.join(OUT_DIR, fname), "PNG")
                print(f"FALLBACK:{i+1}/{total}:{ex}", flush=True)
            else:
                time.sleep(2)

print("FINISHED", flush=True)
`;
          const pyScriptPath = path.join(tmpBase, 'batch.py');
          fs.writeFileSync(pyScriptPath, pyScript, 'utf8');

          // Pythonスクリプト実行 (SSE進捗連動)
          await new Promise((resolve, reject) => {
            const { spawn } = require('child_process');
            const pyProc = spawn(IOPAINT_PYEXE, [pyScriptPath], { stdio: ['ignore', 'pipe', 'pipe'] });
            let totalFrames = 0;
            pyProc.stdout.on('data', (chunk) => {
              const lines = chunk.toString().split('\n').filter(Boolean);
              lines.forEach(line => {
                if (line.startsWith('TOTAL:')) {
                  totalFrames = parseInt(line.split(':')[1]) || 0;
                } else if (line.startsWith('DONE:') || line.startsWith('SKIP:') || line.startsWith('FALLBACK:')) {
                  const parts = line.split(':');
                  const cur = parseInt(parts[1]) || 0;
                  const pct = totalFrames > 0 ? Math.round(20 + (cur / totalFrames) * 55) : 50;
                  sse({ type: 'progress', step: 2, total: 4, pct, msg: `AI処理中 ${cur}/${totalFrames}フレーム`, cur, totalFrames });
                } else if (line === 'FINISHED') {
                  sse({ type: 'progress', step: 2, total: 4, pct: 75, msg: 'AI処理完了' });
                }
              });
            });
            pyProc.stderr.on('data', d => console.error('[IOPaint batch]', d.toString().trim()));
            pyProc.on('exit', code => { if (code === 0) resolve(); else reject(new Error('Python batch failed code=' + code)); });
          });

          // ── Step 3: 動画再エンコード ──
          sse({ type: 'progress', step: 3, total: 4, pct: 80, msg: '動画再エンコード中 (H.264 CRF' + quality + ')...' });
          const audioMap = fs.existsSync(videoPath) ? `-i "${videoPath}" -map 0:v -map 1:a?` : `-map 0:v`;
          const reencCmd = `ffmpeg -framerate ${fps} -i "${path.join(outDir, 'frame_%04d.png')}" -i "${videoPath}" -map 0:v -map 1:a? -c:v libx264 -crf ${quality} -preset fast -pix_fmt yuv420p -profile:v high -level 4.1 -c:a aac -b:a 192k -movflags +faststart "${outputPath}" -y`;
          await execPromise(reencCmd);

          const stat = fs.statSync(outputPath);
          sse({ type: 'progress', step: 4, total: 4, pct: 100, msg: '完了！' });
          sse({ type: 'done', outputPath, sizeBytes: stat.size, frames: frames.length });

        } catch(e) {
          console.error('[IOPaint process-video]', e.message);
          sse({ type: 'error', error: e.message });
        } finally {
          // 一時ファイル削除（非同期）
          try { fs.rmSync(tmpBase, { recursive: true, force: true }); } catch(_) {}
        }
        res.end();
      })();
    });
    return;
  }

  // ── API: 画像生成プロキシ (Pollinations.ai / Turnstileバイパス) ──
  if (req.url.startsWith('/api/generate-image') && req.method === 'GET') {
    const urlObj = new URL('http://localhost' + req.url);
    const prompt = urlObj.searchParams.get('prompt') || 'photorealistic portrait';
    const width  = urlObj.searchParams.get('width')  || '576';
    const height = urlObj.searchParams.get('height') || '1024';
    const model  = urlObj.searchParams.get('model')  || 'flux';
    const seed   = urlObj.searchParams.get('seed')   || String(Math.floor(Math.random() * 99999));
    const nologo = urlObj.searchParams.get('nologo') || 'true';
    const enhance = urlObj.searchParams.get('enhance') || 'true';

    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`
      + `?width=${width}&height=${height}&model=${model}&seed=${seed}&nologo=${nologo}&enhance=${enhance}`;

    console.log('[Image] Proxying to Pollinations:', prompt.substring(0, 60) + '...');
    const https = require('https');
    const imgReq = https.get(pollinationsUrl, imgRes => {
      if (imgRes.statusCode !== 200) {
        res.writeHead(imgRes.statusCode, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Pollinations returned ' + imgRes.statusCode }));
        return;
      }
      res.writeHead(200, {
        'Content-Type': imgRes.headers['content-type'] || 'image/jpeg',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*'
      });
      imgRes.pipe(res);
    });
    imgReq.on('error', err => {
      console.error('[Image] Proxy error:', err.message);
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    });
    imgReq.setTimeout(60000, () => {
      imgReq.destroy();
      res.writeHead(504, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Timeout after 60s' }));
    });
    return;
  }

  // ── API: Claude APIプロキシ (CORSバイパス) ──
  if (req.url === '/api/claude' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const apiKey = ENV.ANTHROPIC_API_KEY;
      if (!apiKey) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'API key not configured in .env' }));
        return;
      }
      const https = require('https');
      const postData = body;
      const options = {
        hostname: 'api.anthropic.com',
        path: '/v1/messages',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Length': Buffer.byteLength(postData)
        }
      };
      const apiReq = https.request(options, apiRes => {
        let data = '';
        apiRes.on('data', chunk => data += chunk);
        apiRes.on('end', () => {
          res.writeHead(apiRes.statusCode, { 'Content-Type': 'application/json' });
          res.end(data);
        });
      });
      apiReq.on('error', err => {
        console.error('[Claude API] Proxy error:', err.message);
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Proxy error: ' + err.message }));
      });
      apiReq.write(postData);
      apiReq.end();
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
