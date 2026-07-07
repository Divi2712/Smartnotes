# 📝 AI Notes Platform

> A smart study companion that helps students store, organize, and summarize notes from text, PDFs, images, audio, and video — all powered by AI.

---

## 🌟 What is this?

AI Notes is a full-stack web application built for students. Instead of just storing plain notes, it lets you:

- 📤 Upload any type of content (text, PDF, image, audio, video)
- 🤖 Process it using AI to generate summaries and study notes
- 💾 Store everything securely in the cloud
- 🔍 Search, revisit, and study your notes anytime

---

## 🖥️ Live Demo

> Coming soon after deployment

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 Authentication | Register, login, JWT-protected sessions |
| 📁 File Upload | Upload txt, pdf, jpg, png, mp3, wav, mp4, mov |
| 📝 Notes CRUD | Create, read, update, delete, search notes |
| 📊 Dashboard | Analytics — storage usage, upload counts, recent activity |
| 📜 History | Full paginated history of uploads and notes |
| ☁️ Cloud Storage | Files stored securely via Supabase Storage |
| 🗄️ Database | MongoDB for users, notes, and file metadata |

---

## 🛠️ Tech Stack

### Frontend
![HTML](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

### Backend
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)

### Database & Storage
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)

### Auth
![JWT](https://img.shields.io/badge/JWT-000000?style=flat&logo=jsonwebtokens&logoColor=white)

---

## 📁 Project Structure

```
backend/
├── app.py                    ← FastAPI entry point
├── requirements.txt          ← All dependencies
├── .env                      ← Environment variables (not pushed)
│
├── routers/
│   ├── auth.py               ← /api/v1/auth/*
│   ├── upload.py             ← /api/v1/files/*
│   ├── notes.py              ← /api/v1/notes/*
│   ├── dashboard.py          ← /api/v1/dashboard/
│   └── history.py            ← /api/v1/history/*
│
├── models/
│   ├── user.py               ← User schema
│   ├── file.py               ← File schema
│   └── note.py               ← Note schema
│
├── database/
│   └── mongodb.py            ← MongoDB connection + indexes
│
├── services/
│   ├── auth_service.py       ← Register / login logic
│   ├── upload_service.py     ← Supabase file upload
│   ├── note_service.py       ← Notes CRUD logic
│   └── dashboard_service.py  ← Analytics aggregations
│
├── middleware/
│   └── auth_middleware.py    ← JWT auth dependency
│
└── utils/
    ├── jwt_handler.py        ← Token create / verify
    └── password.py           ← bcrypt hashing
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- MongoDB (local or Atlas)
- Supabase account (free)

### 1. Clone the repository

```bash
git clone https://github.com/coptercode/notes-website-jun26.git
cd notes-website-jun26
```

### 2. Create virtual environment

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Create your `.env` file

Create a file called `.env` in the project root and fill in:

```env
# MongoDB
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=ai_notes_db

# JWT
JWT_SECRET_KEY=your-secret-key-here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Supabase Storage
SUPABASE_URL=https://yourproject.supabase.co
SUPABASE_KEY=your-service-role-key
SUPABASE_BUCKET=ai-notes

# App
MAX_UPLOAD_SIZE_MB=100
```

Generate a JWT secret key:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

### 5. Run the server

```bash
python -m uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

Visit **http://localhost:8000/docs** for the interactive Swagger API docs.

---

## 📡 API Endpoints

### 🔐 Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login and get JWT token |
| GET | `/api/v1/auth/me` | Get current user profile |
| POST | `/api/v1/auth/logout` | Logout |

### 📁 File Upload
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/files/upload` | Upload a file |
| GET | `/api/v1/files/` | List all uploaded files |
| DELETE | `/api/v1/files/{id}` | Delete a file |

### 📝 Notes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/notes/` | Create a note |
| GET | `/api/v1/notes/` | Get all notes (with search) |
| GET | `/api/v1/notes/{id}` | Get single note |
| PUT | `/api/v1/notes/{id}` | Update a note |
| DELETE | `/api/v1/notes/{id}` | Delete a note |

### 📊 Dashboard & History
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/dashboard/` | Get analytics and stats |
| GET | `/api/v1/history/uploads` | Upload history |
| GET | `/api/v1/history/notes` | Notes history |

---

## 🗄️ Database Schemas

### User
```json
{
  "_id": "ObjectId",
  "name": "string",
  "email": "string",
  "password_hash": "string",
  "created_at": "datetime"
}
```

### File
```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "file_name": "string",
  "file_type": "text | pdf | image | audio | video",
  "file_size": "number",
  "file_url": "string",
  "upload_date": "datetime",
  "status": "uploaded"
}
```

### Note
```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "title": "string",
  "original_content": "string",
  "summary": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

---

## ☁️ Supabase Storage Setup

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to **Storage** → **New Bucket** → name it `ai-notes` → enable **Public**
4. Go to **Project Settings** → **API**
5. Copy the **Project URL** and **service_role** key into your `.env`

---

## 🔒 Environment Variables

| Variable | Description |
|---|---|
| `MONGODB_URL` | MongoDB connection string |
| `DATABASE_NAME` | Database name |
| `JWT_SECRET_KEY` | Secret key for JWT tokens |
| `JWT_ALGORITHM` | Algorithm (default: HS256) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiry in minutes |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_KEY` | Supabase service role key |
| `SUPABASE_BUCKET` | Supabase storage bucket name |
| `MAX_UPLOAD_SIZE_MB` | Max file upload size in MB |

> ⚠️ Never commit your `.env` file to GitHub. It is already listed in `.gitignore`.

---

## 🌐 Deployment

When ready to deploy, switch to **MongoDB Atlas** (free cloud MongoDB):

1. Create free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Get your connection string
3. Update `.env`:
```env
MONGODB_URL=mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/
```

That's the only change needed — all code stays the same.

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">
  Built with ❤️ for students who want to study smarter
</div>
