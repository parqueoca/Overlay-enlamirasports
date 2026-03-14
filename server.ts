import express from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const server = createServer(app);
  const wss = new WebSocketServer({ server });
  const PORT = Number(process.env.PORT) || 3000;

  let gameState: any = null;

  wss.on("connection", (ws) => {
    console.log("Client connected");
    
    // Send current state to new client
    if (gameState) {
      ws.send(JSON.stringify({ type: "UPDATE_STATE", state: gameState }));
    }

    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === "UPDATE_STATE") {
          gameState = data.state;
          // Broadcast to all other clients
          wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({ type: "UPDATE_STATE", state: gameState }));
            }
          });
        } else if (data.type === "REQUEST_STATE") {
          if (gameState) {
            ws.send(JSON.stringify({ type: "UPDATE_STATE", state: gameState }));
          }
        }
      } catch (e) {
        console.error("Error processing message", e);
      }
    });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
