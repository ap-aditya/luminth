FROM python:3.11-slim AS builder
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    pkg-config \
    libcairo2-dev \
    libpango1.0-dev \
    git \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
RUN pip install uv
COPY pyproject.toml uv.lock* README.md ./
RUN uv venv /app/.venv && \
    uv sync --no-cache -p /app/.venv/bin/python

COPY rendering_service/ ./rendering_service/


FROM python:3.11-slim
ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONUNBUFFERED=1 \
    PATH="/app/.venv/bin:$PATH"

RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    texlive-latex-base \
    texlive-latex-extra \
    texlive-fonts-recommended \
    texlive-science \
    dvipng \
    libcairo2 \
    libpango1.0-0 \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /app/.venv /app/.venv
COPY --from=builder /app/rendering_service/ /app/rendering_service/
CMD ["gunicorn", "-w", "1", "--threads", "6", "--timeout", "0", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:8080", "rendering_service.main:app"]
# uvicorn rendering_service.main:app --host 0.0.0.0 --port 8080 --reload
