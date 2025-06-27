from fastapi import FastAPI

from rendering_service.api import router as api_router

app = FastAPI(title="Manim Rendering Service")
app.include_router(api_router)


@app.get("/health", tags=["Health Check"])
def health_check():
    """A simple health check endpoint."""
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    print("Running in local development mode. Access at http://localhost:8080")
    uvicorn.run("rendering_service.main:app", host="0.0.0.0", port=8080, reload=True)
