from fastapi import APIRouter, UploadFile, File, HTTPException
import os, zipfile
from pathlib import Path
from api.services.enricher import *

router = APIRouter()

UPLOAD_DIR = Path("./data/user_repos")

@router.post("/upload-zip/")
async def upload_zip(file: UploadFile = File(...)):
    # Validate file type
    if not file.filename.endswith(".zip"):
        raise HTTPException(status_code=400, detail="Only .zip files are supported")

    # Prepare storage paths
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    zip_path = UPLOAD_DIR / file.filename
    extract_dir = UPLOAD_DIR / file.filename.replace(".zip", "")

    # Save uploaded zip
    with open(zip_path, "wb") as f:
        f.write(await file.read())

    # Extract the zip
    try:
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_dir)

    except zipfile.BadZipFile:
        raise HTTPException(status_code=400, detail="Corrupted ZIP file")

    try:
        results = enrich_and_store(str(extract_dir))
    except Exception as e:
        return {"status": "error", "message": str(e)}
    
    # Prepare the response
    results["status"] = "success"
    results["repo"] = extract_dir.name
    return results
