from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
import os

SCOPES = ["https://www.googleapis.com/auth/gmail.modify"]
GLOBAL_ACCESS_TOKEN = None


def get_flow():
    return Flow.from_client_config(
        {
            "web": {
                "client_id": os.getenv("GOOGLE_CLIENT_ID"),
                "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
                "redirect_uris": [os.getenv("GOOGLE_REDIRECT_URI")],
                "auth_uri": "https://accounts.google.com/o/oauth2/auth", # https://accounts.google.com/o/oauth2/v2/auth
                "token_uri": "https://oauth2.googleapis.com/token",
            }
        },
        scopes=SCOPES
    )


def generate_auth_url():
    flow = get_flow()
    flow.redirect_uri = os.getenv("GOOGLE_REDIRECT_URI")
    auth_url, state = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent"
    )
    return auth_url


def exchange_code_for_tokens(code):
    flow = get_flow()
    flow.redirect_uri = os.getenv("GOOGLE_REDIRECT_URI")
    flow.fetch_token(code=code)

    creds: Credentials = flow.credentials

    # global GLOBAL_ACCESS_TOKEN
    # GLOBAL_ACCESS_TOKEN = creds.token

    # if creds.refresh_token:
    #     USER_TOKEN_DB["refresh_token"] = creds.refresh_token

    return {
    "access_token": creds.token,
    "refresh_token": creds.refresh_token if creds.refresh_token else None,
    "expiry": creds.expiry.isoformat() if creds.expiry else None,
    "scopes": creds.scopes
}


def refresh_access_token():
    from google.auth.transport.requests import Request

    creds = Credentials(
        token=None,
        refresh_token=refresh_token,
        client_id=os.getenv("GOOGLE_CLIENT_ID"),
        client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
        token_uri="https://oauth2.googleapis.com/token",
        scopes=[os.getenv("GOOGLE_SCOPES")]
    )

    creds.refresh(Request())

    global GLOBAL_ACCESS_TOKEN
    GLOBAL_ACCESS_TOKEN = creds.token

    return creds.token
