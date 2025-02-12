import request from "supertest";
import { createServer } from "http";
import { describe, test, expect, afterAll, beforeAll, it } from "@jest/globals";
import express from "express";

describe("Express Server", () => {
  let testServer: any;

  beforeAll((done) => {
    const app = express();
    app.get("/", (req, res) => {
      res.send("Hello World");
    });
    testServer = createServer(app).listen(() => {
      done();
    });
  });

  afterAll((done) => {
    testServer.close(done);
  });

  it("should respond with 'Hello World' on GET /", async () => {
    const res = await request(testServer).get("/");
    expect(res.status).toBe(200);
    expect(res.text).toBe("Hello World");
  });

  it("should handle 404 errors", async () => {
    const res = await request(testServer).get("/nonexistent");
    expect(res.status).toBe(404);
  });
});
