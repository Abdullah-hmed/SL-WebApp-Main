FROM python:3.10-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy only requirements.txt first for dependency installation caching
COPY App/requirements.txt /app/requirements.txt

# Upgrade pip and install Python dependencies
RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r /app/requirements.txt \
    && pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

# Copy the rest of the application code
COPY App /app

# Expose the application port
EXPOSE 3000

# Set environment variables for Flask
ENV FLASK_APP=webapp.py
ENV FLASK_RUN_HOST=0.0.0.0
ENV FLASK_RUN_PORT=3000

# Run the Flask application
CMD ["python", "webapp.py"]
