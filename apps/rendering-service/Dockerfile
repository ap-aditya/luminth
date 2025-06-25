
FROM python:3.11-slim


WORKDIR /app


ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1

ENV PYTHONPATH=/app


RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    texlive-latex-base \
    texlive-latex-extra \
    texlive-fonts-recommended \
    texlive-science \
    dvipng \
    build-essential \
    pkg-config \
    libcairo2-dev \
    libpango1.0-dev \
    libglib2.0-dev \
    git \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*


RUN pip install uv


COPY apps/rendering-service ./apps/rendering-service
COPY libs/db-core ./libs/db-core


WORKDIR /app/apps/rendering-service
RUN uv sync --no-cache


WORKDIR /app


ENV PATH="/app/apps/rendering-service/.venv/bin:$PATH"


CMD ["gunicorn", "--chdir", "/app/apps/rendering-service", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:8080", "rendering_service.main:app"]