const { protect, authorize } = require("../src/middleware/auth");
const errorHandler = require("../src/middleware/errorHandler");
const jwt = require("jsonwebtoken");
const User = require("../src/models/User");

// Mock dependencies
jest.mock("jsonwebtoken");
jest.mock("../src/models/User");

describe("Authentication Middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {
        authorization: "Bearer validtoken",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("protect middleware", () => {
    test("should call next if token is valid", async () => {
      const mockUser = { id: "123", name: "Test User" };
      jwt.verify.mockReturnValue({ id: "123" });
      User.findById.mockResolvedValue(mockUser);

      await protect(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith(
        "validtoken",
        process.env.JWT_SECRET
      );
      expect(User.findById).toHaveBeenCalledWith("123");
      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
    });

    test("should return 401 if no token is provided", async () => {
      req.headers.authorization = undefined;

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: "Not authorized to access this route",
      });
      expect(next).not.toHaveBeenCalled();
    });

    test("should return 401 if token is invalid", async () => {
      jwt.verify.mockImplementation(() => {
        throw new Error("Invalid token");
      });

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: "Not authorized to access this route",
      });
    });
  });

  describe("authorize middleware", () => {
    test("should call next if user role is authorized", () => {
      req.user = { role: "admin" };
      const authMiddleware = authorize("admin", "superadmin");

      authMiddleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    test("should return 403 if user role is not authorized", () => {
      req.user = { role: "user" };
      const authMiddleware = authorize("admin", "superadmin");

      authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: "User role user is not authorized to access this route",
      });
    });
  });
});

describe("Error Handler Middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    console.error = jest.fn(); // Mock console.error
  });

  test("should handle CastError", () => {
    const err = {
      name: "CastError",
      message: "Cast Error",
      stack: "stack trace",
    };

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Resource not found",
    });
  });

  test("should handle duplicate key error", () => {
    const err = { code: 11000, message: "Duplicate key", stack: "stack trace" };

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Duplicate field value entered",
    });
  });

  test("should handle validation error", () => {
    const err = {
      name: "ValidationError",
      message: "Validation failed",
      errors: {
        field1: { message: "Field1 is required" },
        field2: { message: "Field2 is invalid" },
      },
      stack: "stack trace",
    };

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: ["Field1 is required", "Field2 is invalid"],
    });
  });

  test("should handle generic server error", () => {
    const err = { message: "Server error", stack: "stack trace" };

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Server error",
    });
  });
});
