# LMS Frontend Developer Complete Guide

**Version:** 1.0.0-MVP  
**Last Updated:** June 4, 2026  
**Target Audience:** Frontend Engineers, New Team Members  
**Status:** Production Ready

---

## 📋 TABLE OF CONTENTS

1. [Quick Start (First 30 Minutes)](#quick-start-first-30-minutes)
2. [Development Environment Setup](#development-environment-setup)
3. [Project Structure & Architecture](#project-structure--architecture)
4. [Component Creation Guide](#component-creation-guide)
5. [State Management Patterns](#state-management-patterns)
6. [API Integration Guide](#api-integration-guide)
7. [Styling & UI Standards](#styling--ui-standards)
8. [Authentication Flow](#authentication-flow)
9. [Error Handling & Logging](#error-handling--logging)
10. [Performance Optimization](#performance-optimization)
11. [Testing Strategy](#testing-strategy)
12. [Build & Deployment](#build--deployment)
13. [Git Workflow & Contributing](#git-workflow--contributing)
14. [Troubleshooting Guide](#troubleshooting-guide)
15. [Dependency Management](#dependency-management)

---

## QUICK START (FIRST 30 MINUTES)

### Prerequisites

- **Node.js:** v16.x or v18.x (check with `node -v`)
- **npm:** v8.x or higher (check with `npm -v`)
- **Git:** Latest version
- **Code Editor:** VS Code recommended

### Step-by-Step Setup

#### 1. Clone Repository

```bash
git clone <repository-url>
cd frontend
```

#### 2. Install Dependencies

```bash
npm install
# This installs all packages from package.json
# Takes 2-3 minutes on first install
```

#### 3. Create Environment File

```bash
# Create .env.local file in project root
cat > .env.local << EOF
REACT_APP_API_BASE_URL=http://localhost:8080/api/v1
REACT_APP_ADMIN_API_BASE_URL=http://localhost:8082/api/v1
REACT_APP_CATALOG_API_BASE_URL=http://localhost:8081/api/v1
REACT_APP_ENV=development
EOF
```

#### 4. Start Development Server

```bash
npm start
# Opens http://localhost:3000 automatically
# Hot reload enabled - changes refresh automatically
```

#### 5. Verify Installation

```
✅ Browser opens to http://localhost:3000
✅ Login page visible
✅ Console has no red errors
✅ Network tab shows API calls to localhost:8082
```

### Expected Output

```
Compiled successfully!

You can now view frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000

Note that the development build is not optimized.
To create a production build, use npm run build.
```

---

## DEVELOPMENT ENVIRONMENT SETUP

### System Requirements

| Tool    | Version      | Command to Check |
| ------- | ------------ | ---------------- |
| Node.js | 16.x or 18.x | `node -v`        |
| npm     | 8.x+         | `npm -v`         |
| Git     | Latest       | `git --version`  |
| RAM     | 4GB+         | -                |
| Disk    | 500MB+       | -                |

### Recommended VS Code Extensions

```json
{
  "extensions": [
    "ES7+ React/Redux/React-Native snippets",
    "Tailwind CSS IntelliSense",
    "Prettier - Code formatter",
    "ESLint",
    "Thunder Client or REST Client",
    "React Developer Tools",
    "Redux DevTools"
  ]
}
```

### Installation Steps

```bash
# 1. Open VS Code
code .

# 2. Install extensions
# Go to Extensions (Ctrl+Shift+X) and search for above

# 3. Optional: Install global tools
npm install -g create-react-app

# 4. Verify everything
node -v  # Should show v16 or v18
npm -v   # Should show 8.x+
git --version  # Should show git version
```

### Environment Files

Create `.env.local` file:

```properties
# Development environment variables
REACT_APP_API_BASE_URL=http://localhost:8080/api/v1
REACT_APP_ADMIN_API_BASE_URL=http://localhost:8082/api/v1
REACT_APP_CATALOG_API_BASE_URL=http://localhost:8081/api/v1
REACT_APP_ENV=development
REACT_APP_DEBUG=true

# Optional: Analytics
REACT_APP_ANALYTICS_ID=UA-XXXXXXXXX-X
```

**Note:** Never commit `.env.local` to Git - add to `.gitignore`

### Backend Service URLs

Before starting frontend, ensure backend services are running:

| Service         | Port | Command                                    | Status Check                          |
| --------------- | ---- | ------------------------------------------ | ------------------------------------- |
| Admin Service   | 8082 | `cd adminservice && mvn spring-boot:run`   | http://localhost:8082/actuator/health |
| LMS Service     | 8080 | `cd project && mvn spring-boot:run`        | http://localhost:8080/actuator/health |
| Catalog Service | 8081 | `cd catalogservice && mvn spring-boot:run` | http://localhost:8081/actuator/health |

---

## PROJECT STRUCTURE & ARCHITECTURE

### Directory Layout

```
frontend/
├── src/
│   ├── components/              # React components
│   │   ├── Auth/
│   │   │   ├── LoginPage.js    # Email/Phone/OTP login
│   │   │   └── RegisterPage.js # User registration
│   │   ├── Dashboard/
│   │   │   ├── TaskBoard.js    # Task list with filters
│   │   │   ├── AddTaskForm.js  # Create task form
│   │   │   ├── Stats.js        # Statistics sidebar
│   │   │   └── CourseCatalog.js# Course enrollment
│   │   ├── Admin/
│   │   │   ├── AdminPanel.js   # Admin dashboard
│   │   │   └── AdminStats.js   # Dashboard statistics
│   │   ├── Shared/
│   │   │   ├── Spinner.js      # Loading indicator
│   │   │   ├── SyllabusModal.js# Course details modal
│   │   │   └── UserSwitcher.js # (Deprecated - security)
│   │   └── ErrorBoundary.js    # Error boundary (TODO)
│   │
│   ├── services/                # API & business logic
│   │   ├── api.js              # LMS API (8080) + interceptors
│   │   ├── AuthService.js      # Authentication (8082)
│   │   └── CourseService.js    # Courses (8081)
│   │
│   ├── hooks/                  # Custom React hooks (TODO)
│   │   ├── useAuth.js
│   │   ├── useTasks.js
│   │   └── useApi.js
│   │
│   ├── utils/                  # Helper functions
│   │   ├── validators.js       # Form validation
│   │   ├── formatters.js       # Date/time formatting
│   │   └── errorHandler.js     # Error handling
│   │
│   ├── styles/                 # Global styles
│   │   ├── index.css           # Global CSS
│   │   ├── App.css             # App-specific styles
│   │   └── tailwind.config.js  # Tailwind configuration
│   │
│   ├── App.js                  # Main app routing
│   ├── index.js                # Entry point
│   └── index.css               # Global styles
│
├── public/
│   ├── index.html              # HTML template
│   ├── favicon.ico
│   └── manifest.json           # PWA manifest
│
├── .env.local                  # Environment variables (NOT in Git)
├── .env.example                # Template for .env
├── .gitignore                  # Git ignore rules
├── package.json                # Dependencies & scripts
├── package-lock.json           # Locked versions
├── tailwind.config.js          # Tailwind CSS config
├── postcss.config.js           # PostCSS config
├── README.md                   # Project README
└── COMPREHENSIVE_AUDIT.md      # Technical audit document
```

### Component Organization

**By Feature (Recommended):**

```
components/
├── Auth/
│   ├── LoginPage.js
│   ├── RegisterPage.js
│   └── AuthGuard.js
├── Dashboard/
│   ├── index.js (main dashboard)
│   ├── TaskBoard.js
│   ├── AddTaskForm.js
│   ├── Stats.js
│   └── CourseCatalog.js
├── Admin/
│   ├── AdminPanel.js
│   └── AdminStats.js
└── Shared/
    ├── Spinner.js
    ├── SyllabusModal.js
    └── ErrorBoundary.js
```

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                  FRONTEND ARCHITECTURE                   │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │          React Component Layer                    │   │
│  │  LoginPage → Dashboard → Admin Routes             │   │
│  │  State: auth, tasks, courses, user, loading       │   │
│  └──────────────────────────────────────────────────┘   │
│                     ↓                                     │
│  ┌──────────────────────────────────────────────────┐   │
│  │       Custom Hooks & Context Layer               │   │
│  │  useAuth(), useTasks(), useApi()                 │   │
│  │  ErrorBoundary, AuthGuard                         │   │
│  └──────────────────────────────────────────────────┘   │
│                     ↓                                     │
│  ┌──────────────────────────────────────────────────┐   │
│  │         Services Layer (API Integration)          │   │
│  │  AuthService (8082)                              │   │
│  │  api.js (8080) - with interceptors               │   │
│  │  CourseService (8081)                            │   │
│  └──────────────────────────────────────────────────┘   │
│                     ↓                                     │
│  ┌──────────────────────────────────────────────────┐   │
│  │    Utilities & Helpers                            │   │
│  │  validators, formatters, errorHandler             │   │
│  └──────────────────────────────────────────────────┘   │
│                     ↓                                     │
│  ┌──────────────────────────────────────────────────┐   │
│  │     External Services (Backend APIs)              │   │
│  │  Admin Service (8082)                            │   │
│  │  LMS Service (8080)                              │   │
│  │  Catalog Service (8081)                          │   │
│  └──────────────────────────────────────────────────┘   │
│                     ↓                                     │
│  ┌──────────────────────────────────────────────────┐   │
│  │         PostgreSQL Database (Supabase)            │   │
│  │  db.ybltvwovudgeyfybygqu.supabase.co:5432         │   │
│  └──────────────────────────────────────────────────┘   │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## COMPONENT CREATION GUIDE

### Component Template

**Functional Component (Recommended):**

```javascript
import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types"; // Optional but recommended
import toast from "react-hot-toast";
import { SomeIcon } from "lucide-react";

/**
 * ComponentName - Brief description
 * @component
 * @example
 * return (
 *   <ComponentName prop1="value" onAction={handleAction} />
 * )
 */
export default function ComponentName({
  // Props with defaults
  prop1 = "default",
  prop2 = [],
  onAction = () => {},
  disabled = false,
}) {
  // State
  const [state, setState] = useState("initial");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Effects
  useEffect(() => {
    // Cleanup function
    return () => {
      // Cleanup
    };
  }, []); // Dependencies

  // Callbacks (memoized functions)
  const handleAction = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Action logic
      toast.success("Success message");
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      console.error("Error details:", err);
    } finally {
      setLoading(false);
    }
  }, []); // Dependencies

  // Render
  return (
    <div className="space-y-4">
      {/* Content */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}

      {loading && <Spinner />}

      <button
        onClick={handleAction}
        disabled={disabled || loading}
        className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? "Loading..." : "Action"}
      </button>
    </div>
  );
}

// PropTypes definition
ComponentName.propTypes = {
  prop1: PropTypes.string,
  prop2: PropTypes.arrayOf(PropTypes.object),
  onAction: PropTypes.func,
  disabled: PropTypes.bool,
};
```

### Step-by-Step: Add New Component

#### Step 1: Create Component File

```bash
# Create component directory
mkdir src/components/NewFeature

# Create component file
touch src/components/NewFeature/NewComponent.js

# Create test file (optional)
touch src/components/NewFeature/NewComponent.test.js

# Create index for easier imports
touch src/components/NewFeature/index.js
```

#### Step 2: Implement Component

```javascript
// src/components/NewFeature/NewComponent.js
import React, { useState } from "react";

export default function NewComponent({ initialValue = "" }) {
  const [value, setValue] = useState(initialValue);

  return (
    <div className="p-4">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="border rounded px-3 py-2"
      />
    </div>
  );
}
```

#### Step 3: Create Index Export

```javascript
// src/components/NewFeature/index.js
export { default as NewComponent } from "./NewComponent";
```

#### Step 4: Use in App

```javascript
// App.js
import { NewComponent } from "./components/NewFeature";

function App() {
  return (
    <div>
      <NewComponent initialValue="test" />
    </div>
  );
}
```

#### Step 5: Add to Git

```bash
git add src/components/NewFeature/
git commit -m "feat: add NewComponent"
```

### Common Component Patterns

#### Pattern 1: Data Fetching Component

```javascript
export default function DataComponent() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get("/endpoint");
        setData(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!data.length) return <EmptyState />;

  return <DataList data={data} />;
}
```

#### Pattern 2: Form Component

```javascript
export default function FormComponent({ onSubmit }) {
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm(formData);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Form fields */}
      <button type="submit">Submit</button>
    </form>
  );
}
```

#### Pattern 3: Modal Component

```javascript
export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="text-2xl">
            &times;
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
```

---

## STATE MANAGEMENT PATTERNS

### useState Hook - Basic State

```javascript
import React, { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

### useState - Complex State

```javascript
const [user, setUser] = useState({
  name: "",
  email: "",
  preferences: {
    theme: "light",
    notifications: true,
  },
});

// Updating nested state
setUser((prev) => ({
  ...prev,
  preferences: {
    ...prev.preferences,
    theme: "dark",
  },
}));
```

### useEffect - Side Effects

```javascript
useEffect(() => {
  // This runs when component mounts
  console.log("Component mounted");

  // Cleanup function (optional)
  return () => {
    console.log("Component unmounting");
  };
}, []); // Dependency array - empty means run once

// Run when specific dependencies change
useEffect(() => {
  console.log("Value changed:", value);
}, [value]); // Run when 'value' changes
```

### useCallback - Memoized Functions

```javascript
const handleClick = useCallback(() => {
  console.log("Button clicked");
  doSomething(value);
}, [value]); // Re-create function only if 'value' changes

// Use in child components to prevent unnecessary re-renders
<ChildComponent onClick={handleClick} />;
```

### useReducer - Complex State Logic

```javascript
const initialState = { count: 0, error: null };

function reducer(state, action) {
  switch (action.type) {
    case "INCREMENT":
      return { ...state, count: state.count + 1 };
    case "DECREMENT":
      return { ...state, count: state.count - 1 };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

export default function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: "INCREMENT" })}>+</button>
      <button onClick={() => dispatch({ type: "DECREMENT" })}>-</button>
    </div>
  );
}
```

### useContext - Global State

```javascript
// Create context
const UserContext = React.createContext();

// Provider component
export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

// Custom hook to use context
export function useUser() {
  const context = React.useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
}

// Usage in component
export default function ProfileComponent() {
  const { user, setUser } = useUser();
  return <div>User: {user?.name}</div>;
}
```

### State Management Best Practices

1. **Keep state as local as possible** - Only lift state when needed
2. **Use useState for simple state** - Easy to understand
3. **Use useReducer for complex state** - Multiple related values
4. **Use useCallback for callbacks** - Passed as props frequently
5. **Use useContext for global state** - Avoid prop drilling
6. **Initialize state from props** - Pass initial values
7. **Group related state** - Keep related values together

### Local Storage State Persistence

```javascript
// Custom hook for persistent state
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  });

  const updateValue = (newValue) => {
    setValue(newValue);
    window.localStorage.setItem(key, JSON.stringify(newValue));
  };

  return [value, updateValue];
}

// Usage
export default function Component() {
  const [theme, setTheme] = useLocalStorage("theme", "light");

  return (
    <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
      Toggle theme
    </button>
  );
}
```

---

## API INTEGRATION GUIDE

### Service Layer Architecture

```
Component → Service Layer → API Interceptor → Backend Service
```

### AuthService - Authentication API

**File:** `src/services/AuthService.js`

```javascript
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const authApi = axios.create({
  baseURL: "http://localhost:8082/api/v1",
});

const AuthService = {
  // Register
  register: async (fullName, email, phoneNumber, password) => {
    try {
      const res = await authApi.post("/auth/register", {
        fullName,
        email,
        phoneNumber,
        password,
      });
      if (res.data.token) {
        localStorage.setItem("authToken", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        return res.data;
      }
      throw new Error("No token returned");
    } catch (err) {
      throw err.response?.data?.message || err.message || "Registration failed";
    }
  },

  // Login
  login: async (email, password) => {
    try {
      const res = await authApi.post("/auth/login", { email, password });
      if (res.data.token) {
        localStorage.setItem("authToken", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        return res.data;
      }
      throw new Error("No token returned");
    } catch (err) {
      throw err.response?.data?.message || err.message || "Login failed";
    }
  },

  // Request Email OTP
  requestOTP: async (email) => {
    try {
      const res = await authApi.post("/auth/request-otp", { email });
      return res.data;
    } catch (err) {
      throw err.response?.data?.message || err.message || "OTP request failed";
    }
  },

  // Send Phone OTP
  sendPhoneOTP: async (phoneNumber) => {
    try {
      const res = await authApi.post("/auth/send-otp", { phoneNumber });
      return res.data;
    } catch (err) {
      throw err.response?.data?.message || err.message || "Failed to send OTP";
    }
  },

  // Verify OTP
  verifyOTP: async (emailOrPhone, otp) => {
    try {
      const isPhoneNumber = /^\d{10}$/.test(emailOrPhone);
      const payload = isPhoneNumber
        ? { phoneNumber: emailOrPhone, otp }
        : { email: emailOrPhone, otp };

      const res = await authApi.post("/auth/verify-otp", payload);
      const token = res.data.token || res.data.authToken;
      const user = res.data.user || res.data.userData;

      if (token) {
        localStorage.setItem("authToken", token);
        if (user) localStorage.setItem("user", JSON.stringify(user));
        return { token, user };
      }
      throw new Error("No token returned");
    } catch (err) {
      throw (
        err.response?.data?.message || err.message || "OTP verification failed"
      );
    }
  },

  // Refresh Token
  refreshToken: async () => {
    try {
      const res = await authApi.post("/auth/refresh");
      if (res.data.token) {
        localStorage.setItem("authToken", res.data.token);
        return res.data.token;
      }
      throw new Error("No token returned");
    } catch (err) {
      AuthService.logout();
      throw err;
    }
  },

  // Get Token
  getToken: () => localStorage.getItem("authToken"),

  // Get User
  getUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  // Get User Role
  getUserRole: () => {
    const token = AuthService.getToken();
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      return decoded.role || null;
    } catch (err) {
      console.error("Failed to decode token:", err);
      return null;
    }
  },

  // Check Authentication
  isAuthenticated: () => {
    const token = AuthService.getToken();
    if (!token) return false;
    try {
      const decoded = jwtDecode(token);
      return decoded.exp * 1000 > Date.now();
    } catch (err) {
      return false;
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  },
};

export default AuthService;
```

### LMS API Service

**File:** `src/services/api.js`

```javascript
import axios from "axios";
import AuthService from "./AuthService";
import toast from "react-hot-toast";

// Create base axios instance for LMS Service
export const api = axios.create({
  baseURL: "http://localhost:8080/api/v1",
});

// Create admin API instance
export const adminApi = axios.create({
  baseURL: "http://localhost:8082/api/v1",
});

// Setup interceptors
const setupInterceptor = (axiosInstance) => {
  // Request interceptor
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = AuthService.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  // Response interceptor
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Handle 401 - Token expired
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
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

      // Handle 403 - Forbidden
      if (error.response?.status === 403) {
        toast.error(
          "Access denied. You don't have permission for this action.",
        );
      }

      return Promise.reject(error);
    },
  );
};

// Setup both interceptors
setupInterceptor(api);
setupInterceptor(adminApi);

export default api;
```

### CourseService

**File:** `src/services/CourseService.js`

```javascript
import { api } from "./api";

export const CourseService = {
  // Get all courses
  getCourses: async (page = 1, limit = 20) => {
    try {
      const res = await api.get("/courses", {
        params: { page, limit },
      });
      return res.data.content || res.data;
    } catch (err) {
      console.error("Error fetching courses:", err);
      throw err;
    }
  },

  // Get single course
  getCourseById: async (courseId) => {
    try {
      const res = await api.get(`/courses/${courseId}`);
      return res.data;
    } catch (err) {
      console.error("Error fetching course:", err);
      throw err;
    }
  },

  // Get course modules
  getModules: async (courseId) => {
    try {
      const res = await api.get(`/courses/${courseId}/modules`);
      return res.data;
    } catch (err) {
      console.error("Error fetching modules:", err);
      throw err;
    }
  },

  // Enroll in course
  enrollCourse: async (courseId, userId) => {
    try {
      const res = await api.post(`/courses/${courseId}/enroll`, { userId });
      return res.data;
    } catch (err) {
      console.error("Error enrolling in course:", err);
      throw err;
    }
  },
};

export default CourseService;
```

### Adding New API Endpoints

#### Step 1: Define Service Method

```javascript
// src/services/api.js or custom service

export const TaskService = {
  getTasks: async (userId) => {
    try {
      const res = await api.get(`/tasks/user/${userId}`);
      return res.data;
    } catch (err) {
      console.error("Error fetching tasks:", err);
      throw err;
    }
  },

  createTask: async (taskData) => {
    try {
      const res = await api.post("/tasks", taskData);
      return res.data;
    } catch (err) {
      console.error("Error creating task:", err);
      throw err;
    }
  },

  updateTask: async (taskId, updates) => {
    try {
      const res = await api.put(`/tasks/${taskId}`, updates);
      return res.data;
    } catch (err) {
      console.error("Error updating task:", err);
      throw err;
    }
  },

  deleteTask: async (taskId) => {
    try {
      const res = await api.delete(`/tasks/${taskId}`);
      return res.data;
    } catch (err) {
      console.error("Error deleting task:", err);
      throw err;
    }
  },
};
```

#### Step 2: Use in Component

```javascript
import { TaskService } from "./services/api";

export default function TaskComponent() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const data = await TaskService.getTasks(userId);
        setTasks(data);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [userId]);

  return <div>{loading ? <Spinner /> : <TaskList tasks={tasks} />}</div>;
}
```

### API Error Handling

```javascript
// Centralized error handler
export function handleApiError(error) {
  if (!error.response) {
    // Network error
    return "Network error. Please check your connection.";
  }

  const { status, data } = error.response;

  switch (status) {
    case 400:
      return data.message || "Invalid request";
    case 401:
      return "Please login again";
    case 403:
      return "Access denied";
    case 404:
      return "Resource not found";
    case 429:
      return "Too many requests. Try again later.";
    case 500:
      return "Server error. Please try again later.";
    default:
      return data.message || "An error occurred";
  }
}

// Usage in component
try {
  await api.post("/tasks", taskData);
} catch (err) {
  const message = handleApiError(err);
  toast.error(message);
}
```

---

## STYLING & UI STANDARDS

### Tailwind CSS Setup

**File:** `tailwind.config.js`

```javascript
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f9ff",
          600: "#2563eb",
          700: "#1d4ed8",
        },
      },
    },
  },
  plugins: [],
};
```

### Color Palette

| Purpose        | Tailwind Class | Hex     | Usage            |
| -------------- | -------------- | ------- | ---------------- |
| Primary        | indigo-600     | #4f46e5 | Buttons, links   |
| Primary Dark   | indigo-700     | #4338ca | Hover states     |
| Success        | green-600      | #16a34a | Success messages |
| Error          | red-600        | #dc2626 | Error messages   |
| Warning        | yellow-600     | #ca8a04 | Warning messages |
| Info           | blue-600       | #2563eb | Info messages    |
| Background     | slate-50       | #f8fafc | Page background  |
| Border         | slate-200      | #e2e8f0 | Borders          |
| Text Primary   | slate-900      | #0f172a | Main text        |
| Text Secondary | slate-600      | #475569 | Secondary text   |

### Typography Standards

```javascript
// Heading hierarchy
<h1 className="text-4xl font-bold text-slate-900">Page Title</h1>
<h2 className="text-2xl font-bold text-slate-800">Section</h2>
<h3 className="text-lg font-semibold text-slate-700">Subsection</h3>

// Body text
<p className="text-base text-slate-600">Regular paragraph</p>
<p className="text-sm text-slate-500">Secondary text</p>

// Links
<a href="#" className="text-indigo-600 hover:text-indigo-700 underline">Link</a>
```

### Button Variants

```javascript
// Primary Button
<button className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition">
  Primary Action
</button>

// Secondary Button
<button className="px-4 py-2 rounded-lg bg-gray-200 text-slate-700 hover:bg-gray-300 font-medium transition">
  Secondary Action
</button>

// Danger Button
<button className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-medium transition">
  Delete
</button>

// Outlined Button
<button className="px-4 py-2 rounded-lg border border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-medium transition">
  Outlined
</button>
```

### Form Input Styles

```javascript
// Text Input
<input
  type="text"
  placeholder="Enter text"
  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
/>

// Textarea
<textarea
  placeholder="Enter description"
  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
  rows={4}
/>

// Select
<select className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500">
  <option>Option 1</option>
</select>

// Checkbox
<input
  type="checkbox"
  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
/>
```

### Layout Components

```javascript
// Flexbox Container
<div className="flex items-center justify-between gap-4">
  Content
</div>

// Grid Layout
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  Items
</div>

// Card Component
<div className="p-6 bg-white rounded-lg shadow">
  Card content
</div>

// Alert/Message
<div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-700">
  Alert message
</div>
```

### Responsive Breakpoints

```javascript
// Mobile-first approach (recommended)
<div className="
  w-full              // Mobile: full width
  md:w-1/2            // Tablet: half width
  lg:w-1/3            // Desktop: one-third width
  text-sm             // Mobile: small text
  md:text-base        // Tablet: base text
  lg:text-lg          // Desktop: large text
">
  Responsive content
</div>

// Common breakpoints
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

### Icons (Lucide React)

```javascript
import { Mail, Lock, Check, X, AlertCircle } from "lucide-react";

export default function Component() {
  return (
    <div className="flex items-center gap-2">
      <Mail size={20} className="text-indigo-600" />
      <span>Email Address</span>
    </div>
  );
}
```

### Common Icon Sizes

- `size={16}` - Small
- `size={20}` - Medium (default)
- `size={24}` - Large
- `size={32}` - Extra large

---

## AUTHENTICATION FLOW

### Login Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│ 1. User enters email/password on LoginPage               │
├─────────────────────────────────────────────────────────┤
│                      ↓                                     │
│ 2. Frontend calls AuthService.login()                    │
│    POST /api/v1/auth/login (to port 8082)               │
├─────────────────────────────────────────────────────────┤
│                      ↓                                     │
│ 3. Backend validates credentials                         │
│    ✓ User exists                                          │
│    ✓ Password correct                                     │
│    ✓ Account active                                       │
├─────────────────────────────────────────────────────────┤
│                      ↓                                     │
│ 4. Backend generates JWT token                           │
│    JWT = {sub, userId, email, role, exp}                │
├─────────────────────────────────────────────────────────┤
│                      ↓                                     │
│ 5. Frontend stores token in localStorage                 │
│    localStorage.setItem("authToken", token)              │
├─────────────────────────────────────────────────────────┤
│                      ↓                                     │
│ 6. Frontend redirects to dashboard                       │
│    Reads user role from JWT                              │
│    Shows ROLE_USER or ROLE_ADMIN interface               │
├─────────────────────────────────────────────────────────┤
│                      ↓                                     │
│ 7. All subsequent requests include token                 │
│    Authorization: Bearer {token}                         │
└─────────────────────────────────────────────────────────┘
```

### Token Management

```javascript
// Getting token
const token = AuthService.getToken();
// Returns: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

// Getting user from token
const user = AuthService.getUser();
// Returns: { id: 1, email: "user@example.com", role: "ROLE_USER" }

// Getting user role
const role = AuthService.getUserRole();
// Returns: "ROLE_USER" or "ROLE_ADMIN"

// Checking if authenticated
const isAuth = AuthService.isAuthenticated();
// Returns: true or false

// Logging out
AuthService.logout();
// Clears localStorage and redirects
```

### JWT Token Structure

```javascript
// Encoded JWT (what's stored)
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyQGV4YW1wbGUuY29tIiwidXNlcklkIjoxLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJyb2xlIjoiUk9MRV9VU0VSIiwiaWF0IjoxNzE3NTAwMDAwLCJleHAiOjE3MTc1ODY0MDB9.signature

// Decoded JWT (what frontend sees)
{
  "sub": "user@example.com",      // Subject (email)
  "userId": 1,                     // User ID
  "email": "user@example.com",     // Email
  "role": "ROLE_USER",             // Role
  "iat": 1717500000,               // Issued at
  "exp": 1717586400                // Expires at (24h later)
}

// In frontend (jwtDecode)
import { jwtDecode } from 'jwt-decode';

const decoded = jwtDecode(token);
console.log(decoded.role);  // "ROLE_USER"
console.log(decoded.exp);   // 1717586400 (Unix timestamp)
```

### Protected Routes

```javascript
// App.js - Route protection
export default function App() {
  const [isAuth, setIsAuth] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = AuthService.getToken();
    if (token && AuthService.isAuthenticated()) {
      setIsAuth(true);
      setUserRole(AuthService.getUserRole());
    }
  }, []);

  // Not authenticated - show login
  if (!isAuth) {
    return <LoginPage onLoginSuccess={handleLogin} />;
  }

  // Admin only - show admin panel
  if (userRole === "ROLE_ADMIN") {
    return <AdminPanel />;
  }

  // User role - show user dashboard
  return <Dashboard />;
}
```

---

## ERROR HANDLING & LOGGING

### Error Handling Strategy

```javascript
// Global error handler
export function handleError(error, context = "") {
  console.error(`Error in ${context}:`, error);

  // Network error
  if (!error.response) {
    return {
      message: "Network error. Please check your connection.",
      code: "NETWORK_ERROR",
      status: 0,
    };
  }

  const { status, data } = error.response;

  // Server errors
  const errorMap = {
    400: { message: data.message || "Invalid request", code: "BAD_REQUEST" },
    401: {
      message: "Session expired. Please login again.",
      code: "UNAUTHORIZED",
    },
    403: { message: "Access denied.", code: "FORBIDDEN" },
    404: { message: "Resource not found.", code: "NOT_FOUND" },
    429: {
      message: "Too many requests. Try again later.",
      code: "RATE_LIMITED",
    },
    500: {
      message: "Server error. Please try again later.",
      code: "SERVER_ERROR",
    },
  };

  return {
    message: errorMap[status]?.message || "An error occurred",
    code: errorMap[status]?.code || "UNKNOWN_ERROR",
    status,
  };
}

// Usage
try {
  await api.post("/tasks", taskData);
} catch (error) {
  const { message, code } = handleError(error, "TaskCreation");
  toast.error(message);

  if (code === "UNAUTHORIZED") {
    window.location.href = "/login";
  }
}
```

### Component Error Boundaries

```javascript
// src/components/ErrorBoundary.js
import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    // Send to error tracking service (Sentry, etc.)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-lg font-bold text-red-700">
            Something went wrong
          </h2>
          <p className="mt-2 text-red-600">{this.state.error?.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

### Logging Best Practices

```javascript
// src/utils/logger.js
const LOG_LEVELS = {
  ERROR: "error",
  WARN: "warn",
  INFO: "info",
  DEBUG: "debug",
};

export const logger = {
  error: (message, data = {}) => {
    console.error(`[ERROR] ${message}`, data);
    // Send to error tracking service
  },

  warn: (message, data = {}) => {
    console.warn(`[WARN] ${message}`, data);
  },

  info: (message, data = {}) => {
    if (process.env.REACT_APP_ENV === "development") {
      console.log(`[INFO] ${message}`, data);
    }
  },

  debug: (message, data = {}) => {
    if (process.env.REACT_APP_DEBUG === "true") {
      console.log(`[DEBUG] ${message}`, data);
    }
  },
};

// Usage
import { logger } from "./utils/logger";

logger.info("User logged in", { userId: 1, email: "user@example.com" });
logger.error("Failed to fetch tasks", { status: 500, error: err });
```

---

## PERFORMANCE OPTIMIZATION

### Code Splitting

```javascript
import React, { lazy, Suspense } from "react";
import Spinner from "./components/Spinner";

// Lazy load admin panel (only load when needed)
const AdminPanel = lazy(() => import("./components/Admin/AdminPanel"));

export default function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <AdminPanel />
    </Suspense>
  );
}
```

### Memoization

```javascript
import React, { memo, useMemo, useCallback } from "react";

// Memoize component
const TaskItem = memo(({ task, onToggle }) => {
  console.log("TaskItem rendered");
  return <div onClick={() => onToggle(task.id)}>{task.title}</div>;
});

// Memoize expensive calculations
export default function TaskList({ tasks }) {
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }, [tasks]);

  // Memoize callback
  const handleToggle = useCallback((taskId) => {
    console.log("Toggle task", taskId);
  }, []);

  return (
    <div>
      {sortedTasks.map((task) => (
        <TaskItem key={task.id} task={task} onToggle={handleToggle} />
      ))}
    </div>
  );
}
```

### Image Optimization

```javascript
// Use appropriate image sizes
<img
  src="image.jpg"
  alt="Description"
  className="w-full h-auto"
  loading="lazy"  // Lazy load images
/>

// Use WebP format with fallback
<picture>
  <source srcSet="image.webp" type="image/webp" />
  <source srcSet="image.jpg" type="image/jpeg" />
  <img src="image.jpg" alt="Description" />
</picture>
```

### Bundle Analysis

```bash
# Analyze bundle size
npm install --save-dev source-map-explorer

# Add to package.json scripts
"analyze": "source-map-explorer 'build/static/js/*.js'"

# Run analysis
npm run build
npm run analyze
```

### Performance Metrics

```javascript
// Track Core Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from "web-vitals";

getCLS(console.log); // Cumulative Layout Shift
getFID(console.log); // First Input Delay
getFCP(console.log); // First Contentful Paint
getLCP(console.log); // Largest Contentful Paint
getTTFB(console.log); // Time to First Byte
```

---

## TESTING STRATEGY

### Unit Tests with Jest & React Testing Library

```javascript
// src/components/Button.test.js
import { render, screen, fireEvent } from "@testing-library/react";
import Button from "./Button";

describe("Button Component", () => {
  test("renders button with text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  test("calls onClick when clicked", () => {
    const mockClick = jest.fn();
    render(<Button onClick={mockClick}>Click</Button>);

    fireEvent.click(screen.getByText("Click"));
    expect(mockClick).toHaveBeenCalledTimes(1);
  });

  test("disables button when disabled prop is true", () => {
    render(<Button disabled>Click</Button>);
    expect(screen.getByText("Click")).toBeDisabled();
  });
});
```

### Integration Tests

```javascript
// src/__tests__/integration/login.test.js
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginPage from "../../components/LoginPage";

describe("Login Integration", () => {
  test("user can login successfully", async () => {
    render(<LoginPage onLoginSuccess={jest.fn()} />);

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@example.com" },
    });

    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "Password123" },
    });

    fireEvent.click(screen.getByText("Login"));

    await waitFor(() => {
      expect(screen.getByText("Login successful")).toBeInTheDocument();
    });
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (re-run on file change)
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- LoginPage.test.js
```

---

## BUILD & DEPLOYMENT

### Build Process

```bash
# Create production build
npm run build

# Output: build/ directory with optimized files
# - Minified JavaScript
# - Compressed CSS
# - Optimized images
# - Source maps (for debugging)
```

### Build Output

```
build/
├── index.html          # Main HTML file
├── static/
│   ├── css/           # Minified CSS
│   ├── js/            # Minified JavaScript
│   └── media/         # Images, fonts
├── asset-manifest.json
├── favicon.ico
└── robots.txt
```

### Production Checklist

```
Pre-deployment:
- [ ] npm run build succeeds
- [ ] Lighthouse score > 80
- [ ] No console errors
- [ ] All API endpoints working
- [ ] Environment variables set correctly
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Error tracking configured (Sentry, etc.)
```

### Deployment Steps (Vercel Example)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy
vercel --prod

# 4. Set environment variables in Vercel dashboard
# REACT_APP_API_BASE_URL=https://api.production.com/api/v1
```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## GIT WORKFLOW & CONTRIBUTING

### Branch Naming Convention

```
feature/task-name                 # New features
bugfix/issue-description          # Bug fixes
hotfix/urgent-issue               # Production hotfixes
refactor/component-name           # Code refactoring
docs/documentation-update         # Documentation changes
```

### Commit Message Format

```
type(scope): subject

type: feat, fix, docs, style, refactor, test, chore
scope: component or feature name
subject: brief description (imperative mood)

Examples:
feat(LoginPage): add phone OTP authentication
fix(TaskBoard): fix task filtering bug
docs(README): update setup instructions
refactor(AuthService): improve token management
```

### Pull Request Process

1. **Create branch from `develop`:**

   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/new-feature
   ```

2. **Make changes and commit:**

   ```bash
   git add .
   git commit -m "feat(component): description"
   git push origin feature/new-feature
   ```

3. **Create PR on GitHub:**
   - Title: Descriptive title
   - Description: What changed and why
   - Screenshots: For UI changes
   - Checklist: Tests, lint, docs

4. **Code Review:**
   - At least 1 approval required
   - All CI/CD checks pass
   - Conflicts resolved

5. **Merge:**
   ```bash
   # Squash commits into single commit
   git merge --squash feature/new-feature
   ```

### Code Review Checklist

```
- [ ] Code follows project style
- [ ] No console errors/warnings
- [ ] Components are reusable
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Responsive design verified
- [ ] Tests written/updated
- [ ] No sensitive data exposed
- [ ] Performance acceptable
- [ ] Documentation updated
```

---

## TROUBLESHOOTING GUIDE

### Common Issues & Solutions

#### Issue: `npm start` fails

```
Error: npm ERR! code ENOENT

Solution:
1. Delete node_modules: rm -rf node_modules
2. Delete package-lock.json: rm package-lock.json
3. Reinstall: npm install
4. Start again: npm start
```

#### Issue: Port 3000 already in use

```
Error: Something is already running on port 3000

Solution (macOS/Linux):
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 npm start
```

#### Issue: 401 Unauthorized errors

```
Symptoms: All API calls return 401

Debugging:
1. Check token: localStorage.getItem("authToken")
2. Verify token format: Bearer prefix
3. Check token expiry: jwtDecode(token).exp
4. Login again if expired

Solution:
AuthService.logout();
window.location.href = '/login';
```

#### Issue: CORS errors

```
Error: Access to XMLHttpRequest blocked by CORS policy

Causes:
- Frontend port ≠ backend expectation
- Backend CORS not configured
- Origin header missing

Solution:
1. Verify backend allows http://localhost:3000
2. Check .env variables are correct
3. Restart backend after CORS config change
```

#### Issue: Components not rendering

```
Symptoms: Blank page or component not visible

Debugging:
1. Check console for errors (F12)
2. Check React DevTools extension
3. Verify component props
4. Check if conditional rendering hides it

Solution:
- Add console.log() in component
- Check {condition && <Component />}
- Verify parent component passes props
```

#### Issue: API calls not working

```
Symptoms: Spinner spins forever or network tab shows failed requests

Debugging:
1. Check backend services are running
2. Verify API URLs in .env
3. Check network tab (F12 → Network)
4. Look at request/response details

Solution:
# Verify backend is running
curl http://localhost:8080/actuator/health

# Check API endpoint
curl http://localhost:8082/api/v1/users
```

#### Issue: Form validation failing

```
Symptoms: Cannot submit form, validation errors unclear

Solution:
1. Check browser console for errors
2. Verify regex patterns for validation
3. Test with simple values first
4. Check backend requirements match frontend

Example:
// Phone should be 10 digits
if (!/^\d{10}$/.test(phoneNumber)) {
  setError("Phone must be 10 digits");
}
```

---

## DEPENDENCY MANAGEMENT

### Current Dependencies

```json
{
  "dependencies": {
    "react": "19.2.4", // UI framework
    "react-dom": "19.2.4", // React DOM rendering
    "axios": "1.13.5", // HTTP client
    "jwt-decode": "4.0.0", // JWT parsing
    "react-hot-toast": "2.6.0", // Toast notifications
    "lucide-react": "0.575.0", // Icon library
    "tailwindcss": "3.4.19", // CSS framework
    "autoprefixer": "10.4.24", // CSS vendor prefixes
    "react-scripts": "5.0.1" // Create React App scripts
  },
  "devDependencies": {
    "@testing-library/react": "16.3.2",
    "@testing-library/jest-dom": "6.9.1",
    "prettier": "latest", // Code formatter
    "eslint": "latest" // Linter
  }
}
```

### Adding New Packages

```bash
# Install package
npm install package-name

# Install as dev dependency
npm install --save-dev package-name

# Install specific version
npm install package-name@1.2.3

# Update all packages
npm update

# Check for vulnerabilities
npm audit

# Fix vulnerabilities automatically
npm audit fix
```

### Updating Dependencies

```bash
# Check outdated packages
npm outdated

# Update single package
npm update package-name

# Update major version (might have breaking changes)
npm install package-name@latest

# Remove package
npm uninstall package-name
```

### Best Practices

1. **Keep dependencies minimal** - Only install what you need
2. **Check package size** - Use `npm ls` or bundlephobia.com
3. **Review before updating** - Check changelog for breaking changes
4. **Use exact versions** - Avoid `~` or `^` in production
5. **Regularly audit** - Run `npm audit` monthly
6. **Use lock file** - Commit `package-lock.json` to git

---

## SECURITY BEST PRACTICES

### Secure Token Storage

```javascript
// ❌ BAD: Storing in localStorage (vulnerable to XSS)
localStorage.setItem("token", jwtToken);

// ✅ GOOD: Backend sends httpOnly cookie
// Frontend cannot access via JavaScript
// Automatically sent with requests
```

### Input Validation

```javascript
import DOMPurify from "dompurify";

// Sanitize user input before display
const sanitized = DOMPurify.sanitize(userInput);

// Validation on frontend
function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Still validate on backend (never trust client)
```

### Sensitive Data

```javascript
// ❌ Never store sensitive data in localStorage
localStorage.setItem("password", password);
localStorage.setItem("creditCard", creditCard);

// ✅ Only store tokens (sent by backend anyway)
localStorage.setItem("authToken", token);

// ❌ Never log sensitive data
console.log("User data:", { email, password }); // EXPOSED!

// ✅ Log safely
console.log("User logged in:", { email: user.email });
```

### Environment Variables

```javascript
// ❌ WRONG: Hardcoded secrets
const API_KEY = "sk-abc123xyz";

// ✅ RIGHT: Use environment variables
const API_KEY = process.env.REACT_APP_API_KEY;

// Note: REACT_APP_ prefix required for frontend
// REACT_APP_API_BASE_URL=http://localhost:8080/api/v1
```

---

**This guide is comprehensive and up-to-date as of June 4, 2026.**
