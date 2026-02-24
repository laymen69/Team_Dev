import os
import sys
import json
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.user import User
from app.models.gms import GMS

def sync_data_to_seed():
    db = SessionLocal()
    try:
        # 1. Fetch Users
        users_db = db.query(User).all()
        users_list = []
        for u in users_db:
            users_list.append({
                "email": u.email,
                "first_name": u.first_name,
                "last_name": u.last_name,
                "hashed_password": u.hashed_password, # Store the actual hash
                "role": u.role
            })

        # 2. Fetch GMS Stores
        gms_db = db.query(GMS).all()
        gms_list = []
        for g in gms_db:
            gms_list.append({
                "name": g.name,
                "address": g.address,
                "latitude": g.latitude,
                "longitude": g.longitude,
                "city": g.city,
                "type": g.type
            })

        # 3. Read seed_db.py
        seed_path = "seed_db.py"
        with open(seed_path, "r", encoding="utf-8") as f:
            lines = f.readlines()

        # 4. Find and replace blocks
        # This is a bit brute force but works for this specific file structure
        new_lines = []
        in_users_block = False
        in_gms_block = False
        users_replaced = False
        gms_replaced = False

        i = 0
        while i < len(lines):
            line = lines[i]
            
            # Start of users block
            if "users = [" in line and not users_replaced:
                new_lines.append(f"    users = {json.dumps(users_list, indent=8)}\n")
                # Skip until closing bracket
                while "]" not in lines[i]:
                    i += 1
                users_replaced = True
            
            # Start of GMS block
            elif "gms_stores = [" in line and not gms_replaced:
                new_lines.append(f"    gms_stores = {json.dumps(gms_list, indent=8)}\n")
                # Skip until closing bracket
                while "]" not in lines[i]:
                    i += 1
                gms_replaced = True
            
            else:
                new_lines.append(line)
            
            i += 1

        # 5. Write back to seed_db.py
        with open(seed_path, "w", encoding="utf-8") as f:
            f.writelines(new_lines)

        print(f"Successfully synced {len(users_list)} users and {len(gms_list)} stores to seed_db.py")

    except Exception as e:
        print(f"Error syncing data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    sync_data_to_seed()
