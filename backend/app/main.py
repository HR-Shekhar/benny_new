from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.routers import auth as auth_router
from app.routers import faculty_profile as faculty_router
from app.routers import slots as slots_router
from app.routers import resources as resources_router
from app.routers import chatbot as chatbot_router
from app.routers import assignments as assignments_router
from app.db import init_indexes
from app.routers import notices

app = FastAPI(title="Benny WebApp Backend")

# Adjust CORS for your React frontend
# Adjust CORS for your frontend(s). During development it's common to run
# the frontend on localhost or 127.0.0.1 with different ports (3000, 5173, etc.).
# For production, restrict this to your actual frontend origin(s).
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",  # Vite might use next available port
    "http://127.0.0.1:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers under a versioned API prefix so frontend calls to
# `/api/v1/auth/login` will resolve correctly.
API_PREFIX = "/api/v1"

app.include_router(auth_router.router, prefix=API_PREFIX)
app.include_router(faculty_router.router, prefix=API_PREFIX)
app.include_router(notices.router, prefix=API_PREFIX)
app.include_router(slots_router.router, prefix=API_PREFIX)
app.include_router(resources_router.router, prefix=API_PREFIX)
app.include_router(chatbot_router.router, prefix=API_PREFIX)
app.include_router(assignments_router.router, prefix=API_PREFIX)

# Mount static file serving for assignment and submission files
# Note: In production, consider using a proper file server (S3, etc.)
app.mount("/storage", StaticFiles(directory="storage"), name="storage")


@app.get("/")
async def root():
    return {"message": "Benny backend running"}
