FROM python:3.8.0-slim
RUN apt-get update \
    && apt-get install g++ -y \
    && apt-get clean

RUN curl -sSL https://install.python-poetry.org | python3 -
COPY pyproject.toml poetry.lock /app/
RUN poetry install

COPY . /app
WORKDIR /app

RUN poetry run start