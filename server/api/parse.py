from fastapi import APIRouter
from server.api.services.parser import get_all_chunks_from_repo

router = APIRouter()


@router.get("/parse/")
def parse_repo(path: str):
    chunks = get_all_chunks_from_repo(path)
    return {"status": "parsed", "total_chunks": len(chunks)}
