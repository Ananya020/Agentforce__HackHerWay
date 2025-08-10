# ==============================================================================
# FINAL, COMPLETE main.py for PerzonAI Backend
# Includes: Generate, Upload, Refine, Export, Share, and Chat functionalities
# ==============================================================================

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import uvicorn
import os
from dotenv import load_dotenv
import json
import csv
import io
from datetime import datetime, timedelta
import uuid
from typing import List, Optional, Dict, Any
import google.generativeai as genai
import traceback
import pandas as pd
from supabase import create_client, Client
from pydantic import BaseModel

# --- 1. Configuration and Initialization ---
load_dotenv()

app = FastAPI(
    title="PerzonAI API",
    version="1.0.0",
    description="Backend API for generating, refining, and interacting with AI-powered customer personas."
)

# --- 2. Middleware ---
# Allows your frontend (at localhost:3000) to communicate with this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 3. Service Clients ---
# Initialize Supabase client for database operations
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

# Initialize Google Gemini client for AI generation
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)
gemini_model = genai.GenerativeModel('gemini-1.5-flash')

# --- 4. Pydantic Models (Data Validation) ---
class PersonaGenerationRequest(BaseModel):
    product_positioning: str
    industry: str
    target_region: str
    product_category: str
    survey_data: Optional[str] = None
    review_data: Optional[str] = None

class PersonaRefinementRequest(BaseModel):
    personas: List[Dict[str, Any]]
    refinements: Dict[str, Any]
    original_context: Dict[str, Any]

class ChatRequest(BaseModel):
    persona: Dict[str, Any]
    message: str

class ShareRequest(BaseModel):
    personas: List[Dict[str, Any]]
    settings: Dict[str, Any]

class ExportRequest(BaseModel):
    personas: List[Dict[str, Any]]
    format: str

# --- 5. Prompt Engineering Functions ---
def generate_persona_prompt(data: PersonaGenerationRequest) -> str:
    prompt_parts = [
        "Acting as a world-class market research analyst, create 3 detailed and distinct customer personas.",
        f"The personas must be tailored for a product with this context: {data.product_positioning} in the {data.industry} industry for the {data.target_region} region.",
        "For each persona, you MUST provide: a 'name', 'demographics' (age, gender, location, occupation, income), a 'bio' string, and lists for 'traits', 'pain_points', 'goals', and 'quotes'.",
        "Format the entire output as a single, valid JSON object with a root key 'personas' which is a list of the 3 persona objects. Do not include any text or markdown formatting before or after the JSON object."
    ]
    if data.survey_data:
        prompt_parts.append(f"Incorporate insights from this survey data: {data.survey_data}")
    if data.review_data:
        prompt_parts.append(f"Incorporate insights from these customer reviews: {data.review_data}")
    return "\n".join(prompt_parts)

def generate_refine_prompt(request: PersonaRefinementRequest) -> str:
    instructions = []
    for key, value in request.refinements.items():
        instructions.append(f"- {key}: {value}")
    
    return (
        "You are an AI assistant that refines customer personas based on instructions. "
        "Read the original personas and the user's refinement instructions carefully. "
        "Then, return the complete, updated list of all personas in the exact same JSON format as the original. "
        "Do not add any commentary before or after the JSON object.\n\n"
        f"REFINEMENT INSTRUCTIONS:\n{' '.join(instructions)}\n\n"
        f"ORIGINAL PERSONAS JSON:\n{json.dumps(request.personas, indent=2)}\n\n"
        "REFINED PERSONAS JSON:"
    )

def create_chat_prompt(request: ChatRequest) -> str:
    persona = request.persona
    return (
        f"You are role-playing as {persona.get('name')}. Your character profile is {persona.get('demographics')}. "
        "Stay completely in character. Do not reveal you are an AI. Respond naturally based on your character profile.\n\n"
        f"The user just said: '{request.message}'.\n\nYour response:"
    )

# --- 6. API Endpoints ---
@app.get("/")
async def root():
    return {"message": "PerzonAI API is running"}

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        content = await file.read()
        return {"success": True, "content": content.decode('utf-8')}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error during file upload: {e}")

@app.post("/api/personas/generate")
async def generate_personas(request: PersonaGenerationRequest):
    try:
        prompt = generate_persona_prompt(request)
        response = gemini_model.generate_content(prompt)
        raw_json = response.text.strip().replace("```json", "").replace("```", "").strip()
        personas_data = json.loads(raw_json)
        
        session_id = str(uuid.uuid4())
        for p in personas_data.get("personas", []):
            p["id"] = f"persona_{uuid.uuid4().hex[:8]}"
            if p.get("name"):
                p["avatar"] = f"https://api.dicebear.com/7.x/avataaars/svg?seed={p['name'].replace(' ', '')}"
        
        supabase.table("persona_sessions").insert({"id": session_id, "personas": personas_data.get("personas", [])}).execute()
        return {"success": True, "session_id": session_id, "personas": personas_data.get("personas", [])}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error during persona generation: {e}")

@app.post("/api/personas/refine")
async def refine_personas(request: PersonaRefinementRequest):
    try:
        prompt = generate_refine_prompt(request)
        response = gemini_model.generate_content(prompt)
        raw_json = response.text.strip().replace("```json", "").replace("```", "").strip()
        refined_data = json.loads(raw_json)
        personas_list = []
        if isinstance(refined_data, dict):
            personas_list = refined_data.get("personas", [])
        elif isinstance(refined_data, list):
            personas_list = refined_data
        else:
           
            raise ValueError("AI response was not in a recognized format (dict or list).")
       
        for p in personas_list:
            if not p.get("id"): p["id"] = f"persona_{uuid.uuid4().hex[:8]}"
            if not p.get("avatar") and p.get("name"):
                 p["avatar"] = f"https://api.dicebear.com/7.x/avataaars/svg?seed={p['name'].replace(' ', '')}"
        
        return {"success": True, "personas": personas_list}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to refine personas: {str(e)}")

@app.post("/api/export/personas")
async def export_personas(request: ExportRequest):
    try:
        flat_data = [
            {"Name": p.get("name"), "Occupation": p.get("demographics", {}).get("occupation"), "Age": p.get("demographics", {}).get("age"), "Traits": ", ".join(p.get("traits", [])), "Pain Points": ", ".join(p.get("pain_points", [])), "Goals": ", ".join(p.get("goals", []))}
            for p in request.personas
        ]
        df = pd.DataFrame(flat_data)
        stream = io.StringIO()
        df.to_csv(stream, index=False)
        response = StreamingResponse(iter([stream.getvalue()]), media_type="text/csv")
        response.headers["Content-Disposition"] = f"attachment; filename=personas_{datetime.now().strftime('%Y-%m-%d')}.csv"
        return response
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to export data: {e}")

@app.post("/api/share")
async def create_share_link(request: ShareRequest):
    # This is a placeholder. To make it work, you need a `shared_personas` table in Supabase.
    try:
        share_url = f"http://localhost:3000/shared/{uuid.uuid4().hex[:8]}"
        return {"success": True, "share_url": share_url}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to create share link: {e}")

@app.post("/api/personas/chat")
async def chat_with_persona(request: ChatRequest):
    try:
        prompt = create_chat_prompt(request)
        response = gemini_model.generate_content(prompt)
        return {"success": True, "reply": response.text}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to get chat reply: {e}")

# --- 7. Main Execution ---
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)