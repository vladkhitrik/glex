import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
const WEB_PORT = Number(process.env.WEB_PORT || 5173);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".wav": "audio/wav",
  ".mp3": "audio/mpeg",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".txt": "text/plain; charset=utf-8"
};

function send(res, code, body, type = "text/plain; charset=utf-8") {
  res.writeHead(code, {
    "Content-Type": type,
    "Cache-Control": "no-cache",
    "Access-Control-Allow-Origin": "*"
  });
  res.end(body);
}

function safeResolve(baseDir, requestPath) {
  const decoded = decodeURIComponent(requestPath.split("?")[0]);
  const clean = decoded === "/" ? "/index.html" : decoded;
  const target = path.normalize(path.join(baseDir, clean));
  if (!target.startsWith(baseDir)) return null;
  return target;
}

const server = http.createServer((req, res) => {
  const filePath = safeResolve(__dirname, req.url || "/");
  if (!filePath) {
    send(res, 403, "Forbidden");
    return;
  }

  fs.stat(filePath, (statErr, stat) => {
    if (statErr) {
      send(res, 404, "Not Found");
      return;
    }

    const finalPath = stat.isDirectory() ? path.join(filePath, "index.html") : filePath;
    fs.readFile(finalPath, (readErr, data) => {
      if (readErr) {
        send(res, 404, "Not Found");
        return;
      }
      const ext = path.extname(finalPath).toLowerCase();
      send(res, 200, data, MIME[ext] || "application/octet-stream");
    });
  });
});

server.listen(WEB_PORT, () => {
  console.log(`Web server listening on http://localhost:${WEB_PORT}`);
  if (process.argv.includes("--browser")) {
    const startPage = `http://localhost:${WEB_PORT}/flight-select-fresh.html`;
    const isWin = process.platform === "win32";
    const isMac = process.platform === "darwin";
    const cmd = isWin
      ? `start "" "${startPage}"`
      : isMac
      ? `open "${startPage}"`
      : `xdg-open "${startPage}"`;
    import("node:child_process").then(({ exec }) => exec(cmd));
  }
});

setTimeout(() => {
  process.title = "GLEX Web Server";
  process.stdout.write(`\x1b]2;${process.title}\x1b\\`);
}, 50);
