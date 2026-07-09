import http from "node:http";
import url from "node:url";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

// Lightweight .env loading without external dependency.
try {
  const dotenv = await import("dotenv");
  dotenv.default.config({ path: `${__dirname}/.env` });
} catch {
  // dotenv is optional in this workspace.
}

const API_PORT = Number(process.env.API_PORT || 5050);

async function startSocketlessServer() {
  const [{ createServer }, { ServerClass }] = await Promise.all([
    import("socketless"),
    import("./src/classes/index.js")
  ]);

  const { webserver } = createServer(ServerClass);
  webserver.listen(API_PORT, () => {
    console.log(`Socketless API server listening on http://localhost:${API_PORT}`);
  });
}

function startFallbackServer() {
  const server = http.createServer((req, res) => {
    const now = new Date().toISOString();
    if (req.url === "/health") {
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ ok: true, mode: "fallback", time: now }));
      return;
    }

    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(
      JSON.stringify({
        ok: true,
        mode: "fallback",
        message:
          "Socketless dependencies not found. Install socketless and ./src/classes to run full API mode.",
        time: now
      })
    );
  });

  server.listen(API_PORT, () => {
    console.log(`Fallback API server listening on http://localhost:${API_PORT}`);
    console.log(`Health check: http://localhost:${API_PORT}/health`);
  });
}

try {
  await startSocketlessServer();
} catch (err) {
  console.warn("Socketless API mode unavailable, starting fallback server.");
  console.warn(err?.message || err);
  startFallbackServer();
}

setTimeout(() => {
  process.title = "GLEX API Server";
  process.stdout.write(`\x1b]2;${process.title}\x1b\\`);
}, 50);
