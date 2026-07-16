it`s my source code for uppy &amp; tus for streaming upload. you can also use it.

# 📚 Course Stream — Resumable Video Uploads for Online Courses

A full-stack platform that lets instructors create courses and upload large video lessons with **resumable, interruption-proof uploads** — powered by the [tus](https://tus.io) protocol. Built with a modern TypeScript stack on both ends.

![Node.js](https://img.shields.io/badge/Node.js-20.19%2B-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)
![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=black)
![tus](https://img.shields.io/badge/tus-resumable%20uploads-orange)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## ✨ Why this project?

Uploading large course videos over unreliable connections is painful — a dropped connection usually means starting from zero. This project solves that with **resumable uploads**: if the network drops mid-upload, the client picks up exactly where it left off, no re-upload needed.

- 🔐 **Secure by default** — JWT-based authentication protects every upload.
- ⏸️ **Resumable uploads** — powered by [`@tus/server`](https://www.npmjs.com/package/@tus/server) on the backend and [Uppy](https://uppy.io) on the frontend.
- 🗂️ **Organized storage** — uploaded videos are automatically renamed, validated, and sorted into structured folders per course.
- 🧩 **Fully typed** — end-to-end TypeScript, from Prisma models to React components.
- 🧱 **Composable upload pipeline** — a generic `createTusServer` factory lets you spin up new upload endpoints (courses, avatars, attachments, etc.) with custom validation and database logic in just a few lines.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Backend runtime** | Node.js + Express (TypeScript) |
| **Database ORM** | Prisma (SQLite) |
| **Authentication** | JWT (`jsonwebtoken`) + password hashing (`bcryptjs`) |
| **Resumable uploads** | `@tus/server` + `@tus/file-store` |
| **Frontend** | React (TypeScript) |
| **Upload client** | [Uppy](https://uppy.io) (`@uppy/core`, `@uppy/tus`, `@uppy/react`) |
| **HTTP client** | Axios |

---

## 🗺️ Architecture Overview

```
┌─────────────────┐        JWT Auth         ┌──────────────────────┐
│   React Client   │ ───────────────────────▶│   Express API Server │
│  (Uppy Dashboard) │                          │                      │
└────────┬─────────┘                          └──────────┬───────────┘
         │  Resumable PATCH/POST (tus protocol)           │
         ▼                                                 ▼
┌─────────────────┐                          ┌──────────────────────┐
│  @tus/server     │ ───── on finish ────────▶│   Prisma + SQLite     │
│  (chunked upload)│      rename & validate    │  User / Course / File │
└────────┬─────────┘                          └──────────────────────┘
         │
         ▼
┌─────────────────┐
│  /storage/*      │  ← final, organized video files
└─────────────────┘
```

**Upload flow in a nutshell:**
1. The client authenticates and receives a JWT.
2. Uppy uploads the video in chunks to a tus-protocol endpoint, attaching `courseId` and `sessionNumber` as upload metadata.
3. On completion, the server verifies the JWT, validates the target course, renames the file, moves it into `storage/<subfolder>/`, and persists a `File` record linked to both the `User` and the `Course`.

---

## 📂 Project Structure

```
backend/
├── prisma/
│   └── schema.prisma          # User, Course, File models
├── src/
│   ├── controller/
│   │   ├── authController.ts  # register / login
│   │   ├── courseController.ts
│   │   └── fileController.ts  # tus upload endpoint
│   ├── middleware/
│   │   └── checkAuthentication.ts
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   ├── courseRoutes.ts
│   │   └── fileRoutes.ts
│   ├── utils/
│   │   ├── tus.ts             # generic, reusable tus server factory
│   │   ├── CorrectName.ts     # filename/extension helpers
│   │   ├── jwt.ts
│   │   └── prisma.ts
│   └── index.ts
└── uploads/ | storage/         # tus temp storage + final organized files

frontend/
└── src/
    └── component/
        ├── auth/
        │   ├── Register.tsx
        │   └── Login.tsx
        ├── course/
        │   ├── AddCourse.tsx
        │   └── GetAllCourses.tsx
        └── upload/
            └── UppyDashboard.tsx
```

---

## 🧬 Data Model

```mermaid
erDiagram
    User ||--o{ File : uploads
    User ||--|| Course : owns
    Course ||--o{ File : contains

    User {
        string id PK
        string email
        string password
    }
    Course {
        string id PK
        string title
        string description
        string userId FK
    }
    File {
        string id PK
        string filename
        string originalName
        string mimeType
        string extension
        int size
        string path
        string url
        int sessionNumber
        string userId FK
        string courseId FK
    }
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js **>= 20.19.0**
- npm

### 1. Clone & install

```bash
git clone https://github.com/arefsalarieh/my-source-uppy-tus.git
cd my-source-uppy-tus

# backend
cd backend
npm install

# frontend
cd ../frontend
npm install
```

### 2. Configure environment variables

Create a `.env` file inside `backend/`:

```env
PORT=5000
DATABASE_URL="file:./dev.db"
JWT_SECRET="replace-with-a-long-random-secret"
```

### 3. Set up the database

```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Run the app

```bash
# backend
cd backend
npm run dev

# frontend (in a separate terminal)
cd frontend
npm run dev
```

The API will be available at `http://localhost:5000` and the frontend at the port your dev server prints (typically `http://localhost:5173` for Vite).

---

## 🔑 API Reference

### Auth

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create a new account and receive a JWT |
| `POST` | `/api/auth/login` | Authenticate and receive a JWT |

### Courses

| Method | Endpoint | Auth required | Description |
|---|---|---|---|
| `POST` | `/api/course` | ✅ | Create a course (one per user) |
| `GET` | `/api/course` | ❌ | List all courses with their files |

### File Upload (tus protocol)

| Method | Endpoint | Auth required | Description |
|---|---|---|---|
| `POST` / `PATCH` / `HEAD` / `DELETE` | `/api/file/upload` | ✅ | Resumable video upload endpoint following the [tus protocol](https://tus.io/protocols/resumable-upload) |

Uploads expect the following metadata (sent automatically by Uppy's `meta` option):

```ts
{
  filename: string,
  filetype: string,
  courseId: string,
  sessionNumber: string,
}
```

---

## 🧩 Extending the Upload System

The backend exposes a generic, type-safe factory — `createTusServer<T>()` — so you can spin up new upload pipelines (avatars, assignments, attachments...) without duplicating any tus/file-handling logic:

```ts
const avatarTus = createTusServer<{ isPublic: boolean }>({
  routePath: "/api/file/avatars/upload",
  subfolder: "avatars",
  buildData: async ({ upload }) => ({
    isPublic: upload.metadata?.isPublic === "true",
  }),
  onSaved: async (info) => {
    await prisma.avatarFile.create({ data: info });
  },
});
```

---

## 🛣️ Roadmap

- [ ] Video transcoding / thumbnail generation on upload completion
- [ ] Progress tracking and analytics per student
- [ ] Role-based access control (instructor vs. student)
- [ ] Cloud storage backends (S3 / Azure) via `@tus/s3-store`
- [ ] Course enrollment and payment flow

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](../../issues).

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
