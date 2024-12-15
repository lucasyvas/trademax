import request from "supertest";

import createApp, { CreateProps } from "./app";
import { MediaType } from "./models/v1";

const createTestApp = (options: Partial<CreateProps> = {}) => {
  return createApp(options.enableSwagger !== undefined ? { enableSwagger: options.enableSwagger } : {});
};

describe("app", () => {
  it("Succeeds accessing /health", async () => {
    const response = await request(await createTestApp()).get("/health");
    expect(response.status).toBe(204);
  });

  it("Redirects / to /api/docs when Swagger UI enabled", async () => {
    const response = await request(await createTestApp({ enableSwagger: true })).get("/");
    expect(response.status).toBe(302);
    expect(response.header["location"]).toBe("/api/docs");
  });

  it("Succeeds calling /api/v1/documents route", async () => {
    const response = await request(await createTestApp())
      .post("/api/v1/documents")
      .set("Content-Type", MediaType.Json)
      .set("Accept", MediaType.Json)
      .send({ a: [] });

    expect(response.status).toBe(200);
  });
});
