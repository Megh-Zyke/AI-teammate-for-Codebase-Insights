import os
from github import Github
from mcp.server.fastmcp import FastMCP

from dotenv import load_dotenv
load_dotenv()

mcp = FastMCP("GitHub")
g = Github(os.getenv("GITHUB_ACCESS_TOKEN"))

@mcp.tool()
def get_repo_info(repo: str) -> str:
    """Fetches the repository information for a given repository name."""
    
    try:
        repository = g.get_repo(repo)
        return f"Repository: {repository.name}, Stars: {repository.stargazers_count}, Forks: {repository.forks_count}"
    except Exception as e:
        return f"Error fetching repository info: {str(e)}"
    
# Functions realting to commits in a repository.

@mcp.tool()
def get_total_number_of_commits(repo: str) -> int :
    """Fetches the total number of commits for a given repository name."""
    
    try:
        repository = g.get_repo(repo)
        return repository.get_commits().totalCount
    except Exception as e:
        return f"Error fetching total number of commits: {str(e)}"


@mcp.tool()
def get_commit_numbers(repo: str) -> list:
    """Fetches the commit numbers for a given repository name."""   
    try:
        repository = g.get_repo(repo)
        commits = repository.get_commits()
        return [commit.sha for commit in commits]
    except Exception as e:
        return f"Error fetching commit numbers: {str(e)}"
    
@mcp.tool()
def get_commit_details(repo: str, commit_sha: str) -> str:
    """Fetches the details of a specific commit in a given repository."""
    
    try:
        repository = g.get_repo(repo)
        commit = repository.get_commit(commit_sha)
        return f"Commit SHA: {commit.sha}, Author: {commit.author.login}, Message: {commit.commit.message}"
    except Exception as e:
        return f"Error fetching commit details: {str(e)}"

@mcp.tool()
def compare_commits(repo:str , base_commit: str , new_commit: str)->str:
    """Function used to compare the two mentioned commits in a repository. The response needs to be sufficiently detailed with respect to the changes made in the two commits. """
    
    try:
        repository = g.get_repo(repo)
        commits = repository.get_commits()
        commits_sha = [commit.sha for commit in commits]
        print(commits_sha)
        diff = repository.compare(base_commit, new_commit)
        changes = []
        
        for file_diff in diff.files:
            changes.append({
                "filename": file_diff.filename,
                "status": file_diff.status,
                "changes": file_diff.patch
            })
        
        return f"Comparison between commits:\n" + "\n".join([f"{change['filename']} ({change['status']}): {change['changes']}" for change in changes])
    except Exception as e:
        return f"Error comparing commits: {str(e)}"

# Functions related to issues in a repository.
@mcp.tool()
def get_all_issues(repo:str, state="open"):
        """
        Returns a list of issue summaries.
        """
        repository = g.get_repo(repo)
        return [{
            "number": issue.number,
            "title": issue.title,
            "state": issue.state,
            "created_by": issue.user.login,
            "created_at": issue.created_at.strftime("%Y-%m-%d %H:%M"),
            "labels": [label.name for label in issue.labels]
        } for issue in repository.get_issues(state=state)]

@mcp.tool()
def get_issue_by_number(repo:str, number: int):
        """
        Returns details of a specific issue.
        """
        repository = g.get_repo(repo)
        issue = repository.get_issue(number=number)
        return {
            "number": issue.number,
            "title": issue.title,
            "body": issue.body,
            "state": issue.state,
            "created_by": issue.user.login,
            "assignees": [a.login for a in issue.assignees],
            "labels": [label.name for label in issue.labels],
            "created_at": issue.created_at.strftime("%Y-%m-%d %H:%M")
        }

@mcp.tool()
def create_issue(repo:str, title: str, body: str = "", assignee: str = None, labels: list = []):
        """
        Creates a new issue and returns a confirmation message.
        """
        repository = g.get_repo(repo)
        issue = repository.create_issue(title=title, body=body, assignee=assignee, labels=labels)
        return f"Issue #{issue.number} created: {issue.title}"

@mcp.tool()
def comment_on_issue(repo:str, issue_number: int, comment: str):
        repository = g.get_repo(repo)
        issue = repository.get_issue(number=issue_number)
        issue.create_comment(comment)
        return f"Comment added to issue #{issue_number}."

@mcp.tool()
def get_issue_comments(repo:str, issue_number: int):
        repository = g.get_repo(repo)
        issue = repository.get_issue(number=issue_number)
        return [{
            "author": c.user.login,
            "created_at": c.created_at.strftime("%Y-%m-%d %H:%M"),
            "body": c.body
        } for c in issue.get_comments()]

@mcp.tool()
def add_issue_labels(repo:str, issue_number: int, labels: list):
        repository = g.get_repo(repo)
        issue = repository.get_issue(number=issue_number)
        issue.add_to_labels(*labels)
        return f"Added labels to issue #{issue_number}: {', '.join(labels)}"

@mcp.tool()
def remove_issue_labels(repo:str, issue_number: int, labels: list):
        repository = g.get_repo(repo)
        issue = repository.get_issue(number=issue_number)
        issue.remove_from_labels(*labels)
        return f"Removed labels from issue #{issue_number}: {', '.join(labels)}"

@mcp.tool()
def assign_issue(repo:str, issue_number: int, users: list):
        repository = g.get_repo(repo)
        issue = repository.get_issue(number=issue_number)
        issue.add_to_assignees(*users)
        return f"Assigned users to issue #{issue_number}: {', '.join(users)}"

@mcp.tool()
def unassign_issue(repo:str, issue_number: int, users: list):
        repository = g.get_repo(repo)
        issue = repository.get_issue(number=issue_number)
        issue.remove_from_assignees(*users)
        return f"Removed assignees from issue #{issue_number}: {', '.join(users)}"

@mcp.tool()
def close_issue(repo:str, issue_number: int):
        repository = g.get_repo(repo)
        issue = repository.get_issue(number=issue_number)
        issue.edit(state="closed")
        return f"Issue #{issue_number} has been closed."



if __name__ == "__main__":
    # The transport is set to "stdio" for standard input/output to receive and respond to tool function calls.
    mcp.run(transport="stdio")