import http from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { applyEvent, canApplyEvent, EventType, initialJourney } from "./src/state.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || "0.0.0.0";
const clients = new Set();
let journey = structuredClone(initialJourney);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon"
};

function json(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*"
  });
  res.end(JSON.stringify(payload));
}

function broadcast(eventName, payload) {
  const message = `event: ${eventName}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const res of clients) res.write(message);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 100_000) {
        reject(new Error("Request body too large."));
        req.destroy();
      }
    });
    req.on("end", () => {
      try { resolve(body ? JSON.parse(body) : {}); }
      catch { reject(new Error("Invalid JSON body.")); }
    });
    req.on("error", reject);
  });
}

function isKnownRole(role) { return role === "patient" || role === "staff"; }

function roleCanSend(role, type) {
  if (role === "patient") return type === EventType.PATIENT_ARRIVED;
  if (role === "staff") return [
    EventType.CHECKED_IN,
    EventType.QUEUE_ADVANCED,
    EventType.ROOM_CHANGED,
    EventType.CALL_PATIENT,
    EventType.START_CONSULTATION,
    EventType.COMPLETE_CONSULTATION
  ].includes(type);
  return false;
}

function serveStatic(req, res) {
  let requestPath;
  try {
    requestPath = decodeURIComponent(new URL(req.url, `http://${req.headers.host || "localhost"}`).pathname);
  } catch {
    res.writeHead(400); res.end("Bad request"); return;
  }

  if (requestPath === "/") requestPath = "/index.html";
  const normalized = path.normalize(requestPath).replace(/^([.][.][\\/])+/, "");
  const filePath = path.join(__dirname, normalized);

  if (!filePath.startsWith(__dirname) || !existsSync(filePath) || !statSync(filePath).isFile()) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  readFile(filePath)
    .then((data) => {
      res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream", "Cache-Control": "no-cache" });
      res.end(data);
    })
    .catch(() => { res.writeHead(500); res.end("Could not read file"); });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    });
    res.end();
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/state") {
    json(res, 200, { journey });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/events") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "X-Accel-Buffering": "no"
    });
    res.write(": connected\n\n");
    res.write(`event: journey\ndata: ${JSON.stringify({ journey })}\n\n`);
    clients.add(res);
    req.on("close", () => clients.delete(res));
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/event") {
    try {
      const body = await readBody(req);
      const { role, type, ...extra } = body;
      if (!isKnownRole(role)) return json(res, 403, { error: "Choose a demo role first." });
      if (!Object.values(EventType).includes(type)) return json(res, 400, { error: "Unknown journey event." });
      if (!roleCanSend(role, type)) return json(res, 403, { error: "That role cannot trigger this event." });
      if (!canApplyEvent(journey, type)) return json(res, 409, { error: `That action is not available while the journey is ${journey.state}.` });
      journey = applyEvent(journey, { type, ...extra });
      broadcast("journey", { journey });
      return json(res, 200, { journey });
    } catch (error) {
      return json(res, 400, { error: error.message || "Could not update the journey." });
    }
  }

  if (req.method === "POST" && url.pathname === "/api/reset") {
    try {
      const body = await readBody(req);
      if (body.role !== "staff") return json(res, 403, { error: "Only staff can reset the synthetic journey." });
      journey = structuredClone(initialJourney);
      broadcast("reset", { journey });
      return json(res, 200, { journey });
    } catch (error) {
      return json(res, 400, { error: error.message || "Could not reset the journey." });
    }
  }

  serveStatic(req, res);
});

setInterval(() => {
  for (const res of clients) res.write(": heartbeat\n\n");
}, 20_000).unref();

server.listen(PORT, HOST, () => {
  console.log(`\nCarePath demo server running on http://localhost:${PORT}`);
  console.log(`Open the same URL on the patient laptop and the staff phone using this computer's LAN IP.`);
  console.log(`Example: http://192.168.1.10:${PORT}\n`);
});
