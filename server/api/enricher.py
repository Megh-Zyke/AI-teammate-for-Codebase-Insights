from fastapi import APIRouter

router = APIRouter()

from server.api.services.db import get_db_connection
from server.api.services.parser import classify_all_files


@router.put("/enrich/")
def enrich_and_store(repo_path):
    
    results = classify_all_files(repo_path)
    conn = get_db_connection()
    cur = conn.cursor()

    table_name = repo_path.split("/")[-1]

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

    for result in results:
        try:
              cur.execute(
                f"""
                INSERT INTO "{table_name}" 
                (file_path, file_name, role_category, ai_description, complexity, key_components)
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (
                    result.get("file_path"),
                    result.get("file_name"),
                    result.get("category"),
                    result.get("description"),
                    result.get("complexity"),
                    result.get("key_components")
                )
            )
        except Exception as e:
            print(f"Error inserting {result.get("file_name")} into database: {e}")
            continue

    conn.commit()
    cur.close()
    conn.close()

