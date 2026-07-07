from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from database.mongodb import connect_db, close_db
from routers import auth, upload, notes, dashboard, history, ai


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await close_db()


app = FastAPI(
    title="AI Notes Platform API",
    description="""
## Student AI Notes Platform Backend

A production-ready REST API for managing student notes, file uploads, and study materials.

### Features
- **Authentication** – Register, login, JWT-protected routes
- **File Upload** – Upload txt, pdf, images, audio, video to Cloudflare R2
- **Notes CRUD** – Create, read, update, delete, search notes
- **Dashboard** – Analytics: storage usage, upload/note counts, recent activity
- **History** – Paginated upload and notes history

### Auth
Use the **Authorize** button and enter: `Bearer <your_token>`
    """,
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # Tighten this in production to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router,      prefix="/api/v1")
app.include_router(upload.router,    prefix="/api/v1")
app.include_router(notes.router,     prefix="/api/v1")
app.include_router(dashboard.router, prefix="/api/v1")
app.include_router(history.router,   prefix="/api/v1")
app.include_router(ai.router, prefix="/api/v1")


@app.get("/", tags=["Health"])
async def root():
    return {"status": "ok", "message": "AI Notes Platform API is running 🚀"}


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "healthy"}


