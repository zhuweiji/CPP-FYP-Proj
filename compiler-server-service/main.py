import logging

from compiler_server_service.routers.templates import BasicResponse

logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)

from pathlib import Path

from compiler_server_service.routers import (
    cpp_handlers,
    notebook_handlers,
    tutorial_handlers,
    user_handlers,
)
from compiler_server_service.services.limiter.rate_limiter import limiterobj
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

tags_metadata = [
    {
        "name": "Compiler Service",
        "description": "Operations involving C++ code, including the compilation and running of any C++ code.",
    },
    {
        "name": "Tutorials",
        "description": "Manages tutorials, such as providing and reading pre-written tutorial data.",
    },
    {
        "name": "Users",
        "description": "Handles all operations involving users, including user identity verification and account creations",
    },
]

app = FastAPI(
    title="CPP Compiler Backend",
    openapi_tags=tags_metadata,
)

app.state.limiter = limiterobj
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    
app.include_router(cpp_handlers.router)
app.include_router(tutorial_handlers.router)
app.include_router(user_handlers.router)
app.include_router(notebook_handlers.router)



origins = [
    "http://localhost:3000",
    "https://cpp-fyp-proj.vercel.app",
    "https://cpp-fyp-proj-git-codingconundrum-zhuweiji.vercel.app",
    # "https://cpp-fyp-proj-git-codingconundrum-zhuweiji.vercel.app/",
    # regex origins should be added via the allow_origin_regex param
    # "https://cpp-fyp-proj-*.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# app.add_middleware(HTTPSRedirectMiddleware)


@app.get('/')
def root():
    return BasicResponse(message="we're up!")



