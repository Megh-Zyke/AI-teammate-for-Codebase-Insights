from google import genai
from google.genai import types
from dotenv import load_dotenv
import os

load_dotenv()

def code_explaination(chunk, code):
    client = genai.Client(
        api_key=os.getenv("GOOGLE_API_KEY_CODE"),
    )
    prompt = """You are a codebase analysis assistant. Given a code chunk and its full codefile context, provide a detailed, role-specific explanation covering:

- How the chunk fits and functions within the full codefile  
- Key dependencies, integrations, and data flows related to the chunk  
- Its significance to the overall project or system  
- Potential issues or risks
- Any architectural decisions or patterns it exemplifies


Assume the user may lack full knowledge of the codebase, so be clear and thorough. But keep in mind that the user is a developer familiar with programming concepts. Keep the explanation concise but informative, focusing on technical details relevant to developers. Respond with the same level of complexity as the provided code chunk.

Input:
Code Chunk:
{chunk}

Full Codefile Context:
{full_codefile_context}

Output (JSON):
{{
  "Explanation": "detailed explanation of the chunk's purpose and role"
}}

Make sure to provide a comprehensive, technical explanation that covers all relevant aspects of the code chunk and its context. 
"""
    # Format the prompt with the actual chunk and code
    formatted_prompt = prompt.format(chunk=chunk, full_codefile_context=code)

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
