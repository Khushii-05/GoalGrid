FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
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

# Clean initialization
RUN mkdir -p instance && \
    rm -rf migrations && \
    flask db init && \
    flask db migrate --message "Initial production DB" && \
    flask db upgrade

# Start script
COPY start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 5000

CMD ["/start.sh"]