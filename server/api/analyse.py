from fastapi import APIRouter
from pydantic import BaseModel
from server.api.services.git_utils import clone_repo
import os

router = APIRouter()

class RepoRequest(BaseModel):
    repo_url: str

def build_graph_tree(path, parent_id=None, counter={"id": 0}):
    nodes = []
    edges = []

    def get_id():
        counter["id"] += 1
        return f"node-{counter['id']}"

    for item in os.listdir(path):
        full_path = os.path.join(path, item)
        node_id = get_id()
        node = {
            "id": node_id,
            "data": {"label": item},
            "type": "default",
            "position": {"x": 0, "y": 0}  # Will be auto-adjusted in React
        }
        nodes.append(node)
        if parent_id:
            edges.append({"id": f"e{parent_id}-{node_id}", "source": parent_id, "target": node_id})
        if os.path.isdir(full_path):
            child_nodes, child_edges = build_graph_tree(full_path, node_id, counter)
            nodes.extend(child_nodes)
            edges.extend(child_edges)

    return nodes, edges

@router.post("/clone/")
def clone_endpoint(payload: RepoRequest):
    repo_path = clone_repo(payload.repo_url)
    if not repo_path:
        return {"status": "error", "message": "Failed to clone repository"}
    
    root_path = os.path.abspath(repo_path)
    root_id = "node-0"
    nodes = [{
        "id": root_id,
        "data": {"label": os.path.basename(repo_path)},
        "position": {"x": 0, "y": 0}
    }]
    child_nodes, child_edges = build_graph_tree(root_path, root_id)
    nodes.extend(child_nodes)
    
    return {
        "status": "success",
        "repo": os.path.basename(repo_path),
        "graph": {
            "nodes": nodes,
            "edges": child_edges
        }
    }
