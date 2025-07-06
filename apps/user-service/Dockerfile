
FROM python:3.11-slim

WORKDIR /app
ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

RUN apt-get update && apt-get install -y --no-install-recommends git && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN pip install uv

COPY apps/user-service ./apps/user-service
COPY libs/db-core ./libs/db-core


WORKDIR /app/apps/user-service
RUN uv sync --no-cache

WORKDIR /app

ENV PATH="/app/apps/user-service/.venv/bin:$PATH"
CMD ["gunicorn", "--chdir", "/app/apps/user-service", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:8000", "user_service.main:app"]