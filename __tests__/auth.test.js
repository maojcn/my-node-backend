const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/app");
const User = require("../src/models/User");

// Setup and teardown
beforeAll(async () => {
  // Connect to a test database if needed
});

afterEach(async () => {
  // Clean up test data
  await User.deleteMany({});
});

afterAll(async () => {
  // Disconnect from database
  await mongoose.connection.close();
});

describe("Auth API", () => {
  describe("POST /api/auth/register", () => {
    it("should register a new user", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "Test User",
        email: "test@example.com",
        password: "Password123",
      });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("token");
    });

    it("should not register a user with invalid data", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "Test User",
        email: "invalid-email",
        password: "pass",
      });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty("success", false);
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login existing user and return token", async () => {
      // First create a user
      await User.create({
        name: "Login Test",
        email: "login@example.com",
        password: "Password123",
      });

      // Try to login
      const res = await request(app).post("/api/auth/login").send({
        email: "login@example.com",
        password: "Password123",
      });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("token");
    });

    it("should not login with incorrect credentials", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "wrong@example.com",
        password: "WrongPassword",
      });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty("success", false);
    });
  });

  describe("GET /api/auth/me", () => {
    it("should get current user profile when authenticated", async () => {
      // Create a user
      const user = await User.create({
        name: "Profile Test",
        email: "profile@example.com",
        password: "Password123",
      });

      // Get token
      const token = user.getSignedJwtToken();

      // Get profile
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data).toHaveProperty("email", "profile@example.com");
    });

    it("should not allow access without token", async () => {
      const res = await request(app).get("/api/auth/me");

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty("success", false);
    });
  });
});
