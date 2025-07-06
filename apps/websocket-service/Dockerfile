
FROM python:3.11-slim

WORKDIR /app
ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

RUN apt-get update && apt-get install -y --no-install-recommends git && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN pip install uv

COPY apps/websocket-service ./apps/websocket-service
COPY libs/db-core ./libs/db-core


WORKDIR /app/apps/websocket-service
RUN uv sync --no-cache

WORKDIR /app

ENV PATH="/app/apps/websocket-service/.venv/bin:$PATH"
CMD ["gunicorn", "--chdir", "/app/apps/websocket-service", "-w", "1", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:8086", "websocket_service.main:app"]
