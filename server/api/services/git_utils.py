import os
import git
import shutil

def clone_repo(repo_url: str, target_dir: str = "./data/user_repos/cloned"):
    if os.path.exists(target_dir):
        shutil.rmtree(target_dir)
    git.Repo.clone_from(repo_url, target_dir)
    return target_dir


