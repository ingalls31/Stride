FROM python:3.10.14-alpine

ENV PYTHONUNBUFFERED 1

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

RUN mkdir -p /app/static

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]