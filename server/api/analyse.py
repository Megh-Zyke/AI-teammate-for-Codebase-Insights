import os
from fastapi import APIRouter
from pydantic import BaseModel
from api.services.git_utils import clone_repo
from api.services.enricher import *

router = APIRouter()

class RepoRequest(BaseModel):
    repo_url: str

@router.post("/clone/")
def clone_endpoint(payload: RepoRequest):
    repo_path = clone_repo(payload.repo_url)
    if not repo_path:
        return {"status": "error", "message": "Failed to clone repository"}
    
    # Enrich and store the repository data
    try:
        results = enrich_and_store(repo_path)
    except Exception as e:
        return {"status": "error", "message": str(e)}
    
    # Prepare the response
    results["status"] = "success"
    results["repo"] = os.path.basename(repo_path)
    return results
