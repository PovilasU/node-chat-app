import request from "supertest";
import { Server } from "socket.io";
import { createServer } from "http";
import { app, server, io } from "../src/server";
import { describe, test, expect, afterAll, beforeAll, it } from "@jest/globals";
import { AddressInfo } from "net";
import { io as Client } from "socket.io-client";

describe("Express Server", () => {
  let testServer: any;

  beforeAll((done) => {
    testServer = server.listen(() => {
      done();
    });
  });

  afterAll((done) => {
    testServer.close(done);
  });

  it("should serve static files", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
  });

  it("should handle 404 errors", async () => {
    const res = await request(app).get("/nonexistent");
    expect(res.status).toBe(404);
  });
});

describe("Socket.io Server", () => {
  let ioServer: Server;
  let clientSocket: any;
  let httpServer: any;

  beforeAll((done) => {
    httpServer = createServer();
    ioServer = new Server(httpServer);
    httpServer.listen(() => {
      const { port } = httpServer.address() as AddressInfo;
      clientSocket = Client(`http://localhost:${port}`);
      ioServer.on("connection", (socket) => {
        socket.on("chatMessage", (msg: string) => {
          if (typeof msg !== "string" || msg.trim() === "") {
            socket.emit("errorMessage", "Invalid message format");
          } else {
            ioServer.emit("chatMessage", msg);
          }
        });
      });
      clientSocket.on("connect", done);
    });
  });

  afterAll(() => {
    ioServer.close();
    clientSocket.close();
    httpServer.close();
  });

  it("should connect to the socket server", (done) => {
    clientSocket.on("connect", () => {
      expect(clientSocket.connected).toBe(true);
      done();
    });
  });

  it("should handle valid chat messages", (done) => {
    const testMessage = "Hello, World!";
    clientSocket.emit("chatMessage", testMessage);
    clientSocket.on("chatMessage", (msg: string) => {
      expect(msg).toBe(testMessage);
      done();
    });
  });

  it("should handle invalid chat messages", (done) => {
    clientSocket.emit("chatMessage", "");
    clientSocket.on("errorMessage", (msg: string) => {
      expect(msg).toBe("Invalid message format");
      done();
    });
  });

  it("should handle disconnect event", (done) => {
    clientSocket.on("disconnect", () => {
      expect(clientSocket.connected).toBe(false);
      done();
    });
    clientSocket.close();
  });
});
