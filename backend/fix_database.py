# fix_database.py
import os
import sys
from app import create_app, db

# Import from the app directory
try:
    from app.models import User
    print("✅ Successfully imported User from app.models")
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("🔍 Checking what's in app directory...")
    print("Files in app directory:", os.listdir('app'))
    sys.exit(1)

def setup_database():
    app = create_app()
    
    with app.app_context():
        print("🔄 Setting up SQLite database...")
        
        try:
            # Create all tables
            db.create_all()
            print("✅ Tables created successfully!")
            
            # Create admin user
            admin = User.query.filter_by(email="admin@example.com").first()
            if not admin:
                admin = User(
                    name="Admin",
                    email="admin@example.com",
                    role="admin"
                )
                admin.set_password("admin123")
                db.session.add(admin)
                db.session.commit()
                print("✅ Admin user created: admin@example.com / admin123")
            else:
                print("✅ Admin user already exists")
                
            print("🎉 Database setup complete!")
            return True
            
        except Exception as e:
            print(f"❌ Error: {e}")
            import traceback
            traceback.print_exc()
            return False

if __name__ == "__main__":
    setup_database()