"""
Utility used to get all email messages with query.
Provided tool:
 - get_list_of_emails
"""
import requests
from langchain_core.tools import tool

@tool
def get_list_of_emails(q: str, access_token: str):
    """
    Fetches a filtered list of Gmail message metadata using a search query.

    What It Does:
        Sends a GET request to the Gmail API to retrieve emails that match
        the specified Gmail search query. The query allows filtering by sender,
        receiver, subject, labels, keywords, attachment presence, dates, and
        other standard Gmail search operators.

    Args:
        q (str):
            A Gmail search query string that follows the standard Gmail search
            syntax.

            The query can combine multiple operators using spaces. Gmail treats
            spaces as logical AND by default. For OR operations, use uppercase
            "OR".

            **Supported Query Patterns:**

            1. **Sender / Receiver**
               - `from:email@example.com`
               - `to:email@example.com`
               - `cc:email@example.com`
               - `bcc:email@example.com`

            2. **Subject**
               - `subject:Invoice`
               - `subject:"Payment Reminder"`

            3. **Keywords**
               - `meeting`
               - `"project update"`

            4. **Labels**
               - `label:IMPORTANT`
               - `label:STARRED`
               - `label:UNREAD`

            5. **Has / Has Not**
               - `has:attachment`
               - `has:drive`
               - `has:document`
               - `-has:attachment` (messages without attachments)

            6. **Read / Unread**
               - `is:read`
               - `is:unread`
               - `is:important`
               - `is:starred`

            7. **Date Filters**  
               Gmail uses **YYYY/MM/DD** format.
               - `after:2024/01/01`
               - `before:2024/02/01`
               - `newer_than:7d`
               - `older_than:30d`
               - Combine: `after:2024/01/01 before:2024/03/01`

            8. **Message IDs / Thread IDs**
               - `rfc822msgid:unique_id`
               - `threadid:XYZ123`

            9. **Attachment Filename**
               - `filename:pdf`
               - `filename:"report.pdf"`

            10. **Boolean Logic**
                - `(from:alice OR from:bob)`
                - `subject:Invoice has:attachment`
                - `from:boss -subject:meeting` (exclude something)

            **Example Queries (Before & After Explanation):**

            - Before: “I want all unread mails from Google after Jan 2024”
              After: `from:google.com is:unread after:2024/01/01`

            - Before: “Show mails with PDF attachments sent to me last week”
              After: `to:me filename:pdf newer_than:7d`

            - Before: “Find all messages with the subject Project Update”
              After: `subject:"Project Update"`

            - Before: “All mails that have attachments and came in 2023”
              After: `has:attachment after:2023/01/01 before:2024/01/01`

    Returns:
        requests.Response:
            The raw HTTP response from the Gmail API containing message IDs
            and metadata. Use `response.json()` to access structured data.
    """
    
    url = f"https://gmail.googleapis.com/gmail/v1/users/me/messages"
    params = {"q": q, "maxResults": 500}

    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    response = requests.get(url, headers=headers, params=params)
    response.raise_for_status()
    return response.json()

