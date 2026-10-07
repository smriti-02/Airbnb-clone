FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Run the seed script to ensure DB has data on startup if it's empty, 
# then start the uvicorn server.
# NOTE: In production with a persistent disk, you'd check if DB exists. 
# Here we just run the seed, which drops and recreates data. 
# For true production, avoid drop_all in seed.py.
CMD python seed.py && uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
