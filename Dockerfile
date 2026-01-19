# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# Stage 2: Setup Backend
FROM python:3.13-slim

WORKDIR /app

# Install system dependencies if needed (e.g. for some python packages)
# RUN apt-get update && apt-get install -y --no-install-recommends gcc && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./backend

# Copy built frontend assets to backend/static
COPY --from=frontend-builder /app/frontend/dist ./backend/static

# Set working directory to backend so imports like 'from api...' work
WORKDIR /app/backend

# Env vars
ENV PORT=8080

# Expose port
EXPOSE $PORT

# Start command
CMD sh -c "uvicorn main:app --host 0.0.0.0 --port $PORT"
