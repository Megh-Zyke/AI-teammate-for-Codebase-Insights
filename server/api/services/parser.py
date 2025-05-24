from server.api.services.llm_utils import describe_and_classify_chunk_gemini
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
        if len(current_chunk) >= 20:  
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


#category, description, complexity, key_components
def classify_all_files(repo_path):
    files = list_code_files(repo_path)
    results = []

    for file in files:
        try:
            with open(file, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()

            category, description, complexity , key_components = describe_and_classify_chunk_gemini(content)

            results.append({
                "file_path": file,
                "file_name": os.path.basename(file),
                "category": category,
                "description": description,
                "complexity": complexity,
                "key_components": key_components
            })

        except Exception as e:
            print(f"Failed to process {file}: {e}")
            results.append({
                "file_path": file,
                "file_name": os.path.basename(file),
                "category": "unknown",
                "description": f"Error: {str(e)}"
            })

    return results

# if __name__ == "__main__":
#     print("hi")
#     repo_path = "data/user_repos/cloned"  # Replace with your actual repo path
#     results = classify_all_files(repo_path)

#     for result in results[:5]: 
#         print(result)