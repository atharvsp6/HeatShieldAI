import os
import sys
import sqlalchemy
from sqlalchemy import create_engine, MetaData, select, func
from dotenv import load_dotenv

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import Base
import models.models  # Ensure models are loaded into Base.metadata

def get_postgres_url():
    """Retrieve the PostgreSQL URL from the environment or .env file"""
    load_dotenv()
    url = os.environ.get("POSTGRES_URL")
    if not url:
        print("ERROR: POSTGRES_URL environment variable is not set.")
        print("Please provide the Supabase PostgreSQL connection string.")
        sys.exit(1)
        
    # Ensure it uses the modern psycopg driver for SQLAlchemy
    if url.startswith("postgresql://") or url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+psycopg://", 1)
        url = url.replace("postgresql://", "postgresql+psycopg://", 1)
        
    return url

def migrate():
    # 1. Connections
    sqlite_url = "sqlite:///./heatshield.db"
    pg_url = get_postgres_url()
    
    print(f"[*] Connecting to local SQLite database...")
    sqlite_engine = create_engine(sqlite_url)
    
    print(f"[*] Connecting to PostgreSQL database...")
    pg_engine = create_engine(pg_url)
    
    # 2. Schema Creation
    print(f"[*] Creating schema in PostgreSQL if not exists...")
    Base.metadata.create_all(bind=pg_engine)
    
    # 3. Data Transfer
    sqlite_meta = MetaData()
    sqlite_meta.reflect(bind=sqlite_engine)
    
    # We iterate over sorted_tables to respect foreign key constraints
    sorted_tables = Base.metadata.sorted_tables
    
    sqlite_conn = sqlite_engine.connect()
    pg_conn = pg_engine.connect()
    
    for table in sorted_tables:
        print(f"\n--- Migrating table: {table.name} ---")
        
        # Read all rows from SQLite
        sqlite_table = sqlite_meta.tables[table.name]
        records = sqlite_conn.execute(sqlite_table.select()).fetchall()
        
        if not records:
            print(f"  [i] No records found in SQLite. Skipping.")
            continue
            
        print(f"  [+] Found {len(records)} records in SQLite.")
        
        # Convert records to list of dicts for fast insertion
        keys = sqlite_table.columns.keys()
        data = [dict(zip(keys, row)) for row in records]
        
        # Insert into PostgreSQL
        try:
            with pg_conn.begin():
                # We can't use table.insert() safely on all drivers if it conflicts, 
                # but since it's a fresh DB, standard insert is fine.
                # However, if there are existing rows, we should either truncate or abort.
                
                # First, check if the table is empty in Postgres
                existing_count = pg_conn.scalar(select(func.count()).select_from(table))
                if existing_count > 0:
                    print(f"  [!] Postgres table '{table.name}' already contains {existing_count} rows.")
                    print(f"  [!] TRUNCATING Postgres table '{table.name}' before migration...")
                    # Using CASCADE to safely truncate tables with foreign keys
                    pg_conn.execute(sqlalchemy.text(f'TRUNCATE TABLE {table.name} CASCADE'))
                
                print(f"  [>] Inserting {len(data)} records into PostgreSQL...")
                pg_conn.execute(table.insert(), data)
                
                # Fix the primary key sequence
                if 'id' in keys:
                    seq_sql = sqlalchemy.text(f"SELECT setval(pg_get_serial_sequence('{table.name}', 'id'), COALESCE(MAX(id), 1)) FROM {table.name};")
                    pg_conn.execute(seq_sql)
                    print(f"  [>] Reset primary key sequence for {table.name}.id")
                    
        except Exception as e:
            print(f"  [ERROR] Failed to migrate table {table.name}: {e}")
            sys.exit(1)
            
        # 4. Verification
        with pg_conn.begin():
            pg_count = pg_conn.scalar(select(func.count()).select_from(table))
            
        print(f"  [OK] Verification: Postgres row count = {pg_count}")
        if len(records) != pg_count:
            print(f"  [ERROR] Row count mismatch! SQLite had {len(records)}, Postgres has {pg_count}")
            sys.exit(1)

    sqlite_conn.close()
    pg_conn.close()
    
    print("\n=======================================================")
    print("[SUCCESS] Data migration completed successfully!")
    print("=======================================================\n")

if __name__ == "__main__":
    migrate()
