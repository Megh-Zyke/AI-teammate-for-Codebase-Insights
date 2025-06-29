from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel
from github import Github
import os

router = APIRouter()
g = Github(os.getenv("GITHUB_ACCESS_TOKEN"))


class PullRequestCreate(BaseModel):
    repo: str
    title: str
    body: str
    head: str  # Branch with changes
    base: str  # Branch to merge into


@router.get("/list_pull_requests/")
def list_pull_requests(repo: str, state: str = "open"):
    try:
        repository = g.get_repo(repo)
        pulls = repository.get_pulls(state=state)
        return [{
            "number": pr.number,
            "title": pr.title,
            "user": pr.user.login,
            "created_at": pr.created_at,
            "state": pr.state
        } for pr in pulls]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/get_pull_request/")
def get_pull_request(repo: str, number: int):
    try:
        repository = g.get_repo(repo)
        pr = repository.get_pull(number)
        return {
            "title": pr.title,
            "body": pr.body,
            "state": pr.state,
            "head": pr.head.ref,
            "base": pr.base.ref,
            "author": pr.user.login,
            "created_at": pr.created_at,
            "merged": pr.is_merged(),
            "mergeable": pr.mergeable
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/create_pull_request/")
def create_pull_request(data: PullRequestCreate):
    try:
        repo = g.get_repo(data.repo)

        
        pr = repo.create_pull(
            title=data.title,
            body=data.body,
            head=data.head,
            base=data.base
        )
        return {"message": "Pull Request created", "number": pr.number}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/merge_pull_request/")
def merge_pull_request(repo: str, number: int):
    try:
        repository = g.get_repo(repo)
        pr = repository.get_pull(number)
        merge_result = pr.merge()
        return {"message": "Pull Request merged", "merged": merge_result.merged}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/close_pull_request/")
def close_pull_request(repo: str, number: int):
    try:
        pr = g.get_repo(repo).get_pull(number)
        pr.edit(state="closed")
        return {"message": "Pull Request closed"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/reopen_pull_request/")
def reopen_pull_request(repo: str, number: int):
    try:
        pr = g.get_repo(repo).get_pull(number)
        pr.edit(state="open")
        return {"message": "Pull Request reopened"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/get_pull_request_files/")
def get_pull_request_files(repo: str, number: int):
    try:
        pr = g.get_repo(repo).get_pull(number)
        return [{
            "filename": f.filename,
            "additions": f.additions,
            "deletions": f.deletions,
            "status": f.status
        } for f in pr.get_files()]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/get_pull_comments/")
def get_pull_comments(repo: str, number: int):
    try:
        pr = g.get_repo(repo).get_pull(number)
        comments = pr.get_review_comments()
        return [{
            "user": c.user.login,
            "body": c.body,
            "path": c.path,
            "position": c.position,
            "created_at": c.created_at
        } for c in comments]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
