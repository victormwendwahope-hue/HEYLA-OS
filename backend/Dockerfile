FROM python:3.11-slim

WORKDIR /app

# System deps
RUN apt-get update && apt-get install -y \
    libpq-dev gcc && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE ${PORT:-5000}

ENV FLASK_ENV=production

CMD ["gunicorn", "--bind", "0.0.0.0:${PORT:-5000}", "--workers", "1", "--timeout", "120", "run:app"]

