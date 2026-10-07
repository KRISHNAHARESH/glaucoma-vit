FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for OpenCV
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency specifications
COPY requirements.txt .

# Install python packages
RUN pip install --no-cache-dir -r requirements.txt \
    fastapi uvicorn python-multipart "python-jose[cryptography]" "passlib[bcrypt]" bcrypt sqlalchemy python-dotenv

# Copy source code and trained weights
COPY src/ ./src/
COPY backend/ ./backend/
COPY models/ ./models/

EXPOSE 8000

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
