FROM python:3.13.5-alpine

WORKDIR /app

RUN apk update && apk add --no-cache \
    gcc \
    musl-dev \
    libffi-dev \
    sqlite-dev \
    wget \
    && rm -rf /var/cache/apk/*

COPY pyproject.toml .
RUN pip install --no-cache-dir -e .

COPY . .

RUN adduser -D -s /bin/sh appuser
USER appuser

EXPOSE 3001

ENV FLASK_HOST=0.0.0.0
ENV FLASK_PORT=3001
ENV FLASK_DEBUG=false

CMD ["python", "app.py"]
