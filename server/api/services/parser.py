import os

def list_code_files(base_path, extensions={".py", ".js", ".ts", ".jsx"}):
    code_files = []
    for root, _, files in os.walk(base_path):
        for file in files:
            if any(file.endswith(ext) for ext in extensions):
                code_files.append(os.path.join(root, file))
    return code_files


def extract_code_chunks(file_path):
    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        lines = f.readlines()

    chunks = []
    current_chunk = []
    for line in lines:
        current_chunk.append(line)
        if len(current_chunk) >= 20:  # tune chunk size
            chunks.append("".join(current_chunk))
            current_chunk = []
    if current_chunk:
        chunks.append("".join(current_chunk))

    return chunks

def get_all_chunks_from_repo(repo_path):
    files = list_code_files(repo_path)
    all_chunks = []
    for file in files:
        all_chunks.extend(extract_code_chunks(file))
    return all_chunks
