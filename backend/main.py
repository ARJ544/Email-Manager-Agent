from fastapi import FastAPI,Request, HTTPException
from fastapi.responses import JSONResponse
from auth import generate_auth_url, exchange_code_for_tokens, refresh_access_token
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from fastapi.responses import RedirectResponse
from langchain_core.messages import HumanMessage
from graph.graph import workflow

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "warning": "⚠️ CRITICAL SECURITY ALERT ⚠️",
        "message": (
            "This page is running a protected internal OAuth service. "
            "If you are not the developer, CLOSE THIS TAB IMMEDIATELY. "
            "Leaving this open may expose sensitive authorization data. "
            "Close the tab right now to avoid security risks."
        )
    }

@app.get("/auth/google/login")
def login():
    return RedirectResponse(generate_auth_url())


@app.get("/auth/google/callback")
def google_callback(request: Request):
    
    code = request.query_params.get("code")
    if not code:
        return JSONResponse({"error": "Missing authorization code"}, status_code=400)

    tokens_expireDate_scope = exchange_code_for_tokens(code)
    
    if tokens_expireDate_scope is None:
        raise HTTPException(status_code=400, detail="Token exchange failed")
    
    frontend_url = "http://localhost:3000/"
    response = RedirectResponse(url=frontend_url)
    response.set_cookie(
        key="access_token",
        value=tokens_expireDate_scope["access_token"],
        httponly=True,
        secure=False,  # True in production with HTTPS
        max_age=3600,  # 1 hour
        samesite="lax",
    )


    if tokens_expireDate_scope.get("refresh_token"):
        response.set_cookie(
            key="refresh_token",
            value=tokens_expireDate_scope["refresh_token"],
            httponly=True,
            secure=False,
            max_age=7*24*3600,  # 30 days
            samesite="lax",
        )

    return response

@app.get("/auth/refreshaccesstoken")
def refresh_access_tkn(request: Request):
    
    refresh_token = request.cookies.get("refresh_token")

    if not refresh_token:
        raise HTTPException(status_code=400, detail="No refresh token found")

    new_access_token = refresh_access_token(refresh_token)

    response = RedirectResponse(url="http://localhost:3000/")
    response.set_cookie(
        key="access_token",
        value=new_access_token,
        httponly=True,
        secure=False,  # True in production
        max_age=3600,
        samesite="lax",
    )
    return response


@app.get("/auth/tokens")
def get_tokens(request: Request):
    """Endpoint to read tokens from cookies and send them to frontend safely."""
    access_token = request.cookies.get("access_token")
    refresh_token = request.cookies.get("refresh_token")
    return {
        "access_token": access_token,
        "refresh_token": refresh_token
    }

if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8000)
    
# input_data = {"messages": [HumanMessage(content=prompt)]}
# result = workflow.invoke(input_data)