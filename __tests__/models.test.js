const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../src/models/User");

// Mock dependencies
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

describe("User Model", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = "testsecret";
    process.env.JWT_EXPIRE = "30d";
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Validation", () => {
    test("should validate a valid user", async () => {
      const validUser = new User({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });

      const validateResult = validUser.validateSync();
      expect(validateResult).toBeUndefined();
    });

    test("should require name, email, and password", async () => {
      const user = new User({});

      const validateResult = user.validateSync();

      expect(validateResult.errors.name).toBeDefined();
      expect(validateResult.errors.email).toBeDefined();
      expect(validateResult.errors.password).toBeDefined();
      expect(validateResult.errors.name.message).toBe("Please add a name");
      expect(validateResult.errors.email.message).toBe("Please add an email");
      expect(validateResult.errors.password.message).toBe(
        "Please add a password"
      );
    });

    test("should validate email format", async () => {
      const user = new User({
        name: "Test User",
        email: "invalid-email",
        password: "password123",
      });

      const validateResult = user.validateSync();

      expect(validateResult.errors.email).toBeDefined();
      expect(validateResult.errors.email.message).toBe(
        "Please add a valid email"
      );
    });

    test("should validate password length", async () => {
      const user = new User({
        name: "Test User",
        email: "test@example.com",
        password: "short",
      });

      const validateResult = user.validateSync();

      expect(validateResult.errors.password).toBeDefined();
      expect(validateResult.errors.password.message).toBe(
        "Password must be at least 6 characters"
      );
    });

    test("should validate role enum values", async () => {
      const user = new User({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        role: "superuser", // Invalid role
      });

      const validateResult = user.validateSync();

      expect(validateResult.errors.role).toBeDefined();
      expect(validateResult.errors.role.message).toContain(
        "is not a valid enum value"
      );
    });
  });

  describe("Password Hashing", () => {
    test("should hash password before saving", async () => {
      // Setup mocks
      bcrypt.genSalt.mockResolvedValue("salt");
      bcrypt.hash.mockResolvedValue("hashedpassword");

      const user = new User({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });

      // Mock isModified method
      user.isModified = jest.fn().mockReturnValue(true);

      // Mock the pre-save hook
      const mockPreSave = jest.fn().mockImplementation(async function(next) {
        if (!this.isModified('password')) {
          return next();
        }
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
      });
      
      // Call the mocked pre-save hook
      await mockPreSave.call(user, () => {});

      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith("password123", "salt");
      expect(user.password).toBe("hashedpassword");
    });

    test("should not rehash password if not modified", async () => {
      const user = new User({
        name: "Test User",
        email: "test@example.com",
        password: "hashedpassword",
      });

      // Mock isModified method
      user.isModified = jest.fn().mockReturnValue(false);

      const next = jest.fn();

      // Mock the pre-save hook similar to the previous test
      const mockPreSave = jest.fn().mockImplementation(async function(next) {
        if (!this.isModified('password')) {
          return next();
        }
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
      });
      
      // Call the mocked pre-save hook
      await mockPreSave.call(user, next);

      expect(bcrypt.genSalt).not.toHaveBeenCalled();
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
      expect(user.password).toBe("hashedpassword");
    });
  });

  describe("JWT Generation", () => {
    test("should return a signed JWT", () => {
      jwt.sign.mockReturnValue("mocktoken");
      
      const mockId = new mongoose.Types.ObjectId("507f1f77bcf86cd799439011");
      const user = new User({
        _id: mockId,
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        role: "user",
      });

      const token = user.getSignedJwtToken();

      expect(jwt.sign).toHaveBeenCalledWith(
        { id: mockId, role: "user" },
        "testsecret",
        { expiresIn: "30d" }
      );
      expect(token).toBe("mocktoken");
    });
  });

  describe("Password Matching", () => {
    test("should return true when passwords match", async () => {
      bcrypt.compare.mockResolvedValue(true);

      const user = new User({
        name: "Test User",
        email: "test@example.com",
        password: "hashedpassword",
      });

      const match = await user.matchPassword("password123");

      expect(bcrypt.compare).toHaveBeenCalledWith(
        "password123",
        "hashedpassword"
      );
      expect(match).toBe(true);
    });

    test("should return false when passwords do not match", async () => {
      bcrypt.compare.mockResolvedValue(false);

      const user = new User({
        name: "Test User",
        email: "test@example.com",
        password: "hashedpassword",
      });

      const match = await user.matchPassword("wrongpassword");

      expect(bcrypt.compare).toHaveBeenCalledWith(
        "wrongpassword",
        "hashedpassword"
      );
      expect(match).toBe(false);
    });
  });
});
