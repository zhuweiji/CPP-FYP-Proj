import logging

from compiler_server_service.routers.templates import BasicResponse

logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)

from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from compiler_server_service.routers import (
    cpp_handlers,
    notebook_handlers,
    python_handlers,
    tutorial_handlers,
    user_handlers,
    quiz_handlers, # ADD
    quiz_question_handlers,
    faq_handlers,
    open_ai_handlers,
    chat_topic_handlers,
    chat_query_handlers,
    notes_handlers,
    video_resource_handlers,
    exam_paper_handlers,
    exam_solution_handlers,
    resource_handlers,
    resource_rating_handlers
)
from compiler_server_service.services.limiter.rate_limiter import limiterobj


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

app.include_router(python_handlers.router)
app.include_router(cpp_handlers.router)
app.include_router(tutorial_handlers.router)
app.include_router(user_handlers.router)
app.include_router(notebook_handlers.router)
app.include_router(quiz_handlers.router) # ADD
app.include_router(quiz_question_handlers.router)
app.include_router(faq_handlers.router)
app.include_router(open_ai_handlers.router)
app.include_router(chat_topic_handlers.router)
app.include_router(chat_query_handlers.router)
app.include_router(notes_handlers.router)
app.include_router(video_resource_handlers.router)
app.include_router(exam_paper_handlers.router)
app.include_router(exam_solution_handlers.router)
app.include_router(resource_handlers.router)
app.include_router(resource_rating_handlers.router)


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

# For serving static files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get('/')
def root():
    return BasicResponse(message="we're up!")



