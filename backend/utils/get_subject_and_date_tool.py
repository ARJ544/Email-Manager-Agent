"""
Utility to get subject, date, snippet of email ids from list
"""
import requests

def get_message_metadata(message_id: str, access_token: str):
    """Fetch Subject, Date, and Snippet from Gmail using direct REST API call."""

    url = f"https://gmail.googleapis.com/gmail/v1/users/me/messages/{message_id}"

    params = {
        "format": "metadata",
        "metadataHeaders": ["Subject", "Date"]
    }

    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    response = requests.get(url, headers=headers, params=params)
    response.raise_for_status()

    data = response.json()

    # Extract headers
    headers_list = data["payload"]["headers"]

    subject = ""
    date = ""

    for header in headers_list:
        if header["name"] == "Subject":
            subject = header["value"]
        elif header["name"] == "Date":
            date = header["value"]

    # Extract snippet
    snippet = data.get("snippet", "")

    return subject, date, snippet


def get_subject_date_and_snippet(ids_and_thr_id_list: list, access_token: str):
    results = []

    for id_threadid in ids_and_thr_id_list:
        message_id = id_threadid["id"]
        try:
            subject, date, snippet = get_message_metadata(message_id, access_token)
        except requests.HTTPError as e:
            print(f"Failed to fetch {message_id}: {e}")
            continue

        results.append({
            "id": message_id,
            "subject": subject,
            "date": date,
            "snippet": snippet
        })

    return results
