from fastapi import FastAPI
from api import upload, analyse, file_info
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