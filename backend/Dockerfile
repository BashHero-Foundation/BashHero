FROM python:3.15-alpine

RUN apk add --no-cache curl

WORKDIR /app/backend

COPY backend/requirements.txt .
RUN python -m pip install --no-cache-dir -r requirements.txt

COPY backend/*.py ./
COPY app/levels/chapter*.json /app/app/levels/

EXPOSE 8000
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
