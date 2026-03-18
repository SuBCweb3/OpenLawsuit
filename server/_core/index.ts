import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);

  // Audio upload endpoint for voice transcription
  app.post("/api/upload-audio", async (req, res) => {
    try {
      const { storagePut } = await import("../storage");
      const { nanoid } = await import("nanoid");
      const chunks: Buffer[] = [];
      req.on("data", (chunk: Buffer) => chunks.push(chunk));
      req.on("end", async () => {
        try {
          const body = Buffer.concat(chunks);
          // Parse multipart form data manually for audio file
          const contentType = req.headers["content-type"] || "";
          if (!contentType.includes("multipart/form-data")) {
            res.status(400).json({ error: "Expected multipart/form-data" });
            return;
          }
          const boundary = contentType.split("boundary=")[1];
          if (!boundary) {
            res.status(400).json({ error: "No boundary found" });
            return;
          }
          // Find the file data between boundaries
          const boundaryBuffer = Buffer.from(`--${boundary}`);
          const parts = [];
          let start = body.indexOf(boundaryBuffer);
          while (start !== -1) {
            const nextStart = body.indexOf(boundaryBuffer, start + boundaryBuffer.length);
            if (nextStart !== -1) {
              parts.push(body.subarray(start + boundaryBuffer.length, nextStart));
            }
            start = nextStart;
          }
          if (parts.length === 0) {
            res.status(400).json({ error: "No file found" });
            return;
          }
          const part = parts[0];
          const headerEnd = part.indexOf(Buffer.from("\r\n\r\n"));
          if (headerEnd === -1) {
            res.status(400).json({ error: "Invalid part" });
            return;
          }
          const fileData = part.subarray(headerEnd + 4, part.length - 2); // Remove trailing \r\n
          const fileKey = `audio/${nanoid()}.webm`;
          const { url } = await storagePut(fileKey, fileData, "audio/webm");
          res.json({ url });
        } catch (err: any) {
          console.error("Upload error:", err);
          res.status(500).json({ error: err.message });
        }
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
