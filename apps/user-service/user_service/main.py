import json
import logging

import firebase_admin
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from firebase_admin import credentials

from .dependencies.config import settings
from .routers import canvas, dashboard, history, prompt, user

load_dotenv()
logging.basicConfig(level=logging.INFO)


try:
    service_account_info_str = settings.FIREBASE_SERVICE_ACCOUNT_KEY
    if service_account_info_str:
        service_account_info = json.loads(service_account_info_str)
        cred = credentials.Certificate(service_account_info)
        firebase_admin.initialize_app(cred)
        logging.info(
            "Firebase Admin SDK initialized successfully via environment variable."
        )
    else:
        firebase_admin.initialize_app()
        logging.info(
            "Firebase Admin SDK initialized successfully via default credentials."
        )
except Exception as e:
    logging.critical(f"CRITICAL ERROR: Could not initialize Firebase Admin SDK: {e}")
    raise


app = FastAPI(
    title="User & Task Submission Service",
    description="Handles user data and task submissions",
    version="1.0.0",
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

app.include_router(user.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(prompt.router, prefix="/api/v1/prompts", tags=["Prompts"])
app.include_router(canvas.router, prefix="/api/v1/canvases", tags=["Canvases"])
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["Dashboard"])
app.include_router(history.router, prefix="/api/v1/history", tags=["History"])

@app.get("/health", tags=["Health Check"])
async def health_check():
    return {"status": "ok", "service": "user-service"}

