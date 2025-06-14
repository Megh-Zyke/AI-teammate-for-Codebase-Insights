import os
import json
from api.services.db import get_db_connection
from api.services.parser import classify_all_files

# Build tree from filesystem + classification
def build_graph_tree(path, filename_type, parent_id=None, counter={"id": 0}):
    nodes = []
    edges = []

    def get_id():
        counter["id"] += 1
        return f"node-{counter['id']}"

    for item in os.listdir(path):
        if not item.startswith('.'):
            full_path = os.path.join(path, item)
            category = filename_type.get(full_path.replace("C:\\Users\\megha\\Documents\\Holboxathon\\server", ".").replace("/", "\\"), "unknown")
            node_id = get_id()

            node = {
                "id": node_id,
                "data": {"label": item, "abs_path": os.path.abspath(full_path).replace("/", "\\"), "repo_path": full_path.replace("C:\\Users\\megha\\Documents\\Holboxathon\\server", ".").replace("/", "\\") , "category": category},
                "type": "default",
                "position": {"x": 0, "y": 0}
            }

            nodes.append(node)

            if parent_id:
                edges.append({
                    "id": f"e{parent_id}-{node_id}",
                    "source": parent_id,
                    "target": node_id
                })

            if os.path.isdir(full_path):
                child_nodes, child_edges = build_graph_tree(full_path, filename_type, node_id, counter)
                nodes.extend(child_nodes)
                edges.extend(child_edges)

    return nodes, edges

def enrich_and_store(repo_path: str):

    results = classify_all_files(repo_path)
    conn = get_db_connection()
    cur = conn.cursor()


    print(len(results), "files classified")
    filename_type = {
        result.get("file_path"): result.get("category")
        for result in results
    }


    # 🌳 Build graph
    root_path = os.path.abspath(repo_path)
    root_id = "node-0"

    nodes = [{
        "id": root_id,
        "data": {"label": os.path.basename(repo_path) , "abs_path" : root_path.replace("/" , "\\")  , "repo_path" : repo_path.replace("/" , "\\") },
        "position": {"x": 0, "y": 0}
    }]
    child_nodes, child_edges = build_graph_tree(root_path, filename_type, root_id)
    nodes.extend(child_nodes)

    graph = {
        "nodes": nodes,
        "edges": child_edges
    }

    graph_file_path = f"trees/{os.path.basename(repo_path)}.json"
    os.makedirs(os.path.dirname(graph_file_path), exist_ok=True)

    with open(graph_file_path, 'w') as f:
        json.dump(graph, f, indent=4)
    print(f"Graph saved to {graph_file_path}")

    # 🗃️ Store file-level enrichment
    table_name = os.path.basename(repo_path).replace("-", "_").replace(" ", "_").lower()
    # Ensure table name is valid for SQL

    # Create table if it doesn't exist
    create_table_query = f"""
        CREATE TABLE IF NOT EXISTS "{table_name}" (
            id SERIAL PRIMARY KEY,
            file_path TEXT NOT NULL,
            file_name TEXT NOT NULL,
            role_category TEXT,
            ai_description TEXT,
            complexity TEXT,
            key_components TEXT
        );
    """
    cur.execute(create_table_query)

    # Truncate table if it exists
    truncate_query = f'TRUNCATE TABLE "{table_name}";'

    cur.execute(truncate_query)

    for result in results:
        try:
            cur.execute(
                f"""
                INSERT INTO "{table_name}" 
                (file_path, file_name, role_category, ai_description, complexity, key_components)
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (
                    result.get("file_path").replace("\\", "/"), 
                    result.get("file_name"),
                    result.get("category"),
                    result.get("description"),
                    result.get("complexity"),
                    result.get("key_components")
                )
            )
        except Exception as e:
            print(f"Error inserting {result.get('file_name')} into database: {e}")
            continue

    # ✅ Insert graph into graph_table
    try:
        graph_insert_query = """
            INSERT INTO graph_table (repo_name, repo_graph)
            VALUES (%s, %s)
            ON CONFLICT (repo_name)
            DO UPDATE SET repo_graph = EXCLUDED.repo_graph
        """
        cur.execute(graph_insert_query, (table_name, json.dumps(graph)))
    except Exception as e:
        print(f"Error inserting graph into graph_table: {e}")

    conn.commit()
    cur.close()
    conn.close()

    return {
        "status": "success",
        "file_count": len(results),
        "graph_saved_to": graph_file_path,
        "graph": graph,
    }
