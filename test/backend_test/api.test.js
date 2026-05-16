const path = require("path");
const os = require("os");
const fs = require("fs");
const request = require("supertest");

// fresh sqlite file for this test run (must be set before app + db load)
process.env.DB_PATH = path.join(os.tmpdir(), `ngo-api-test-${Date.now()}.db`);

const app = require("../../backend/src/app");

const validReport = {
  ngo_id: "NGO-TEST-1",
  month: "2025-04",
  people_helped: 10,
  events_conducted: 2,
  funds_utilized: 1000,
};

describe("Backend API (HTTP)", () => {
  afterAll(() => {
    try {
      fs.unlinkSync(process.env.DB_PATH);
    } catch (err) {
      if (err.code === "ENOENT") {
        return;
      }
      console.warn(
        "[api.test] could not remove temp DB file:",
        process.env.DB_PATH,
        err.message
      );
    }
  });

  describe("core routes", () => {
    test("POST /api/report — 201 on valid body", async () => {
      const res = await request(app)
        .post("/api/report")
        .send(validReport)
        .expect(201)
        .expect("Content-Type", /json/);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toBeDefined();
    });

    test("POST /api/report — 400 on invalid body", async () => {
      const res = await request(app)
        .post("/api/report")
        .send({ month: "2025-04" })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(Array.isArray(res.body.errors)).toBe(true);
    });

    test("GET /api/dashboard — 400 when month is invalid", async () => {
      await request(app)
        .get("/api/dashboard")
        .query({ month: "not-a-month" })
        .expect(400);
    });

    test("GET /api/dashboard — 200 for valid month", async () => {
      const res = await request(app)
        .get("/api/dashboard")
        .query({ month: "2025-04" })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });

    test("GET /api/months — 200 and array", async () => {
      const res = await request(app).get("/api/months").expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.months)).toBe(true);
    });
  });

  describe("edge cases", () => {
    test("GET /api/dashboard — 400 when month query is missing", async () => {
      await request(app).get("/api/dashboard").expect(400);
    });

    test("GET /api/dashboard — 400 for invalid calendar month (2025-13)", async () => {
      await request(app)
        .get("/api/dashboard")
        .query({ month: "2025-13" })
        .expect(400);
    });

    test("POST /api/report — 400 when month is not YYYY-MM", async () => {
      const res = await request(app)
        .post("/api/report")
        .send({
          ...validReport,
          month: "04-2025",
        })
        .expect(400);

      expect(res.body.errors.some((e) => e.includes("month"))).toBe(true);
    });

    test("POST /api/report — 400 when people_helped is negative", async () => {
      const res = await request(app)
        .post("/api/report")
        .send({ ...validReport, people_helped: -1 })
        .expect(400);

      expect(res.body.errors.some((e) => e.includes("people_helped"))).toBe(
        true
      );
    });

    test("POST /api/report — 400 when funds_utilized is not a number", async () => {
      const res = await request(app)
        .post("/api/report")
        .send({ ...validReport, funds_utilized: "lots" })
        .expect(400);

      expect(res.body.errors.some((e) => e.includes("funds_utilized"))).toBe(
        true
      );
    });

    test("POST /api/report — upsert returns 201 and GET dashboard reflects latest row", async () => {
      const base = {
        ngo_id: "NGO-UPSERT",
        month: "2025-06",
        people_helped: 1,
        events_conducted: 1,
        funds_utilized: 100,
      };

      await request(app).post("/api/report").send(base).expect(201);

      await request(app)
        .post("/api/report")
        .send({
          ...base,
          people_helped: 42,
          events_conducted: 3,
          funds_utilized: 200,
        })
        .expect(201);

      const res = await request(app)
        .get("/api/dashboard")
        .query({ month: "2025-06" })
        .expect(200);

      expect(res.body.data.total_people_helped).toBe(42);
      expect(res.body.data.total_events_conducted).toBe(3);
      expect(res.body.data.total_funds_utilized).toBeCloseTo(200, 5);
      expect(res.body.data.total_ngos).toBe(1);
    });

    test("GET /api/months — includes month after a report is saved", async () => {
      await request(app)
        .post("/api/report")
        .send({
          ngo_id: "NGO-MONTHS-LIST",
          month: "2025-07",
          people_helped: 1,
          events_conducted: 1,
          funds_utilized: 1,
        })
        .expect(201);

      const res = await request(app).get("/api/months").expect(200);
      expect(res.body.months).toContain("2025-07");
    });
  });
});