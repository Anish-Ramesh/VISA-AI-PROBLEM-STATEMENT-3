from fastapi import APIRouter, UploadFile, File, HTTPException
import os
from services.ingestion import load_data, profile_dataset
from core.rules_engine import RulesEngine
from services.scoring import calculate_scores
from ai.agent import run_advisory_agent

router = APIRouter()

from services.provenance import provenance_service

@router.post("/analyze")
async def analyze_data(file: UploadFile = File(...)):
    # 1. Ingestion & Profiling (Metadata Extraction)
    try:
        df = await load_data(file)
        metadata = profile_dataset(df)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    # 2. Rule Execution (Deterministic)
    engine = RulesEngine(metadata)
    rule_results = engine.run_all()

    # 3. Scoring
    scores = calculate_scores(rule_results)

    # 4. Agent Analysis
    try:
        if os.environ.get("GOOGLE_API_KEY"):
            analysis = await run_advisory_agent(scores, metadata)
        else:
            analysis = {
                "executive_summary": "AI analysis skipped (GOOGLE_API_KEY not set).",
                "risk_assessment": "Configure the API key to enable GenAI insights.",
                "remediation_steps": []
            }
    except Exception as e:
         # Fallback to prevent API failure
         analysis = {
            "executive_summary": "AI analysis failed temporarily.",
            "risk_assessment": str(e),
            "remediation_steps": []
        }

    # 5. Provenance Attestation
    attestation_data = {
        "filename": file.filename,
        "health_score": scores["health_score"],
        "overall_score": scores["overall_score"],
        "metadata_hash": provenance_service.compute_fingerprint(metadata),
        "analysis_summary_hash": provenance_service.compute_fingerprint(analysis) if analysis else None
    }
    provenance = provenance_service.sign_record(attestation_data)

    return {
        "filename": file.filename,
        "metadata": metadata, # Frontend might need this for visualization
        "scores": scores,
        "analysis": analysis,
        "provenance": provenance
    }

from pydantic import BaseModel
from ai.agent import chat_about_dataset

class ChatRequest(BaseModel):
    question: str
    context: dict

@router.post("/chat")
async def chat(request: ChatRequest):
    try:
        if not os.environ.get("GOOGLE_API_KEY"):
            return {"response": "I need a Google API Key to chat! Please configure backend/.env."}
            
        response = await chat_about_dataset(request.question, request.context)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
