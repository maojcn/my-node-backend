const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");
const User = require("../src/models/User");
const userRoutes = require("../src/routes/users");

// Mock User model
jest.mock("../src/models/User");

// Mock auth middleware
jest.mock("../src/middleware/auth", () => ({
  protect: (req, res, next) => next(),
  authorize: () => (req, res, next) => next(),
}));

const app = express();
app.use(express.json());
app.use("/api/users", userRoutes);

describe("User Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/users", () => {
    it("should get all users", async () => {
      const mockUsers = [
        { _id: "user1", name: "User 1", email: "user1@example.com" },
        { _id: "user2", name: "User 2", email: "user2@example.com" },
      ];

      User.find.mockResolvedValue(mockUsers);

      const res = await request(app).get("/api/users");

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2);
      expect(res.body.data).toEqual(mockUsers);
      expect(User.find).toHaveBeenCalledTimes(1);
    });

    it("should handle errors", async () => {
      const errorMessage = "Database error";
      User.find.mockRejectedValue(new Error(errorMessage));

      const res = await request(app).get("/api/users");

      expect(res.statusCode).toBe(500);
    });
  });

  describe("GET /api/users/:id", () => {
    it("should get a single user", async () => {
      const mockUser = {
        _id: "user1",
        name: "User 1",
        email: "user1@example.com",
      };
      User.findById.mockResolvedValue(mockUser);

      const res = await request(app).get("/api/users/user1");

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(mockUser);
      expect(User.findById).toHaveBeenCalledWith("user1");
    });

    it("should return 404 if user not found", async () => {
      User.findById.mockResolvedValue(null);

      const res = await request(app).get("/api/users/nonexistent");

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("User not found");
    });

    it("should handle errors", async () => {
      User.findById.mockRejectedValue(new Error("Database error"));

      const res = await request(app).get("/api/users/user1");

      expect(res.statusCode).toBe(500);
    });
  });

  describe("POST /api/users", () => {
    it("should create a new user", async () => {
      const newUser = {
        name: "New User",
        email: "newuser@example.com",
        password: "password123",
      };
      const createdUser = { _id: "newuserid", ...newUser };

      User.create.mockResolvedValue(createdUser);

      const res = await request(app).post("/api/users").send(newUser);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(createdUser);
      expect(User.create).toHaveBeenCalledWith(newUser);
    });

    it("should handle errors", async () => {
      const newUser = {
        name: "New User",
        email: "newuser@example.com",
        password: "password123",
      };
      User.create.mockRejectedValue(new Error("Database error"));

      const res = await request(app).post("/api/users").send(newUser);

      expect(res.statusCode).toBe(500);
    });
  });

  describe("PUT /api/users/:id", () => {
    it("should update a user", async () => {
      const userId = "user1";
      const updateData = { name: "Updated User", email: "updated@example.com" };
      const updatedUser = { _id: userId, ...updateData };

      User.findByIdAndUpdate.mockResolvedValue(updatedUser);

      const res = await request(app)
        .put(`/api/users/${userId}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(updatedUser);
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(userId, updateData, {
        new: true,
        runValidators: true,
      });
    });

    it("should return 404 if user not found", async () => {
      const userId = "nonexistent";
      const updateData = { name: "Updated User" };

      User.findByIdAndUpdate.mockResolvedValue(null);

      const res = await request(app)
        .put(`/api/users/${userId}`)
        .send(updateData);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("User not found");
    });

    it("should handle errors", async () => {
      const userId = "user1";
      const updateData = { name: "Updated User" };

      User.findByIdAndUpdate.mockRejectedValue(new Error("Database error"));

      const res = await request(app)
        .put(`/api/users/${userId}`)
        .send(updateData);

      expect(res.statusCode).toBe(500);
    });
  });

  describe("DELETE /api/users/:id", () => {
    it("should delete a user", async () => {
      const userId = "user1";
      const deletedUser = {
        _id: userId,
        name: "User 1",
        email: "user1@example.com",
      };

      User.findByIdAndDelete.mockResolvedValue(deletedUser);

      const res = await request(app).delete(`/api/users/${userId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual({});
      expect(User.findByIdAndDelete).toHaveBeenCalledWith(userId);
    });

    it("should return 404 if user not found", async () => {
      const userId = "nonexistent";

      User.findByIdAndDelete.mockResolvedValue(null);

      const res = await request(app).delete(`/api/users/${userId}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("User not found");
    });

    it("should handle errors", async () => {
      const userId = "user1";

      User.findByIdAndDelete.mockRejectedValue(new Error("Database error"));

      const res = await request(app).delete(`/api/users/${userId}`);

      expect(res.statusCode).toBe(500);
    });
  });
});
