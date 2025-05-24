from fastapi import APIRouter
from pydantic import BaseModel
from server.api.services.git_utils import clone_repo

router = APIRouter()

@router.on_event("startup")
async def startup_event():
    router.state.repo_path = None

class RepoRequest(BaseModel):
    repo_url: str

@router.post("/clone/")
def clone_endpoint(payload: RepoRequest):
    repo_path = clone_repo(payload.repo_url)
    if not repo_path:
        return {"status": "error", "message": "Failed to clone repository"}
    # Store the repo path in the router state for later use
    router.state.repo_path = repo_path
    return {"status": "success", "path": repo_path}