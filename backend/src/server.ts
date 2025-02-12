import express, { Request, Response, NextFunction } from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import path from "path";
import errorHandler from "./middleware/errorHandler";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins (change this in production)
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

// Middleware to handle errors
app.use(errorHandler);

io.on("connection", (socket: Socket) => {
  console.log("A user connected:", socket.id);

  // Listen for incoming messages
  socket.on("chatMessage", (msg: string) => {
    if (typeof msg !== "string" || msg.trim() === "") {
      socket.emit("errorMessage", "Invalid message format");
      return;
    }
    console.log(`Message from ${socket.id}: ${msg}`);
    io.emit("chatMessage", msg); // Broadcast message to all clients
  });

  // Handle disconnect event
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export { app, server, io };
