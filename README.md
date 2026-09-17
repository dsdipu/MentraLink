# MentraLink

<p align="center">
  <img src="https://img.shields.io/badge/MentraLink-SWE%20Mentorship%20Management%20System-0A66C2?style=for-the-badge" alt="MentraLink">
</p>

<p align="center">
  A full-stack web-based mentorship management system designed to connect students, mentors, and administrators through a centralized digital platform.
</p>

<p align="center">
  <a href="https://mentra-link.vercel.app">
    <img src="https://img.shields.io/badge/Live%20Application-Visit%20Now-success?style=for-the-badge" alt="Live Application">
  </a>
  <a href="https://github.com/dsdipu/MentraLink">
    <img src="https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github" alt="GitHub Repository">
  </a>
</p>

---

## About MentraLink

**MentraLink** is a full-stack **SWE Mentorship Management System** developed to simplify and centralize academic mentorship activities.

The platform provides dedicated workflows for **Students, Mentors, and Administrators**, allowing mentorship-related activities such as sessions, attendance, evaluations, feedback, blogs, student management, and mentor management to be handled through a single web application.

The goal is to reduce dependency on disconnected manual processes and provide a structured digital environment for academic mentorship.

---

## Live Application

### Frontend

https://mentra-link.vercel.app

### Production API

https://mentralink.onrender.com/api

### Source Code

https://github.com/dsdipu/MentraLink

---

## Why MentraLink?

Academic mentorship often involves multiple activities, including:

* Student-mentor communication
* Group management
* Mentorship sessions
* Attendance tracking
* Student evaluation
* Feedback collection
* Administrative monitoring
* Learning resources and blogs

MentraLink brings these activities together into a centralized platform with role-based access and dedicated dashboards.

---

## Key Features

### Authentication & Authorization

* JWT-based authentication
* Password hashing with bcrypt
* Role-based access control
* Protected routes
* Separate workflows for Students, Mentors, and Admins

### Student Management

* Student profile management
* Mentor and group information
* Session participation
* Attendance tracking
* Evaluation information
* Feedback access

### Mentor Management

* Mentor dashboard
* Assigned student groups
* Session management
* Attendance management
* Student evaluation
* Mentorship-related activities

### Session Management

* Create and manage mentorship sessions
* View session information
* Track participation
* Record attendance
* Role-based session access

### Evaluation System

* Student evaluation
* Mentor ratings
* Evaluation records
* Administrative monitoring

### Feedback

* Mentorship feedback
* Feedback management
* Role-based feedback workflows

### Blog & Learning Content

* Blog publishing
* Blog management
* Learning content
* Image-supported content
* Student-facing resources

### Administrative Dashboard

* Student management
* Mentor management
* User management
* Group management
* Session management
* Attendance monitoring
* Evaluation monitoring
* Feedback management
* Blog management
* Dashboard statistics

---

## User Roles

| Role        | Responsibilities                                                                                              |
| ----------- | ------------------------------------------------------------------------------------------------------------- |
| **Student** | Access mentorship information, sessions, attendance, evaluations, feedback and learning resources             |
| **Mentor**  | Manage assigned students, conduct sessions, record attendance, evaluate students and provide mentorship       |
| **Admin**   | Manage users, mentors, students, groups, sessions, evaluations, feedback, blogs and overall system activities |

---

## Screenshots

> Add screenshots to `docs/screenshots/` using the filenames shown below.

### Landing Page

![MentraLink Landing Page](docs/screenshots/landing-page.png)

### Login

![MentraLink Login](docs/screenshots/login.png)

### Student Dashboard

![Student Dashboard](docs/screenshots/student-dashboard.png)

### Mentor Dashboard

![Mentor Dashboard](docs/screenshots/mentor-dashboard.png)

### Admin Dashboard

![Admin Dashboard](docs/screenshots/admin-dashboard.png)

### Mentorship Sessions

![Mentorship Sessions](docs/screenshots/sessions.png)

### Attendance

![Attendance](docs/screenshots/attendance.png)

### Evaluations

![Evaluations](docs/screenshots/evaluations.png)

### Blog

![MentraLink Blog](docs/screenshots/blog.png)

---

## System Architecture

```text
                         ┌─────────────────────────┐
                         │        End Users         │
                         │                          │
                         │ Students / Mentors/Admin │
                         └────────────┬────────────┘
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │         Vercel          │
                         │    React + Vite App     │
                         └────────────┬────────────┘
                                      │
                                REST API / HTTP
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │         Render          │
                         │     Express Backend     │
                         └────────────┬────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
                    ▼                 ▼                 ▼
             ┌─────────────┐  ┌──────────────┐  ┌──────────────┐
             │  MongoDB    │  │  Cloudinary  │  │ JWT / Auth   │
             │   Atlas     │  │ Media Storage│  │ & Security   │
             └─────────────┘  └──────────────┘  └──────────────┘
```

---

## Technology Stack

### Frontend

| Technology   | Purpose                       |
| ------------ | ----------------------------- |
| React        | User interface                |
| Vite         | Development and build tooling |
| React Router | Client-side routing           |
| Axios        | API communication             |
| Tailwind CSS | Styling                       |
| Lucide React | Icons                         |
| ESLint       | Code quality                  |
| PropTypes    | Component prop validation     |

### Backend

| Technology                | Purpose                       |
| ------------------------- | ----------------------------- |
| Node.js                   | Runtime                       |
| Express.js                | REST API framework            |
| MongoDB                   | Database                      |
| Mongoose                  | ODM                           |
| JWT                       | Authentication                |
| bcryptjs                  | Password hashing              |
| Multer                    | File upload handling          |
| Cloudinary                | Media storage                 |
| multer-storage-cloudinary | Cloudinary upload integration |
| CORS                      | Cross-origin request handling |
| dotenv                    | Environment configuration     |
| Nodemon                   | Development server            |

### Deployment & Services

| Service       | Purpose             |
| ------------- | ------------------- |
| GitHub        | Source control      |
| Vercel        | Frontend deployment |
| Render        | Backend deployment  |
| MongoDB Atlas | Database hosting    |
| Cloudinary    | Media storage       |

---

## Project Structure

```text
MentraLink/
│
├── Frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── utils/
│   │   └── ...
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── server.js
│   ├── package.json
│   └── ...
│
├── docs/
│   └── screenshots/
│
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites

Make sure you have the following installed:

* Node.js
* npm
* Git
* MongoDB Atlas account or local MongoDB
* Cloudinary account

---

## Clone the Repository

```bash
git clone https://github.com/dsdipu/MentraLink.git
cd MentraLink
```

---

## Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory.

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

Start the backend:

```bash
npm run dev
```

Backend:

```text
http://localhost:5000
```

---

## Frontend Setup

Open another terminal:

```bash
cd Frontend
npm install
```

For local development, configure the API URL according to the frontend environment configuration.

Example:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

## Production Deployment

MentraLink follows a separated full-stack deployment architecture.

```text
                  GitHub Repository
                         │
              ┌──────────┴──────────┐
              │                     │
              ▼                     ▼
           Vercel                 Render
        React Frontend         Express Backend
              │                     │
              │                     ├──── MongoDB Atlas
              │                     │
              │                     └──── Cloudinary
              │
              └──────── REST API ──────────►
```

### Frontend

https://mentra-link.vercel.app

### Backend API

https://mentralink.onrender.com/api

---

## API Modules

The backend is organized into dedicated API modules:

```text
/api/auth
/api/students
/api/mentors
/api/semesters
/api/groups
/api/sessions
/api/attendance
/api/evaluations
/api/feedback
/api/blogs
/api/admin
```

For backend-specific documentation:

[Backend README](backend/README.md)

For frontend-specific documentation:

[Frontend README](Frontend/README.md)

---

## Security

MentraLink uses several security practices, including:

* JWT-based authentication
* Password hashing using bcrypt
* Role-based authorization
* Protected API routes
* CORS configuration
* Environment-based secret management
* Cloud-based media storage

### Never commit sensitive information

```text
.env
MongoDB credentials
JWT secrets
Cloudinary API secrets
Admin passwords
Private tokens
```

---

## Development Workflow

```text
Feature / Fix
      │
      ▼
feature/* or fix/*
      │
      ▼
develop
      │
      ▼
Testing
      │
      ▼
main
      │
      ▼
Production
```

---

## Future Improvements

Possible future improvements include:

* Automated backend testing
* CI/CD using GitHub Actions
* More detailed API documentation
* Notification system
* Real-time communication
* Advanced analytics and reporting
* Improved audit logging
* Additional security hardening
* Mobile application support

---

# Project Team

MentraLink was developed collaboratively as a Software Engineering project.

| Member              | Contribution                          | GitHub                                   |
| ------------------- | ------------------------------------- | ---------------------------------------- |
| **Dipankar Sarkar** | Project Lead & Full-Stack Development | [GitHub](https://github.com/dsdipu)      |
| **Tanha Tasri**     | Frontend Lead                         | [GitHub](https://github.com/tanha-tasri) |
| **Tuhinur Rahman**  | Frontend Developer                    | [GitHub](https://github.com/tuhintr0)    |
| **Taimia Howlader** | Backend Developer                     | [GitHub](https://github.com/taimiyea)    |

---

# Connect with Me

<p align="left">

<a href="https://www.linkedin.com/in/dsdipu" target="_blank">
  <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn"/>
</a>

<a href="https://www.facebook.com/dsdipu0" target="_blank">
  <img src="https://img.shields.io/badge/Facebook-1877F2?style=for-the-badge&logo=facebook&logoColor=white" alt="Facebook"/>
</a>

<a href="https://www.instagram.com/dsdipu0" target="_blank">
  <img src="https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white" alt="Instagram"/>
</a>

<a href="mailto:mr.sarkar9979@gmail.com">
  <img src="https://img.shields.io/badge/Gmail-D14836?style=for-the-badge&logo=gmail&logoColor=white" alt="Gmail"/>
</a>

<a href="https://github.com/dsdipu" target="_blank">
  <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"/>
</a>

<a href="https://codeforces.com/profile/dipu37" target="_blank">
  <img src="https://img.shields.io/badge/Codeforces-1F8ACB?style=for-the-badge&logo=codeforces&logoColor=white" alt="Codeforces"/>
</a>

</p>

---

## License

This project was developed for academic and educational purposes.

---

<p align="center">
  <strong>MentraLink</strong><br>
  Connecting Students, Mentors & Academic Support Through Technology
</p>

<p align="center">
  © 2026 Dipankar Sarkar & MentraLink Project Team
</p>
