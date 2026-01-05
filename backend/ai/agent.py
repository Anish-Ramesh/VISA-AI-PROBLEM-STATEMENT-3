import os
import requests
import asyncio
from typing import TypedDict, List
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage, BaseMessage
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
from langgraph.graph import StateGraph, END
import json

# Define the Agent State
class AgentState(TypedDict):
    metadata: dict
    scores: dict
    privacy_check: str
    dataset_type: str
    insights: str
    analysis: dict
    framework: str # Optional: "PCI-DSS", "GDPR", etc.

# ... existing code ...

def advisory_agent(state: AgentState):
    """
    Agent 6: Advisory Agent
    Generates the final JSON output with remediation steps.
    """
    print("\n🔹 [Advisory Agent]: Generating remediation plan...")
    
    scores = state["scores"]
    metadata = state["metadata"]
    context = state["dataset_type"]
    insights = state["insights"]
    framework = state.get("framework")
    
    lens_instruction = ""
    if framework:
        lens_instruction = f"""
        **COMPLIANCE LENS ACTIVE: {framework}**
        - STRICTLY prioritize issues relevant to {framework}.
        - References specific articles/clauses of {framework} if possible.
        - Ignore minor non-compliant issues if they don't violate {framework}.
        """

    system_prompt = f"""You are an Expert Financial Compliance Advisor.
    Context: {context}
    Insights: {insights}
    {lens_instruction}
    
    Role: Analyze the following scores and rule details to generate a prioritized remediation plan.
    
    **Priority Logic**:
    - **CRITICAL**: Security gaps (PCI DSS, PII), Major Fraud risks, Clear Regulatory violations.
    - **HIGH**: Financial Inaccuracies (Negative amounts, Currency mismatches), Missing required fields.
    - **MEDIUM**: Data Hygiene (Date formats, Consistency), Operational warnings.
    - **LOW**: Optimization suggestions.

    Output strictly valid JSON:
    {{
        "executive_summary": "One sentence overview.",
        "risk_assessment": "Short paragraph on compliance risks.",
        "remediation_steps": [
            {{"issue": "Brief issue title", "action": "Specific fix action", "priority": "CRITICAL/HIGH/MEDIUM/LOW"}}
        ]
    }}
    
    **Important**: Sort the 'remediation_steps' array so 'CRITICAL' items appear first, followed by 'HIGH', then 'MEDIUM'.
    """
    
    user_message = f"""
    Scores: {json.dumps(scores['dimension_scores'], indent=2)}
    Failed Rules: {[k for k,v in scores['rule_results'].items() if not v['passed']]}
    """
    
    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=user_message)
    ]
    
    try:
        # Use Fallback Wrapper
        response = invoke_llm_with_fallback(messages)
        content = response.content.replace("```json", "").replace("```", "").strip()
        analysis_json = json.loads(content)
        print("   ✅ [Advisory Agent]: Plan generated successfully.")
        return {"analysis": analysis_json}
    except Exception as e:
        print(f"   ❌ [Advisory Agent]: Error generating plan: {e}")
        return {"analysis": {
            "executive_summary": "Error generating advice.",
            "risk_assessment": "LLM Failure",
            "remediation_steps": []
        }}

# ... existing code ...

async def run_advisory_agent(scores: dict, metadata: dict, framework: str = None) -> dict:
    """
    Entry point to run the multi-agent system.
    """
    print("\n--- 🤖 Starting Multi-Agent Compliance Analysis ---")
    
    initial_state = {
        "scores": scores,
        "metadata": metadata,
        "privacy_check": "",
        "dataset_type": "",
        "insights": "",
        "analysis": {},
        "framework": framework
    }
    
    result = await app.ainvoke(initial_state)
    print("--- 🏁 Agent Workflow Complete ---\n")
    return result["analysis"]

def build_compliance_rag(scores: dict, metadata: dict) -> FAISS:
    """
    Builds an ephemeral vector store from the safe parts of the analysis.
    Explicitly excludes raw rows.
    """
    docs = []
    
    # 1. High Level Scores
    docs.append(Document(page_content=f"Overall Health Score: {scores.get('health_score')}/100", metadata={"source": "scores"}))
    
    # 2. Dimension Scores
    for dim, score in scores.get("dimension_scores", {}).items():
        docs.append(Document(page_content=f"{dim} dimension score: {score}/100", metadata={"source": "dimension"}))
        
    # 3. Rule Results
    for rule, result in scores.get("rule_results", {}).items():
        status = "PASSED" if result['passed'] else "FAILED"
        content = f"Rule '{rule}' {status}. Score: {result['score']}. Details: {result['details']}"
        docs.append(Document(page_content=content, metadata={"source": "rule_result"}))
        
    # 4. Metadata (Safe Columns Only)
    columns = list(metadata.get("columns", {}).keys())
    docs.append(Document(page_content=f"Dataset has {metadata.get('total_rows')} rows and {metadata.get('total_columns')} columns.", metadata={"source": "metadata"}))
    docs.append(Document(page_content=f"Column names in the dataset: {', '.join(columns)}", metadata={"source": "metadata"}))
    
    vectorstore = FAISS.from_documents(docs, embeddings)
    return vectorstore

async def chat_about_dataset(question: str, context: dict) -> str:
    """
    Unrestricted Chat: Provides full dataset context to the LLM.
    Acts as an Independent Auditor answering questions.
    """
    scores = context.get("scores", {})
    metadata = context.get("metadata", {})
    analysis = context.get("analysis", {})
    
    # Construct Full Context (No RAG extraction)
    # We dump the entire relevant JSON structure so the LLM has "whole data on the page"
    full_context_data = {
        "report_summary": {
            "health_score": scores.get("health_score"),
            "dataset_classification": context.get("dataset_type", "Unknown"),
            "row_count": metadata.get("total_rows"),
            "column_count": metadata.get("total_columns")
        },
        "dimension_breakdown": scores.get("dimension_scores", {}),
        "detailed_rule_results": scores.get("rule_results", {}),
        "ai_risk_assessment": analysis.get("risk_assessment", "Not available"),
        "ai_remediation_plan": analysis.get("remediation_steps", []),
        "columns": list(metadata.get("columns", {}).keys())
    }
    
    context_str = json.dumps(full_context_data, indent=2)

    # Auditor Persona System Prompt
    system_prompt = """You are the 'FinAUDIT Independent Auditor', an expert AI agent responsible for explaining the results of a financial data compliance audit.

    Your Mandate:
    1. **Full Transparency**: You have access to the COMPLETE audit report. Answer ANY question related to the data quality, scores, rules, or specific failures. Do not restrict information.
    2. **Persona**: Professional, objective, and authoritative (like a CPA or Auditor). use phrases like "based on our analysis", "the audit evidence suggests".
    3. **Grounding**: strictly base your answers on the provided 'Context JSON'.
    4. **Format**: Use Markdown (Bold, Lists, Tables) to present data clearly.
    
    If asked about the 'opinion', derive it from the Health Score (Unqualified if > 90, Qualified if 70-90, Adverse if < 70).
    """
    
    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=f"Context JSON:\n{context_str}\n\nUser Question: {question}")
    ]
    
    try:
        # Use Fallback Async Wrapper
        response = await invoke_llm_with_fallback_async(messages)
        return response.content
    except Exception as e:
        return f"Auditor Error: {str(e)}"
