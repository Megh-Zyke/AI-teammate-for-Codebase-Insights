import os
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from api.services.db import get_db_connection

router = APIRouter()

@router.get("/file_info/")
def get_file_info(path: str, label: str, table: str , abs_path = str):
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
    
    if not file_info:
        return JSONResponse(
            status_code=404,
            content={"message": "File not found in the database"}
        )
    
    if not os.path.exists(abs_path):
        return JSONResponse(
            status_code=404,
            content={"message": "File does not exist on the server"}
        )
    try:
        with open(abs_path, 'r', encoding='utf-8', errors='ignore') as file:
            content = file.read()
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"message": f"Error reading file: {str(e)}"}
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"message": f"Error reading file: {str(e)}"}
        )    

    return JSONResponse(
        status_code= 200,
        content={
        "file_path": file_info[1],
        "file_name": file_info[2],
        "file_category": file_info[3],
        "ai_description": file_info[4],
        "complexity": file_info[5],
        "key_components": file_info[6],
        "content": content
    })


# path = "./data/user_repos/MiniShell/main.cpp"
# table = "minishell"
# label = "main.cpp"
# # Example usage
# file_info = get_file_info(path, label, table)


