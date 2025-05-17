# Dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies required for Python packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Set environment variables
ENV FLASK_APP=run.py
ENV FLASK_ENV=production
ENV FLASK_DEBUG=0

# Database initialization and migrations
RUN mkdir -p instance && \
    if [ -d "migrations" ]; then rm -rf migrations; fi && \
    flask db init && \
    flask db migrate -m "Initial migration" && \
    flask db upgrade

# Copy and prepare startup script
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Expose the application port
EXPOSE 5000

# Run the application
CMD ["/start.sh"]