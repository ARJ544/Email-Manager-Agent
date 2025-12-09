from langgraph.graph import StateGraph, START, END
from nodes.agent_nodes import call_llm_node, execute_tool_calls_node, should_call_tools
from graphState.Agentstate import AgentState
from langgraph.checkpoint.memory import MemorySaver

graph = StateGraph(AgentState)
graph.add_node("llm_node", call_llm_node)
graph.add_node("execute_tool_calls_node", execute_tool_calls_node)

graph.add_edge(START,"llm_node")
graph.add_conditional_edges(
    "llm_node", 
    should_call_tools,
    {
        "tools": "execute_tool_calls_node",
        "end": END,
    }
)
graph.add_edge("execute_tool_calls_node", END)
checkpointer = MemorySaver()
workflow = graph.compile(checkpointer=checkpointer)