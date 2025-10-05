# force_sqlite_fix.py
import os
from app import create_app, db
from app.models import User

# Override to ensure SQLite
os.environ['DATABASE_URL'] = 'sqlite:///moringadesk.db'

app = create_app()

with app.app_context():
    print("🔄 Setting up SQLite database...")
    print(f"📊 Using database: {app.config['SQLALCHEMY_DATABASE_URI']}")
    
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
            
        # Test the user
        test_admin = User.query.filter_by(email="admin@example.com").first()
        if test_admin and test_admin.check_password("admin123"):
            print("✅ Password verification works!")
        else:
            print("❌ Password issue")
            
        print("🎉 SQLite database setup complete!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()