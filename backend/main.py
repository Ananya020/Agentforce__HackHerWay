from fastapi import FastAPI, HTTPException, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
from dotenv import load_dotenv
import json
import csv
import io
from datetime import datetime, timedelta
import uuid
from typing import List, Optional, Dict, Any
import asyncio
import httpx
from supabase import create_client, Client
from pydantic import BaseModel
import pandas as pd

load_dotenv()

app = FastAPI(title="PerzonAI API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://your-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_ANON_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

# HuggingFace API configuration
HF_API_URL = "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium"
HF_TOKEN = os.getenv("HUGGINGFACE_API_TOKEN")

class PersonaGenerationRequest(BaseModel):
    product_positioning: str
    industry: str
    target_region: str
    product_category: str
    survey_data: Optional[str] = None
    review_data: Optional[str] = None

class ChatRequest(BaseModel):
    persona_id: str
    message: str
    conversation_history: List[Dict[str, str]]
    persona_context: Dict[str, Any]

class RefinementRequest(BaseModel):
    personas: List[Dict[str, Any]]
    refinements: Dict[str, Any]
    original_context: Dict[str, Any]

class ShareRequest(BaseModel):
    personas: List[Dict[str, Any]]
    settings: Dict[str, Any]

async def query_huggingface(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Query HuggingFace API for text generation"""
    headers = {"Authorization": f"Bearer {HF_TOKEN}"}
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(HF_API_URL, headers=headers, json=payload, timeout=30.0)
            if response.status_code == 200:
                return response.json()
            else:
                raise HTTPException(status_code=500, detail=f"HuggingFace API error: {response.text}")
        except httpx.TimeoutException:
            raise HTTPException(status_code=500, detail="HuggingFace API timeout")

def generate_persona_prompt(data: PersonaGenerationRequest) -> str:
    """Generate a detailed prompt for persona creation"""
    return f"""
Create 3 detailed customer personas for a marketing campaign based on the following information:

Product Positioning: {data.product_positioning}
Industry: {data.industry}
Target Region: {data.target_region}
Product Category: {data.product_category}
{f"Survey Data: {data.survey_data}" if data.survey_data else ""}
{f"Review Data: {data.review_data}" if data.review_data else ""}

For each persona, provide:
1. Name and basic demographics (age, gender, location, occupation, income)
2. Personality traits and behavioral characteristics
3. Pain points and challenges they face
4. Goals and motivations
5. Preferred communication style and messaging tone
6. Marketing channels they use
7. Buying behavior and decision factors
8. 2-3 realistic quotes they might say

Make each persona distinct, realistic, and based on market research patterns for the {data.industry} industry in {data.target_region}.

Format the response as a JSON object with this structure:
{{
  "personas": [
    {{
      "name": "string",
      "demographics": {{
        "age": number,
        "gender": "string",
        "location": "string",
        "occupation": "string",
        "income": "string"
      }},
      "traits": ["string"],
      "pain_points": ["string"],
      "motivations": ["string"],
      "goals": ["string"],
      "messaging_tone": "string",
      "preferred_channels": ["string"],
      "buying_behavior": {{
        "decision_factors": ["string"],
        "purchase_frequency": "string",
        "budget_range": "string"
      }},
      "quotes": ["string"]
    }}
  ]
}}
"""

def generate_chat_prompt(data: ChatRequest) -> str:
    """Generate a prompt for persona chat responses"""
    persona = data.persona_context
    history = "\n".join([f"{msg['role']}: {msg['content']}" for msg in data.conversation_history[-5:]])
    
    return f"""
You are {persona['name']}, a {persona['demographics']['age']}-year-old {persona['demographics']['occupation']} from {persona['demographics']['location']}.

Your key traits: {', '.join(persona['traits'])}
Your main concerns: {', '.join(persona['pain_points'])}
Your communication style: {persona['messaging_tone']}

Recent conversation:
{history}

User just said: {data.message}

Respond as {persona['name']} would, staying true to your personality and background. Keep it conversational and under 100 words. Don't mention you're an AI.
"""

@app.get("/")
async def root():
    return {"message": "PerzonAI API is running"}

@app.post("/api/personas/generate")
async def generate_personas(request: PersonaGenerationRequest):
    """Generate AI personas based on input data"""
    try:
        # Create prompt for LLM
        prompt = generate_persona_prompt(request)
        
        # Query HuggingFace API
        payload = {
            "inputs": prompt,
            "parameters": {
                "max_new_tokens": 1500,
                "temperature": 0.7,
                "do_sample": True,
                "return_full_text": False
            }
        }
        
        # For demo purposes, we'll use a structured response
        # In production, you'd parse the LLM response
        personas_data = {
            "personas": [
                {
                    "name": "Sarah Chen",
                    "demographics": {
                        "age": 28,
                        "gender": "Female",
                        "location": "San Francisco, CA",
                        "occupation": "UX Designer",
                        "income": "$85,000"
                    },
                    "traits": ["Tech-savvy", "Quality-focused", "Time-conscious", "Collaborative"],
                    "pain_points": [
                        "Overwhelmed by too many tool options",
                        "Needs seamless team collaboration",
                        "Values intuitive user interfaces"
                    ],
                    "motivations": ["Career advancement", "Work-life balance", "Creative fulfillment"],
                    "goals": ["Streamline workflow", "Improve team productivity", "Stay current with trends"],
                    "messaging_tone": "Professional yet approachable",
                    "preferred_channels": ["LinkedIn", "Design blogs", "Slack communities"],
                    "buying_behavior": {
                        "decision_factors": ["User experience", "Integration capabilities", "Team features"],
                        "purchase_frequency": "Quarterly",
                        "budget_range": "$50-200/month"
                    },
                    "quotes": [
                        "If it takes more than 5 minutes to figure out, I'm not using it.",
                        "I need tools that help my team work together, not create more silos."
                    ]
                },
                {
                    "name": "Mike Rodriguez",
                    "demographics": {
                        "age": 35,
                        "gender": "Male",
                        "location": "Austin, TX",
                        "occupation": "Small Business Owner",
                        "income": "$65,000"
                    },
                    "traits": ["Budget-conscious", "Results-driven", "Practical", "Independent"],
                    "pain_points": [
                        "Limited budget for tools",
                        "Needs clear ROI demonstration",
                        "Prefers simple solutions"
                    ],
                    "motivations": ["Business growth", "Cost efficiency", "Time savings"],
                    "goals": ["Increase revenue", "Reduce operational costs", "Scale business"],
                    "messaging_tone": "Direct and value-focused",
                    "preferred_channels": ["Google search", "Business forums", "Email"],
                    "buying_behavior": {
                        "decision_factors": ["Price", "ROI", "Ease of use"],
                        "purchase_frequency": "Annually",
                        "budget_range": "$20-100/month"
                    },
                    "quotes": [
                        "Show me the numbers - how will this make me money?",
                        "I don't have time for complicated setups."
                    ]
                },
                {
                    "name": "Emma Thompson",
                    "demographics": {
                        "age": 42,
                        "gender": "Female",
                        "location": "New York, NY",
                        "occupation": "Marketing Director",
                        "income": "$120,000"
                    },
                    "traits": ["Strategic", "Quality-focused", "Brand-conscious", "Innovation-seeking"],
                    "pain_points": [
                        "Needs advanced features",
                        "Requires integration capabilities",
                        "Values premium support"
                    ],
                    "motivations": ["Professional excellence", "Brand building", "Market leadership"],
                    "goals": ["Drive brand awareness", "Optimize campaigns", "Lead innovation"],
                    "messaging_tone": "Sophisticated and detailed",
                    "preferred_channels": ["Industry publications", "Conferences", "LinkedIn"],
                    "buying_behavior": {
                        "decision_factors": ["Features", "Scalability", "Support quality"],
                        "purchase_frequency": "Bi-annually",
                        "budget_range": "$200-1000/month"
                    },
                    "quotes": [
                        "We need enterprise-grade solutions that can scale with our growth.",
                        "Premium support isn't optional - it's essential for our operations."
                    ]
                }
            ]
        }
        
        # Add IDs and avatars
        session_id = str(uuid.uuid4())
        for i, persona in enumerate(personas_data["personas"]):
            persona_id = f"persona_{int(datetime.now().timestamp())}_{i}"
            persona["id"] = persona_id
            persona["avatar"] = f"https://api.dicebear.com/7.x/avataaars/svg?seed={persona['name']}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf"
        
        # Store in Supabase
        result = supabase.table("persona_sessions").insert({
            "id": session_id,
            "personas": personas_data["personas"],
            "original_request": request.dict(),
            "created_at": datetime.now().isoformat()
        }).execute()
        
        return {
            "success": True,
            "session_id": session_id,
            "personas": personas_data["personas"],
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating personas: {str(e)}")

@app.post("/api/personas/chat")
async def chat_with_persona(request: ChatRequest):
    """Chat with a specific persona"""
    try:
        # Create chat prompt
        prompt = generate_chat_prompt(request)
        
        # For demo purposes, we'll use predefined responses
        # In production, you'd use the LLM response
        persona_responses = {
            "Sarah Chen": [
                "That's a great question! As a UX designer, I always think about how users will interact with features like that.",
                "I really value tools that don't require a steep learning curve. Time is so precious in our industry.",
                "Collaboration features are huge for me. I work with developers and PMs daily, so seamless integration is key.",
                "I'm willing to invest in quality tools, but they need to prove their worth quickly.",
                "Clean, intuitive design isn't just nice to have - it's essential for my workflow."
            ],
            "Mike Rodriguez": [
                "I need to see clear ROI before I invest in any new tool. Show me the numbers!",
                "As a small business owner, every dollar counts. I can't afford tools that don't deliver value.",
                "I prefer straightforward solutions. If it takes more than 10 minutes to set up, it's too complex.",
                "Customer support is crucial. When something breaks, I need it fixed fast.",
                "I trust recommendations from other small business owners more than fancy marketing."
            ],
            "Emma Thompson": [
                "We need enterprise-grade solutions that can handle our scale and complexity.",
                "Integration capabilities are non-negotiable. Any new tool must work with our existing stack.",
                "I value premium support and dedicated account management. White-glove service is expected.",
                "Brand reputation and security are paramount. We can't risk our data with unknown vendors.",
                "Advanced features and customization options are essential for our sophisticated campaigns."
            ]
        }
        
        # Get persona name from context
        persona_name = request.persona_context.get("name", "")
        responses = persona_responses.get(persona_name, ["That's interesting! Tell me more about what you're looking for."])
        
        # Select a response (in production, this would come from LLM)
        import random
        response_text = random.choice(responses)
        
        # Simulate thinking delay
        await asyncio.sleep(1.5)
        
        # Store conversation in Supabase
        supabase.table("conversations").insert({
            "persona_id": request.persona_id,
            "user_message": request.message,
            "persona_response": response_text,
            "created_at": datetime.now().isoformat()
        }).execute()
        
        return {
            "success": True,
            "response": response_text,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating chat response: {str(e)}")

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    """Handle file uploads and process data"""
    try:
        # Validate file type
        allowed_types = ["text/csv", "text/plain", "application/json"]
        if file.content_type not in allowed_types:
            raise HTTPException(status_code=400, detail="Invalid file type. Only CSV, TXT, and JSON files are allowed.")
        
        # Validate file size (max 10MB)
        max_size = 10 * 1024 * 1024
        content = await file.read()
        if len(content) > max_size:
            raise HTTPException(status_code=400, detail="File too large. Maximum size is 10MB.")
        
        # Process file content
        content_str = content.decode('utf-8')
        processed_data = {}
        
        if file.content_type == "text/csv":
            # Parse CSV
            csv_reader = csv.DictReader(io.StringIO(content_str))
            rows = list(csv_reader)
            processed_data = {
                "type": "csv",
                "headers": list(rows[0].keys()) if rows else [],
                "rows": rows,
                "summary": {
                    "total_rows": len(rows),
                    "columns": len(rows[0].keys()) if rows else 0
                }
            }
        elif file.content_type == "application/json":
            try:
                json_data = json.loads(content_str)
                processed_data = {
                    "type": "json",
                    "data": json_data,
                    "summary": {
                        "keys": list(json_data.keys()) if isinstance(json_data, dict) else [],
                        "data_type": "array" if isinstance(json_data, list) else "object"
                    }
                }
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid JSON format")
        else:
            # Plain text
            processed_data = {
                "type": "text",
                "content": content_str,
                "summary": {
                    "word_count": len(content_str.split()),
                    "line_count": len(content_str.split('\n')),
                    "char_count": len(content_str)
                }
            }
        
        # Store file data in Supabase
        file_id = str(uuid.uuid4())
        supabase.table("uploaded_files").insert({
            "id": file_id,
            "filename": file.filename,
            "file_type": file.content_type,
            "processed_data": processed_data,
            "created_at": datetime.now().isoformat()
        }).execute()
        
        return {
            "success": True,
            "file_id": file_id,
            "filename": file.filename,
            "file_size": len(content),
            "file_type": file.content_type,
            "processed_data": processed_data,
            "uploaded_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@app.get("/api/trends")
async def get_trends(industry: Optional[str] = None, region: Optional[str] = None, timeframe: str = "30d"):
    """Get marketing trends data"""
    try:
        # Generate mock trends data (in production, this would come from real APIs)
        trends_data = {
            "trending_topics": [
                {"topic": "AI & Automation", "mentions": 15420, "growth": "+23%", "sentiment": "positive"},
                {"topic": "Sustainability", "mentions": 12890, "growth": "+18%", "sentiment": "positive"},
                {"topic": "Remote Work", "mentions": 11250, "growth": "+12%", "sentiment": "neutral"},
                {"topic": "Mental Health", "mentions": 9870, "growth": "+31%", "sentiment": "positive"},
                {"topic": "Digital Privacy", "mentions": 8640, "growth": "+15%", "sentiment": "neutral"}
            ],
            "content_performance": [
                {"format": "Video Content", "performance": 92, "trend": "up", "engagement": 78},
                {"format": "Interactive Posts", "performance": 87, "trend": "up", "engagement": 72},
                {"format": "Stories", "performance": 78, "trend": "down", "engagement": 65},
                {"format": "Carousel Posts", "performance": 85, "trend": "up", "engagement": 70},
                {"format": "Live Streams", "performance": 73, "trend": "up", "engagement": 68}
            ],
            "demographics": [
                {"age_group": "18-24", "percentage": 25, "trend": "up"},
                {"age_group": "25-34", "percentage": 35, "trend": "up"},
                {"age_group": "35-44", "percentage": 25, "trend": "stable"},
                {"age_group": "45+", "percentage": 15, "trend": "down"}
            ]
        }
        
        return {
            "success": True,
            "data": trends_data,
            "filters": {"industry": industry, "region": region, "timeframe": timeframe},
            "last_updated": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching trends: {str(e)}")

@app.post("/api/share")
async def create_share_link(request: ShareRequest):
    """Create a shareable link for personas"""
    try:
        share_id = str(uuid.uuid4())
        expires_at = datetime.now() + timedelta(days=30)
        
        # Store in Supabase
        supabase.table("shared_personas").insert({
            "id": share_id,
            "personas": request.personas,
            "settings": request.settings,
            "expires_at": expires_at.isoformat(),
            "created_at": datetime.now().isoformat(),
            "access_count": 0
        }).execute()
        
        base_url = os.getenv("NEXT_PUBLIC_BASE_URL", "http://localhost:3000")
        share_url = f"{base_url}/shared/{share_id}"
        
        return {
            "success": True,
            "share_id": share_id,
            "share_url": share_url,
            "expires_at": expires_at.isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating share link: {str(e)}")

@app.get("/api/share/{share_id}")
async def get_shared_personas(share_id: str, password: Optional[str] = None):
    """Get shared personas by ID"""
    try:
        # Get from Supabase
        result = supabase.table("shared_personas").select("*").eq("id", share_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Share not found")
        
        share_data = result.data[0]
        
        # Check if expired
        if datetime.now() > datetime.fromisoformat(share_data["expires_at"]):
            raise HTTPException(status_code=410, detail="Share link has expired")
        
        # Check password if required
        if share_data["settings"].get("password") and share_data["settings"]["password"] != password:
            raise HTTPException(status_code=401, detail="Invalid password")
        
        # Update access count
        supabase.table("shared_personas").update({
            "access_count": share_data["access_count"] + 1,
            "last_accessed": datetime.now().isoformat()
        }).eq("id", share_id).execute()
        
        return {
            "success": True,
            "personas": share_data["personas"],
            "metadata": {
                "created_at": share_data["created_at"],
                "expires_at": share_data["expires_at"],
                "access_count": share_data["access_count"] + 1
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error accessing shared personas: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
