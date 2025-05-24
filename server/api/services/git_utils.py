import os
import git
import shutil

def clone_repo(repo_url: str, target_dir: str = "./data/user_repos"):

    file_name = repo_url.split("/")[-1].replace(".git", "")
    target_dir = os.path.join(target_dir, file_name)
    git.Repo.clone_from(repo_url, target_dir)
    return target_dir


