# MentraLink Backend

### Express.js REST API

The MentraLink backend is a Node.js and Express.js REST API responsible for authentication, authorization, database operations, mentorship workflows, file uploads, and communication with the frontend application.

---

## Production API

**Base URL:**

https://mentralink.onrender.com/api

**Frontend:**

https://mentra-link.vercel.app

**Repository:**

https://github.com/dsdipu/MentraLink

---

## Overview

The backend provides APIs for:

* Authentication
* User management
* Student management
* Mentor management
* Semester management
* Group management
* Mentorship sessions
* Attendance
* Evaluations
* Feedback
* Blog management
* Administrative operations
* Media uploads

---

## Technology Stack

| Technology                | Purpose                       |
| ------------------------- | ----------------------------- |
| Node.js                   | Runtime                       |
| Express.js                | REST API framework            |
| MongoDB                   | Database                      |
| Mongoose                  | ODM                           |
| JWT                       | Authentication                |
| bcryptjs                  | Password hashing              |
| Cloudinary                | Media storage                 |
| Multer                    | File upload handling          |
| multer-storage-cloudinary | Cloudinary upload integration |
| CORS                      | Cross-origin request handling |
| dotenv                    | Environment configuration     |
| Nodemon                   | Development server            |

---

## Backend Architecture

```text
backend/
│
├── src/
│   ├── controllers/
│   │   └── Business logic
│   │
│   ├── middleware/
│   │   ├── authentication
│   │   ├── authorization
│   │   └── upload handling
│   │
│   ├── models/
│   │   └── MongoDB/Mongoose models
│   │
│   ├── routes/
│   │   └── REST API routes
│   │
│   ├── utils/
│   │   └── Shared utilities
│   │
│   └── server.js
│
├── package.json
└── ...
```

---

## API Architecture

```text
Client
  │
  │ HTTP / REST API
  ▼
Express Server
  │
  ├── Authentication Middleware
  │
  ├── Authorization Middleware
  │
  ├── Route Layer
  │
  ├── Controller / Business Logic
  │
  └── Data Access
          │
          ▼
      MongoDB
```

Media uploads follow a separate flow:

```text
Client
  │
  ▼
Multer
  │
  ▼
Cloudinary Storage
  │
  ▼
Media URL
  │
  ▼
MongoDB / Application Data
```

---

## Prerequisites

Install:

* Node.js
* npm
* Git
* MongoDB Atlas account or local MongoDB
* Cloudinary account

---

## Installation

From the repository root:

```bash
cd backend
npm install
```

---

## Environment Variables

Create a `.env` file inside the `backend` directory.

Example:

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

FRONTEND_URLS=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password
```

> The values above are examples only. Never commit real credentials to GitHub.

---

## Running the Backend

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

The local API will normally run at:

```text
http://localhost:5000
```

---

## API Base URL

### Local

```text
http://localhost:5000/api
```

### Production

```text
https://mentralink.onrender.com/api
```

---

## API Modules

The API is organized into separate functional areas.

| Module         | Endpoint           |
| -------------- | ------------------ |
| Authentication | `/api/auth`        |
| Students       | `/api/students`    |
| Mentors        | `/api/mentors`     |
| Semesters      | `/api/semesters`   |
| Groups         | `/api/groups`      |
| Sessions       | `/api/sessions`    |
| Attendance     | `/api/attendance`  |
| Evaluations    | `/api/evaluations` |
| Feedback       | `/api/feedback`    |
| Blogs          | `/api/blogs`       |
| Administration | `/api/admin`       |

> Individual HTTP methods and request/response structures depend on the specific route implementation.

---

## Authentication

MentraLink uses JWT-based authentication.

General authentication flow:

```text
User Login
    │
    ▼
Credentials Verified
    │
    ▼
Password Checked
    │
    ▼
JWT Generated
    │
    ▼
Authenticated Client
    │
    ▼
Protected API Requests
```

Passwords are hashed using `bcryptjs`.

Protected endpoints use authentication and role-based authorization where required.

---

## Role-Based Access

The system supports multiple application roles:

### Student

Access to student-specific mentorship functionality.

### Mentor

Access to mentor-specific mentorship and evaluation functionality.

### Admin

Access to system administration and management functionality.

Authorization middleware ensures that protected operations are only accessible to permitted roles.

---

## Database

MentraLink uses **MongoDB** with **Mongoose**.

The database stores application entities such as:

* Users
* Students
* Mentors
* Groups
* Semesters
* Sessions
* Attendance
* Evaluations
* Feedback
* Blogs

The MongoDB connection string is provided through the `MONGO_URI` environment variable.

---

## File Uploads

The backend uses:

* Multer
* Cloudinary
* multer-storage-cloudinary

for handling uploaded media.

General upload flow:

```text
Frontend
   │
   ▼
Multipart Request
   │
   ▼
Multer
   │
   ▼
Cloudinary
   │
   ▼
Cloud Media URL
```

Cloudinary credentials must be configured through environment variables.

---

## CORS

The backend uses CORS configuration to allow requests from approved frontend origins.

Development frontend:

```text
http://localhost:5173
```

Production frontend:

```text
https://mentra-link.vercel.app
```

Allowed origins should be configured through:

```env
FRONTEND_URLS=
```

Multiple origins can be provided as comma-separated values where supported by the application configuration.

---

## Error Handling

The API should return appropriate HTTP status codes and JSON responses for:

* Authentication errors
* Authorization errors
* Validation errors
* Missing resources
* Database errors
* Server errors

Clients should use the response status and message to display appropriate feedback to users.

---

## Deployment

The backend is deployed on Render.

Production API:

https://mentralink.onrender.com/api

Typical deployment architecture:

```text
GitHub
   │
   ▼
Render
   │
   ▼
Node.js / Express
   │
   ├──────────────► MongoDB Atlas
   │
   └──────────────► Cloudinary
```

---

## Local Development

Recommended workflow:

```bash
# Clone
git clone https://github.com/dsdipu/MentraLink.git

# Enter backend
cd MentraLink/backend

# Install dependencies
npm install

# Configure environment variables
# Create .env

# Start development server
npm run dev
```

---

## Production Checklist

Before deploying changes, verify:

* Environment variables are configured
* MongoDB connection is working
* Cloudinary credentials are valid
* CORS allows the production frontend
* JWT secret is configured
* Admin credentials are not committed
* Uploaded media works correctly
* API endpoints return expected responses
* No local `localhost` URLs are stored in production data

---

## Security Notes

Never commit:

```text
.env
MongoDB credentials
JWT secrets
Cloudinary API secrets
Admin passwords
Private tokens
```

Use environment variables for sensitive configuration.

---

## Related Documentation

* [Main Project Documentation](../README.md)
* [Frontend Documentation](../Frontend/README.md)
* [Live Application](https://mentra-link.vercel.app)
* [Production API](https://mentralink.onrender.com/api)
* [GitHub Repository](https://github.com/dsdipu/MentraLink)

---

---

## Project Team

MentraLink was developed collaboratively as a Software Engineering project.

| Member | Contribution | Github |
|--------|--------------|--------|
| Dipankar Sarkar | Project Lead & Full-Stack Development | [See Github Profile](https://github.com/dsdipu) |
| Tanha Tasri | Frontend Lead | [See Github Profile](https://github.com/tanha-tasri) |
| Tuhinur Rahman | Frontend Developer | [See Github Profile](https://github.com/tuhintr0) |
| Taimia Howlader | Backend Developer | [See Github Profile](https://github.com/taimiyea) |

---

## Connect with me

<p align="left">

<a href="https://www.linkedin.com/in/dsdipu" target="_blank">
  <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white"/>
</a>

<a href="https://www.facebook.com/dsdipu0" target="_blank">
  <img src="https://img.shields.io/badge/Facebook-1877F2?style=for-the-badge&logo=facebook&logoColor=white"/>
</a>

<a href="https://www.instagram.com/dsdipu0" target="_blank">
  <img src="https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white"/>
</a>

<a href="mailto:mr.sarkar9979@gmail.com" target="_blank">
  <img src="https://img.shields.io/badge/Gmail-D14836?style=for-the-badge&logo=gmail&logoColor=white"/>
</a>

<a href="https://github.com/dsdipu" target="_blank">
  <img src="https://img.shields.io/badge/GitHub-000000?style=for-the-badge&logo=github&logoColor=white"/>
</a>

<a href="https://codeforces.com/profile/dipu37" target="_blank">
  <img src="https://img.shields.io/badge/Codeforces-1F8ACB?style=for-the-badge&logo=codeforces&logoColor=white"/>
</a>

</p>

---

© 2026 [Dipankar Sarkar](www.facebook.com/dsdipu0)

---

<p align="center">
  MentraLink Backend · Node.js + Express + MongoDB
</p>
