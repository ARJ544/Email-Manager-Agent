from langgraph.graph import MessagesState
from langchain_core.messages import SystemMessage, ToolMessage, AIMessage
from config_llm import llm_with_tools
from utils import get_list_of_emails_tool as gloe
import graph.graph as grhp
from langchain_core.messages import BaseMessage


system_msg = SystemMessage(content=
    "You are Email Manager Agent, created by Abhinav. "
    "You can fetch all emails based on queries. "
    "The user never needs to provide access tokens or credentials. "
    "The backend securely provides authentication tokens automatically. "
    "When the user asks for an operation, only request the required search query, "
    "and call the appropriate tool with the arguments. "
    "Never ask the user for access_token or credentials."
)

def call_llm_node(state: grhp.AgentState):
    
    messages = state["messages"]
    if not any(msg.__class__.__name__ == "SystemMessage" for msg in messages):
        messages.insert(0, system_msg)
    
    try:
        response = llm_with_tools.invoke(messages)
    except Exception as e:
        response = {
            "role": "system",
            "content": f"LLM failed to generate a response: {str(e)}"
        }
    return {
        "messages": [response],
        "access_token": state["access_token"]  # KEEP TOKEN
    }


def execute_tool_calls_node(state: grhp.AgentState):
    """
    Executes all tool calls from the last message dynamically.

    Args:
        state (MessagesState): The current state containing messages and tool calls.

    Returns:
        dict: A dictionary with 'messages' containing the outputs of all executed tools.
    """
    last_message = state["messages"][-1]
    tool_outputs = []

    tools_map = {
        "get_list_of_emails": gloe.get_list_of_emails 
    }

    for tool_call in last_message.tool_calls:
        tool_name = tool_call["name"]
        args = tool_call["args"]
        args["access_token"] = state["access_token"]

        if tool_name in tools_map:
            try:
                result = tools_map[tool_name].invoke(args)
                tool_outputs.append(ToolMessage(tool_call_id=tool_call['id'], content=result))
            except Exception as e:
                tool_outputs.append(
                    ToolMessage(tool_call_id=tool_call['id'], content=f"Error executing {tool_name}: {e}")
                )
        else:
            print(f"No tool found with name '{tool_name}'")
            tool_outputs.append(
                ToolMessage(tool_call_id=tool_call['id'], content=f"No tool found with name '{tool_name}'")
            )

    return {
        "messages": tool_outputs,
        "access_token": state["access_token"]  # KEEP TOKEN
    }

def should_call_tools(state: grhp.AgentState):
    last_message = state["messages"][-1]
    if isinstance(last_message, AIMessage) and last_message.tool_calls:
        return "tools"
    else:
        return "end"