import json
import logging
import firebase_admin
from dotenv import load_dotenv
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from firebase_admin import credentials
from .dependencies.config import settings
from .routers import canvas, dashboard, history, prompt, user
from .dependencies.security import SecretKeyMiddleware
from .dependencies.limiter import limiter
from slowapi.middleware import SlowAPIMiddleware
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
    docs_url=None, 
    redoc_url=None
)

app.state.limiter=limiter
app.add.middleware(
    SecretKeyMiddleware,
    secret=settings.INTERNAL_API_SECRET,
    exempt_paths=["/health", "/docs", "/openapi.json"],
)

app.add_middleware(SlowAPIMiddleware)
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

default_rate_limit = Depends(limiter.limit("30/minute"))
app.include_router(
    user.router, 
    prefix="/api/v1/users", 
    tags=["Users"], 
    dependencies=[default_rate_limit]
)
app.include_router(
    prompt.router, 
    prefix="/api/v1/prompts", 
    tags=["Prompts"], 
    dependencies=[default_rate_limit]
)
app.include_router(
    canvas.router, 
    prefix="/api/v1/canvases", 
    tags=["Canvases"], 
    dependencies=[default_rate_limit]
)
app.include_router(
    dashboard.router, 
    prefix="/api/v1/dashboard", 
    tags=["Dashboard"], 
    dependencies=[default_rate_limit]
)
app.include_router(
    history.router, 
    prefix="/api/v1/history", 
    tags=["History"], 
    dependencies=[default_rate_limit]
)

@app.get("/health", tags=["Health Check"])
async def health_check():
    return {"status": "ok", "service": "user-service"}

@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html(req):
    from fastapi.openapi.docs import get_swagger_ui_html
    return get_swagger_ui_html(openapi_url="/openapi.json", title="Docs")

@app.get("/openapi.json", include_in_schema=False)
async def get_open_api_endpoint(req):
    from fastapi.openapi.utils import get_openapi
    return get_openapi(title=app.title, version=app.version, routes=app.routes)