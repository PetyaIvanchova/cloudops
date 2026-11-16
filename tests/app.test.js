
const request = require("supertest");
const app = require("../app");

describe("CloudOps API", () => {
  test("GET /health returns healthy status", async () => {
    const response = await request(app).get("/health");

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("healthy");
  });

  test("GET /tasks returns an array", async () => {
    const response = await request(app).get("/tasks");

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test("POST /tasks creates a task", async () => {
    const response = await request(app)
      .post("/tasks")
      .send({ title: "Learn Jenkins" });

    expect(response.statusCode).toBe(201);
    expect(response.body.title).toBe("Learn Jenkins");
    expect(response.body.completed).toBe(false);
  });

  test("POST /tasks rejects an empty title", async () => {
    const response = await request(app)
      .post("/tasks")
      .send({ title: "" });

    expect(response.statusCode).toBe(400);
  });
});
