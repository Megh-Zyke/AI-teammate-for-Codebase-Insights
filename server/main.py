from fastapi import FastAPI
from server.api import upload, analyse ,parse, enricher
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
app.include_router(parse.router, prefix="/api")
app.include_router(enricher.router, prefix="/api")