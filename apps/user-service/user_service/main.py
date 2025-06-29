import firebase_admin
from firebase_admin import credentials
import json
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import user, prompt, canvas
from .dependencies.config import settings
logging.basicConfig(level=logging.INFO)

try:
    service_account_info_str = settings.FIREBASE_SERVICE_ACCOUNT_KEY
    if service_account_info_str:
        service_account_info = json.loads(service_account_info_str)
        cred = credentials.Certificate(service_account_info)
        firebase_admin.initialize_app(cred)
        logging.info("Firebase Admin SDK initialized successfully via environment variable.")
    else:
        firebase_admin.initialize_app()
        logging.info("Firebase Admin SDK initialized successfully via default credentials.")
except Exception as e:
    logging.critical(f"CRITICAL ERROR: Could not initialize Firebase Admin SDK: {e}")
    raise


app = FastAPI(
    title="User & Task Submission Service",
    description="Handles user data, dashboard, and submitting jobs to the render queue.",
    version="1.0.0"
)

origins = [
    settings.FRONTEND_URL,
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user.router)
app.include_router(prompt.router)
app.include_router(canvas.router)

@app.get("/health", tags=["Health Check"])
async def health_check():
    return {"status": "ok", "service": "user-service"}





