from google import genai
from google.genai import types
from dotenv import load_dotenv
import os
load_dotenv()

def describe_and_classify_chunk_gemini(chunk):
    client = genai.Client(
        api_key= os.getenv("GOOGLE_API_KEY"),
    )

    prompt_text = f"""You are an intelligent codebase analysis assistant. Analyze the given code chunk and provide role-specific insights.
Classification Task: Categorize as frontend, backend, or ai

Analysis Requirements:

Identify key technical patterns and architectural decisions
Note any dependencies, integrations, or data flows
Highlight potential issues or optimization opportunities
Assess complexity level and maintenance considerations

Code Chunk:
{chunk}

Role-Specific Notes:
- Backend: <API/database/performance insights if relevant>
- Frontend: <UI/UX/integration insights if relevant>  
- AI/ML: <data/model/pipeline insights if relevant>
- Product: <business impact and technical debt if relevant>

If it a combination of roles and contains AI/ML chunk, classify it as "ai".
If it is a combination of roles and does not contain AI/ML chunk, classify it as "hybrid".

Classification Guidelines:

Frontend: UI components, styling, user interactions, client-side logic, browser APIs
Backend: Server logic, databases, APIs, authentication, business rules, infrastructure
AI: Data processing, ML models, training pipelines, feature engineering, model deployment
Hybrid: Code that bridges multiple domains (e.g., API clients, data visualization, ML-powered UI)

Response Format:
Category: <category>
Complexity: <low/medium/high>
Key Components: <2-3 main technical elements>
Description: <3-4 sentences explaining purpose and functionality>"""

    contents = [
        types.Content(
            role="user",
            parts=[types.Part.from_text(text=prompt_text)],
        ),
    ]

    generate_content_config = types.GenerateContentConfig(
        response_mime_type="text/plain",
        temperature=0,
    )

    # Collect streamed text chunks here
    full_response = ""

    for chunk in client.models.generate_content_stream(
        model="gemini-2.0-flash",
        contents=contents,
        config=generate_content_config,
    ):
        full_response += chunk.text

    # After streaming completes, parse the response
    lines = full_response.strip().split("\n")
    category = None
    description = None

    for line in lines:
        if line.lower().startswith("category:"):
            category = line.split(":", 1)[1].strip().lower()
        elif line.lower().startswith("description:"):
            description = line.split(":", 1)[1].strip()
        elif line.lower().startswith("complexity:"):
            complexity = line.split(":", 1)[1].strip()
        elif line.lower().startswith("key components:"):
            key_components = line.split(":", 1)[1].strip()
        

    return category, description, complexity, key_components
