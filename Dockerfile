# Use the official PyTorch image with CUDA support
FROM pytorch/pytorch:1.13.1-cuda11.6-cudnn8-runtime

# Set the working directory inside the container
WORKDIR /app

# Install system-level dependencies required by Mediapipe and OpenCV
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    && rm -rf /var/lib/apt/lists/*

# Copy the entire project into the container
COPY . /app

# Set the working directory for the Flask app
WORKDIR /app/App

# Upgrade pip to the latest version
RUN pip install --upgrade pip

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose Flask's default port
EXPOSE 3000

# Set environment variables for Flask
ENV FLASK_APP=webapp.py
ENV FLASK_RUN_HOST=0.0.0.0
ENV FLASK_RUN_PORT=3000

# Command to run the Flask app
CMD ["flask", "run"]
