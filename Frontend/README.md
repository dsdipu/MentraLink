# MentraLink Frontend

<p align="center">
  <img src="https://img.shields.io/badge/React-Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/Tailwind%20CSS-UI-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
</p>

<p align="center">
  The React-based frontend application for the MentraLink SWE Mentorship Management System.
</p>

---

## Overview

The MentraLink frontend is a modern React-based web application that provides role-specific interfaces for:

* Students
* Mentors
* Administrators

The frontend communicates with the MentraLink Express backend through REST APIs and provides the primary user interface for the mentorship management system.

---

## Live Application

### Production

https://mentra-link.vercel.app

### Backend API

https://mentralink.onrender.com/api

### GitHub Repository

https://github.com/dsdipu/MentraLink

---

## Main Features

### Authentication

* User login
* JWT-based authentication
* Protected routes
* Role-based navigation
* Session-aware application flow

### Student Dashboard

* Student overview
* Mentor/group information
* Session information
* Attendance
* Evaluations
* Feedback
* Learning resources

### Mentor Dashboard

* Mentor overview
* Assigned students/groups
* Session management
* Attendance
* Student evaluation
* Mentorship activities

### Admin Dashboard

* User management
* Student management
* Mentor management
* Group management
* Session management
* Attendance monitoring
* Evaluation management
* Feedback management
* Blog management
* Dashboard statistics


## Technology Stack

| Technology   | Purpose                       |
| ------------ | ----------------------------- |
| React        | UI development                |
| Vite         | Build and development tooling |
| React Router | Client-side routing           |
| Axios        | REST API communication        |
| Tailwind CSS | Styling                       |
| Lucide React | Icons                         |
| ESLint       | Code quality                  |
| PropTypes    | Component prop validation     |

---

## Frontend Architecture

```text
Frontend/
│
├── public/
│
├── src/
│   ├── assets/
│   │
│   ├── components/
│   │   ├── reusable components
│   │   ├── navigation
│   │   └── feature components
│   │
│   ├── pages/
│   │   ├── authentication
│   │   ├── student pages
│   │   ├── mentor pages
│   │   ├── admin pages
│   │   └── shared pages
│   │
│   ├── utils/
│   │   └── helper utilities
│   │
│   └── ...
│
├── package.json
├── vite.config.js
└── ...
```

---

## Prerequisites

Make sure you have:

* Node.js
* npm
* Git

---

## Installation

From the repository root:

```bash
cd Frontend
npm install
```

---

## Environment Configuration

Create a `.env` file inside the `Frontend` directory when required.

For local development:

```env
VITE_API_URL=http://localhost:5000/api
```

For production:

```env
VITE_API_URL=https://mentralink.onrender.com/api
```

> Do not store private API keys or secrets in frontend environment variables. Variables prefixed with `VITE_` are exposed to the client-side application.

---

## Development

Start the development server:

```bash
npm run dev
```

The application will normally be available at:

```text
http://localhost:5173
```

---

## Production Build

Create a production build:

```bash
npm run build
```

The generated files will be placed in:

```text
dist/
```

---

## Preview Production Build

```bash
npm run preview
```

---

## Linting

Run ESLint:

```bash
npm run lint
```

---

## API Communication

The frontend communicates with the backend through REST APIs using Axios.

### Local API

```text
http://localhost:5000/api
```

### Production API

```text
https://mentralink.onrender.com/api
```

The API base URL should be configured through the environment configuration.

---

## Deployment

The frontend is deployed using **Vercel**.

```text
GitHub
   │
   ▼
Vercel
   │
   ▼
React + Vite Build
   │
   ▼
Production Application
```

### Production URL

https://mentra-link.vercel.app

---

## Development Guidelines

When adding a new feature:

1. Keep reusable UI components inside `components/`.
2. Keep page-level interfaces inside `pages/`.
3. Keep helper functions inside `utils/`.
4. Use the configured API client for backend communication.
5. Follow the existing naming conventions.
6. Keep components focused and reusable.
7. Run ESLint before committing changes.
8. Test frontend features against the production or local backend as appropriate.

---

## Related Documentation

* [Main Project README](../README.md)
* [Backend README](../backend/README.md)
* [Live Application](https://mentra-link.vercel.app)
* [Production API](https://mentralink.onrender.com/api)
* [GitHub Repository](https://github.com/dsdipu/MentraLink)

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
  <strong>MentraLink Frontend</strong><br>
  React + Vite
</p>

<p align="center">
  © 2026 Dipankar Sarkar & MentraLink Project Team
</p>
