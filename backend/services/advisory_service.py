"""
Advisory Generation Service

Template-based deterministic advisory generator.
Structured so an LLM can be plugged in later by replacing the
generate_advisory_content() function.
"""

from typing import List, Dict
from datetime import datetime


# Template-based advisory content per audience and severity
ADVISORY_TEMPLATES: Dict[str, Dict[str, Dict[str, str]]] = {
    "HEATWAVE": {
        "CITIZENS": {
            "title": "Heatwave Advisory – {region}",
            "content": (
                "⚠️ Heatwave Warning for {region}\n\n"
                "A heatwave has been declared with temperatures expected to reach {temp}°C.\n\n"
                "Precautions:\n"
                "• Avoid direct sun exposure between 11 AM and 4 PM\n"
                "• Drink at least 3-4 litres of water daily\n"
                "• Wear lightweight, light-coloured, loose cotton clothes\n"
                "• Use ORS, lemon water, or buttermilk to stay hydrated\n"
                "• Keep windows covered with wet cloth or curtains during daytime\n"
                "• Check on elderly neighbours and young children regularly\n\n"
                "If you experience dizziness, nausea, or heavy sweating, move to shade "
                "immediately and seek medical attention."
            ),
        },
        "FARMERS": {
            "title": "Heatwave Agricultural Advisory – {region}",
            "content": (
                "🌾 Agricultural Heatwave Advisory for {region}\n\n"
                "Temperatures expected to reach {temp}°C.\n\n"
                "Recommendations:\n"
                "• Irrigate crops during early morning or late evening hours only\n"
                "• Apply mulching to conserve soil moisture\n"
                "• Provide shade and extra water to livestock\n"
                "• Avoid spraying pesticides during peak heat hours\n"
                "• Monitor crops for heat stress symptoms — leaf curling, wilting\n"
                "• Consider light irrigation (sprinkler) to reduce canopy temperature\n"
                "• Ensure adequate ventilation in poultry sheds and cattle shelters"
            ),
        },
        "AUTHORITIES": {
            "title": "Heatwave Action Alert – {region}",
            "content": (
                "🏛️ Administrative Heatwave Action Alert for {region}\n\n"
                "Predicted temperature: {temp}°C\n\n"
                "Required Actions:\n"
                "• Activate heat action plan for the district\n"
                "• Ensure public cooling shelters are open and accessible\n"
                "• Increase water tanker deployment to vulnerable areas\n"
                "• Alert hospitals and PHCs to prepare for heat-related cases\n"
                "• Issue public announcements through loudspeakers and local media\n"
                "• Coordinate with disaster management teams\n"
                "• Monitor outdoor labour sites for compliance with rest guidelines"
            ),
        },
        "HEALTHCARE": {
            "title": "Heatwave Health Advisory – {region}",
            "content": (
                "🏥 Healthcare Heatwave Advisory for {region}\n\n"
                "Expected temperature: {temp}°C\n\n"
                "Clinical Guidance:\n"
                "• Prepare for increased cases of heat exhaustion and heatstroke\n"
                "• Stock adequate ORS packets, IV fluids, and cooling supplies\n"
                "• Set up dedicated heat illness triage areas\n"
                "• Train staff on rapid cooling protocols for heatstroke patients\n"
                "• Identify high-risk groups: elderly, children, outdoor workers, "
                "chronic disease patients\n"
                "• Ensure ambulance services are on standby\n"
                "• Share IEC material on heat illness prevention with communities"
            ),
        },
    },
    "SEVERE_HEATWAVE": {
        "CITIZENS": {
            "title": "🔴 SEVERE Heatwave Alert – {region}",
            "content": (
                "🔴 SEVERE Heatwave Emergency for {region}\n\n"
                "Extreme temperatures of {temp}°C expected. This is a life-threatening situation.\n\n"
                "URGENT Precautions:\n"
                "• STAY INDOORS — avoid ALL outdoor activity during 10 AM to 5 PM\n"
                "• Drink water continuously, even if not thirsty\n"
                "• Keep wet towels ready, use them to cool the body\n"
                "• Do NOT leave children or pets in parked vehicles\n"
                "• If you must go out, carry water, wear a hat, and take frequent breaks\n"
                "• Watch for danger signs: confusion, rapid heartbeat, no sweating despite heat\n\n"
                "EMERGENCY: Call 108/112 immediately if someone collapses or shows "
                "signs of heatstroke."
            ),
        },
        "FARMERS": {
            "title": "🔴 SEVERE Heatwave Farm Emergency – {region}",
            "content": (
                "🔴 Severe Heatwave Agricultural Emergency for {region}\n\n"
                "Extreme temperatures of {temp}°C predicted.\n\n"
                "Emergency Actions:\n"
                "• SUSPEND all farm labour during 10 AM to 5 PM\n"
                "• Provide emergency water and shade to all livestock\n"
                "• Move vulnerable animals to covered shelters\n"
                "• Apply emergency irrigation if water available\n"
                "• Do NOT use heavy machinery during peak hours\n"
                "• Contact local agriculture officer for crop insurance guidance\n"
                "• Harvest mature crops immediately if possible to prevent losses"
            ),
        },
        "AUTHORITIES": {
            "title": "🔴 SEVERE Heatwave Emergency Protocol – {region}",
            "content": (
                "🔴 SEVERE Heatwave Emergency Protocol for {region}\n\n"
                "Extreme temperatures: {temp}°C. Immediate action required.\n\n"
                "Emergency Protocols:\n"
                "• Declare heat emergency; activate NDRF/SDRF if needed\n"
                "• Order closure of outdoor work sites during peak hours\n"
                "• Deploy emergency cooling centres in all wards\n"
                "• Mandatory water distribution in slum areas and construction sites\n"
                "• Cancel outdoor public events and gatherings\n"
                "• Issue school closure advisory for primary schools\n"
                "• 24/7 heat helpline must be operational\n"
                "• Deploy medical rapid response teams in high-risk zones"
            ),
        },
        "HEALTHCARE": {
            "title": "🔴 SEVERE Heatwave Medical Emergency – {region}",
            "content": (
                "🔴 SEVERE Heatwave Medical Emergency for {region}\n\n"
                "Extreme temperatures: {temp}°C. Mass casualty preparedness required.\n\n"
                "Emergency Medical Protocol:\n"
                "• Activate mass casualty protocol for heat emergencies\n"
                "• All leave cancelled for emergency medicine staff\n"
                "• Set up ice bath / active cooling stations in all ERs\n"
                "• Pre-position ambulances in vulnerable areas\n"
                "• Stock cold IV fluids and prepare cooling blankets\n"
                "• Conduct mortality audits for all heat-related deaths\n"
                "• Deploy mobile medical units to outdoor labour sites\n"
                "• Report all heat illness cases to district surveillance unit"
            ),
        },
    },
}


def generate_advisory_content(
    region_name: str,
    severity: str,
    temperature: float,
    audience: str,
) -> dict:
    """
    Generate advisory content for a specific audience.
    
    This function can be replaced with an LLM-based generator later
    by keeping the same interface:
        Input: region, severity, temperature, audience
        Output: dict with title and content
    
    Args:
        region_name: Name of the affected region
        severity: HEATWAVE or SEVERE_HEATWAVE
        temperature: Predicted temperature
        audience: Target audience (CITIZENS, FARMERS, AUTHORITIES, HEALTHCARE)
    
    Returns:
        dict with 'title' and 'content' keys
    """
    severity_key = severity.upper()
    audience_key = audience.upper()

    templates = ADVISORY_TEMPLATES.get(severity_key, ADVISORY_TEMPLATES.get("HEATWAVE", {}))
    template = templates.get(audience_key, templates.get("CITIZENS", {
        "title": "Heatwave Advisory – {region}",
        "content": "Heatwave conditions expected in {region} with temperatures reaching {temp}°C. Take necessary precautions.",
    }))

    return {
        "title": template["title"].format(region=region_name, temp=temperature),
        "content": template["content"].format(region=region_name, temp=temperature),
    }


def generate_all_advisories(
    region_name: str,
    severity: str,
    temperature: float,
) -> List[dict]:
    """
    Generate advisories for all audience types.
    
    Returns a list of dicts, each with: audience, title, content
    """
    if severity == "NORMAL":
        return []

    audiences = ["CITIZENS", "FARMERS", "AUTHORITIES", "HEALTHCARE"]
    advisories = []

    for audience in audiences:
        advisory = generate_advisory_content(region_name, severity, temperature, audience)
        advisory["audience"] = audience
        advisory["severity"] = severity
        advisory["region_name"] = region_name
        advisories.append(advisory)

    return advisories
