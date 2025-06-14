from fastapi import APIRouter
from api.services.db import get_db_connection

router = APIRouter()

@router.get("/file_info/")
def get_file_info(path:str ,label : str , table: str):

    """
    Get file information for a given path from the database
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = f"SELECT * FROM {table} WHERE file_path = %s AND file_name = %s"
    cursor.execute(query, (path, label))
    file_info = cursor.fetchone()
    
    cursor.close()
    conn.close()
    
    return {
        "file_path" : file_info[1],
        "file_name" : file_info[2],
        "file_category" : file_info[3],
        "ai_description" : file_info[4],
        "complexity" : file_info[5],
        "key_components" : file_info[6]
    }



# path = "./data/user_repos/MiniShell/main.cpp"
# table = "minishell"
# label = "main.cpp"
# # Example usage
# file_info = get_file_info(path, label, table)


