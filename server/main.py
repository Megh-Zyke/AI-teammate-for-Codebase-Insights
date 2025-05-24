from fastapi import FastAPI
from server.api import upload, analyse 

app = FastAPI()

app.include_router(upload.router, prefix="/api")
app.include_router(analyse.router, prefix="/api")
