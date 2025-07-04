from fastapi import FastAPI
from api import upload, analyse, file_info, explain_code, get_commits, pull_requests
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(upload.router, prefix="/api")
app.include_router(analyse.router, prefix="/api")
app.include_router(file_info.router, prefix="/api")
app.include_router(explain_code.router, prefix="/api")
app.include_router(get_commits.router, prefix="/api")
app.include_router(pull_requests.router, prefix="/api")
