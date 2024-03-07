import request from "supertest";
import app from "../../../app"; // Express 앱의 주요 파일

describe("GET /api/v1/alive", () => {
  let response: any;

  beforeAll(async () => {
    response = await request(app).get("/api/v1/alive");
  });

  it("should return JSON data", async () => {
    expect(response.status).toBe(200);
    expect(response.type).toMatch(/json/);
  });

  it("should return success statue", async () => {
    const responseData = response.body;

    expect(responseData).toHaveProperty("status");
    expect(responseData.status).toBe("success");
  });

  it("should return 'I'm alive message", async () => {
    const responseData = response.body;

    expect(responseData).toHaveProperty("message");
    expect(responseData.message).toBe("I'm alive");
  });

  it("should return null data", async () => {
    const responseData = response.body;

    expect(responseData).toHaveProperty("data");
    expect(responseData.data).toBe(null);
  });
});
