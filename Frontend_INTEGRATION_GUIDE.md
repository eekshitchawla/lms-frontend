# LMS Frontend-Backend Integration Guide

**Prepared for:** Backend Development Team  
**Date:** April 29, 2026  
**Purpose:** Complete frontend requirements and backend integration specifications  
**Frontend Version:** 75% Complete (MVP Stage)

---

## 📋 TABLE OF CONTENTS

1. [Frontend Architecture Overview](#frontend-architecture-overview)
2. [Service Configuration](#service-configuration)
3. [Authentication System](#authentication-system)
4. [API Endpoints Specification](#api-endpoints-specification)
5. [Database Schema Requirements](#database-schema-requirements)
6. [Error Handling Standards](#error-handling-standards)
7. [Testing Checklist](#testing-checklist)
8. [Deployment Configuration](#deployment-configuration)

---

## FRONTEND ARCHITECTURE OVERVIEW

### Tech Stack

- **Framework:** React 19.2.4
- **Styling:** Tailwind CSS 3.4.19
- **HTTP Client:** Axios 1.13.5
- **Authentication:** JWT (jwtDecode)
- **Icons:** Lucide React
- **Notifications:** React Hot Toast

### Frontend Structure

```
src/
├── components/
│   ├── LoginPage.js ............. Auth UI (email/phone/OTP)
│   ├── RegisterPage.js .......... User registration
│   ├── TaskBoard.js ............. Task list with filters
│   ├── AddTaskForm.js ........... Create task form
│   ├── CourseCatalog.js ......... Course listing
│   ├── AdminPanel.js ............ Admin dashboard
│   ├── AdminStats.js ............ Admin statistics (Task 4)
│   ├── UserSwitcher.js .......... User selection dropdown
│   ├── SyllabusModal.js ......... Course details modal
│   ├── Stats.js ................. Dashboard stats sidebar
│   └── Spinner.js ............... Loading indicator
├── services/
│   ├── api.js ................... LMS API (8080)
│   ├── AuthService.js ........... Authentication service
│   └── CourseService.js ......... Course operations
├── App.js ....................... Main app routing
└── index.js ..................... Entry point
```

### Service Architecture

The frontend communicates with **3 separate backend services**:

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (3000)                       │
│  React App with Components & Services                    │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌───────────────┐  ┌──────────────┐  ┌─────────────┐
│ Admin Service │  │ LMS Service  │  │   Catalog   │
│   (8082)      │  │   (8080)     │  │  Service    │
│               │  │              │  │   (8081)    │
│ • Auth        │  │ • Tasks      │  │ • Courses   │
│ • Users       │  │ • Courses    │  │ • Modules   │
│ • Admin Ops   │  │ • Sync       │  │             │
└───────────────┘  └──────────────┘  └─────────────┘
        │                 │                 │
        └─────────────────┼─────────────────┘
                          │
                    ┌─────────────┐
                    │  Database   │
                    │ (PostgreSQL)│
                    └─────────────┘
```

---

## SERVICE CONFIGURATION

### Frontend API Configuration

#### Admin Service (Authentication & Users)

- **Base URL:** `http://localhost:8082/api/v1`
- **Port:** 8082
- **Purpose:** User authentication, user management, admin operations
- **File:** `src/services/AuthService.js` (creates dedicated axios instance)

#### LMS Service (Tasks & Courses)

- **Base URL:** `http://localhost:8080/api/v1`
- **Port:** 8080
- **Purpose:** Task management, course enrollment, sync
- **File:** `src/services/api.js` (default axios instance)

#### Catalog Service (Course Catalog)

- **Base URL:** `http://localhost:8081/api/v1`
- **Port:** 8081
- **Purpose:** Course catalog, modules, course details
- **File:** `src/services/CourseService.js`

### CORS Configuration Required

**Frontend Origin:** `http://localhost:3000`

All backend services must allow CORS requests from `http://localhost:3000`:

```javascript
// Example CORS configuration (Node/Express)
const cors = require("cors");

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
```

### Environment Variables

**Frontend (.env file)**

```bash
REACT_APP_API_BASE_URL=http://localhost:8080/api/v1
REACT_APP_ADMIN_API_BASE_URL=http://localhost:8082/api/v1
REACT_APP_CATALOG_API_BASE_URL=http://localhost:8081/api/v1
```

**Backend (for production)**

```bash
FRONTEND_URL=https://lms-frontend.yourdomain.com
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=lms_db
DB_USER=postgres
DB_PASSWORD=your-password
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRY=24h
OTP_EXPIRY=10m
```

---

## AUTHENTICATION SYSTEM

### JWT Token Structure

The frontend expects JWT tokens with the following claims:

```json
{
  "sub": "user@example.com",
  "userId": 1,
  "email": "user@example.com",
  "fullName": "John Doe",
  "phoneNumber": "9876543210",
  "role": "ROLE_USER",
  "phoneVerified": false,
  "emailVerified": false,
  "iat": 1682000000,
  "exp": 1682086400
}
```

**Required Claims:**

- `sub` - Subject (typically email or user ID)
- `userId` - User ID in database
- `email` - User email
- `role` - User role: `ROLE_USER` or `ROLE_ADMIN`
- `exp` - Expiration time (Unix timestamp)

**Optional Claims:**

- `fullName` - User's full name
- `phoneNumber` - User's phone number
- `phoneVerified` - Boolean
- `emailVerified` - Boolean

### Token Lifecycle

```
1. User logs in (email+password OR OTP)
   ↓
2. Backend validates credentials
   ↓
3. Backend generates JWT token + refresh token
   ↓
4. Frontend stores token in localStorage
   ↓
5. Frontend includes token in Authorization header: Bearer {token}
   ↓
6. Token expires after JWT_EXPIRY (default 24h)
   ↓
7. Frontend detects 401 error
   ↓
8. Frontend calls refresh endpoint with refresh token
   ↓
9. Backend validates refresh token
   ↓
10. Backend returns new JWT token
    ↓
11. Frontend retries original request with new token
    ↓
    OR
12. If refresh fails → Frontend logs out user
```

### Authorization Header Format

All authenticated API requests must include:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Implementation:** Frontend automatically adds this via Axios interceptor in `src/services/api.js`

---

## API ENDPOINTS SPECIFICATION

### 1. AUTHENTICATION ENDPOINTS (Admin Service - 8082)

#### 1.1 User Registration

```
POST /auth/register
Content-Type: application/json

Request Body:
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "9876543210",
  "password": "SecurePass123"
}

Response: 201 Created
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "fullName": "John Doe",
    "phoneNumber": "9876543210",
    "role": "ROLE_USER",
    "phoneVerified": false,
    "emailVerified": false,
    "createdAt": "2026-04-19T10:30:00Z",
    "updatedAt": "2026-04-19T10:30:00Z"
  },
  "message": "User registered successfully"
}

Error Responses:
- 400: Email already exists
- 400: Invalid email format
- 400: Password too weak
- 400: Phone number invalid
- 500: Registration failed
```

#### 1.2 Email/Password Login

```
POST /auth/login
Content-Type: application/json

Request Body:
{
  "email": "john@example.com",
  "password": "SecurePass123"
}

Response: 200 OK
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "fullName": "John Doe",
    "phoneNumber": "9876543210",
    "role": "ROLE_USER",
    "phoneVerified": false,
    "emailVerified": false
  },
  "message": "Login successful"
}

Error Responses:
- 401: Invalid email or password
- 404: User not found
- 500: Login failed
```

#### 1.3 Request Email OTP

```
POST /auth/request-otp
Content-Type: application/json

Request Body:
{
  "email": "john@example.com"
}

Response: 200 OK
{
  "message": "OTP sent to email",
  "expiresIn": "10m",
  "destination": "john@example.com"
}

Error Responses:
- 404: User not found
- 429: Too many OTP requests (rate limit)
- 500: Failed to send OTP
```

#### 1.4 Send Phone OTP

```
POST /auth/send-otp
Content-Type: application/json

Request Body:
{
  "phoneNumber": "9876543210"
}

Response: 200 OK
{
  "message": "OTP sent to phone",
  "expiresIn": "10m",
  "destination": "9876543210"
}

Error Responses:
- 404: User not found
- 429: Too many OTP requests (rate limit)
- 500: Failed to send OTP
```

#### 1.5 Verify OTP (Email or Phone)

```
POST /auth/verify-otp
Content-Type: application/json

Request Body (Email):
{
  "email": "john@example.com",
  "otp": "820160"
}

Request Body (Phone):
{
  "phone_number": "9876543210",
  "otp": "820160"
}

Response: 200 OK
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "fullName": "John Doe",
    "phoneNumber": "9876543210",
    "role": "ROLE_USER",
    "phoneVerified": true,
    "emailVerified": true
  },
  "message": "OTP verified successfully"
}

Error Responses:
- 400: Invalid or expired OTP
- 404: User not found
- 500: Verification failed
```

#### 1.6 Refresh Token

```
POST /auth/refresh
Authorization: Bearer {refreshToken}
Content-Type: application/json

Response: 200 OK
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
  "message": "Token refreshed successfully"
}

Error Responses:
- 401: Invalid or expired refresh token
- 500: Refresh failed
```

---

### 2. USER MANAGEMENT ENDPOINTS (Admin Service - 8082)

#### 2.1 Get All Users (Admin Only)

```
GET /users
Authorization: Bearer {token}

Query Parameters:
- page: optional (default: 1)
- limit: optional (default: 20)
- search: optional (email/name search)

Response: 200 OK
{
  "data": [
    {
      "id": 1,
      "email": "john@example.com",
      "fullName": "John Doe",
      "phoneNumber": "9876543210",
      "role": "ROLE_USER",
      "phoneVerified": false,
      "emailVerified": false,
      "createdAt": "2026-04-19T10:30:00Z",
      "lastLogin": "2026-04-19T14:30:00Z"
    },
    ...more users
  ],
  "total": 50,
  "page": 1,
  "limit": 20,
  "pages": 3
}

Error Responses:
- 401: Unauthorized (not authenticated)
- 403: Forbidden (not admin)
- 500: Failed to fetch users
```

#### 2.2 Get User Details

```
GET /users/{userId}
Authorization: Bearer {token}

Response: 200 OK
{
  "id": 1,
  "email": "john@example.com",
  "fullName": "John Doe",
  "phoneNumber": "9876543210",
  "role": "ROLE_USER",
  "phoneVerified": false,
  "emailVerified": false,
  "createdAt": "2026-04-19T10:30:00Z",
  "updatedAt": "2026-04-19T10:30:00Z",
  "lastLogin": "2026-04-19T14:30:00Z"
}

Error Responses:
- 401: Unauthorized
- 404: User not found
- 500: Failed to fetch user
```

---

### 3. TASK MANAGEMENT ENDPOINTS (LMS Service - 8080)

#### 3.1 Get User Tasks

```
GET /tasks/user/{userId}
Authorization: Bearer {token}

Query Parameters:
- page: optional (default: 1)
- limit: optional (default: 50)

Response: 200 OK
{
  "data": [
    {
      "id": 1,
      "title": "Complete Project Proposal",
      "description": "Write and submit the Q2 project proposal",
      "userId": 1,
      "dueDate": "2026-04-25",
      "completed": false,
      "createdAt": "2026-04-19T10:30:00Z",
      "updatedAt": "2026-04-19T10:30:00Z"
    },
    ...more tasks
  ],
  "total": 10,
  "page": 1,
  "limit": 50
}

Error Responses:
- 401: Unauthorized
- 500: Failed to fetch tasks
```

#### 3.2 Get Single Task

```
GET /tasks/{taskId}
Authorization: Bearer {token}

Response: 200 OK
{
  "id": 1,
  "title": "Complete Project Proposal",
  "description": "Write and submit the Q2 project proposal",
  "userId": 1,
  "dueDate": "2026-04-25",
  "completed": false,
  "createdAt": "2026-04-19T10:30:00Z",
  "updatedAt": "2026-04-19T10:30:00Z"
}

Error Responses:
- 401: Unauthorized
- 404: Task not found
- 500: Failed to fetch task
```

#### 3.3 Create Task

```
POST /tasks
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "title": "Complete Project Proposal",
  "description": "Write and submit the Q2 project proposal",
  "dueDate": "2026-04-25"
}

Response: 201 Created
{
  "id": 1,
  "title": "Complete Project Proposal",
  "description": "Write and submit the Q2 project proposal",
  "userId": 1,
  "dueDate": "2026-04-25",
  "completed": false,
  "createdAt": "2026-04-19T10:30:00Z",
  "updatedAt": "2026-04-19T10:30:00Z"
}

Error Responses:
- 400: Missing required fields
- 401: Unauthorized
- 500: Failed to create task
```

#### 3.4 Update Task

```
PUT /tasks/{taskId}
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "title": "Updated Title",
  "description": "Updated description",
  "dueDate": "2026-04-26"
}

Response: 200 OK
{
  "id": 1,
  "title": "Updated Title",
  "description": "Updated description",
  "userId": 1,
  "dueDate": "2026-04-26",
  "completed": false,
  "createdAt": "2026-04-19T10:30:00Z",
  "updatedAt": "2026-04-19T15:30:00Z"
}

Error Responses:
- 400: Invalid input
- 401: Unauthorized
- 404: Task not found
- 500: Failed to update task
```

#### 3.5 Toggle Task Completion

```
PATCH /tasks/{taskId}/toggle
Authorization: Bearer {token}

Response: 200 OK
{
  "id": 1,
  "completed": true,
  "message": "Task marked as completed"
}

Error Responses:
- 401: Unauthorized
- 404: Task not found
- 500: Failed to toggle task
```

#### 3.6 Delete Task

```
DELETE /tasks/{taskId}
Authorization: Bearer {token}

Response: 200 OK
{
  "message": "Task deleted successfully"
}

Error Responses:
- 401: Unauthorized
- 404: Task not found
- 500: Failed to delete task
```

---

### 4. COURSE MANAGEMENT ENDPOINTS (Catalog Service - 8081 & LMS Service - 8080)

#### 4.1 Get All Courses

```
GET /courses
Authorization: Bearer {token} (optional for public catalog)

Query Parameters:
- page: optional (default: 1)
- limit: optional (default: 20)
- category: optional
- difficulty: optional

Response: 200 OK
{
  "data": [
    {
      "id": 1,
      "title": "Python Basics",
      "description": "Learn Python fundamentals",
      "category": "Programming",
      "difficulty": "Beginner",
      "duration": "4 weeks",
      "instructor": "John Smith",
      "createdAt": "2026-01-15T10:00:00Z"
    },
    ...more courses
  ],
  "total": 25,
  "page": 1,
  "limit": 20,
  "pages": 2
}

Error Responses:
- 500: Failed to fetch courses
```

#### 4.2 Get Course Details

```
GET /courses/{courseId}
Authorization: Bearer {token}

Response: 200 OK
{
  "id": 1,
  "title": "Python Basics",
  "description": "Learn Python fundamentals",
  "category": "Programming",
  "difficulty": "Beginner",
  "duration": "4 weeks",
  "instructor": "John Smith",
  "modules": [
    {
      "id": 1,
      "title": "Module 1: Introduction",
      "lessons": [
        {
          "id": 1,
          "title": "What is Python?",
          "duration": "15 minutes"
        },
        ...more lessons
      ]
    },
    ...more modules
  ],
  "createdAt": "2026-01-15T10:00:00Z"
}

Error Responses:
- 404: Course not found
- 500: Failed to fetch course
```

#### 4.3 Get Course Modules

```
GET /courses/{courseId}/modules
Authorization: Bearer {token}

Response: 200 OK
{
  "courseId": 1,
  "modules": [
    {
      "id": 1,
      "title": "Module 1: Introduction",
      "order": 1,
      "lessons": [
        {
          "id": 1,
          "title": "What is Python?",
          "duration": "15 minutes",
          "order": 1
        }
      ]
    }
  ]
}

Error Responses:
- 404: Course not found
- 500: Failed to fetch modules
```

#### 4.4 Enroll User in Course

```
POST /courses/{courseId}/enroll
Authorization: Bearer {token}
Content-Type: application/json

Request Body: {} (empty)

Response: 200 OK
{
  "enrollmentId": 1,
  "courseId": 1,
  "userId": 1,
  "enrolledAt": "2026-04-19T10:30:00Z",
  "progress": 0,
  "message": "Successfully enrolled in course"
}

Error Responses:
- 400: Already enrolled in this course
- 401: Unauthorized
- 404: Course not found
- 500: Enrollment failed
```

---

### 5. ADMIN ENDPOINTS (Admin Service - 8082)

#### 5.1 Assign Course to User

```
POST /admin/courses/assign
Authorization: Bearer {token} (Admin only)
Content-Type: application/json

Request Body:
{
  "userId": 1,
  "courseId": 5
}

Response: 200 OK
{
  "enrollmentId": 1,
  "userId": 1,
  "courseId": 5,
  "assignedBy": "admin@example.com",
  "assignedAt": "2026-04-19T10:30:00Z",
  "message": "Course assigned to user successfully"
}

Error Responses:
- 400: User already enrolled in this course
- 401: Unauthorized
- 403: Forbidden (not admin)
- 404: User or course not found
- 500: Assignment failed
```

#### 5.2 Update Course Content

```
PUT /admin/courses/{courseId}/content
Authorization: Bearer {token} (Admin only)
Content-Type: application/json

Request Body:
{
  "title": "Updated Title",
  "description": "Updated description",
  "content": "HTML/Rich text content here"
}

Response: 200 OK
{
  "id": 1,
  "title": "Updated Title",
  "description": "Updated description",
  "updatedAt": "2026-04-19T10:30:00Z",
  "message": "Course content updated successfully"
}

Error Responses:
- 401: Unauthorized
- 403: Forbidden (not admin)
- 404: Course not found
- 500: Update failed
```

#### 5.3 Get Dashboard Statistics (Task 4)

```
GET /admin/dashboard/stats
Authorization: Bearer {token} (Admin only)

Response: 200 OK
{
  "totalUsers": 50,
  "activeUsers": 35,
  "totalCoursesAssigned": 120,
  "completedCourses": 45,
  "averageProgress": 42.5,
  "lastUpdated": "2026-04-19T15:30:00Z"
}

Error Responses:
- 401: Unauthorized
- 403: Forbidden (not admin)
- 500: Failed to fetch statistics
```

---

## DATABASE SCHEMA REQUIREMENTS

### Users Table

```sql
CREATE TABLE "user" (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  phone_verified BOOLEAN DEFAULT false,
  email_verified BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  role VARCHAR(50) DEFAULT 'ROLE_USER', -- ROLE_USER or ROLE_ADMIN
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_email ON "user"(email);
CREATE INDEX idx_user_role ON "user"(role);
```

### Tasks Table

```sql
CREATE TABLE task (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  user_id INTEGER NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  due_date DATE,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_task_user_id ON task(user_id);
CREATE INDEX idx_task_completed ON task(completed);
```

### Courses Table

```sql
CREATE TABLE course (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  difficulty VARCHAR(50), -- Beginner, Intermediate, Advanced
  duration VARCHAR(50),
  instructor VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_course_category ON course(category);
CREATE INDEX idx_course_difficulty ON course(difficulty);
```

### Course Modules Table

```sql
CREATE TABLE course_module (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL REFERENCES course(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_module_course_id ON course_module(course_id);
```

### Enrollments Table

```sql
CREATE TABLE enrollment (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  course_id INTEGER NOT NULL REFERENCES course(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0, -- 0-100 percentage
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  UNIQUE(user_id, course_id)
);

CREATE INDEX idx_enrollment_user_id ON enrollment(user_id);
CREATE INDEX idx_enrollment_course_id ON enrollment(course_id);
```

### OTP Verification Table

```sql
CREATE TABLE otp_verification (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  otp_code VARCHAR(6) NOT NULL,
  verification_type VARCHAR(20), -- 'email' or 'phone'
  contact_info VARCHAR(255), -- email or phone
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  verified_at TIMESTAMP,
  is_used BOOLEAN DEFAULT false
);

CREATE INDEX idx_otp_user_id ON otp_verification(user_id);
CREATE INDEX idx_otp_expires_at ON otp_verification(expires_at);
```

---

## ERROR HANDLING STANDARDS

### Error Response Format

All error responses must follow this format:

```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable error message",
  "timestamp": 1682000000000,
  "path": "/api/v1/endpoint",
  "status": 400
}
```

### HTTP Status Codes

| Status | Meaning           | Example                            |
| ------ | ----------------- | ---------------------------------- |
| 200    | OK                | Request succeeded                  |
| 201    | Created           | Resource created                   |
| 400    | Bad Request       | Invalid input, missing fields      |
| 401    | Unauthorized      | Missing/invalid token              |
| 403    | Forbidden         | Authenticated but lacks permission |
| 404    | Not Found         | Resource doesn't exist             |
| 429    | Too Many Requests | Rate limit exceeded (OTP requests) |
| 500    | Server Error      | Unexpected error                   |

### Common Error Scenarios

#### 1. Missing Required Fields

```json
{
  "error": "VALIDATION_ERROR",
  "message": "Missing required fields: email, password",
  "status": 400
}
```

#### 2. Invalid Email Format

```json
{
  "error": "INVALID_EMAIL",
  "message": "Email format is invalid",
  "status": 400
}
```

#### 3. Weak Password

```json
{
  "error": "WEAK_PASSWORD",
  "message": "Password must contain uppercase, lowercase, numbers and be at least 8 characters",
  "status": 400
}
```

#### 4. User Already Exists

```json
{
  "error": "USER_EXISTS",
  "message": "Email already registered",
  "status": 400
}
```

#### 5. Invalid OTP

```json
{
  "error": "INVALID_OTP",
  "message": "Invalid or expired OTP",
  "status": 400
}
```

#### 6. Unauthorized Access

```json
{
  "error": "UNAUTHORIZED",
  "message": "Invalid credentials",
  "status": 401
}
```

#### 7. Admin-Only Access

```json
{
  "error": "FORBIDDEN",
  "message": "Admin access required",
  "status": 403
}
```

---

## TESTING CHECKLIST

### Manual Testing for Backend Integration

#### Authentication Flow

- [ ] **Register New User**
  - POST `/auth/register` with valid data
  - Verify user created in database
  - Verify token returned and valid
  - Verify JWT claims include role, userId
  - Test with invalid email format → 400 error
  - Test with weak password → 400 error
  - Test with duplicate email → 400 error

- [ ] **Email/Password Login**
  - POST `/auth/login` with correct credentials
  - Verify token returned
  - Test with wrong password → 401 error
  - Test with non-existent email → 404 error
  - Token should decode with jwtDecode

- [ ] **Email OTP Flow**
  - POST `/auth/request-otp` with email
  - Verify OTP sent (check email or log)
  - POST `/auth/verify-otp` with correct OTP
  - Verify token returned
  - Test with expired OTP → 400 error
  - Test with wrong OTP → 400 error
  - Test with rate limiting (multiple OTP requests)

- [ ] **Phone OTP Flow**
  - POST `/auth/send-otp` with 10-digit phone
  - Verify OTP sent (check SMS or log)
  - POST `/auth/verify-otp` with phone_number field
  - Verify token returned with phoneVerified: true
  - Test with invalid phone format → 400 error

- [ ] **Token Refresh**
  - Verify refresh endpoint exists at `/auth/refresh`
  - Test token refresh with valid refresh token
  - Test with expired refresh token → 401 error

#### User Management

- [ ] **Get All Users**
  - GET `/users` with admin token
  - Verify returns list of users
  - Test with non-admin token → 403 error
  - Test with invalid token → 401 error
  - Verify pagination works

- [ ] **Get Single User**
  - GET `/users/{userId}` with valid userId
  - Verify returns correct user data
  - Test with invalid userId → 404 error

#### Task Management

- [ ] **Create Task**
  - POST `/tasks` with title, description, dueDate
  - Verify task created in database
  - Verify userId automatically set from token
  - Test with missing title → 400 error

- [ ] **Get User Tasks**
  - GET `/tasks/user/{userId}`
  - Verify returns only user's tasks
  - Verify completed field is boolean
  - Test pagination works

- [ ] **Update Task**
  - PUT `/tasks/{taskId}` with updated fields
  - Verify database updated
  - Test with invalid taskId → 404 error

- [ ] **Toggle Task Completion**
  - PATCH `/tasks/{taskId}/toggle`
  - Verify completed status toggled
  - Verify updatedAt timestamp changed

- [ ] **Delete Task**
  - DELETE `/tasks/{taskId}`
  - Verify task removed from database
  - Test with invalid taskId → 404 error

#### Course Management

- [ ] **Get All Courses**
  - GET `/courses`
  - Verify returns course list with all required fields
  - Test filtering by category
  - Test filtering by difficulty
  - Verify pagination works

- [ ] **Get Course Details**
  - GET `/courses/{courseId}`
  - Verify includes modules array
  - Test with invalid courseId → 404 error

- [ ] **Enroll in Course**
  - POST `/courses/{courseId}/enroll`
  - Verify enrollment record created
  - Verify cannot enroll twice → 400 error
  - Test with invalid courseId → 404 error

#### Admin Endpoints

- [ ] **Assign Course to User**
  - POST `/admin/courses/assign` with userId, courseId
  - Verify enrollment created
  - Verify only admin can call → test with user token → 403
  - Test with invalid userId/courseId → 404

- [ ] **Update Course Content**
  - PUT `/admin/courses/{courseId}/content`
  - Verify course updated in database
  - Test with non-admin token → 403 error

- [ ] **Get Dashboard Statistics**
  - GET `/admin/dashboard/stats`
  - Verify returns all 6 metrics
  - Values should be integers/floats
  - Test with non-admin token → 403 error

### Automated Testing with cURL

```bash
# Test Registration
curl -X POST http://localhost:8082/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "phoneNumber": "9876543210",
    "password": "TestPass123"
  }'

# Test Login
curl -X POST http://localhost:8082/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }'

# Test Get Tasks (replace TOKEN with actual token)
curl -X GET http://localhost:8080/api/v1/tasks/user/1 \
  -H "Authorization: Bearer TOKEN"

# Test Create Task
curl -X POST http://localhost:8080/api/v1/tasks \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Task",
    "description": "Test description",
    "dueDate": "2026-04-25"
  }'
```

---

## DEPLOYMENT CONFIGURATION

### Production Environment Setup

#### Backend Services Configuration

```bash
# Admin Service (8082)
PORT=8082
DB_HOST=prod-db-host
DB_PORT=5432
DB_NAME=lms_admin_db
JWT_SECRET=production-jwt-secret-key
JWT_EXPIRY=24h
OTP_EXPIRY=10m
FRONTEND_URL=https://lms-frontend.yourdomain.com

# LMS Service (8080)
PORT=8080
DB_HOST=prod-db-host
DB_PORT=5432
DB_NAME=lms_db
JWT_SECRET=production-jwt-secret-key
ADMIN_SERVICE_URL=https://admin.yourdomain.com

# Catalog Service (8081)
PORT=8081
DB_HOST=prod-db-host
DB_PORT=5432
DB_NAME=lms_catalog_db
```

#### Frontend Environment Configuration

```bash
REACT_APP_API_BASE_URL=https://api.yourdomain.com/api/v1
REACT_APP_ADMIN_API_BASE_URL=https://admin-api.yourdomain.com/api/v1
REACT_APP_CATALOG_API_BASE_URL=https://catalog-api.yourdomain.com/api/v1
REACT_APP_ENV=production
```

#### CORS Configuration for Production

```javascript
const cors = require("cors");

const allowedOrigins = [
  "https://lms-frontend.yourdomain.com",
  "https://www.lms-frontend.yourdomain.com",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
```

### Security Checklist

- [ ] HTTPS enforced on all endpoints
- [ ] CORS properly configured
- [ ] JWT secrets securely stored (environment variables)
- [ ] Passwords hashed with bcrypt (min 10 rounds)
- [ ] Input validation on all endpoints
- [ ] Rate limiting on authentication endpoints
- [ ] SQL injection prevention (use parameterized queries)
- [ ] XSS protection headers set
- [ ] CSRF protection enabled
- [ ] Sensitive data not logged
- [ ] API keys not exposed in code/git
- [ ] Database backups configured
- [ ] Monitoring & alerting enabled

---

## QUICK INTEGRATION SUMMARY

### What Frontend Expects from Backend

1. **3 Services Running** on ports 8080, 8081, 8082
2. **JWT Authentication** with proper token structure
3. **CORS Headers** allowing frontend origin
4. **API Endpoints** matching specification
5. **Error Responses** in standard JSON format
6. **Database** with required schema tables
7. **OTP Service** (email/SMS integration)

### What Backend Should Verify

1. **All services start** without errors
2. **Database migrations** applied successfully
3. **CORS** is enabled for localhost:3000
4. **JWT tokens** are properly formatted
5. **All endpoints** return proper response format
6. **Error handling** returns correct status codes
7. **Rate limiting** is working on OTP endpoints
8. **User roles** properly enforced (ROLE_USER vs ROLE_ADMIN)

---

## SUPPORT & CONTACT

**Frontend Team:** Ready for integration testing  
**Backend Team:** Please verify all endpoints and database setup  
**DevOps Team:** Configure services for staging/production deployment

**Frontend GitHub/Repository:** [Add link]  
**Backend Repository:** [Add link]  
**Database Schema:** [Add link/documentation]

---

**Document Version:** 1.0  
**Last Updated:** April 29, 2026  
**Next Review:** After Task 4 completion
