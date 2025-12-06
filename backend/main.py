import random
import uvicorn, uuid
from datetime import datetime
from fastapi import FastAPI,Request, HTTPException, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from auth import generate_auth_url, exchange_code_for_tokens, refresh_access_token
from langchain_core.messages import HumanMessage
from graph.graph import workflow

app = FastAPI()
config = {"configurable": {"thread_id": uuid.uuid4()}}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def generate_threat_code():
    return f"THR-{random.randint(100000, 999999)}"

@app.get("/")
def home():
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S UTC")
    threat_code = generate_threat_code()

    return {
        "terminal_log": [
            f"[ {timestamp} ] INITIALIZING SECURITY PROTOCOLS...",
            f"[ {timestamp} ] Unauthorized client detected.",
            f"[ {timestamp} ] Running identity scan...",
            f"[ {timestamp} ] >> Scan Result: UNKNOWN SOURCE",
            f"[ {timestamp} ] >> Security Handshake: FAILED ❌",
            f"[ {timestamp} ] >> Threat Level: ELEVATED",
            f"[ {timestamp} ] >> Assigned Threat Code: {threat_code}",
            f"[ {timestamp} ] >> Status: CONNECTION NOT TRUSTED",
            "⚠️ ACTION REQUIRED: CLOSE THIS TAB IMMEDIATELY. ⚠️",
        ]
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

@app.post("/agent/llm")
def get_response(request: Request, query: str = Form(...)):
    access_token = request.cookies.get("access_token")

    if not access_token:
        raise HTTPException(status_code=500, detail="Missing access token")

    input_data = {
        "messages": [HumanMessage(content=query)],
        "access_token": access_token
    }

    result = workflow.invoke(input_data, config=config)
    return result

    

# deployment
# uvicorn main:app --host 0.0.0.0 --port $PORT