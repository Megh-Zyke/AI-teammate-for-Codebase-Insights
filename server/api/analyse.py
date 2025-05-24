from fastapi import APIRouter
from pydantic import BaseModel
from server.api.services.git_utils import clone_repo
router = APIRouter()

class RepoRequest(BaseModel):
    repo_url: str

@router.post("/clone/")
def clone_endpoint(payload: RepoRequest):
    repo_path = clone_repo(payload.repo_url)
    return {"status": "success", "path": repo_path}