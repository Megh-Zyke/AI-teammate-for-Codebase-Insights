#from server.api.services.db import get_db_connection
from api.services.parser import classify_all_files
import os

def enrich_and_store(repo_path):
    
    results = classify_all_files(repo_path)

    for i in range(5):
        print(results[i])

    # conn = get_db_connection()
    # cur = conn.cursor()

    # for file_path, chunk in chunks:
    #     try:
    #         category, description = describe_and_classify_chunk(chunk)
    #     except Exception as e:
    #         print(f"Skipping chunk due to LLM error: {e}")
    #         continue

    #     file_name = os.path.basename(file_path)

    #     cur.execute("""
    #         INSERT INTO code_chunks (file_path, file_name, chunk_text, role_category, ai_description)
    #         VALUES (%s, %s, %s, %s, %s)
    #     """, (file_path, file_name, chunk, category, description))

    # conn.commit()
    # cur.close()
    # conn.close()

if __name__ == "__main__":
    repo_path = "data/user_repos/cloned"  # Replace with your actual repo path
    enrich_and_store(repo_path)
