from google import genai
from google.genai import types
from dotenv import load_dotenv
import os

load_dotenv()

def code_explaination(chunk, code, file_category, user_role):
    client = genai.Client(
        api_key=os.getenv("GOOGLE_API_KEY_CODE"),
    )
    prompt = """You are a codebase analysis assistant. Given a selected code chunk and the full context of the file it belongs to, generate a **concise, role-specific explanation**.

Your response should focus on what is **relevant and actionable** for the user's role. Be technical where needed, but avoid unnecessary verbosity or unrelated details.

A category of the file and the user's role are provided. Use them to **tailor the tone, depth, and content** of your explanation.

Please include only the most pertinent insights on:
- The function and purpose of the selected code chunk within the file
- How it connects to other parts of the system (e.g., APIs, UI components, models, services)
- Why this chunk matters to the current role
- Risks or red flags (if any), from the lens of the user's role
- Notable design patterns or architecture only if highly relevant

Do **not** explain unrelated parts of the code or general programming concepts the user is likely to know already.

**Input:**
Code Chunk:
{chunk}

Full Codefile Context:
{full_codefile_context}

File Category: {file_category}

User Role: {user_role}

**Output (JSON):**
{{
  "Explanation": "A focused, role-aware explanation of the chunk"
}}
"""
    # Format the prompt with the actual chunk and code
    formatted_prompt = prompt.format(chunk=chunk, full_codefile_context=code , file_category=file_category, user_role=user_role)

    contents = [
        types.Content(
            role="user",
            parts=[types.Part.from_text(text=formatted_prompt)],
        ),
    ]

    generate_content_config = types.GenerateContentConfig(
        response_mime_type="text/plain",
        temperature=0,
    )

    full_response = ""

    for chunk_response in client.models.generate_content_stream(
        model="gemini-2.0-flash",
        contents=contents,
        config=generate_content_config,
    ):
        full_response += chunk_response.text

    return full_response    
