from fastapi import APIRouter
from api.services.llm_explaination import code_explaination
from pydantic import BaseModel
from fastapi.responses import JSONResponse
import json

router = APIRouter()
class CodeRequest(BaseModel):
    chunk: str
    code : str

@router.post("/explain_code/")
def explain_code_endpoint(payload: CodeRequest):
    """
    Endpoint to explain a code chunk using LLM.
    """
    try:
        explanation = code_explaination(payload.chunk, payload.code)
        explanation = explanation.replace("```json" , "").replace("```", "").strip()
        explanation = json.loads(explanation)
        explanation = explanation.get('Explanation', explanation)
        return JSONResponse(
            status_code=200,
            content={
                "status": "success",
                "explanation": explanation
            }
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "message": f"Failed to explain code: {str(e)}"
            }
        )

