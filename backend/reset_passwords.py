from app.db.session import SessionLocal, init_db
from app.models.user import User
from app.core.security import get_password_hash

def reset_all_passwords():
    init_db()
    db = SessionLocal()
    users = db.query(User).all()
    
    new_hash = get_password_hash("password123")
    print(f"Generated new bcrypt hash for 'password123': {new_hash}")
    
    for user in users:
        print(f"Resetting password for {user.email}")
        user.hashed_password = new_hash
        db.add(user)
        
    db.commit()
    db.close()
    print("Successfully reset all passwords to 'password123' using bcrypt.")

if __name__ == "__main__":
    reset_all_passwords()
