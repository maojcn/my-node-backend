# My Node.js Backend

A RESTful API built with Node.js, Express, and MongoDB.

## Overview

This is a backend API that provides authentication and user management capabilities with JWT-based authentication and role-based access control.

## Features

- User authentication (register, login, logout)
- JWT-based protected routes
- Role-based access control
- MongoDB integration with Mongoose
- Error handling middleware
- Input validation
- Environment configuration

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/myapp
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=30d
   NODE_ENV=development
   ```

## Running the Application

Development mode with auto-restart:
```
npm run dev
```

Production mode:
```
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info (protected)
- `GET /api/auth/logout` - Logout user (protected)

### User Management (Admin only)

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get a specific user
- `POST /api/users` - Create a new user
- `PUT /api/users/:id` - Update a user
- `DELETE /api/users/:id` - Delete a user

## Authentication

The API uses JWT (JSON Web Token) authentication. To access protected routes:

1. Obtain a token via login or register
2. Include the token in the Authorization header:
   ```
   Authorization: Bearer <your_jwt_token>
   ```

## Project Structure

```
.
├── .env                  # Environment variables
├── package.json          # Project metadata and dependencies
├── src/
│   ├── app.js            # Application entry point
│   ├── config/           # Configuration files
│   │   └── db.js         # Database connection
│   ├── controllers/      # Route controllers
│   │   ├── authController.js
│   │   └── userController.js
│   ├── middleware/       # Custom middleware
│   │   ├── auth.js       # Authentication middleware
│   │   └── errorHandler.js
│   ├── models/           # Database models
│   │   └── User.js
│   ├── routes/           # API routes
│   │   ├── auth.js
│   │   └── users.js
│   └── utils/            # Utility functions
│       └── validators.js
```

## Security Features

- Password hashing with bcrypt
- JWT with expiration
- Route protection middleware
- Role-based access control
- Input validation
- Error handling

## Testing

Run tests using Jest:
```
npm test
