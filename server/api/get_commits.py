import os
from github import Github
from dotenv import load_dotenv
load_dotenv()
from fastapi import APIRouter, HTTPException
from api.services.parser import get_all_chunks_from_repo

router = APIRouter()

g = Github(os.getenv("GITHUB_ACCESS_TOKEN"))

@router.get("/get_commits/")
def get_commits(repo: str):
    """Fetches the commit numbers for a given repository name."""
    try:
        repository = g.get_repo(repo)
        commits = repository.get_commits()
        commit_data = [
            {
                "sha": commit.sha,
                "date": commit.commit.author.date.isoformat()  # ISO format (e.g., 2024-06-22T10:45:00Z)
            }
            for commit in commits
        ]
        return {"commit_numbers": commit_data}
    except Exception as e:
        return {"error": f"Error fetching commit numbers: {str(e)}"}

@router.get("/get_commit_details/")
def get_commit_details(repo: str, commit_sha: str):
    """Fetches the details of a specific commit in a given repository."""
    try:
        repository = g.get_repo(repo)
        commit = repository.get_commit(commit_sha)
        commit_files_info = {}
        for file in commit.files:
            commit_files_info[file.filename] = {
                "additions": file.additions,
                "deletions": file.deletions,
                "changes": file.changes,
                "patch": getattr(file, "patch", "Diff not available")
            }
        return {
            "commit_sha": commit.sha,
            "author": commit.author.login if commit.author else "Unknown",
            "message": commit.commit.message,
            "files_changed": commit_files_info,
            "stats": {
            "total": commit.stats.total,
            "additions": commit.stats.additions,
            "deletions": commit.stats.deletions
            } if commit.stats else {"total": 0, "additions": 0, "deletions": 0},
        }
    except Exception as e:
        print("Error in get_commit_details:", e)
        raise HTTPException(status_code=500, detail=f"Error fetching commit details: {str(e)}")