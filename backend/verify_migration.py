import os
import sys
import requests
from sqlalchemy import create_engine, MetaData, select, func
from dotenv import load_dotenv

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from config import get_settings

load_dotenv(override=True)
settings = get_settings()

API_BASE = "http://localhost:8000"

def verify_db():
    print("=== DB Verification ===")
    url = str(settings.DATABASE_URL)
    dialect = url.split("://")[0]
    
    # Mask URL carefully to not expose credentials
    if "@" in url:
        masked_url = dialect + "://***:***@" + url.split("@")[-1]
    else:
        masked_url = "***"
        
    print(f"DIALECT: {dialect}")
    print(f"DATABASE: {masked_url}")
    
    engine = create_engine(url)
    meta = MetaData()
    meta.reflect(bind=engine)
    
    tables = list(meta.tables.keys())
    print(f"TABLES: {', '.join(tables)}")
    
    counts = {}
    with engine.connect() as conn:
        for t_name in tables:
            t = meta.tables[t_name]
            counts[t_name] = conn.scalar(select(func.count()).select_from(t))
    
    print(f"ROW_COUNTS: {counts}")
    return counts

def verify_api():
    print("=== API Verification ===")
    
    # Login
    resp = requests.post(f"{API_BASE}/api/auth/login", json={"username": "meteorologist", "password": "met123"})
    if resp.status_code != 200:
        print(f"AUTH: FAILED - {resp.text}")
        return False
        
    token = resp.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}
    print("AUTH: OK")
    
    endpoints = [
        "/api/dashboard",
        "/api/alerts",
        "/api/stations",
        "/api/forecasts",
        "/api/heatwaves",
        "/api/advisories",
        "/api/validation"
    ]
    
    all_ok = True
    for ep in endpoints:
        r = requests.get(f"{API_BASE}{ep}", headers=headers)
        if r.status_code != 200:
            print(f"GET {ep} FAILED: {r.status_code} {r.text}")
            all_ok = False
        else:
            pass # print(f"GET {ep} OK")
            
    # POST advisories generate
    r_gen = requests.post(f"{API_BASE}/api/advisories/generate", json={
        "region_name": "Delhi",
        "severity": "SEVERE_HEATWAVE",
        "temperature": 45.0
    }, headers=headers)
    if r_gen.status_code == 200:
        generated = r_gen.json()
        if generated and isinstance(generated, list):
            adv_id = generated[0]["id"]
            r_app = requests.post(f"{API_BASE}/api/advisories/{adv_id}/approve", headers=headers)
            if r_app.status_code != 200:
                print(f"POST /api/advisories/{{id}}/approve FAILED: {r_app.text}")
                all_ok = False
    else:
        print(f"POST /api/advisories/generate FAILED: {r_gen.text}")
        all_ok = False
        
    # POST forecasts generate
    r_fcast = requests.post(f"{API_BASE}/api/forecasts/generate", json={"region_ids": []}, headers=headers)
    if r_fcast.status_code not in [200, 404]: # if 404, it might not exist
        print(f"POST /api/forecasts/generate FAILED: {r_fcast.text}")
        all_ok = False
        
    if all_ok:
        print("API_TESTS: OK")
    else:
        print("API_TESTS: FAILED")

if __name__ == "__main__":
    verify_db()
    verify_api()
