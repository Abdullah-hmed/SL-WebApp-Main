# Stage 1: Base image with system dependencies
FROM python:3.10-slim AS base

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Stage 2: Dependencies installation
FROM base AS dependencies

# Set working directory
WORKDIR /app

# Copy only the requirements file
COPY App/requirements.txt ./requirements.txt

# Upgrade pip and install dependencies
RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

RUN pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121


# Stage 3: Final image
FROM base

# Set working directory
WORKDIR /app

# Copy installed dependencies from previous stage
COPY --from=dependencies /usr/local/lib/python3.10/site-packages /usr/local/lib/python3.10/site-packages
COPY --from=dependencies /usr/local/bin /usr/local/bin

# Copy application files
COPY App /app

# Expose the application port
EXPOSE 3000

# Set environment variables for Flask
ENV FLASK_APP=webapp.py
ENV FLASK_RUN_HOST=0.0.0.0
ENV FLASK_RUN_PORT=3000

# Run the Flask application
CMD ["python", "webapp.py"]