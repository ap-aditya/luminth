import logging
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi.middleware import SlowAPIMiddleware

from .dependencies.config import settings
from .dependencies.limiter import limiter
from .dependencies.security import SecretKeyMiddleware, initialize_firebase
from .routers import canvas, dashboard, history, prompt, user
from .services.publish_job import initialize_publisher

load_dotenv()
logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logging.info("Application startup: Initializing services...")
    await initialize_firebase()
    await initialize_publisher()
    logging.info("Application startup: Services initialized.")
    yield
    logging.info("Application shutdown: Cleaning up resources.")


app = FastAPI(
    title="User & Task Submission Service",
    description="Handles user data and task submissions",
    version="1.0.0",
    docs_url=None,
    redoc_url=None,
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_middleware(
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
    dependencies=[default_rate_limit],
)
app.include_router(
    prompt.router,
    prefix="/api/v1/prompts",
    tags=["Prompts"],
    dependencies=[default_rate_limit],
)
app.include_router(
    canvas.router,
    prefix="/api/v1/canvases",
    tags=["Canvases"],
    dependencies=[default_rate_limit],
)
app.include_router(
    dashboard.router,
    prefix="/api/v1/dashboard",
    tags=["Dashboard"],
    dependencies=[default_rate_limit],
)
app.include_router(
    history.router,
    prefix="/api/v1/history",
    tags=["History"],
    dependencies=[default_rate_limit],
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
