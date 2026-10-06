# LMS Frontend - Comprehensive Audit & Technical Specification

**Audit Date:** June 4, 2026  
**Status:** 75% Complete MVP  
**Prepared By:** AI Code Auditor  
**Project Version:** 1.0.0-MVP

---

## TABLE OF CONTENTS

1. [Project Overview & Architecture](#project-overview--architecture)
2. [Detailed API Endpoints Specification](#detailed-api-endpoints-specification)
3. [Database Schema & Relationships](#database-schema--relationships)
4. [Service Configuration & Setup](#service-configuration--setup)
5. [Error Handling & Exception Management](#error-handling--exception-management)
6. [Component Analysis & Structure](#component-analysis--structure)
7. [Identified Flaws & Breakpoints](#identified-flaws--breakpoints)
8. [Critical TODOs & Recommendations](#critical-todos--recommendations)
9. [Code Quality Assessment](#code-quality-assessment)

---

## PROJECT OVERVIEW & ARCHITECTURE

### Current Status Summary

| Aspect              | Status         | Details                              |
| ------------------- | -------------- | ------------------------------------ |
| Overall Progress    | **75%**        | MVP stage, core features complete    |
| Components          | **9 Total**    | 7 Complete ✅, 2 In Progress 🟠      |
| Services            | **3 Complete** | AuthService, LMS API, CourseService  |
| Backend Integration | **70%**        | 16/23 endpoints integrated           |
| Testing Coverage    | **Minimal**    | Unit tests only (setupTests.js)      |
| Production Ready    | **NO**         | Requires Task 4 & security hardening |

### Frontend Tech Stack

```
React 19.2.4              - Main framework
Tailwind CSS 3.4.19       - UI styling
Axios 1.13.5              - HTTP client
JWT-Decode 4.0.0          - Token parsing
Lucide React 0.575.0      - Icon library
React Hot Toast 2.6.0     - Notifications
React Scripts 5.0.1       - Build tooling
```

### Frontend Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React App)                      │
│                      Port: 3000                              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │            ROUTING & AUTHENTICATION                  │   │
│  │  • LoginPage ↔ RegisterPage                          │   │
│  │  • Protected Routes (Admin | User Dashboard)         │   │
│  │  • Auth Context (AuthService.js)                     │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              USER DASHBOARD                           │   │
│  │  ├─ Stats Component (sidebar)                         │   │
│  │  ├─ AddTaskForm (create tasks)                        │   │
│  │  ├─ TaskBoard (list + filter + sort)                │   │
│  │  └─ CourseCatalog (enrollment)                        │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │            ADMIN DASHBOARD                            │   │
│  │  ├─ AdminPanel (main)                               │   │
│  │  ├─ AdminStats (dashboard - TASK 4)                 │   │
│  │  ├─ UserManagement                                   │   │
│  │  ├─ CourseManagement                                 │   │
│  │  └─ CourseAssignment                                │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           SERVICES LAYER (API Integration)            │   │
│  │  • api.js (LMS Service - 8080)                       │   │
│  │  • AuthService.js (Admin Service - 8082)             │   │
│  │  • CourseService.js (Catalog Service - 8081)         │   │
│  │  • Interceptors (auth, error handling)               │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
            │                    │                    │
            ▼                    ▼                    ▼
    ┌────────────────┐  ┌──────────────────┐  ┌──────────────┐
    │ Admin Service  │  │  LMS Service     │  │   Catalog    │
    │  Port 8082     │  │   Port 8080      │  │  Port 8081   │
    │                │  │                  │  │              │
    │ • Auth         │  │ • Tasks          │  │ • Courses    │
    │ • Users        │  │ • Courses        │  │ • Modules    │
    │ • Admin Ops    │  │ • Enrollment     │  │ • Metadata   │
    └────────────────┘  └──────────────────┘  └──────────────┘
            │                    │                    │
            └────────────────────┼────────────────────┘
                                 ▼
                        ┌─────────────────────┐
                        │   PostgreSQL DB     │
                        │   (Supabase)        │
                        │ db.ybltvwov... 5432 │
                        └─────────────────────┘
```

---

## DETAILED API ENDPOINTS SPECIFICATION

### 1. AUTHENTICATION ENDPOINTS (Admin Service - Port 8082)

#### 1.1 User Registration

```
Endpoint:    POST /api/v1/auth/register
Port:        8082 (Admin Service)
Auth:        None (public)
CORS:        Allowed from localhost:3000

Request Body:
{
  "fullName": "John Doe",              // Required: 2+ characters
  "email": "john@example.com",         // Required: Valid email
  "phoneNumber": "9876543210",         // Required: 10 digits (India)
  "password": "SecurePass123"          // Required: 8+ chars, 1 upper, 1 lower, 1 digit
}

Response (200 Created):
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",  // JWT token (24h expiry)
  "user": {
    "id": 1,
    "fullName": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "9876543210",
    "role": "ROLE_USER"
  },
  "message": "User registered successfully"
}

Error Responses:
- 400: {message: "Email already registered"}
- 400: {message: "Phone number already registered"}
- 400: {message: "Invalid email format"}
- 400: {message: "Password too weak"}
- 500: {message: "Registration failed"}

Frontend Integration: AuthService.register()
File: src/services/AuthService.js (lines 9-27)
```

#### 1.2 Email/Password Login

```
Endpoint:    POST /api/v1/auth/login
Port:        8082 (Admin Service)
Auth:        None (public)
CORS:        Allowed

Request Body:
{
  "email": "john@example.com",
  "password": "SecurePass123"
}

Response (200 OK):
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "fullName": "John Doe",
    "role": "ROLE_USER"
  },
  "message": "Login successful"
}

Error Responses:
- 401: {message: "Invalid email or password"}
- 404: {message: "User not found"}
- 400: {message: "User account inactive"}

Frontend Integration: AuthService.login()
File: src/services/AuthService.js (lines 29-46)
```

#### 1.3 Request OTP via Email

```
Endpoint:    POST /api/v1/auth/request-otp
Port:        8082 (Admin Service)
Auth:        None (public)
CORS:        Allowed

Request Body:
{
  "email": "john@example.com"
}

Response (200 OK):
{
  "message": "OTP sent to email",
  "destination": "john@example.com"
}

Error Responses:
- 404: {message: "User not found with this email"}
- 429: {message: "Too many OTP requests (rate limit)"}
- 500: {message: "Failed to send OTP"}

Frontend Integration: AuthService.requestOTP()
File: src/services/AuthService.js (lines 48-57)
```

#### 1.4 Send OTP via Phone

```
Endpoint:    POST /api/v1/auth/send-otp
Port:        8082 (Admin Service)
Auth:        None (public)
CORS:        Allowed

Request Body:
{
  "phoneNumber": "9876543210"
}

Response (200 OK):
{
  "message": "OTP sent to phone",
  "destination": "9876543210"
}

Error Responses:
- 404: {message: "User not found with this phone"}
- 429: {message: "Too many OTP requests"}
- 500: {message: "Failed to send OTP"}

Frontend Integration: AuthService.sendPhoneOTP()
File: src/services/AuthService.js (lines 59-73)
```

#### 1.5 Verify OTP (Email or Phone)

```
Endpoint:    POST /api/v1/auth/verify-otp
Port:        8082 (Admin Service)
Auth:        None (public)
CORS:        Allowed

Request Body (Email):
{
  "email": "john@example.com",
  "otp": "820160"
}

Request Body (Phone):
{
  "phoneNumber": "9876543210",
  "otp": "820160"
}

Response (200 OK):
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "fullName": "John Doe",
    "role": "ROLE_USER"
  },
  "message": "OTP verified successfully"
}

Error Responses:
- 400: {message: "Invalid or expired OTP"}
- 400: {message: "Maximum OTP attempts exceeded"}
- 404: {message: "User not found"}

Frontend Integration: AuthService.verifyOTP()
File: src/services/AuthService.js (lines 75-101)

Implementation Notes:
- Frontend auto-detects phone vs email: /^\d{10}$/.test(input)
- Sets phone_number field for phone, email field for email
- Payload detection: isPhoneNumber = /^\d{10}$/.test(emailOrPhone)
```

#### 1.6 Refresh Token

```
Endpoint:    POST /api/v1/auth/refresh
Port:        8082 (Admin Service)
Auth:        Bearer {refreshToken}
CORS:        Allowed

Request Body: {} (empty)

Response (200 OK):
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "message": "Token refreshed successfully"
}

Error Responses:
- 401: {message: "Invalid or expired refresh token"}
- 500: {message: "Token refresh failed"}

Frontend Integration: AuthService.refreshToken()
File: src/services/AuthService.js (lines 145-158)

Interceptor Hook:
- Triggered on 401 response (api.js lines 37-51)
- Automatic token refresh attempted
- Failed refresh triggers logout redirect
```

---

### 2. USER MANAGEMENT ENDPOINTS (Admin Service - Port 8082)

#### 2.1 Get All Users (Admin Only)

```
Endpoint:    GET /api/v1/users
Port:        8082 (Admin Service)
Auth:        Required (Bearer Token)
Role:        ROLE_ADMIN or ROLE_SUPER_ADMIN
CORS:        Allowed

Query Parameters:
- page: number (optional, default: 1)
- limit: number (optional, default: 20)
- search: string (optional, email/name search)

Response (200 OK):
{
  "data": [
    {
      "id": 1,
      "fullName": "John Doe",
      "email": "john@example.com",
      "phoneNumber": "9876543210",
      "role": "ROLE_USER",
      "createdAt": "2026-04-15T10:30:00Z",
      "lastLogin": "2026-04-20T14:30:00Z"
    },
    ...
  ],
  "page": 1,
  "pages": 3
}

Error Responses:
- 401: {message: "Unauthorized (not authenticated)"}
- 403: {message: "Forbidden (insufficient permissions)"}
- 500: {message: "Failed to fetch users"}

Frontend Integration: AdminPanel.fetchUsers()
File: src/components/AdminPanel.js (lines 39-52)
```

#### 2.2 Get User by ID

```
Endpoint:    GET /api/v1/users/{userId}
Port:        8082 (Admin Service)
Auth:        Required (Bearer Token)
CORS:        Allowed

URL Parameters:
- userId: number (required)

Response (200 OK):
{
  "id": 1,
  "fullName": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "9876543210",
  "role": "ROLE_USER",
  "createdAt": "2026-04-15T10:30:00Z",
  "lastLogin": "2026-04-20T14:30:00Z"
}

Error Responses:
- 401: {message: "Unauthorized"}
- 404: {message: "User not found"}
- 500: {message: "Failed to fetch user"}
```

#### 2.3 Get User by Email (Admin Only)

```
Endpoint:    GET /api/v1/users/email/{email}
Port:        8082 (Admin Service)
Auth:        Required (Bearer Token)
Role:        ROLE_ADMIN or ROLE_SUPER_ADMIN
CORS:        Allowed

URL Parameters:
- email: string (required)

Response (200 OK):
{
  "id": 1,
  "fullName": "John Doe",
  "email": "john@example.com",
  ...
}

Error Responses:
- 401: {message: "Unauthorized"}
- 403: {message: "Forbidden"}
- 404: {message: "User not found"}
```

---

### 3. TASK MANAGEMENT ENDPOINTS (LMS Service - Port 8080)

#### 3.1 Get All Tasks

```
Endpoint:    GET /api/v1/tasks
Port:        8080 (LMS Service)
Auth:        None (public)
CORS:        Allowed

Response (200 OK):
[
  {
    "id": 1,
    "title": "Complete Java Fundamentals",
    "description": "Learn basic Java concepts",
    "userId": 1,
    "courseId": 5,
    "completed": false,
    "dueDate": "2026-04-25",
    "createdAt": "2026-04-19T10:30:00Z",
    "updatedAt": "2026-04-19T10:30:00Z"
  },
  ...
]

Error Responses:
- 500: {message: "Failed to fetch tasks"}
```

#### 3.2 Get User Tasks (by User ID)

```
Endpoint:    GET /api/v1/tasks/user/{userId}
Port:        8080 (LMS Service)
Auth:        None (public)
CORS:        Allowed

URL Parameters:
- userId: number (required)

Query Parameters:
- page: number (optional, default: 1)
- limit: number (optional, default: 50)

Response (200 OK):
[
  {
    "id": 1,
    "title": "Complete Java Fundamentals",
    "description": "Learn basic Java concepts",
    "userId": 1,
    "courseId": 5,
    "completed": false,
    "dueDate": "2026-04-25",
    "createdAt": "2026-04-19T10:30:00Z",
    "updatedAt": "2026-04-19T10:30:00Z"
  },
  ...
]

Error Responses:
- 500: {message: "Failed to fetch tasks"}

Frontend Integration: App.fetchTasks()
File: src/App.js (lines 58-72)
Used in: Fetch on component mount and activeUserId change
```

#### 3.3 Create Task

```
Endpoint:    POST /api/v1/tasks
Port:        8080 (LMS Service)
Auth:        Optional (Bearer Token)
CORS:        Allowed

Request Body:
{
  "userId": 1,                    // Required
  "title": "Complete Java Fundamentals",  // Required
  "description": "Learn basics",  // Optional
  "dueDate": "2026-04-25"        // Optional (format: YYYY-MM-DD)
}

Response (201 Created):
{
  "id": 1,
  "title": "Complete Java Fundamentals",
  "description": "Learn basics",
  "userId": 1,
  "courseId": null,
  "completed": false,
  "dueDate": "2026-04-25",
  "createdAt": "2026-04-19T10:30:00Z",
  "updatedAt": "2026-04-19T10:30:00Z"
}

Error Responses:
- 400: {message: "Missing required fields"}
- 401: {message: "Unauthorized (optional)"}
- 404: {message: "User not found"}
- 500: {message: "Failed to create task"}

Frontend Integration: App.createTask()
File: src/App.js (lines 121-135)
Called by: AddTaskForm component
```

#### 3.4 Update Task

```
Endpoint:    PUT /api/v1/tasks/{taskId}
Port:        8080 (LMS Service)
Auth:        Optional
CORS:        Allowed

URL Parameters:
- taskId: number (required)

Request Body (partial updates supported):
{
  "title": "Updated Title",
  "description": "Updated description",
  "dueDate": "2026-04-26"
}

Response (200 OK):
{
  "id": 1,
  "title": "Updated Title",
  "description": "Updated description",
  "userId": 1,
  "completed": false,
  "dueDate": "2026-04-26",
  "updatedAt": "2026-04-19T15:30:00Z"
}

Error Responses:
- 400: {message: "Invalid input"}
- 401: {message: "Unauthorized"}
- 404: {message: "Task not found"}
- 500: {message: "Failed to update task"}
```

#### 3.5 Toggle Task Completion

```
Endpoint:    PATCH /api/v1/tasks/{taskId}/toggle
Port:        8080 (LMS Service)
Auth:        Optional
CORS:        Allowed

URL Parameters:
- taskId: number (required)

Response (200 OK):
{
  "id": 1,
  "title": "Complete Java Fundamentals",
  "completed": true,
  "updatedAt": "2026-04-19T15:30:00Z",
  "message": "Task marked as completed"
}

Error Responses:
- 401: {message: "Unauthorized"}
- 404: {message: "Task not found"}
- 500: {message: "Failed to toggle task"}

Frontend Integration: App.toggleTask()
File: src/App.js (lines 98-111)
Called by: TaskBoard component
```

#### 3.6 Delete Task

```
Endpoint:    DELETE /api/v1/tasks/{taskId}
Port:        8080 (LMS Service)
Auth:        Optional
CORS:        Allowed

URL Parameters:
- taskId: number (required)

Response (204 No Content)

Error Responses:
- 401: {message: "Unauthorized"}
- 404: {message: "Task not found"}
- 500: {message: "Failed to delete task"}

Frontend Integration: App.deleteTask()
File: src/App.js (lines 113-120)
Called by: TaskBoard component with confirmation dialog
```

---

### 4. COURSE MANAGEMENT ENDPOINTS (LMS Service - Port 8080)

#### 4.1 Get All Courses

```
Endpoint:    GET /api/v1/courses
Port:        8080 (LMS Service)
Auth:        None (public)
CORS:        Allowed

Query Parameters:
- page: number (optional)
- limit: number (optional)
- category: string (optional)
- difficulty: string (optional)

Response (200 OK):
{
  "content": [
    {
      "id": 1,
      "title": "Java Fundamentals",
      "description": "Learn Java basics",
      "category": "Programming",
      "difficulty": "Beginner",
      "estimatedHours": 40,
      "createdAt": "2026-01-15T10:00:00Z"
    },
    ...
  ],
  "page": 0,
  "size": 20
}

Error Responses:
- 500: {message: "Failed to fetch courses"}

Frontend Integration: CourseService.getCourses()
File: src/services/CourseService.js (lines 3-13)
Called by: App.fetchCourses() (lines 74-84)
```

#### 4.2 Get Single Course

```
Endpoint:    GET /api/v1/courses/{courseId}
Port:        8080 (LMS Service)
Auth:        None
CORS:        Allowed

URL Parameters:
- courseId: number (required)

Response (200 OK):
{
  "id": 1,
  "title": "Java Fundamentals",
  "description": "Learn Java basics",
  "category": "Programming",
  "difficulty": "Beginner",
  "estimatedHours": 40,
  "modules": [
    {
      "id": 1,
      "title": "Introduction to Java",
      "description": "Basic concepts"
    }
  ],
  "createdAt": "2026-01-15T10:00:00Z"
}

Error Responses:
- 404: {message: "Course not found"}
- 500: {message: "Failed to fetch course"}

Frontend Integration: CourseService.getCourseById()
File: src/services/CourseService.js (lines 15-24)
Used in: SyllabusModal component
```

#### 4.3 Get Courses by Category

```
Endpoint:    GET /api/v1/courses/category/{category}
Port:        8080 (LMS Service)
Auth:        None
CORS:        Allowed

URL Parameters:
- category: string (required) - e.g., "Programming", "Design"

Response (200 OK):
[
  {
    "id": 1,
    "title": "Java Fundamentals",
    ...
  },
  ...
]

Error Responses:
- 500: {message: "Failed to fetch courses"}
```

#### 4.4 Enroll User in Course

```
Endpoint:    POST /api/v1/courses/{courseId}/enroll
Port:        8080 (LMS Service)
Auth:        Required (Bearer Token)
CORS:        Allowed

URL Parameters:
- courseId: number (required)

Request Body:
{
  "userId": 1
}

Response (201 Created):
{
  "message": "Successfully enrolled in course",
  "taskCreated": {
    "id": 10,
    "title": "Complete: Java Fundamentals",
    "userId": 1,
    "courseId": 1
  }
}

Error Responses:
- 400: {message: "Missing userId"}
- 401: {message: "Unauthorized"}
- 404: {message: "Course or User not found"}
- 500: {message: "Failed to enroll in course"}

Frontend Integration: CourseCatalog.handleEnroll()
File: src/components/CourseCatalog.js (lines 15-35)
Calls: api.post(/courses/{courseId}/enroll)
```

---

### 5. CATALOG SERVICE ENDPOINTS (Port 8081)

#### 5.1 Get All Courses (Paginated)

```
Endpoint:    GET /api/v1/courses
Port:        8081 (Catalog Service)
Auth:        None (public)
CORS:        Allowed

Query Parameters:
- page: number (default: 0)
- size: number (default: 20)

Response (200 OK):
{
  "content": [
    {
      "id": 1,
      "title": "Java Fundamentals",
      "description": "Learn Java basics",
      "category": "Programming",
      "difficulty": "Beginner",
      "estimatedHours": 40
    },
    ...
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20
  },
  "totalElements": 50,
  "totalPages": 3
}

Error Responses:
- 500: {message: "Failed to fetch courses"}

NOTE: Frontend currently uses LMS Service (8080)
May switch to Catalog Service (8081) in future
```

---

### 6. ADMIN OPERATIONS ENDPOINTS (Admin Service - Port 8082)

#### 6.1 Assign Course to User

```
Endpoint:    POST /api/v1/admin/courses/assign
Port:        8082 (Admin Service)
Auth:        Required (Bearer Token)
Role:        ROLE_ADMIN or ROLE_SUPER_ADMIN
CORS:        Allowed

Request Body:
{
  "userId": 1,
  "courseId": 5,
  "description": "Essential Java programming concepts"
}

Response (201 Created):
{
  "message": "Course assigned successfully",
  "taskCreated": {
    "id": 10,
    "title": "Complete: Java Fundamentals",
    "userId": 1,
    "courseId": 5
  }
}

Error Responses:
- 400: {message: "Invalid userId or courseId"}
- 401: {message: "Unauthorized"}
- 403: {message: "Forbidden (insufficient permissions)"}
- 500: {message: "Failed to assign course"}

Frontend Integration: AdminPanel.assignCourse()
File: src/components/AdminPanel.js (line ~120)
NOT FULLY IMPLEMENTED - Marked as Task 4
```

#### 6.2 Get Global Statistics

```
Endpoint:    GET /api/v1/admin/dashboard/stats
Port:        8082 (Admin Service)
Auth:        Required (Bearer Token)
Role:        ROLE_ADMIN or ROLE_SUPER_ADMIN
CORS:        Allowed

Response (200 OK):
{
  "totalUsers": 150,
  "activeUsers": 120,
  "totalCoursesAssigned": 300,
  "completedCourses": 80,
  "averageProgress": 45.5,
  "updatedAt": "2026-04-20T14:30:00Z"
}

Error Responses:
- 401: {message: "Unauthorized"}
- 403: {message: "Forbidden (insufficient permissions)"}
- 500: {message: "Failed to fetch statistics"}

Frontend Integration: AdminPanel.fetchStats()
File: src/components/AdminPanel.js (lines 57-81)
Used in: AdminStats component (TASK 4)
```

#### 6.3 Update Course Content

```
Endpoint:    PUT /api/v1/admin/courses/{courseId}/content
Port:        8082 (Admin Service)
Auth:        Required (Bearer Token)
Role:        ROLE_ADMIN or ROLE_SUPER_ADMIN
CORS:        Allowed

URL Parameters:
- courseId: number (required)

Request Body:
{
  "description": "Updated course description",
  "content": "New course content",
  "modules": [
    {
      "title": "Module 1",
      "description": "Module content"
    }
  ]
}

Response (200 OK):
{
  "message": "Course content updated successfully",
  "courseId": 5
}

Error Responses:
- 400: {message: "Invalid request body"}
- 401: {message: "Unauthorized"}
- 403: {message: "Forbidden"}
- 404: {message: "Course not found"}
- 500: {message: "Failed to update course"}
```

---

## DATABASE SCHEMA & RELATIONSHIPS

### 1. USERS TABLE (Admin Service - Public Schema)

```sql
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone_number VARCHAR(20) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'ROLE_USER',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
);
```

**Field Specifications:**

| Field         | Type         | Constraints                 | Purpose                                   |
| ------------- | ------------ | --------------------------- | ----------------------------------------- |
| id            | BIGSERIAL    | PRIMARY KEY, AUTO_INCREMENT | Unique identifier                         |
| full_name     | VARCHAR(255) | NOT NULL                    | User's display name                       |
| email         | VARCHAR(255) | UNIQUE, NOT NULL            | Login credential                          |
| phone_number  | VARCHAR(20)  | UNIQUE                      | Alternative contact                       |
| password_hash | VARCHAR(255) | NOT NULL                    | Hashed password (bcrypt)                  |
| role          | VARCHAR(50)  | DEFAULT 'ROLE_USER'         | ROLE_USER / ROLE_ADMIN / ROLE_SUPER_ADMIN |
| is_active     | BOOLEAN      | DEFAULT true                | Account status                            |
| created_at    | TIMESTAMP    | DEFAULT NOW()               | Account creation date                     |
| updated_at    | TIMESTAMP    | DEFAULT NOW()               | Last modification                         |
| last_login    | TIMESTAMP    | NULL                        | Tracks login activity                     |

**Relationships:**

- Has many: OTP Verifications (1:N)
- Has many: Learning Tasks (1:N) via LMS Service
- Has many: Course Enrollments (1:N) via LMS Service

**Frontend Integration:**

```javascript
// AuthService.js - stores user after login
localStorage.setItem("user", JSON.stringify(res.data.user));

// AuthService.getUser() retrieves from storage
const user = AuthService.getUser();
// Returns: {id, fullName, email, phoneNumber, role}
```

---

### 2. OTP_VERIFICATIONS TABLE (Admin Service - Public Schema)

```sql
CREATE TABLE otp_verifications (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  otp_code VARCHAR(10) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  destination_type VARCHAR(50),
  is_verified BOOLEAN DEFAULT false,
  attempt_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_id (user_id),
  INDEX idx_expires_at (expires_at)
);
```

**Field Specifications:**

| Field            | Type         | Purpose                  |
| ---------------- | ------------ | ------------------------ |
| id               | BIGSERIAL    | Unique identifier        |
| user_id          | BIGINT       | Reference to users table |
| otp_code         | VARCHAR(10)  | 6-digit OTP              |
| destination      | VARCHAR(255) | Email or phone number    |
| destination_type | VARCHAR(50)  | 'EMAIL' or 'PHONE'       |
| is_verified      | BOOLEAN      | Verification status      |
| attempt_count    | INT          | Failed attempts counter  |
| created_at       | TIMESTAMP    | Generation timestamp     |
| expires_at       | TIMESTAMP    | Expiry time (10 minutes) |

**Relationships:**

- Belongs to: User (Many:1)

---

### 3. ADMIN_STATS TABLE (Admin Service - Public Schema)

```sql
CREATE TABLE admin_stats (
  id BIGSERIAL PRIMARY KEY,
  total_users INT DEFAULT 0,
  active_users INT DEFAULT 0,
  total_courses_assigned INT DEFAULT 0,
  completed_courses INT DEFAULT 0,
  average_progress DECIMAL(5,2) DEFAULT 0.0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_updated_at (updated_at)
);
```

**Field Specifications:**

| Field                  | Type         | Purpose                     |
| ---------------------- | ------------ | --------------------------- |
| id                     | BIGSERIAL    | Unique identifier           |
| total_users            | INT          | Total registered users      |
| active_users           | INT          | Users active in last 7 days |
| total_courses_assigned | INT          | Total course assignments    |
| completed_courses      | INT          | Courses completed by users  |
| average_progress       | DECIMAL(5,2) | Average completion %        |
| created_at             | TIMESTAMP    | Record creation             |
| updated_at             | TIMESTAMP    | Last update                 |

**Frontend Integration:**

```javascript
// AdminPanel.js fetches stats
const response = await adminApi.get("/admin/dashboard/stats");
// Used in AdminStats component
```

---

### 4. LEARNING_TASKS TABLE (LMS Service - Public Schema)

```sql
CREATE TABLE learning_tasks (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  course_id BIGINT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  due_date DATE,
  deleted BOOLEAN DEFAULT false,
  INDEX idx_user_id (user_id),
  INDEX idx_completed (completed),
  INDEX idx_due_date (due_date)
);
```

**Field Specifications:**

| Field       | Type         | Purpose                      |
| ----------- | ------------ | ---------------------------- |
| id          | BIGSERIAL    | Unique identifier            |
| user_id     | BIGINT       | Reference to user            |
| course_id   | BIGINT       | Associated course (nullable) |
| title       | VARCHAR(255) | Task title                   |
| description | TEXT         | Task details                 |
| completed   | BOOLEAN      | Completion status            |
| created_at  | TIMESTAMP    | Creation date                |
| updated_at  | TIMESTAMP    | Last modification            |
| due_date    | DATE         | Task deadline                |
| deleted     | BOOLEAN      | Soft delete flag             |

**Frontend Integration:**

```javascript
// App.js fetches tasks
const res = await api.get(`/tasks/user/${userId}`);
setTasks(res.data || []);

// Task object structure:
{
  id: 1,
  title: "Complete Java Fundamentals",
  description: "Learn basic Java concepts",
  userId: 1,
  courseId: 5,
  completed: false,
  dueDate: "2026-04-25",
  createdAt: "2026-04-19T10:30:00Z",
  updatedAt: "2026-04-19T10:30:00Z"
}
```

---

### 5. COURSES TABLE (LMS Service - Public Schema)

```sql
CREATE TABLE courses (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  difficulty VARCHAR(50),
  estimated_hours INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_difficulty (difficulty)
);
```

**Field Specifications:**

| Field           | Type         | Purpose                            |
| --------------- | ------------ | ---------------------------------- |
| id              | BIGSERIAL    | Unique identifier                  |
| title           | VARCHAR(255) | Course name                        |
| description     | TEXT         | Course details                     |
| category        | VARCHAR(100) | e.g., "Programming", "Design"      |
| difficulty      | VARCHAR(50)  | Beginner / Intermediate / Advanced |
| estimated_hours | INT          | Course duration                    |
| created_at      | TIMESTAMP    | Creation date                      |
| updated_at      | TIMESTAMP    | Last update                        |

**Frontend Integration:**

```javascript
// CourseService.getCourses()
const res = await api.get("/courses");

// Course object:
{
  id: 1,
  title: "Java Fundamentals",
  description: "Learn Java basics",
  category: "Programming",
  difficulty: "Beginner",
  estimatedHours: 40,
  createdAt: "2026-01-15T10:00:00Z"
}
```

---

### 6. MODULES TABLE (LMS Service - Public Schema - Optional)

```sql
CREATE TABLE modules (
  id BIGSERIAL PRIMARY KEY,
  course_id BIGINT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INT,
  duration VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id),
  INDEX idx_course_id (course_id),
  INDEX idx_order_index (order_index)
);
```

**Field Specifications:**

| Field       | Type         | Purpose              |
| ----------- | ------------ | -------------------- |
| id          | BIGSERIAL    | Unique identifier    |
| course_id   | BIGINT       | Reference to courses |
| title       | VARCHAR(255) | Module name          |
| description | TEXT         | Module content       |
| order_index | INT          | Sequence in course   |
| duration    | VARCHAR(100) | Estimated duration   |
| created_at  | TIMESTAMP    | Creation date        |

**Frontend Integration:**

```javascript
// SyllabusModal.js displays modules
const modules = course.modules || [];
// Module structure:
{
  id: 1,
  title: "Introduction to Java",
  description: "Basic concepts",
  duration: "2 hours"
}
```

---

### 7. Database Access Configuration

**File Location:** Backend environment variables

```properties
# PostgreSQL Connection (Supabase)
spring.datasource.url=jdbc:postgresql://db.ybltvwovudgeyfybygqu.supabase.co:5432/postgres
spring.datasource.username=postgres
spring.datasource.password=eekitikki@JGJ9
spring.datasource.driver-class-name=org.postgresql.Driver

# Connection Pool (HikariCP)
spring.datasource.hikari.connection-timeout=30000
spring.datasource.hikari.maximum-pool-size=5

# JPA/Hibernate
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=update
```

---

## SERVICE CONFIGURATION & SETUP

### Frontend Service Configuration

#### 1. AuthService (Admin Service - Port 8082)

```javascript
// File: src/services/AuthService.js
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const authApi = axios.create({
  baseURL: "http://localhost:8082/api/v1",
});

// Key Methods:
-register(fullName, email, phoneNumber, password) -
  login(email, password) -
  requestOTP(email) -
  sendPhoneOTP(phoneNumber) -
  verifyOTP(emailOrPhone, otp) -
  getToken() -
  getUser() -
  getUserRole() -
  isAuthenticated() -
  logout() -
  refreshToken();

// Token Storage: localStorage.authToken
// User Storage: localStorage.user
```

#### 2. LMS API Service (Port 8080)

```javascript
// File: src/services/api.js
import axios from "axios";
import AuthService from "./AuthService";

export const api = axios.create({
  baseURL: "http://localhost:8080/api/v1",
});

// Interceptors:
- Request: Adds Bearer token from AuthService
- Response:
  - 401: Attempts token refresh
  - 403: Shows permission error toast
```

#### 3. CourseService (Catalog Service - Port 8081)

```javascript
// File: src/services/CourseService.js
export const CourseService = {
  getCourses()      // GET /api/v1/courses
  getCourseById()   // GET /api/v1/courses/{id}
  getModules()      // GET /api/v1/courses/{id}/modules
  enrollCourse()    // POST /api/v1/courses/enroll
}
```

### CORS Configuration Required

All backend services must allow:

```
Origin: http://localhost:3000
Methods: GET, POST, PUT, DELETE, PATCH
Headers: Content-Type, Authorization
Credentials: true
```

---

## ERROR HANDLING & EXCEPTION MANAGEMENT

### 1. Global Error Handling Strategy

#### Frontend Error Types

```javascript
// 1. Axios Error (Network/HTTP)
try {
  await api.get("/tasks");
} catch (err) {
  // err.response?.status
  // err.response?.data?.message
  // err.message
}

// 2. Application Error
throw new Error("Custom error message");

// 3. Auth Error
AuthService.logout();
window.location.href = "/login";
```

#### Error Response Flow

```
Backend Error
    ↓
Axios Interceptor
    ↓
Error Handler
    ↓
Toast Notification + Console Log
    ↓
State Update (if needed)
    ↓
UI Refresh
```

### 2. Detailed Error Handling by Endpoint

#### Authentication Errors

```javascript
// File: src/services/AuthService.js (lines 16-26)
try {
  const res = await authApi.post("/auth/register", {...});
  if (res.data.token) {
    localStorage.setItem("authToken", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    return res.data;
  }
  throw new Error("No token returned");
} catch (err) {
  throw err.response?.data?.message ||
        err.message ||
        "Registration failed";
}
```

**Error Messages Handled:**

- "Email already registered"
- "Phone number already registered"
- "Invalid email format"
- "Password too weak"
- "No token returned"

#### Task Management Errors

```javascript
// File: src/App.js (lines 98-111)
const toggleTask = async (taskId) => {
  try {
    await api.patch(`/tasks/${taskId}/toggle`);
    fetchTasks(activeUserId);
  } catch (err) {
    console.error(err);
    setTasksError(err.message || "Toggle failed");
    toast.error("Failed to toggle task");
  }
};
```

**Error Handling Pattern:**

1. Console logging for debugging
2. State update (setTasksError)
3. User notification (toast)
4. UI state reversal (loading → false)

#### Course Enrollment Errors

```javascript
// File: src/components/CourseCatalog.js (lines 15-35)
try {
  await api.post(`/courses/${course.id}/enroll`, {
    userId: activeUserId,
  });
  toast.success(`Successfully enrolled in ${course.title}!`);
  onEnrollSuccess();
} catch (err) {
  const errorMsg =
    err.response?.data?.message || "Enrollment failed. Please try again.";
  toast.error(errorMsg);
  console.error(err);
}
```

### 3. Axios Interceptor Error Handling

```javascript
// File: src/services/api.js (lines 37-68)
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // 401 Unauthorized - Token Expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      try {
        const newToken = await AuthService.refreshToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        AuthService.logout();
        window.location.href = "/login";
        toast.error("Session expired. Please login again.");
        return Promise.reject(refreshError);
      }
    }

    // 403 Forbidden - Permission Denied
    if (error.response?.status === 403) {
      toast.error("Access denied. You don't have permission...");
    }

    return Promise.reject(error);
  },
);
```

### 4. Component-Level Error States

```javascript
// File: src/App.js
const [tasksLoading, setTasksLoading] = useState(false);
const [tasksError, setTasksError] = useState(null);

const fetchTasks = async (userId) => {
  setTasksLoading(true);
  setTasksError(null);
  try {
    const res = await api.get(`/tasks/user/${userId}`);
    setTasks(res.data || []);
  } catch (err) {
    setTasksError(err.message || "Failed to load tasks");
  } finally {
    setTasksLoading(false);
  }
};

// Render error
{
  tasksError && <div className="mt-3 text-red-600">{tasksError}</div>;
}
```

### 5. Error Toast Notifications

```javascript
import toast from "react-hot-toast";

// Success
toast.success("Task created");

// Error
toast.error("Failed to delete task");

// Configured in index.js
<Toaster position="top-right" />;
```

### 6. Exception Hierarchy

```
Error
├── Axios Errors (Network/HTTP)
│   ├── 400 Bad Request
│   ├── 401 Unauthorized
│   ├── 403 Forbidden
│   ├── 404 Not Found
│   ├── 429 Rate Limited
│   └── 500 Server Error
├── Application Errors
│   ├── Validation Errors
│   ├── State Management Errors
│   └── Parsing Errors
└── User Errors
    ├── Form Validation
    ├── Missing Fields
    └── Invalid Input
```

---

## COMPONENT ANALYSIS & STRUCTURE

### 1. LoginPage Component

**File:** `src/components/LoginPage.js`

**Purpose:** User authentication (email/password, email OTP, phone OTP)

**State Management:**

```javascript
const [authMode, setAuthMode] = useState("email"); // "email" or "phone"
const [email, setEmail] = useState("");
const [phoneNumber, setPhoneNumber] = useState("");
const [password, setPassword] = useState("");
const [otp, setOtp] = useState("");
const [showOTP, setShowOTP] = useState(false);
const [showPassword, setShowPassword] = useState(false);
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
```

**Key Methods:**

- `handleRequestOTP()` - Sends OTP via email/phone
- `handleVerifyOTP()` - Verifies OTP and logs in
- `handleLogin()` - Email/password login

**API Calls:**

- POST /auth/request-otp (email)
- POST /auth/send-otp (phone)
- POST /auth/verify-otp (both)
- POST /auth/login (email/password)

**Issues Found:**

- No max attempt limiting on UI
- Phone auto-format missing
- OTP timer not implemented

---

### 2. RegisterPage Component

**File:** `src/components/RegisterPage.js`

**Purpose:** User registration with validation

**Validation Rules:**

- Full name: 2+ characters
- Email: Valid format
- Phone: 10 digits (India format)
- Password: 8+ chars, uppercase, lowercase, numbers
- Password confirmation: Must match

**State:**

```javascript
const [fullName, setFullName] = useState("");
const [email, setEmail] = useState("");
const [phoneNumber, setPhoneNumber] = useState("");
const [password, setPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
```

**API Call:**

- POST /auth/register

**Issues Found:**

- No feedback on password strength
- Phone input not auto-formatted
- No terms & conditions acceptance

---

### 3. TaskBoard Component

**File:** `src/components/TaskBoard.js`

**Purpose:** Display filtered/sorted task list

**Props:**

```javascript
tasks = [];
onToggle = () => {};
onDelete = () => {};
taskShowCompleted = false;
taskSortBy = "dueDate";
onShowCompletedChange = () => {};
onSortByChange = () => {};
```

**Filtering Logic:**

- Toggle: Completed vs Active tasks
- Filter condition: `taskShowCompleted === task.completed`

**Sorting Logic:**

- "dueDate": Ascending (earliest first)
- "created": Descending (newest first)
- "newest": Descending

**Issues Found:**

- Sorting applied before filtering in display
- Empty states could show counts
- No task details view

---

### 4. AddTaskForm Component

**File:** `src/components/AddTaskForm.js`

**Purpose:** Create new task

**Form Fields:**

- Title (required)
- Description (optional)

**API Call:**

- POST /tasks

**Issues Found:**

- No due date input field
- No course selection
- Missing date picker
- Title required but not explicitly validated

---

### 5. CourseCatalog Component

**File:** `src/components/CourseCatalog.js`

**Purpose:** Display courses and handle enrollment

**Props:**

```javascript
courses = [];
activeUserId = null;
onEnrollSuccess = () => {};
```

**Grid Layout:**

- 1 column (mobile)
- 2 columns (tablet)
- 3 columns (desktop)

**API Calls:**

- POST /courses/{id}/enroll

**Issues Found:**

- No search/filter for courses
- No course preview before enrollment
- Enroll button not disabled if already enrolled

---

### 6. AdminPanel Component

**File:** `src/components/AdminPanel.js`

**Purpose:** Admin dashboard for user, course, and assignment management

**Tabs:**

- users (list all users)
- courses (list all courses)
- assign (assign course to user)
- dashboard (global statistics - TASK 4)

**API Calls:**

- GET /users
- GET /courses
- POST /admin/courses/assign
- GET /admin/dashboard/stats

**State Management:**

```javascript
const [users, setUsers] = useState([]);
const [courses, setCourses] = useState([]);
const [stats, setStats] = useState(null);
const [assignForm, setAssignForm] = useState({ userId: "", courseId: "" });
const [courseForm, setCourseForm] = useState({
  id: "",
  title: "",
  description: "",
  content: "",
});
const [viewingUser, setViewingUser] = useState(null);
```

**Issues Found:**

- Assign tab form not complete
- Course editing not implemented
- Stats endpoint may have auth issues
- No pagination for user/course lists
- Limited error handling on stat fetch

---

### 7. AdminStats Component

**File:** `src/components/AdminStats.js`

**Purpose:** Display admin dashboard statistics (TASK 4 - Pending)

**Stat Cards Displayed:**

1. Total Users (Users icon)
2. Active Users (UserCheck icon)
3. Courses Assigned (BookOpen icon)
4. Completed Courses (CheckCircle icon)
5. Average Progress (TrendingUp icon)
6. Last Updated (Clock icon)

**Props:**

```javascript
stats = null;
loading = false;
error = "";
```

**API Integration:**

- Fetches from GET /admin/dashboard/stats
- Called in AdminPanel.fetchStats()

**Issues Found:**

- Stats endpoint requires proper auth header setup
- Calculated fields may be null
- No refresh button
- Color coding could be more visual

---

### 8. Supporting Components

#### Stats Component (src/components/Stats.js)

```javascript
// Displays user's personal statistics
- Total tasks
- Completed tasks
- Pending tasks
```

#### Spinner Component (src/components/Spinner.js)

```javascript
// Animated loading indicator
// Used in all async operations
```

#### SyllabusModal Component (src/components/SyllabusModal.js)

```javascript
// Modal showing course modules
- Modal with overlay
- Module list display
- Close button
```

#### UserSwitcher Component (src/components/UserSwitcher.js)

```javascript
// DEPRECATED in current implementation
// Locks to current user for security
// Left as reference, not used
```

---

## IDENTIFIED FLAWS & BREAKPOINTS

### 🔴 CRITICAL ISSUES

#### 1. **Token Refresh Mechanism Incomplete**

**Location:** AuthService.js (lines 145-158) + api.js (lines 37-51)

**Issue:** The refresh token endpoint may not work correctly

```javascript
// Problem: refreshToken() calls auth/refresh without payload
const res = await authApi.post("/auth/refresh");
// Backend may require:
// - refreshToken in Authorization header
// - Or refreshToken in request body
```

**Impact:**

- Users logged out after 24h instead of getting seamless refresh
- Frontend shows "Session expired" instead of transparent renewal

**Fix Needed:**

```javascript
// Check backend requirements for refresh endpoint
// Possibly need to send refresh token
const res = await authApi.post("/auth/refresh", {
  refreshToken: localStorage.getItem("refreshToken"),
});
```

---

#### 2. **OTP Phone Number Field Mismatch**

**Location:** AuthService.js (line 72) + Backend API

**Issue:**

```javascript
// Frontend sends:
{ phone_number: "9876543210", otp: "123456" }

// But backend verify endpoint might expect:
{ phoneNumber: "9876543210", otp: "123456" }
```

**Impact:**

- OTP verification fails for phone-based authentication
- Users cannot login via phone OTP

**Fix Needed:**
Verify backend API contract for field naming (snake_case vs camelCase)

---

#### 3. **Missing Due Date Input in AddTaskForm**

**Location:** AddTaskForm.js (complete file)

**Issue:**

```javascript
// Form only has title and description
// Missing due_date field which is in backend schema
```

**Impact:**

- Tasks created without due dates
- Cannot track task deadlines
- Due date sorting doesn't work effectively

**Fix Needed:**

```javascript
// Add date input field
<input type="date" value={dueDate} onChange={...} />
```

---

#### 4. **Auth Token Storage Not Secure**

**Location:** AuthService.js (lines 20, 35) + Multiple components

**Issue:**

```javascript
// Using localStorage for sensitive JWT tokens
localStorage.setItem("authToken", res.data.token);

// Vulnerable to:
// - XSS attacks (JavaScript can access)
// - CSRF attacks
// - Local storage cloning
```

**Impact:**

- Token theft via malicious scripts
- Man-in-the-middle attacks

**Fix Needed:**

- Implement httpOnly cookies (backend requirement)
- Backend must set Set-Cookie header with httpOnly flag
- Remove localStorage token storage

---

#### 5. **Admin Stats Endpoint Authorization Issue**

**Location:** AdminPanel.js (lines 62-81)

**Issue:**

```javascript
// Token sent in header without proper Bearer prefix verification
const response = await adminApi.get("/admin/dashboard/stats", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// But interceptor ALSO adds token, causing duplicate header
```

**Impact:**

- 401 Unauthorized errors when fetching stats
- Admins can't see dashboard stats

**Fix Needed:**

```javascript
// Remove manual header addition, rely on interceptor
const response = await adminApi.get("/admin/dashboard/stats");
```

---

### ⚠️ MAJOR ISSUES

#### 6. **Course Enrollment Always Creates Tasks**

**Location:** Backend behavior

**Issue:**

- When user enrolls in course, task is auto-created
- Enrolling in same course twice may create duplicate tasks

**Impact:**

- Duplicate tasks in task list
- Confusing for users

**Fix Needed:**

- Backend should check if task already exists
- Frontend should prevent double-enrollment

---

#### 7. **No Pagination for Large Lists**

**Location:** AdminPanel.js (lines 39-52), CourseCatalog.js

**Issue:**

```javascript
// Fetches all users without limit
const res = await adminApi.get("/users");
setUsers(res.data || []);

// If 10,000 users, all loaded at once
```

**Impact:**

- Memory overhead
- Slow rendering
- Poor performance

**Fix Needed:**

```javascript
// Implement pagination
const res = await adminApi.get("/users", {
  params: { page: currentPage, limit: 20 },
});
```

---

#### 8. **Admin Panel Course Assignment Form Incomplete**

**Location:** AdminPanel.js (lines ~120-150)

**Issue:**

- The assign course form exists but submit handler not fully implemented
- TASK 4 pending

**Impact:**

- Admin cannot assign courses to users
- Feature not functional

**Fix Needed:**

- Implement handleAssignCourse()
- Add form validation
- Add error handling

---

#### 9. **User Switching Disabled for Security**

**Location:** App.js (line 47)

**Issue:**

```javascript
// Set activeUserId to current user's ID
// Prevents user switching (good for security)
// But UserSwitcher component still in code (unused)
```

**Impact:**

- Component dead code
- Confusing for developers

**Fix Needed:**

- Remove UserSwitcher component
- Document security decision

---

#### 10. **No Input Sanitization**

**Location:** All form components (LoginPage, RegisterPage, AddTaskForm)

**Issue:**

```javascript
// User input directly used without sanitization
const [title, setTitle] = useState("");
// Then sent to API without sanitization
await api.post("/tasks", { title });
```

**Impact:**

- Potential XSS attacks
- Stored XSS if rendered without escaping
- SQL injection if backend vulnerable

**Fix Needed:**

- Sanitize input using DOMPurify
- Backend should also validate/sanitize

---

### ⚠️ MINOR ISSUES

#### 11. **Console Errors on Page Load**

**Location:** Various components

**Issue:**

```javascript
// Missing error boundary
// Unhandled promise rejections
console.error() calls scattered everywhere
```

**Impact:**

- Console pollution
- Hard to debug
- Unprofessional logging

**Fix Needed:**

- Implement React Error Boundary
- Use centralized logging
- Remove console.error() or use logger

---

#### 12. **No Loading State for Course Enrollment**

**Location:** CourseCatalog.js (line 12)

**Issue:**

```javascript
// Enroll button shows loading during request
// But user might click multiple times
```

**Impact:**

- Duplicate enrollment requests possible
- Multiple tasks created

**Fix Needed:**

```javascript
// Disable button during request
<button disabled={enrolling === course.id}>Enroll</button>
```

---

#### 13. **Task Sorting Applied After Rendering**

**Location:** App.js (lines 280-310)

**Issue:**

```javascript
// Inline sort function in render
// Re-sorts on every render
// Not memoized
```

**Impact:**

- Performance issue with many tasks
- Animation jitter

**Fix Needed:**

- Use useMemo for sorting logic
- Move to separate function

---

#### 14. **No Mobile Responsiveness for Admin Panel**

**Location:** AdminPanel.js

**Issue:**

- Grid layouts not responsive
- Tables overflow on mobile

**Impact:**

- Poor mobile UX

**Fix Needed:**

- Add responsive Tailwind classes
- Test on mobile devices

---

#### 15. **Empty State Messages Not Consistent**

**Location:** Various components

**Issue:**

```javascript
// TaskBoard: "No active tasks. Great job!"
// CourseCatalog: "No courses available."
// Inconsistent messaging
```

**Impact:**

- Confusing UX

**Fix Needed:**

- Create consistent empty state component
- Centralize messages

---

---

## CRITICAL TODOs & RECOMMENDATIONS

### TASK 1: ✅ COMPLETE - User Registration

**Status:** COMPLETE  
**Completed Date:** April 2026  
**Implementation:** RegisterPage component fully functional

**What's Done:**

- ✅ Full registration form
- ✅ Password validation (strength requirements)
- ✅ Email validation
- ✅ Phone number validation (10 digits)
- ✅ Auto-login after registration
- ✅ API integration with /auth/register
- ✅ Error handling and display
- ✅ Responsive design

---

### TASK 2: ✅ COMPLETE - Phone OTP Authentication

**Status:** COMPLETE  
**Completed Date:** April 2026  
**Implementation:** LoginPage component + AuthService

**What's Done:**

- ✅ Phone number toggle in LoginPage
- ✅ 10-digit phone validation
- ✅ Phone OTP request (/auth/send-otp)
- ✅ Phone OTP verification
- ✅ Auto-detection (phone vs email)
- ✅ Error handling
- ✅ UI for OTP entry

**Known Issues:**

- ⚠️ Backend field naming may be snake_case (phone_number)
- ⚠️ Need to verify verify-otp accepts phoneNumber field

---

### TASK 3: ✅ COMPLETE - Task Filtering & Sorting

**Status:** COMPLETE  
**Completed Date:** April 2026  
**Implementation:** TaskBoard component + App.js logic

**What's Done:**

- ✅ Filter: Active vs Completed tasks
- ✅ Sort: Due Date, Created Date, Newest First
- ✅ Task counter display
- ✅ Empty state messages
- ✅ Toggle buttons
- ✅ Sort dropdown
- ✅ Filter logic working
- ✅ Visual feedback

**Known Issues:**

- ⚠️ AddTaskForm missing due date input
- ⚠️ Sorting applied inline (performance)
- ⚠️ Needs memoization for large lists

---

### TASK 4: 🟠 IN PROGRESS - Admin Dashboard Statistics

**Status:** PENDING COMPLETION  
**Priority:** HIGH  
**Estimated Effort:** 4-8 hours

**What's Needed:**

1. **Complete AdminStats Component:**
   - ✅ Component created (AdminStats.js)
   - ✅ Stat cards designed
   - ✅ Props structure defined
   - ❌ Data binding from AdminPanel
   - ❌ Error state handling refinement
   - ❌ Loading skeleton improved

2. **Fix Admin Panel Stats Fetch:**

   ```javascript
   // File: AdminPanel.js (lines 57-81)
   // Issue: Authorization header duplicate
   // Fix: Remove manual header, rely on interceptor
   const fetchStats = useCallback(async () => {
     try {
       const response = await adminApi.get("/admin/dashboard/stats");
       // Remove: headers: { Authorization: ... }
       setStats(response.data);
     } catch (error) {
       setStatsError(
         error.response?.data?.message || "Failed to load statistics",
       );
     }
   }, []);
   ```

3. **Complete Course Assignment Feature:**

   ```javascript
   // Implement assignCourse() method
   const assignCourse = async (userId, courseId, description) => {
     try {
       const res = await adminApi.post("/admin/courses/assign", {
         userId,
         courseId,
         description,
       });
       toast.success("Course assigned successfully");
       // Refresh lists
     } catch (err) {
       toast.error(err.response?.data?.message || "Failed to assign course");
     }
   };
   ```

4. **Add Course Management Tab:**
   - Edit course description
   - Update course modules
   - Delete courses (if authorized)

5. **Testing Checklist:**
   - [ ] Stats load correctly for admin
   - [ ] Stats auto-update every 5 minutes
   - [ ] Course assignment creates tasks
   - [ ] Duplicate assignment prevention
   - [ ] Proper error handling
   - [ ] Mobile responsiveness

---

### TASK 5: 🔴 NOT STARTED - Due Date Input in AddTaskForm

**Status:** NOT STARTED  
**Priority:** MEDIUM  
**Estimated Effort:** 2-3 hours

**What's Needed:**

```javascript
// Add date picker to AddTaskForm.js
const [dueDate, setDueDate] = useState("");

return (
  <form onSubmit={submit}>
    {/* Title input */}
    {/* Description input */}

    {/* NEW: Due Date Input */}
    <div>
      <label>Due Date (optional)</label>
      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        min={new Date().toISOString().split("T")[0]}
      />
    </div>

    <button type="submit">Add Task</button>
  </form>
);
```

**Files to Modify:**

- src/components/AddTaskForm.js
- Update onCreate payload to include dueDate

---

### TASK 6: 🔴 NOT STARTED - Fix Token Refresh Mechanism

**Status:** NOT STARTED  
**Priority:** CRITICAL  
**Estimated Effort:** 4-6 hours

**What's Needed:**

1. **Verify Backend Refresh Token Contract:**
   - Is refresh token stored in localStorage?
   - What endpoint format? (POST /auth/refresh)
   - Required headers/body?

2. **Update AuthService.js:**

```javascript
refreshToken: async () => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    // Or get from Authorization header
    const res = await authApi.post("/auth/refresh", {
      refreshToken: refreshToken,
    });

    if (res.data.token) {
      localStorage.setItem("authToken", res.data.token);
      if (res.data.refreshToken) {
        localStorage.setItem("refreshToken", res.data.refreshToken);
      }
      return res.data.token;
    }
    throw new Error("No token returned");
  } catch (err) {
    AuthService.logout();
    throw err;
  }
};
```

3. **Store Refresh Token After Login:**

```javascript
const res = await authApi.post("/auth/login", { email, password });
localStorage.setItem("authToken", res.data.token);
localStorage.setItem("refreshToken", res.data.refreshToken); // NEW
```

4. **Testing:**
   - [ ] Token refresh succeeds
   - [ ] User stays logged in past 24 hours
   - [ ] No manual logout required
   - [ ] Refresh token rotation works
   - [ ] Invalid refresh token logs out user

---

### TASK 7: 🔴 NOT STARTED - Security Hardening

**Status:** NOT STARTED  
**Priority:** CRITICAL  
**Estimated Effort:** 8-12 hours

**What's Needed:**

1. **Move to HttpOnly Cookies (Backend requirement):**
   - Backend must set Set-Cookie header with httpOnly, secure flags
   - Frontend cannot access via JavaScript (safer)
   - Automatic inclusion in requests

2. **Implement Input Sanitization:**

```javascript
npm install dompurify

import DOMPurify from 'dompurify';

// In forms
const sanitized = DOMPurify.sanitize(userInput);
```

3. **Add CSRF Protection:**
   - Implement CSRF tokens from backend
   - Include in POST/PUT/DELETE requests

4. **Implement Rate Limiting on Frontend:**

```javascript
const [loginAttempts, setLoginAttempts] = useState(0);

if (loginAttempts >= 5) {
  setError("Too many attempts. Try again in 5 minutes.");
  return;
}
```

5. **Add Content Security Policy (CSP):**
   - Configure in nginx/server headers

6. **Audit Checklist:**
   - [ ] No sensitive data in localStorage
   - [ ] CORS properly configured
   - [ ] HTTPS enforced
   - [ ] XSS protection implemented
   - [ ] CSRF protection added
   - [ ] SQL injection prevention (backend)
   - [ ] Rate limiting enabled
   - [ ] Audit logging added

---

### TASK 8: 🔴 NOT STARTED - Pagination Implementation

**Status:** NOT STARTED  
**Priority:** HIGH  
**Estimated Effort:** 6-8 hours

**What's Needed:**

1. **Admin Users List Pagination:**

```javascript
const [currentPage, setCurrentPage] = useState(1);
const [pageSize, setPageSize] = useState(20);

const fetchUsers = async () => {
  const res = await adminApi.get("/users", {
    params: {
      page: currentPage,
      limit: pageSize,
    },
  });
  setUsers(res.data.data);
  setTotalPages(res.data.pages);
};
```

2. **Add Pagination Component:**

```javascript
<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
/>
```

3. **Course Listing Pagination:**
   - Similar implementation for course lists
   - Default limit: 20 items per page

4. **Testing:**
   - [ ] First page loads correctly
   - [ ] Page navigation works
   - [ ] Last page shows correct count
   - [ ] Page size selector works
   - [ ] Performance improved

---

### TASK 9: 🔴 NOT STARTED - Error Boundary Implementation

**Status:** NOT STARTED  
**Priority:** MEDIUM  
**Estimated Effort:** 3-4 hours

**What's Needed:**

1. **Create Error Boundary Component:**

```javascript
// src/components/ErrorBoundary.js
import React from "react";

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200">
          <h2>Something went wrong</h2>
          <details>{this.state.error?.toString()}</details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

2. **Wrap App with Error Boundary:**

```javascript
// src/index.js
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

3. **Add Error Logging Service:**

```javascript
// src/services/ErrorLogger.js
const ErrorLogger = {
  log(error, errorInfo) {
    // Send to backend logging service
    // Or external service (Sentry, etc.)
    console.error(error, errorInfo);
  },
};
```

---

### TASK 10: 🔴 NOT STARTED - Unit & Integration Tests

**Status:** NOT STARTED  
**Priority:** MEDIUM  
**Estimated Effort:** 12-16 hours

**What's Needed:**

1. **Unit Tests:**
   - AuthService.js tests
   - Component render tests
   - State management tests

2. **Integration Tests:**
   - Auth flow (register → login → logout)
   - Task CRUD operations
   - Course enrollment flow

3. **Test Setup:**

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom jest-mock-axios
```

4. **Example Test:**

```javascript
// src/services/AuthService.test.js
describe("AuthService", () => {
  test("login returns token on success", async () => {
    const result = await AuthService.login("test@example.com", "pass");
    expect(result.token).toBeDefined();
  });
});
```

---

### TASK 11: 🔴 NOT STARTED - Performance Optimization

**Status:** NOT STARTED  
**Priority:** MEDIUM  
**Estimated Effort:** 6-8 hours

**What's Needed:**

1. **Memoization:**

```javascript
// In App.js - sort logic
const sortedTasks = useMemo(() => {
  return [...filteredTasks].sort((a, b) => {
    // ... sorting logic
  });
}, [filteredTasks, taskSortBy]);
```

2. **Component Memoization:**

```javascript
export default React.memo(TaskBoard, (prevProps, nextProps) => {
  return prevProps.tasks === nextProps.tasks;
});
```

3. **Lazy Loading:**

```javascript
const AdminPanel = lazy(() => import("./components/AdminPanel"));
```

4. **Code Splitting:**
   - Separate bundle for admin routes
   - Load on demand

---

## CODE QUALITY ASSESSMENT

### Overall Code Score: 72/100

**Breakdown:**

| Aspect                    | Score  | Details                                                    |
| ------------------------- | ------ | ---------------------------------------------------------- |
| **Functionality**         | 75/100 | Core MVP features work, TASK 4 pending                     |
| **Security**              | 45/100 | localStorage tokens, no sanitization, needs hardening      |
| **Performance**           | 60/100 | No memoization, inline renders, pagination missing         |
| **Testing**               | 20/100 | Minimal tests (setupTests.js only)                         |
| **Code Organization**     | 80/100 | Well-structured components, services isolated              |
| **Error Handling**        | 70/100 | Basic try-catch, good toast feedback, needs error boundary |
| **Documentation**         | 85/100 | Inline comments adequate, README incomplete                |
| **Maintainability**       | 75/100 | Component separation good, some code duplication           |
| **Accessibility**         | 65/100 | Basic HTML semantics, no ARIA labels                       |
| **Mobile Responsiveness** | 80/100 | Tailwind responsive classes, some overflow issues          |

### Code Quality Recommendations

#### High Priority

- [ ] Fix security issues (localStorage tokens, input sanitization)
- [ ] Implement error boundary
- [ ] Complete TASK 4 (Admin Dashboard)
- [ ] Fix token refresh mechanism
- [ ] Add input sanitization

#### Medium Priority

- [ ] Implement pagination
- [ ] Add memoization for performance
- [ ] Add unit tests (at least 50% coverage)
- [ ] Improve documentation
- [ ] Fix responsive design issues

#### Low Priority

- [ ] Add accessibility (ARIA labels)
- [ ] Code refactoring
- [ ] Component organization improvements
- [ ] Add analytics

---

## DEPLOYMENT CHECKLIST

### Pre-Production Tasks

- [ ] **Environment Variables Set Up**

  ```bash
  REACT_APP_API_BASE_URL=http://localhost:8080/api/v1
  REACT_APP_ADMIN_API_BASE_URL=http://localhost:8082/api/v1
  REACT_APP_CATALOG_API_BASE_URL=http://localhost:8081/api/v1
  ```

- [ ] **Build Optimization**

  ```bash
  npm run build
  # Check build size
  ```

- [ ] **Security Checks**
  - [ ] No hardcoded secrets
  - [ ] HTTPS configured
  - [ ] CORS properly set
  - [ ] HttpOnly cookies implemented
  - [ ] CSP headers configured

- [ ] **Performance Checks**
  - [ ] Lighthouse score > 80
  - [ ] First Contentful Paint < 2s
  - [ ] Largest Contentful Paint < 3s

- [ ] **Testing**
  - [ ] Manual smoke tests
  - [ ] Cross-browser testing
  - [ ] Mobile testing
  - [ ] API error scenarios tested

---

## SUMMARY & FINAL RECOMMENDATIONS

### What's Working Well ✅

1. Clean component architecture
2. Good authentication flow implementation
3. Responsive design with Tailwind
4. Proper separation of concerns (services)
5. Toast notifications for user feedback
6. Task filtering and sorting logic
7. Role-based routing

### Critical Issues to Fix 🔴

1. Security: localStorage token storage
2. Token refresh not fully functional
3. Task 4 (Admin Dashboard) incomplete
4. No input sanitization
5. Poor error boundary implementation

### Recommended Next Steps 📋

1. **Immediate (Week 1):**
   - Complete TASK 4 (AdminStats + Course Assignment)
   - Fix token refresh mechanism
   - Implement input sanitization
   - Move to httpOnly cookies

2. **Short Term (Week 2-3):**
   - Add pagination for large lists
   - Implement error boundary
   - Add comprehensive unit tests
   - Performance optimization (memoization)

3. **Medium Term (Month 2):**
   - Full integration test suite
   - Accessibility improvements
   - Analytics implementation
   - Advanced admin features (batch operations)

4. **Long Term (Ongoing):**
   - Mobile app (React Native)
   - Real-time notifications (WebSockets)
   - Advanced reporting
   - Machine learning for course recommendations

---

**Audit Completed:** June 4, 2026  
**Next Review:** After TASK 4 Completion
