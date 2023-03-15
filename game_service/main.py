import logging

logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)

import os
from pathlib import Path

from dotenv import dotenv_values
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

os.environ.update(dotenv_values())

from game_service.routers import game_handlers

tags_metadata = [
    {
        "name": "Games",
        "description": "Handles all operations involving games",
    },
]

app = FastAPI(
    title="Game Service API",
    openapi_tags=tags_metadata,
)

origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:8080",
    "https://cpp-fyp-proj.vercel.app",

]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    game_handlers.router
)


@app.get('/')
def root():
    return {'message': "we're up!"}

