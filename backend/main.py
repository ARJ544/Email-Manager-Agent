from fastapi import FastAPI,Request, HTTPException
from fastapi.responses import JSONResponse
from auth import generate_auth_url, exchange_code_for_tokens
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from fastapi.responses import RedirectResponse
# from token_store import save_tokens
from langchain_core.messages import HumanMessage
from graph.graph import workflow

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"message": "Gmail OAuth FastAPI App Running"}

@app.get("/auth/google/login")
def login():
    return RedirectResponse(generate_auth_url())


@app.get("/auth/google/callback")
def google_callback(request: Request):
    """Receive ?code=xyz from Google and exchange it for tokens."""
    code = request.query_params.get("code")
    if not code:
        return JSONResponse({"error": "Missing authorization code"}, status_code=400)

    tokens = exchange_code_for_tokens(code)
    return JSONResponse({
        "message": "Google OAuth successful",
        "tokens": tokens
    })

if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8000)
    
# input_data = {"messages": [HumanMessage(content=prompt)]}
# result = workflow.invoke(input_data)