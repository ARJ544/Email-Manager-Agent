from dotenv import load_dotenv
import os
from utils import get_list_of_emails_tool as gloe
from langchain_google_genai import ChatGoogleGenerativeAI

load_dotenv()

llm = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash-lite",
    temperature=0,
    max_tokens=None,
    timeout=None,
    max_retries=0,
    google_api_key=os.getenv("GOOGLE_API_KEY"),
)
tools = [gloe.get_list_of_emails]
llm_with_tools = llm.bind_tools(tools)