"""
LLM Advisory Generation Service

Uses the Groq API to generate natural-language heat advisories
from verified structured data. Falls back to templates if Groq
is unavailable or unconfigured.

The LLM receives ONLY verified facts and must NOT invent:
- temperatures, dates, regions, health statistics
- population numbers, government orders, phone numbers
"""

import json
import logging
from typing import Dict, Optional
from config import get_settings

logger = logging.getLogger(__name__)

_groq_client = None


def _get_groq_client():
    """Lazily initialize the Groq client."""
    global _groq_client
    if _groq_client is not None:
        return _groq_client
    
    settings = get_settings()
    api_key = settings.GROQ_API_KEY
    
    if not api_key:
        logger.warning("GROQ_API_KEY not configured. LLM advisory generation unavailable.")
        return None
    
    try:
        from groq import Groq
        _groq_client = Groq(api_key=api_key)
        logger.info("Groq client initialized successfully.")
        return _groq_client
    except ImportError:
        logger.error("groq package not installed. Run: pip install groq")
        return None
    except Exception as e:
        logger.error(f"Failed to initialize Groq client: {e}")
        return None


SYSTEM_PROMPT = """You are HeatShield AI, a factual heat advisory generator for Indian government authorities and citizens.

CRITICAL RULES:
1. You MUST use ONLY the data provided in the user message. Do NOT invent any facts.
2. You MUST NOT fabricate temperatures, dates, regions, statistics, population numbers, phone numbers, government orders, or medical protocols.
3. If information is not provided, do NOT include it. Simply omit it.
4. Your output MUST be valid JSON with exactly these keys: "title", "summary", "actions"
5. "actions" must be a JSON array of 4-6 concise, actionable bullet points
6. All temperature references MUST match the provided forecast_temperature exactly
7. The region name MUST match the provided region exactly
8. The severity level MUST match the provided severity exactly
9. Be concise, factual, and safety-focused
10. Do NOT include disclaimers about being an AI

Respond ONLY with valid JSON. No markdown, no explanation outside the JSON."""


AUDIENCE_INSTRUCTIONS = {
    "CITIZENS": "Write for the general public. Focus on personal safety: hydration, avoiding heat exposure, timing outdoor activities, recognizing heat illness symptoms. Use simple, clear language.",
    "AUTHORITIES": "Write for district administrators and emergency management officials. Focus on coordination, public infrastructure readiness, shelter activation, water supply, public announcements, and emergency preparedness.",
    "FARMERS": "Write for agricultural workers and farmers. Focus on crop protection, irrigation timing, livestock care, field-work scheduling, and heat stress on plants and animals.",
    "HEALTHCARE": "Write for healthcare professionals. Focus on clinical preparedness for heat-related illness, hospital readiness, identification of vulnerable populations, and general prevention guidance. Do NOT prescribe specific treatments or cite mortality statistics.",
}


def generate_advisory_llm(context: Dict) -> Optional[Dict]:
    """
    Generate an advisory using the Groq LLM.
    
    Args:
        context: Dict with keys: region, forecast_temperature, normal_temperature,
                 departure, severity, audience, start_date (optional)
    
    Returns:
        Dict with keys: title, summary, actions (list of strings)
        Or None if generation fails
    """
    client = _get_groq_client()
    if client is None:
        return None
    
    settings = get_settings()
    model = settings.GROQ_MODEL
    
    audience = context.get("audience", "CITIZENS")
    audience_instruction = AUDIENCE_INSTRUCTIONS.get(audience, AUDIENCE_INSTRUCTIONS["CITIZENS"])
    
    user_message = f"""Generate a heat advisory based on these VERIFIED facts:

Region: {context['region']}
Forecast Temperature: {context['forecast_temperature']}°C
Normal Temperature: {context['normal_temperature']}°C
Departure from Normal: {context['departure']}°C
Severity Classification: {context['severity']}
Target Audience: {audience}

Audience-specific instruction: {audience_instruction}

Return a JSON object with "title", "summary", and "actions" (array of 4-6 actionable items).
The title should include the region name and severity level.
The summary should be 2-3 sentences describing the situation factually."""

    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ],
            temperature=0.3,
            max_tokens=800,
            response_format={"type": "json_object"},
        )
        
        content = response.choices[0].message.content
        if not content:
            logger.error("Groq returned empty response")
            return None
        
        parsed = json.loads(content)
        
        # Validate structure
        if not isinstance(parsed.get("title"), str) or not parsed["title"]:
            logger.error("Invalid LLM response: missing or empty title")
            return None
        if not isinstance(parsed.get("summary"), str) or not parsed["summary"]:
            logger.error("Invalid LLM response: missing or empty summary")
            return None
        if not isinstance(parsed.get("actions"), list) or len(parsed["actions"]) < 1:
            logger.error("Invalid LLM response: missing or empty actions")
            return None
        
        return {
            "title": parsed["title"],
            "summary": parsed["summary"],
            "actions": [str(a) for a in parsed["actions"]],
        }
        
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse Groq response as JSON: {e}")
        return None
    except Exception as e:
        logger.error(f"Groq advisory generation failed: {e}")
        return None


def validate_advisory(advisory: Dict, context: Dict) -> Optional[str]:
    """
    Validate an LLM-generated advisory against the source context.
    
    Returns None if valid, or an error string if invalid.
    """
    if not advisory:
        return "Advisory is empty"
    
    title = advisory.get("title", "")
    summary = advisory.get("summary", "")
    actions = advisory.get("actions", [])
    
    if not title or not summary:
        return "Advisory missing title or summary"
    
    if len(actions) < 1:
        return "Advisory has no action items"
    
    # Check region mention (should appear in title or summary)
    region = context.get("region", "")
    if region and region.lower() not in title.lower() and region.lower() not in summary.lower():
        return f"Advisory does not mention the requested region '{region}'"
    
    # Check severity consistency
    severity = context.get("severity", "").lower()
    full_text = (title + " " + summary).lower()
    severity_terms = {
        "severe_heatwave": ["severe", "extreme", "critical", "emergency"],
        "heatwave": ["heatwave", "heat wave", "heat advisory", "heat alert", "heat warning"],
    }
    if severity in severity_terms:
        if not any(term in full_text for term in severity_terms[severity]):
            return f"Advisory does not reflect the severity level '{severity}'"
    
    return None  # Valid


def format_advisory_content(advisory_dict: Dict) -> str:
    """
    Serialize a structured advisory into a string for the database content field.
    Uses JSON so the frontend can parse it back if needed, but also works
    as readable text.
    """
    return json.dumps(advisory_dict, ensure_ascii=False)
