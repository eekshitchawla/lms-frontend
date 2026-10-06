# LMS Backend API Complete Specification

**Version:** 1.0.0-MVP  
**Last Updated:** June 4, 2026  
**Target Audience:** Backend Engineers, API Consumers  
**Status:** Production Ready

---

## 📋 TABLE OF CONTENTS

1. [Architecture Overview](#architecture-overview)
2. [Microservices Setup](#microservices-setup)
3. [Authentication & Security](#authentication--security)
4. [API Endpoints - Admin Service (8082)](#api-endpoints---admin-service-8082)
5. [API Endpoints - LMS Service (8080)](#api-endpoints---lms-service-8080)
6. [API Endpoints - Catalog Service (8081)](#api-endpoints---catalog-service-8081)
7. [Database Schema](#database-schema)
8. [Error Handling Standards](#error-handling-standards)
9. [Inter-Service Communication](#inter-service-communication)
10. [Rate Limiting & Throttling](#rate-limiting--throttling)
11. [Validation Rules](#validation-rules)
12. [Testing Requirements](#testing-requirements)
13. [Deployment Guide](#deployment-guide)
14. [Troubleshooting](#troubleshooting)

---

## ARCHITECTURE OVERVIEW

### System Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                    LMS MICROSERVICES ARCHITECTURE                    │
├──────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  Frontend (React)                                                     │
│  Port: 3000                                                           │
│  │                                                                    │
│  ├─→ http://localhost:8082/api/v1    (Admin Service)               │
│  ├─→ http://localhost:8080/api/v1    (LMS Service)                 │
│  └─→ http://localhost:8081/api/v1    (Catalog Service)             │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │          ADMIN SERVICE (Port 8082)                            │   │
│  │  Spring Boot 3.2.0 / Java 21                                 │   │
│  │                                                                │   │
│  │  Endpoints:                                                   │   │
│  │  • /auth/register, /auth/login                               │   │
│  │  • /auth/request-otp, /auth/send-otp, /auth/verify-otp       │   │
│  │  • /auth/refresh                                              │   │
│  │  • /users, /users/{id}                                        │   │
│  │  • /admin/dashboard/stats                                     │   │
│  │  • /admin/courses/assign                                      │   │
│  │  • /admin/courses/{id}/content                                │   │
│  │                                                                │   │
│  │  Dependencies:                                                │   │
│  │  • PostgreSQL (Supabase)                                      │   │
│  │  • Redis (OTP caching)                                        │   │
│  │  • RestTemplate (calls Catalog Service)                       │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │          LMS SERVICE (Port 8080)                              │   │
│  │  Spring Boot 3.2.0 / Java 21                                 │   │
│  │                                                                │   │
│  │  Endpoints:                                                   │   │
│  │  • /tasks (GET, POST)                                         │   │
│  │  • /tasks/user/{userId} (GET)                                │   │
│  │  • /tasks/{id} (GET, PUT, PATCH, DELETE)                     │   │
│  │  • /courses (GET)                                             │   │
│  │  • /courses/{id} (GET)                                        │   │
│  │  • /courses/{id}/modules (GET)                                │   │
│  │  • /courses/{id}/enroll (POST)                                │   │
│  │                                                                │   │
│  │  Dependencies:                                                │   │
│  │  • PostgreSQL (Supabase)                                      │   │
│  │  • Receives calls from Catalog Service                        │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │          CATALOG SERVICE (Port 8081)                          │   │
│  │  Spring Boot 3.2.0 / Java 21                                 │   │
│  │                                                                │   │
│  │  Endpoints:                                                   │   │
│  │  • /courses (GET - public)                                    │   │
│  │  • /courses/{id} (GET)                                        │   │
│  │  • /courses/{id}/modules (GET)                                │   │
│  │  • /courses/category/{name} (GET)                             │   │
│  │  • /courses/{id}/enroll (POST - calls LMS Service)            │   │
│  │                                                                │   │
│  │  Dependencies:                                                │   │
│  │  • PostgreSQL (Supabase)                                      │   │
│  │  • RestTemplate (calls LMS Service)                           │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │          DATA LAYER                                            │   │
│  │  • PostgreSQL 14+ (Supabase Cloud)                            │   │
│  │    Host: db.ybltvwovudgeyfybygqu.supabase.co:5432            │   │
│  │    Port: 5432                                                 │   │
│  │    Database: postgres                                         │   │
│  │    Username: postgres                                         │   │
│  │    SSL Mode: require                                          │   │
│  │                                                                │   │
│  │  • Redis (localhost:6379)                                     │   │
│  │    Purpose: OTP caching, session management                  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                        │
└──────────────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Component   | Technology            | Version        |
| ----------- | --------------------- | -------------- |
| Framework   | Spring Boot           | 3.2.0          |
| Language    | Java                  | 21 LTS         |
| Build Tool  | Maven                 | 3.9            |
| Database    | PostgreSQL            | 14+ (Supabase) |
| Cache       | Redis                 | Latest         |
| ORM         | Spring Data JPA       | Latest         |
| Security    | Spring Security + JWT | jjwt 0.11.5    |
| HTTP Client | RestTemplate          | Spring Web     |
| API Format  | REST/JSON             | -              |

---

## MICROSERVICES SETUP

### Admin Service Configuration

**File:** `adminservice/src/main/resources/application.properties`

```properties
# Application
spring.application.name=adminservice
server.port=8082
server.servlet.context-path=/

# Database Configuration (PostgreSQL - Supabase)
spring.datasource.url=jdbc:postgresql://db.ybltvwovudgeyfybygqu.supabase.co:5432/postgres?sslmode=require&tcpKeepAlives=true
spring.datasource.username=postgres
spring.datasource.password=eekitikki@JGJ9
spring.datasource.driver-class-name=org.postgresql.Driver

# Connection Pool (HikariCP)
spring.datasource.hikari.connection-timeout=30000
spring.datasource.hikari.maximum-pool-size=5
spring.datasource.hikari.idle-timeout=600000
spring.datasource.hikari.max-lifetime=1800000
spring.datasource.hikari.initialization-fail-timeout=0

# JPA/Hibernate
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQL13Dialect
spring.jpa.properties.hibernate.jdbc.batch_size=10

# JWT Configuration
jwt.secret=MyVerySecureSecretKeyThatIsAtLeast32CharactersLongForHS256Algorithm
jwt.expiration=86400000          # 24 hours (milliseconds)
jwt.refresh-expiration=604800000 # 7 days (milliseconds)

# Redis Configuration (OTP Caching)
spring.redis.host=localhost
spring.redis.port=6379
spring.redis.timeout=60000ms
spring.redis.database=0
spring.redis.lettuce.pool.max-active=8
spring.redis.lettuce.pool.max-idle=8
spring.redis.lettuce.pool.min-idle=0

# Email Configuration (Optional - production)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=${MAIL_USERNAME}
spring.mail.password=${MAIL_PASSWORD}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true

# Logging
logging.level.root=INFO
logging.level.com.eeki.adminservice=DEBUG
logging.pattern.console=%d{yyyy-MM-dd HH:mm:ss} - %msg%n
```

### LMS Service Configuration

**File:** `project/src/main/resources/application.properties`

```properties
# Application
spring.application.name=lms
server.port=8080

# Database
spring.datasource.url=jdbc:postgresql://db.ybltvwovudgeyfybygqu.supabase.co:5432/postgres?sslmode=require&tcpKeepAlives=true
spring.datasource.username=postgres
spring.datasource.password=eekitikki@JGJ9
spring.datasource.driver-class-name=org.postgresql.Driver

# Connection Pool
spring.datasource.hikari.connection-timeout=30000
spring.datasource.hikari.maximum-pool-size=5
spring.datasource.hikari.initialization-fail-timeout=0

# JPA/Hibernate
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false

# Logging
logging.level.root=INFO
```

### Catalog Service Configuration

**File:** `catalogservice/src/main/resources/application.properties`

```properties
# Application
spring.application.name=catalogservice
server.port=8081

# Database
spring.datasource.url=jdbc:postgresql://db.ybltvwovudgeyfybygqu.supabase.co:5432/postgres?sslmode=require&tcpKeepAlives=true
spring.datasource.username=postgres
spring.datasource.password=eekitikki@JGJ9
spring.datasource.driver-class-name=org.postgresql.Driver

# Connection Pool
spring.datasource.hikari.connection-timeout=30000
spring.datasource.hikari.maximum-pool-size=5
spring.datasource.hikari.initialization-fail-timeout=0

# JPA/Hibernate
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
```

### CORS Configuration (All Services)

```java
// SecurityConfig.java - Applied to all services
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:3000",
            "http://localhost:3001",
            "https://yourdomain.com"  // Production domain
        ));
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"
        ));
        configuration.setAllowedHeaders(Arrays.asList(
            "Content-Type", "Authorization", "X-Requested-With"
        ));
        configuration.setExposedHeaders(Arrays.asList(
            "Authorization", "Content-Length", "X-Total-Count"
        ));
        configuration.setMaxAge(3600L);
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
            new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

---

## AUTHENTICATION & SECURITY

### JWT Token Specification

**Token Format:** Standard JWT (3 parts separated by dots)

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyQGV4YW1wbGUuY29tIiwidXNlcklkIjoxLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJyb2xlIjoiUk9MRV9VU0VSIiwiaWF0IjoxNzE3NTAwMDAwLCJleHAiOjE3MTc1ODY0MDB9.signature
```

**Header:**

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload (Claims):**

```json
{
  "sub": "user@example.com", // Required: Subject (email)
  "userId": 1, // Required: User ID
  "email": "user@example.com", // Required: Email
  "role": "ROLE_USER", // Required: ROLE_USER or ROLE_ADMIN
  "fullName": "John Doe", // Optional
  "phoneNumber": "9876543210", // Optional
  "emailVerified": true, // Optional
  "phoneVerified": false, // Optional
  "iat": 1717500000, // Required: Issued at (Unix timestamp)
  "exp": 1717586400 // Required: Expires at (Unix timestamp)
}
```

**Token Lifecycle:**

- **Access Token:** 24 hours (86400000 ms)
- **Refresh Token:** 7 days (604800000 ms)
- **OTP Validity:** 10 minutes (600 seconds)

### Role-Based Access Control

```java
// Roles
public enum UserRole {
    ROLE_USER,           // Regular user access
    ROLE_ADMIN,          // Admin dashboard access
    ROLE_SUPER_ADMIN     // Full system access (future)
}

// Permission Matrix
┌────────────────┬──────────┬─────────┬──────────────┐
│ Endpoint       │ ROLE_USER│ ROLE_ADM│ Anonymous    │
├────────────────┼──────────┼─────────┼──────────────┤
│ /auth/register │ ✓        │ ✓       │ ✓            │
│ /auth/login    │ ✓        │ ✓       │ ✓            │
│ /tasks         │ ✓        │ ✓       │ ✗            │
│ /courses       │ ✓        │ ✓       │ ✓ (public)   │
│ /users         │ ✗        │ ✓       │ ✗            │
│ /admin/*       │ ✗        │ ✓       │ ✗            │
└────────────────┴──────────┴─────────┴──────────────┘
```

### Authentication Flow

```
1. User Registration/Login
   └─→ Backend validates credentials
   └─→ Generate JWT token (24h)
   └─→ Generate Refresh token (7d)
   └─→ Return both tokens

2. Subsequent Requests
   └─→ Frontend includes Authorization header
   └─→ Header format: Authorization: Bearer {token}
   └─→ Backend verifies signature
   └─→ Extract claims (userId, role)
   └─→ Process request

3. Token Expiration
   └─→ Frontend receives 401 Unauthorized
   └─→ Frontend calls /auth/refresh with refresh token
   └─→ Backend validates refresh token
   └─→ Generate new access token
   └─→ Frontend retries original request
   └─→ OR logout if refresh fails
```

### Password Hashing

```java
// Using BCrypt
@Component
public class PasswordEncoder {
    private final org.springframework.security.crypto.password.PasswordEncoder encoder =
        new BCryptPasswordEncoder(12); // Strength factor 12

    public String encode(String password) {
        return encoder.encode(password);
    }

    public boolean matches(String rawPassword, String encodedPassword) {
        return encoder.matches(rawPassword, encodedPassword);
    }
}

// Password Requirements (Validated on both Frontend & Backend)
- Minimum 8 characters
- At least 1 uppercase letter (A-Z)
- At least 1 lowercase letter (a-z)
- At least 1 digit (0-9)
- Example: SecurePass123 ✓
```

### Security Headers

All responses include security headers:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
```

---

## API ENDPOINTS - ADMIN SERVICE (8082)

### Base URL

```
http://localhost:8082/api/v1
```

### 1. User Registration

```
POST /auth/register
Content-Type: application/json
CORS: Allowed
Auth: None (public)
Rate Limit: 5 attempts per hour per IP

Request Body:
{
  "fullName": "John Doe",              // Required: 2-100 characters
  "email": "john@example.com",         // Required: Valid email format
  "phoneNumber": "9876543210",         // Required: 10 digits (Indian format)
  "password": "SecurePass123"          // Required: 8+ chars, complex
}

Validation Rules (Backend):
- fullName: length 2-100, no special chars
- email: valid format, unique in database
- phoneNumber: 10 digits, unique, valid India number
- password: min 8 chars, 1 upper, 1 lower, 1 digit, NOT equals email/phone

Response (201 Created):
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "fullName": "John Doe",
    "phoneNumber": "9876543210",
    "role": "ROLE_USER"
  },
  "message": "User registered successfully"
}

Error Responses:

400 - Bad Request:
{
  "message": "Email already registered",
  "code": "DUPLICATE_EMAIL",
  "timestamp": "2026-04-19T10:30:00Z"
}

400 - Bad Request:
{
  "message": "Phone number already registered",
  "code": "DUPLICATE_PHONE"
}

400 - Bad Request:
{
  "message": "Invalid email format",
  "code": "INVALID_EMAIL"
}

400 - Bad Request:
{
  "message": "Password too weak. Must contain uppercase, lowercase, and numbers.",
  "code": "WEAK_PASSWORD"
}

500 - Server Error:
{
  "message": "Registration failed. Please try again later.",
  "code": "REGISTRATION_ERROR"
}
```

### 2. Email/Password Login

```
POST /auth/login
Content-Type: application/json
CORS: Allowed
Auth: None
Rate Limit: 10 failures → 15 min lockout

Request Body:
{
  "email": "john@example.com",
  "password": "SecurePass123"
}

Response (200 OK):
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "fullName": "John Doe",
    "role": "ROLE_USER"
  },
  "message": "Login successful"
}

Error Responses:

401 - Unauthorized:
{
  "message": "Invalid email or password",
  "code": "INVALID_CREDENTIALS"
}

404 - Not Found:
{
  "message": "User not found",
  "code": "USER_NOT_FOUND"
}

403 - Forbidden:
{
  "message": "Account is inactive or disabled",
  "code": "ACCOUNT_DISABLED"
}

429 - Too Many Requests:
{
  "message": "Too many failed login attempts. Account locked for 15 minutes.",
  "code": "LOGIN_RATE_LIMITED"
}
```

### 3. Request Email OTP

```
POST /auth/request-otp
Content-Type: application/json
CORS: Allowed
Auth: None
Rate Limit: 1 per minute per email, 5 per day per email

Request Body:
{
  "email": "john@example.com"
}

Backend Process:
1. Validate email exists in database
2. Generate 6-digit random OTP
3. Store in Redis with 10-minute expiry
4. Send OTP via email service
5. Return success response

Response (200 OK):
{
  "message": "OTP sent to email",
  "destination": "john@example.com",
  "expiresIn": 600                    // Seconds until expiry
}

Error Responses:

404 - Not Found:
{
  "message": "User not found with this email",
  "code": "USER_NOT_FOUND"
}

429 - Too Many Requests:
{
  "message": "OTP request limit exceeded. Try after 1 minute.",
  "code": "RATE_LIMITED"
}

500 - Server Error:
{
  "message": "Failed to send OTP. Email service unavailable.",
  "code": "EMAIL_SERVICE_ERROR"
}
```

### 4. Send Phone OTP

```
POST /auth/send-otp
Content-Type: application/json
CORS: Allowed
Auth: None
Rate Limit: 1 per minute per phone, 5 per day

Request Body:
{
  "phoneNumber": "9876543210"
}

Validation:
- Must be exactly 10 digits
- Must start with 6-9 (valid Indian mobile range)
- User with this phone must exist

Backend Process:
1. Validate phone number format
2. Generate 6-digit OTP
3. Store in Redis (10-minute expiry)
4. Send OTP via SMS service (Twilio, etc.)
5. Return response

Response (200 OK):
{
  "message": "OTP sent to phone",
  "destination": "XXXX543210",        // Masked for security
  "expiresIn": 600
}

Error Responses:

404 - Not Found:
{
  "message": "User not found with this phone",
  "code": "USER_NOT_FOUND"
}

400 - Bad Request:
{
  "message": "Invalid phone number format",
  "code": "INVALID_PHONE"
}

429 - Too Many Requests:
{
  "message": "OTP request limit exceeded",
  "code": "RATE_LIMITED"
}

500 - Server Error:
{
  "message": "Failed to send OTP",
  "code": "SMS_SERVICE_ERROR"
}
```

### 5. Verify OTP

```
POST /auth/verify-otp
Content-Type: application/json
CORS: Allowed
Auth: None
Rate Limit: 5 attempts per OTP, 429 after

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

Validation:
- OTP must be exactly 6 digits
- OTP must exist in Redis
- OTP must not be expired (10 minutes)
- Not more than 5 attempts
- Either email OR phone_number (not both)

Response (200 OK):
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "fullName": "John Doe",
    "role": "ROLE_USER"
  },
  "message": "OTP verified successfully"
}

Error Responses:

400 - Bad Request:
{
  "message": "Invalid or expired OTP",
  "code": "INVALID_OTP"
}

400 - Bad Request:
{
  "message": "Maximum OTP verification attempts exceeded",
  "code": "MAX_ATTEMPTS_EXCEEDED",
  "retriesRemaining": 0
}

404 - Not Found:
{
  "message": "User not found",
  "code": "USER_NOT_FOUND"
}

500 - Server Error:
{
  "message": "OTP verification failed",
  "code": "VERIFICATION_ERROR"
}
```

### 6. Refresh Token

```
POST /auth/refresh
Authorization: Bearer {refreshToken}
Content-Type: application/json
CORS: Allowed
Auth: Required (Refresh Token)

Request Body: {} (empty)

Backend Process:
1. Extract refresh token from Authorization header
2. Validate token signature
3. Check if token expired
4. Verify user still exists and is active
5. Generate new access token (24h expiry)
6. Optional: Rotate refresh token
7. Return new token

Response (200 OK):
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",  // If rotating
  "message": "Token refreshed successfully"
}

Error Responses:

401 - Unauthorized:
{
  "message": "Invalid or expired refresh token",
  "code": "INVALID_TOKEN"
}

401 - Unauthorized:
{
  "message": "Token has been revoked",
  "code": "TOKEN_REVOKED"
}

403 - Forbidden:
{
  "message": "User account has been disabled",
  "code": "ACCOUNT_DISABLED"
}

500 - Server Error:
{
  "message": "Token refresh failed",
  "code": "REFRESH_ERROR"
}
```

### 7. Get All Users (Admin Only)

```
GET /users
Authorization: Bearer {adminToken}
CORS: Allowed
Auth: Required (ROLE_ADMIN)
Rate Limit: 100 per minute

Query Parameters:
- page: number (optional, default: 1, min: 1)
- limit: number (optional, default: 20, max: 100)
- search: string (optional, searches email/fullName, min: 2 chars)
- role: string (optional, ROLE_USER or ROLE_ADMIN)

Response (200 OK):
{
  "data": [
    {
      "id": 1,
      "email": "john@example.com",
      "fullName": "John Doe",
      "phoneNumber": "9876543210",
      "role": "ROLE_USER",
      "createdAt": "2026-04-19T10:30:00Z",
      "lastLogin": "2026-04-19T14:30:00Z",
      "isActive": true
    },
    {
      "id": 2,
      "email": "admin@example.com",
      "fullName": "Admin User",
      "phoneNumber": "9987654321",
      "role": "ROLE_ADMIN",
      "createdAt": "2026-04-01T09:00:00Z",
      "lastLogin": "2026-04-19T15:00:00Z",
      "isActive": true
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 42,
  "pages": 3
}

Error Responses:

401 - Unauthorized:
{
  "message": "Unauthorized. Please login.",
  "code": "UNAUTHORIZED"
}

403 - Forbidden:
{
  "message": "Access denied. Admin role required.",
  "code": "FORBIDDEN"
}

400 - Bad Request:
{
  "message": "Invalid page or limit parameter",
  "code": "INVALID_PARAMETER"
}

500 - Server Error:
{
  "message": "Failed to fetch users",
  "code": "FETCH_ERROR"
}
```

### 8. Get User by ID (Admin Only)

```
GET /users/{userId}
Authorization: Bearer {adminToken}
CORS: Allowed
Auth: Required (ROLE_ADMIN)

URL Parameters:
- userId: number (required, min: 1)

Response (200 OK):
{
  "id": 1,
  "email": "john@example.com",
  "fullName": "John Doe",
  "phoneNumber": "9876543210",
  "role": "ROLE_USER",
  "createdAt": "2026-04-19T10:30:00Z",
  "lastLogin": "2026-04-19T14:30:00Z",
  "isActive": true,
  "enrollments": [
    {
      "courseId": 1,
      "courseName": "Java Basics",
      "enrolledAt": "2026-04-19T10:30:00Z",
      "progress": 45
    }
  ]
}

Error Responses:

401 - Unauthorized:
{
  "message": "Unauthorized",
  "code": "UNAUTHORIZED"
}

403 - Forbidden:
{
  "message": "Forbidden",
  "code": "FORBIDDEN"
}

404 - Not Found:
{
  "message": "User not found",
  "code": "USER_NOT_FOUND"
}
```

### 9. Get Dashboard Statistics (Admin Only)

```
GET /admin/dashboard/stats
Authorization: Bearer {adminToken}
CORS: Allowed
Auth: Required (ROLE_ADMIN)
Rate Limit: 30 per minute

Response (200 OK):
{
  "totalUsers": 150,
  "activeUsers": 120,
  "totalCoursesAssigned": 45,
  "completedCourses": 32,
  "averageProgress": 68.5,
  "lastUpdated": "2026-04-19T15:30:00Z",
  "stats": {
    "newUsersThisWeek": 12,
    "tasksCompletedToday": 25,
    "enrollmentsThisMonth": 18
  }
}

Calculation Logic:
- totalUsers: COUNT(*) FROM users WHERE is_active = true
- activeUsers: COUNT(*) FROM users WHERE last_login >= now() - 7 days
- totalCoursesAssigned: COUNT(*) FROM enrollments
- completedCourses: COUNT(*) FROM enrollments WHERE status = 'COMPLETED'
- averageProgress: AVG(progress) FROM enrollments

Error Responses:

401 - Unauthorized:
{
  "message": "Unauthorized",
  "code": "UNAUTHORIZED"
}

403 - Forbidden:
{
  "message": "Forbidden",
  "code": "FORBIDDEN"
}

500 - Server Error:
{
  "message": "Failed to fetch statistics",
  "code": "STATS_ERROR"
}
```

### 10. Assign Course to User (Admin Only)

```
POST /admin/courses/assign
Authorization: Bearer {adminToken}
Content-Type: application/json
CORS: Allowed
Auth: Required (ROLE_ADMIN)

Request Body:
{
  "userId": 1,
  "courseId": 5
}

Validation:
- userId exists and is active
- courseId exists
- User not already enrolled in course
- No duplicate enrollment

Backend Process:
1. Verify admin role
2. Check user exists
3. Check course exists
4. Create enrollment record
5. Generate tasks for course modules
6. Return success response

Response (201 Created):
{
  "enrollmentId": 1,
  "userId": 1,
  "courseId": 5,
  "courseName": "Java Advanced",
  "enrolledAt": "2026-04-19T15:30:00Z",
  "message": "Course assigned to user successfully"
}

Error Responses:

400 - Bad Request:
{
  "message": "User already enrolled in this course",
  "code": "DUPLICATE_ENROLLMENT"
}

401 - Unauthorized:
{
  "message": "Unauthorized",
  "code": "UNAUTHORIZED"
}

403 - Forbidden:
{
  "message": "Forbidden. Admin role required.",
  "code": "FORBIDDEN"
}

404 - Not Found:
{
  "message": "User not found",
  "code": "USER_NOT_FOUND"
}

404 - Not Found:
{
  "message": "Course not found",
  "code": "COURSE_NOT_FOUND"
}

500 - Server Error:
{
  "message": "Failed to assign course",
  "code": "ASSIGNMENT_ERROR"
}
```

### 11. Update Course Content (Admin Only)

```
PUT /admin/courses/{courseId}/content
Authorization: Bearer {adminToken}
Content-Type: application/json
CORS: Allowed
Auth: Required (ROLE_ADMIN)

URL Parameters:
- courseId: number (required)

Request Body:
{
  "title": "Advanced Java Programming",
  "description": "Learn advanced Java concepts",
  "content": "<h1>Course Content</h1>...",
  "difficulty": "ADVANCED",
  "instructor": "John Doe",
  "category": "Programming"
}

All fields optional (partial updates supported)

Response (200 OK):
{
  "id": 5,
  "title": "Advanced Java Programming",
  "description": "Learn advanced Java concepts",
  "content": "<h1>Course Content</h1>...",
  "difficulty": "ADVANCED",
  "instructor": "John Doe",
  "category": "Programming",
  "updatedAt": "2026-04-19T15:30:00Z",
  "message": "Course content updated successfully"
}

Error Responses:

401 - Unauthorized:
{
  "message": "Unauthorized",
  "code": "UNAUTHORIZED"
}

403 - Forbidden:
{
  "message": "Forbidden",
  "code": "FORBIDDEN"
}

404 - Not Found:
{
  "message": "Course not found",
  "code": "COURSE_NOT_FOUND"
}

400 - Bad Request:
{
  "message": "Invalid course data",
  "code": "INVALID_DATA"
}

500 - Server Error:
{
  "message": "Failed to update course",
  "code": "UPDATE_ERROR"
}
```

---

## API ENDPOINTS - LMS SERVICE (8080)

### Base URL

```
http://localhost:8080/api/v1
```

### 1. Get All Tasks

```
GET /tasks
Authorization: Optional (Bearer token)
CORS: Allowed
Auth: None (public)
Rate Limit: 1000 per hour

Query Parameters:
- page: number (optional, default: 1)
- limit: number (optional, default: 50, max: 100)
- userId: number (optional, filter by user)
- completed: boolean (optional, filter by completion status)

Response (200 OK):
{
  "data": [
    {
      "id": 1,
      "userId": 1,
      "title": "Complete Project Proposal",
      "description": "Finish the quarterly project proposal document",
      "completed": false,
      "dueDate": "2026-04-25T23:59:59Z",
      "createdAt": "2026-04-19T10:30:00Z",
      "updatedAt": "2026-04-19T10:30:00Z"
    }
  ],
  "page": 1,
  "limit": 50,
  "total": 150
}

Error Responses:

500 - Server Error:
{
  "message": "Failed to fetch tasks",
  "code": "FETCH_ERROR"
}
```

### 2. Get User Tasks

```
GET /tasks/user/{userId}
Authorization: Optional
CORS: Allowed
Auth: None

URL Parameters:
- userId: number (required)

Query Parameters:
- page: number (optional, default: 1)
- limit: number (optional, default: 50)
- completed: boolean (optional)

Response (200 OK):
{
  "data": [
    {
      "id": 1,
      "userId": 1,
      "title": "Task 1",
      "description": "Description",
      "completed": false,
      "dueDate": "2026-04-25T23:59:59Z",
      "createdAt": "2026-04-19T10:30:00Z",
      "updatedAt": "2026-04-19T10:30:00Z"
    }
  ],
  "page": 1,
  "limit": 50,
  "total": 10
}

Error Responses:

500 - Server Error:
{
  "message": "Failed to fetch tasks",
  "code": "FETCH_ERROR"
}
```

### 3. Create Task

```
POST /tasks
Authorization: Optional
Content-Type: application/json
CORS: Allowed
Auth: None

Request Body:
{
  "userId": 1,
  "title": "Complete Project Proposal",
  "description": "Finish quarterly project proposal",
  "dueDate": "2026-04-25"
}

Validation:
- userId: required, must exist
- title: required, 1-200 characters, no HTML
- description: optional, 0-1000 characters
- dueDate: optional, must be future date (YYYY-MM-DD format)

Response (201 Created):
{
  "id": 1,
  "userId": 1,
  "title": "Complete Project Proposal",
  "description": "Finish quarterly project proposal",
  "completed": false,
  "dueDate": "2026-04-25T23:59:59Z",
  "createdAt": "2026-04-19T10:30:00Z",
  "updatedAt": "2026-04-19T10:30:00Z"
}

Error Responses:

400 - Bad Request:
{
  "message": "Missing required field: title",
  "code": "MISSING_FIELD"
}

400 - Bad Request:
{
  "message": "Title must be 1-200 characters",
  "code": "INVALID_LENGTH"
}

404 - Not Found:
{
  "message": "User not found",
  "code": "USER_NOT_FOUND"
}

500 - Server Error:
{
  "message": "Failed to create task",
  "code": "CREATE_ERROR"
}
```

### 4. Get Task by ID

```
GET /tasks/{taskId}
Authorization: Optional
CORS: Allowed
Auth: None

URL Parameters:
- taskId: number (required)

Response (200 OK):
{
  "id": 1,
  "userId": 1,
  "title": "Complete Project Proposal",
  "description": "Finish quarterly project proposal",
  "completed": false,
  "dueDate": "2026-04-25T23:59:59Z",
  "createdAt": "2026-04-19T10:30:00Z",
  "updatedAt": "2026-04-19T10:30:00Z"
}

Error Responses:

404 - Not Found:
{
  "message": "Task not found",
  "code": "TASK_NOT_FOUND"
}
```

### 5. Update Task

```
PUT /tasks/{taskId}
Authorization: Optional
Content-Type: application/json
CORS: Allowed
Auth: None

URL Parameters:
- taskId: number (required)

Request Body (partial updates):
{
  "title": "Updated Title",
  "description": "Updated description",
  "dueDate": "2026-04-26"
}

Validation:
- title: 1-200 characters if provided
- description: 0-1000 characters if provided
- dueDate: future date if provided

Response (200 OK):
{
  "id": 1,
  "userId": 1,
  "title": "Updated Title",
  "description": "Updated description",
  "completed": false,
  "dueDate": "2026-04-26T23:59:59Z",
  "createdAt": "2026-04-19T10:30:00Z",
  "updatedAt": "2026-04-19T15:30:00Z"
}

Error Responses:

400 - Bad Request:
{
  "message": "Invalid input",
  "code": "INVALID_INPUT"
}

404 - Not Found:
{
  "message": "Task not found",
  "code": "TASK_NOT_FOUND"
}

500 - Server Error:
{
  "message": "Failed to update task",
  "code": "UPDATE_ERROR"
}
```

### 6. Toggle Task Completion

```
PATCH /tasks/{taskId}/toggle
Authorization: Optional
CORS: Allowed
Auth: None

URL Parameters:
- taskId: number (required)

Request Body: {} (empty)

Backend Logic:
1. Find task by ID
2. Toggle completed: true → false or false → true
3. Update updatedAt timestamp
4. Save to database

Response (200 OK):
{
  "id": 1,
  "userId": 1,
  "completed": true,
  "updatedAt": "2026-04-19T15:30:00Z",
  "message": "Task marked as completed"
}

Error Responses:

404 - Not Found:
{
  "message": "Task not found",
  "code": "TASK_NOT_FOUND"
}

500 - Server Error:
{
  "message": "Failed to toggle task",
  "code": "TOGGLE_ERROR"
}
```

### 7. Delete Task

```
DELETE /tasks/{taskId}
Authorization: Optional
CORS: Allowed
Auth: None

URL Parameters:
- taskId: number (required)

Backend Logic:
Option A: Hard Delete (remove from DB)
Option B: Soft Delete (set is_deleted = true)

Response (204 No Content)
Empty response body

Or:

Response (200 OK):
{
  "message": "Task deleted successfully",
  "id": 1
}

Error Responses:

404 - Not Found:
{
  "message": "Task not found",
  "code": "TASK_NOT_FOUND"
}

500 - Server Error:
{
  "message": "Failed to delete task",
  "code": "DELETE_ERROR"
}
```

### 8. Get All Courses

```
GET /courses
Authorization: Optional
CORS: Allowed
Auth: None (public - anyone can view courses)
Rate Limit: 1000 per hour

Query Parameters:
- page: number (optional, default: 1)
- limit: number (optional, default: 20, max: 100)
- category: string (optional, filter by category)
- difficulty: string (optional, BEGINNER/INTERMEDIATE/ADVANCED)

Response (200 OK):
{
  "content": [
    {
      "id": 1,
      "title": "Java Basics",
      "description": "Learn Java programming fundamentals",
      "category": "Programming",
      "difficulty": "BEGINNER",
      "instructor": "John Doe",
      "modules": [
        {
          "id": 1,
          "title": "Introduction to Java",
          "duration": "2h 30m"
        }
      ],
      "createdAt": "2026-01-15T10:00:00Z"
    }
  ],
  "page": 1,
  "size": 20,
  "totalElements": 45,
  "totalPages": 3
}

Error Responses:

500 - Server Error:
{
  "message": "Failed to fetch courses",
  "code": "FETCH_ERROR"
}
```

### 9. Get Course by ID

```
GET /courses/{courseId}
Authorization: Optional
CORS: Allowed
Auth: None

URL Parameters:
- courseId: number (required)

Response (200 OK):
{
  "id": 1,
  "title": "Java Basics",
  "description": "Learn Java programming fundamentals",
  "content": "<h1>Course Content</h1><p>Module details...</p>",
  "category": "Programming",
  "difficulty": "BEGINNER",
  "instructor": "John Doe",
  "modules": [
    {
      "id": 1,
      "title": "Introduction to Java",
      "description": "Basics of Java",
      "duration": "2h 30m",
      "moduleIndex": 1
    },
    {
      "id": 2,
      "title": "Variables and Data Types",
      "description": "Understanding variables",
      "duration": "1h 45m",
      "moduleIndex": 2
    }
  ],
  "createdAt": "2026-01-15T10:00:00Z"
}

Error Responses:

404 - Not Found:
{
  "message": "Course not found",
  "code": "COURSE_NOT_FOUND"
}
```

### 10. Get Course Modules

```
GET /courses/{courseId}/modules
Authorization: Optional
CORS: Allowed
Auth: None

URL Parameters:
- courseId: number (required)

Response (200 OK):
{
  "courseId": 1,
  "modules": [
    {
      "id": 1,
      "title": "Introduction to Java",
      "description": "Basics of Java programming",
      "duration": "2h 30m",
      "moduleIndex": 1,
      "courseId": 1
    },
    {
      "id": 2,
      "title": "Variables and Data Types",
      "description": "Understanding variables in Java",
      "duration": "1h 45m",
      "moduleIndex": 2,
      "courseId": 1
    }
  ]
}

Error Responses:

404 - Not Found:
{
  "message": "Course not found",
  "code": "COURSE_NOT_FOUND"
}
```

### 11. Enroll User in Course

```
POST /courses/{courseId}/enroll
Authorization: Optional
Content-Type: application/json
CORS: Allowed
Auth: None

URL Parameters:
- courseId: number (required)

Request Body:
{
  "userId": 1
}

Backend Process:
1. Validate userId exists
2. Validate courseId exists
3. Check user not already enrolled
4. Create enrollment record
5. Generate tasks for each module
6. Return enrollment details

Response (201 Created):
{
  "enrollmentId": 1,
  "userId": 1,
  "courseId": 5,
  "courseName": "Java Basics",
  "enrolledAt": "2026-04-19T15:30:00Z",
  "tasksGenerated": 3,
  "message": "Successfully enrolled in course"
}

Error Responses:

400 - Bad Request:
{
  "message": "Missing userId field",
  "code": "MISSING_FIELD"
}

400 - Bad Request:
{
  "message": "User already enrolled in this course",
  "code": "DUPLICATE_ENROLLMENT"
}

404 - Not Found:
{
  "message": "User not found",
  "code": "USER_NOT_FOUND"
}

404 - Not Found:
{
  "message": "Course not found",
  "code": "COURSE_NOT_FOUND"
}

500 - Server Error:
{
  "message": "Enrollment failed",
  "code": "ENROLLMENT_ERROR"
}
```

---

## DATABASE SCHEMA

### Users Table

```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(100) NOT NULL,
  phone_number VARCHAR(20) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'ROLE_USER',
    CONSTRAINT valid_role CHECK (role IN ('ROLE_USER', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Entity (Java)
@Entity
@Table(name = "users")
public class User {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true)
  private String email;

  @Column(name = "full_name", nullable = false, length = 100)
  private String fullName;

  @Column(name = "phone_number", unique = true)
  private String phoneNumber;

  @Column(nullable = false)
  private String passwordHash;

  @Enumerated(EnumType.STRING)
  private UserRole role = UserRole.ROLE_USER;

  @Column(name = "is_active")
  private Boolean isActive = true;

  @CreationTimestamp
  @Column(name = "created_at")
  private LocalDateTime createdAt;

  @UpdateTimestamp
  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  @Column(name = "last_login")
  private LocalDateTime lastLogin;
}
```

### OTP Verifications Table

```sql
CREATE TABLE IF NOT EXISTS otp_verifications (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255),
  phone_number VARCHAR(20),
  otp_code VARCHAR(6) NOT NULL,
  attempts INT DEFAULT 0,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_used BOOLEAN DEFAULT false,
  CONSTRAINT chk_email_or_phone CHECK (email IS NOT NULL OR phone_number IS NOT NULL)
);

CREATE INDEX idx_otp_email ON otp_verifications(email);
CREATE INDEX idx_otp_phone ON otp_verifications(phone_number);
CREATE INDEX idx_otp_expires ON otp_verifications(expires_at);
```

### Tasks Table

```sql
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT false,
  due_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_deleted BOOLEAN DEFAULT false
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_completed ON tasks(completed);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);

-- Entity
@Entity
@Table(name = "tasks")
public class LearningTask {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "user_id")
  private Long userId;

  @Column(nullable = false, length = 200)
  private String title;

  @Column(columnDefinition = "TEXT")
  private String description;

  @Column(nullable = false)
  private Boolean completed = false;

  @Column(name = "due_date")
  private LocalDateTime dueDate;

  @CreationTimestamp
  private LocalDateTime createdAt;

  @UpdateTimestamp
  private LocalDateTime updatedAt;
}
```

### Courses Table

```sql
CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  content TEXT,
  category VARCHAR(100),
  difficulty VARCHAR(50) DEFAULT 'BEGINNER',
    CONSTRAINT valid_difficulty CHECK (difficulty IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')),
  instructor VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_difficulty ON courses(difficulty);

-- Entity
@Entity
@Table(name = "courses")
public class Course {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String title;

  @Column(nullable = false, columnDefinition = "TEXT")
  private String description;

  @Column(columnDefinition = "TEXT")
  private String content;

  @Column
  private String category;

  @Enumerated(EnumType.STRING)
  private CourseDifficulty difficulty = CourseDifficulty.BEGINNER;

  @Column
  private String instructor;
}
```

### Course Modules Table

```sql
CREATE TABLE IF NOT EXISTS course_modules (
  id SERIAL PRIMARY KEY,
  course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  duration VARCHAR(50),
  module_index INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_modules_course_id ON course_modules(course_id);
CREATE INDEX idx_modules_index ON course_modules(module_index);

-- Entity
@Entity
@Table(name = "course_modules")
public class Module {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "course_id")
  private Long courseId;

  @Column(nullable = false)
  private String title;

  @Column(columnDefinition = "TEXT")
  private String description;

  @Column
  private String duration;

  @Column(name = "module_index")
  private Integer moduleIndex;
}
```

### Enrollments Table

```sql
CREATE TABLE IF NOT EXISTS enrollments (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  progress INT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'ACTIVE',
    CONSTRAINT valid_status CHECK (status IN ('ACTIVE', 'COMPLETED', 'DROPPED')),
  UNIQUE(user_id, course_id)
);

CREATE INDEX idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX idx_enrollments_status ON enrollments(status);

-- Entity
@Entity
@Table(name = "enrollments", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "course_id"}))
public class Enrollment {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "user_id")
  private Long userId;

  @Column(name = "course_id")
  private Long courseId;

  @CreationTimestamp
  @Column(name = "enrolled_at")
  private LocalDateTime enrolledAt;

  @Column(name = "completed_at")
  private LocalDateTime completedAt;

  @Column
  private Integer progress = 0;

  @Enumerated(EnumType.STRING)
  private EnrollmentStatus status = EnrollmentStatus.ACTIVE;
}
```

---

## ERROR HANDLING STANDARDS

### Standard Error Response Format

```json
{
  "timestamp": "2026-04-19T15:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Invalid email format",
  "code": "INVALID_EMAIL",
  "details": {
    "field": "email",
    "value": "invalid-email",
    "constraint": "valid email required"
  },
  "path": "/api/v1/auth/register"
}
```

### HTTP Status Codes

| Code | Meaning                                 | Example                              |
| ---- | --------------------------------------- | ------------------------------------ |
| 200  | OK - Request succeeded                  | User fetched successfully            |
| 201  | Created - Resource created              | New user registered                  |
| 204  | No Content - Success, empty body        | Task deleted                         |
| 400  | Bad Request - Invalid input             | Missing required field               |
| 401  | Unauthorized - Auth failed/expired      | Invalid credentials, token expired   |
| 403  | Forbidden - Insufficient permissions    | User trying to access admin endpoint |
| 404  | Not Found - Resource doesn't exist      | User ID doesn't exist                |
| 409  | Conflict - Duplicate or state violation | Email already registered             |
| 429  | Too Many Requests - Rate limit exceeded | OTP request limit exceeded           |
| 500  | Server Error - Internal error           | Database connection failed           |
| 503  | Service Unavailable - Service down      | Database offline                     |

### Exception Handling in Code

```java
// Global Exception Handler
@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(ResourceNotFoundException.class)
  public ResponseEntity<?> handleNotFound(ResourceNotFoundException ex) {
    ErrorResponse error = new ErrorResponse(
      LocalDateTime.now(),
      404,
      "Not Found",
      ex.getMessage(),
      "RESOURCE_NOT_FOUND"
    );
    return ResponseEntity.status(404).body(error);
  }

  @ExceptionHandler(DuplicateResourceException.class)
  public ResponseEntity<?> handleDuplicate(DuplicateResourceException ex) {
    ErrorResponse error = new ErrorResponse(
      LocalDateTime.now(),
      409,
      "Conflict",
      ex.getMessage(),
      "DUPLICATE_RESOURCE"
    );
    return ResponseEntity.status(409).body(error);
  }

  @ExceptionHandler(RateLimitedException.class)
  public ResponseEntity<?> handleRateLimit(RateLimitedException ex) {
    ErrorResponse error = new ErrorResponse(
      LocalDateTime.now(),
      429,
      "Too Many Requests",
      ex.getMessage(),
      "RATE_LIMITED"
    );
    return ResponseEntity.status(429)
      .header("Retry-After", "60")
      .body(error);
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<?> handleGeneral(Exception ex) {
    ErrorResponse error = new ErrorResponse(
      LocalDateTime.now(),
      500,
      "Internal Server Error",
      "An unexpected error occurred",
      "SERVER_ERROR"
    );
    return ResponseEntity.status(500).body(error);
  }
}
```

---

## INTER-SERVICE COMMUNICATION

### Service-to-Service Calls

#### Admin Service → Catalog Service

```java
// Fetching course details for admin operations
RestTemplate restTemplate;

public CourseDTO getCourseFromCatalog(Long courseId) {
  try {
    String url = "http://localhost:8081/api/v1/courses/" + courseId;
    ResponseEntity<CourseDTO> response = restTemplate.getForEntity(
      url,
      CourseDTO.class
    );
    return response.getBody();
  } catch (RestClientException e) {
    logger.error("Failed to fetch course from Catalog Service", e);
    throw new ServiceUnavailableException("Catalog Service unavailable");
  }
}
```

#### Catalog Service → LMS Service

```java
// Creating enrollment when user enrolls through catalog
public EnrollmentDTO enrollUserInCourse(Long userId, Long courseId) {
  try {
    String url = "http://localhost:8080/api/v1/courses/" + courseId + "/enroll";
    HttpEntity<EnrollmentRequest> request = new HttpEntity<>(
      new EnrollmentRequest(userId)
    );
    ResponseEntity<EnrollmentDTO> response = restTemplate.postForEntity(
      url,
      request,
      EnrollmentDTO.class
    );
    return response.getBody();
  } catch (RestClientException e) {
    logger.error("Failed to enroll user in LMS Service", e);
    throw new ServiceUnavailableException("LMS Service unavailable");
  }
}
```

### Error Handling in Inter-Service Communication

```java
// Retry mechanism for failed service calls
@Retry(maxAttempts = 3, delay = @Delay(1000))
@Fallback(fallbackMethod = "fallbackGetCourse")
public CourseDTO getCourse(Long courseId) {
  return restTemplate.getForObject(
    "http://localhost:8081/api/v1/courses/" + courseId,
    CourseDTO.class
  );
}

public CourseDTO fallbackGetCourse(Long courseId) {
  // Return cached data or empty response
  logger.warn("Catalog Service unavailable, using fallback for course: " + courseId);
  return new CourseDTO(); // Empty/default course
}
```

### Timeout Configuration

```properties
# RestTemplate timeout (milliseconds)
http.connection.timeout=5000    # 5 seconds
http.read.timeout=10000         # 10 seconds
http.write.timeout=10000        # 10 seconds

# Per-service timeouts (if different)
catalog.service.timeout=8000
lms.service.timeout=5000
```

---

## RATE LIMITING & THROTTLING

### Rate Limit Rules

| Endpoint          | Limit                    | Window    | Notes                            |
| ----------------- | ------------------------ | --------- | -------------------------------- |
| /auth/register    | 10/hour                  | per IP    | Account creation limit           |
| /auth/login       | 10 failures then lockout | per email | 15-min lockout after 10 failures |
| /auth/request-otp | 1/min, 5/day             | per email | Email OTP rate limit             |
| /auth/send-otp    | 1/min, 5/day             | per phone | Phone OTP rate limit             |
| /auth/verify-otp  | 5 attempts               | per OTP   | Lockout after 5 wrong attempts   |
| /users            | 100/min                  | per admin | User listing                     |
| /tasks            | 1000/hour                | per user  | Task operations                  |
| /courses          | 1000/hour                | per user  | Course browsing                  |

### Rate Limit Headers (Response)

```http
HTTP/1.1 200 OK
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1617280800

// After limit exceeded:
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1617280800
Retry-After: 60
```

### Implementation (Spring)

```java
// Using Spring Cloud Config with Redis
@Component
@Aspect
public class RateLimitAspect {

  @Autowired
  private RedisTemplate<String, Integer> redisTemplate;

  @Around("@annotation(com.eeki.annotations.RateLimit)")
  public Object rateLimit(ProceedingJoinPoint joinPoint, RateLimit rateLimit)
      throws Throwable {

    String key = getKey(joinPoint); // e.g., "email:user@example.com"
    Integer count = redisTemplate.opsForValue().get(key) != null ?
      (Integer) redisTemplate.opsForValue().get(key) : 0;

    if (count >= rateLimit.limit()) {
      throw new RateLimitedException("Rate limit exceeded");
    }

    redisTemplate.opsForValue().increment(key);
    redisTemplate.expire(key, Duration.ofSeconds(rateLimit.windowSeconds()));

    return joinPoint.proceed();
  }
}

// Usage
@RateLimit(limit = 5, windowSeconds = 600) // 5 per 10 minutes
@PostMapping("/auth/request-otp")
public ResponseEntity<?> requestOtp(@RequestBody OtpRequest request) {
  // Implementation
}
```

---

## VALIDATION RULES

### Field-Level Validation

```java
// Email Validation
private static final String EMAIL_REGEX =
  "^[A-Za-z0-9+_.-]+@([A-Za-z0-9.-]+\\.[A-Z|a-z]{2,})$";

// Phone Number Validation (10-digit Indian)
private static final String PHONE_REGEX = "^[6-9]\\d{9}$";

// Password Validation
private static final String PASSWORD_REGEX =
  "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d@$!%*?&]{8,}$";
// At least 1 lowercase, 1 uppercase, 1 digit, 8+ chars

// Entity
@Entity
public class User {
  @Email(message = "Email should be valid")
  private String email;

  @Pattern(regexp = "^[6-9]\\d{9}$", message = "Phone should be 10 digits")
  private String phoneNumber;

  @Pattern(regexp = PASSWORD_REGEX, message = "Password does not meet requirements")
  private String password;

  @Length(min = 2, max = 100, message = "Name should be 2-100 characters")
  private String fullName;
}
```

### Business Logic Validation

```java
// Validation Service
@Service
public class ValidationService {

  public void validateRegistration(RegisterRequest request) {
    // Email uniqueness
    if (userRepository.existsByEmail(request.getEmail())) {
      throw new DuplicateResourceException("Email already registered");
    }

    // Phone uniqueness
    if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
      throw new DuplicateResourceException("Phone already registered");
    }

    // Password strength
    if (!isPasswordStrong(request.getPassword())) {
      throw new InvalidInputException("Password does not meet requirements");
    }

    // Email not too similar to phone
    if (request.getEmail().startsWith(request.getPhoneNumber())) {
      throw new InvalidInputException("Email cannot start with phone number");
    }
  }

  private boolean isPasswordStrong(String password) {
    return password.matches(PASSWORD_REGEX);
  }
}
```

---

## TESTING REQUIREMENTS

### Unit Tests

```java
// Test: UserService.registerUser()
@SpringBootTest
class UserServiceTest {

  @Autowired
  private UserService userService;

  @MockBean
  private UserRepository userRepository;

  @Test
  void testRegisterUserSuccess() {
    RegisterRequest request = new RegisterRequest(
      "John Doe",
      "john@example.com",
      "9876543210",
      "SecurePass123"
    );

    when(userRepository.existsByEmail("john@example.com")).thenReturn(false);
    when(userRepository.existsByPhoneNumber("9876543210")).thenReturn(false);

    User savedUser = userService.register(request);

    assertNotNull(savedUser.getId());
    assertEquals("john@example.com", savedUser.getEmail());
    assertTrue(passwordEncoder.matches("SecurePass123", savedUser.getPasswordHash()));
  }

  @Test
  void testRegisterUserDuplicateEmail() {
    RegisterRequest request = new RegisterRequest(
      "John Doe",
      "john@example.com",
      "9876543210",
      "SecurePass123"
    );

    when(userRepository.existsByEmail("john@example.com")).thenReturn(true);

    assertThrows(DuplicateResourceException.class, () -> userService.register(request));
  }
}
```

### Integration Tests

```java
// Test: Auth Flow End-to-End
@SpringBootTest
@AutoConfigureMockMvc
class AuthIntegrationTest {

  @Autowired
  private MockMvc mockMvc;

  @Test
  void testCompleteAuthFlow() throws Exception {
    // Step 1: Register
    mockMvc.perform(post("/api/v1/auth/register")
      .contentType(MediaType.APPLICATION_JSON)
      .content("{\"fullName\": \"John\", \"email\": \"john@example.com\", ...}"))
      .andExpect(status().isCreated());

    // Step 2: Login
    MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
      .contentType(MediaType.APPLICATION_JSON)
      .content("{\"email\": \"john@example.com\", \"password\": \"SecurePass123\"}"))
      .andExpect(status().isOk())
      .andReturn();

    String token = extractTokenFromResponse(result);

    // Step 3: Access protected endpoint
    mockMvc.perform(get("/api/v1/users")
      .header("Authorization", "Bearer " + token))
      .andExpect(status().isOk());
  }
}
```

---

## DEPLOYMENT GUIDE

### Build with Maven

```bash
# Clean and build
mvn clean build

# Build specific service
cd adminservice
mvn clean install

# Create executable JAR
mvn clean package -DskipTests
# Output: target/adminservice-1.0.0.jar
```

### Docker Deployment

```dockerfile
# Dockerfile for each service
FROM openjdk:21-jdk-slim
WORKDIR /app
COPY target/adminservice-1.0.0.jar app.jar
EXPOSE 8082
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Docker Compose

```yaml
version: "3.8"
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: eekitikki@JGJ9
      POSTGRES_DB: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  admin-service:
    build: ./adminservice
    ports:
      - "8082:8082"
    depends_on:
      - postgres
      - redis
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/postgres
      SPRING_REDIS_HOST: redis

  lms-service:
    build: ./project
    ports:
      - "8080:8080"
    depends_on:
      - postgres
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/postgres

  catalog-service:
    build: ./catalogservice
    ports:
      - "8081:8081"
    depends_on:
      - postgres
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/postgres

volumes:
  postgres_data:
```

---

## TROUBLESHOOTING

### Common Issues

#### Issue: 401 Unauthorized on all endpoints

**Cause:** Token expired or invalid signature

**Solution:**

1. Verify JWT secret key matches across services
2. Check token expiration time
3. Request new token via /auth/refresh or re-login

#### Issue: CORS Error

**Cause:** Frontend origin not allowed

**Solution:**

```properties
# Update application.properties
cors.allowed-origins=http://localhost:3000,https://yourdomain.com
```

#### Issue: Database Connection Failed

**Cause:** Database unavailable or credentials wrong

**Solution:**

```bash
# Test connection
psql -h db.ybltvwovudgeyfybygqu.supabase.co -U postgres -d postgres

# Check connection pool
spring.datasource.hikari.maximum-pool-size=5  # Increase if needed
```

---

**This specification is complete and production-ready as of June 4, 2026.**
