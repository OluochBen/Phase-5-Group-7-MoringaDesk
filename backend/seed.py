#!/usr/bin/env python3
"""
Seed script for MoringaDesk database
Run this script to populate the database with initial data
"""

from app import create_app, db
from app.models import User, Tag, FAQ, Question, Solution
import sys

def seed_database():
    """Seed the database with initial data"""
    app = create_app()
    
    with app.app_context():
        # --- Admin User ---
        admin_email = "admin@moringadesk.com"
        admin_user = User.query.filter_by(email=admin_email).first()

        if not admin_user:
            admin_user = User(
                name="Admin User",
                email=admin_email,
                role="admin"
            )
            admin_user.set_password("admin123")
            db.session.add(admin_user)
            print("✓ Created admin user")
        else:
            # Ensure role is admin
            admin_user.role = "admin"
            print("✓ Admin user already exists, role reset to admin")

        # --- Student User ---
        student_email = "john@example.com"
        student_user = User.query.filter_by(email=student_email).first()

        if not student_user:
            student_user = User(
                name="John Doe",
                email=student_email,
                role="student"
            )
            student_user.set_password("password123")
            db.session.add(student_user)
            print("✓ Created sample student user")
        else:
            print("✓ Sample student user already exists")

        db.session.commit()  # commit users so we can reference their IDs

        # --- Tags ---
        tags_data = [
            'python', 'javascript', 'react', 'flask', 'django',
            'html', 'css', 'sql', 'git', 'algorithms',
            'data-structures', 'debugging', 'testing', 'deployment',
            'api', 'database', 'frontend', 'backend', 'fullstack'
        ]
        
        for tag_name in tags_data:
            if not Tag.query.filter_by(name=tag_name).first():
                db.session.add(Tag(name=tag_name))
                print(f"✓ Created tag: {tag_name}")

        # --- FAQs ---
        faqs_data = [
            {
                "question": "How do I get started with Python?",
                "answer": "Install Python from python.org and learn basics."
            },
            {
                "question": "What is the difference between frontend and backend?",
                "answer": "Frontend is the UI; backend is the server and database."
            },
            {
                "question": "How do I debug my code effectively?",
                "answer": "Use print, debuggers, logs, and incremental testing."
            },
            {
                "question": "What are the best practices for version control?",
                "answer": "Commit often, use branches, and pull before pushing."
            },
            {
                "question": "How do I choose the right programming language?",
                "answer": "Depends on project, goals, demand, and community support."
            }
        ]

        for faq in faqs_data:
            if not FAQ.query.filter_by(question=faq["question"]).first():
                db.session.add(FAQ(
                    question=faq["question"],
                    answer=faq["answer"],
                    created_by=admin_user.id
                ))
                print(f"✓ Created FAQ: {faq['question'][:50]}...")

        db.session.commit()

        # --- Sample Questions ---
        questions_data = [
            {
                "title": "How do I reverse a list in Python?",
                "description": "I want to reverse a list without using the reverse() method.",
                "problem_type": "python",
                "user_id": student_user.id
            },
            {
                "title": "What is the difference between var, let, and const in JavaScript?",
                "description": "Can someone explain the differences in scope and usage?",
                "problem_type": "javascript",
                "user_id": student_user.id
            },
            {
                "title": "How to connect Flask to a SQLite database?",
                "description": "I'm new to Flask. How do I set up a simple SQLite database?",
                "problem_type": "flask",
                "user_id": admin_user.id
            }
        ]

        created_questions = []
        for q in questions_data:
            existing_q = Question.query.filter_by(title=q["title"]).first()
            if not existing_q:
                new_q = Question(**q)
                db.session.add(new_q)
                created_questions.append(new_q)
                print(f"✓ Created question: {q['title']}")
            else:
                created_questions.append(existing_q)
                print(f"✓ Question already exists: {q['title']}")

        db.session.commit()

        # --- Sample Solutions ---
        solutions_data = [
            {
                "content": "You can reverse a list in Python using slicing: `my_list[::-1]`",
                "question": created_questions[0],
                "user_id": admin_user.id
            },
            {
                "content": "`var` is function-scoped, `let` and `const` are block-scoped. `const` cannot be reassigned.",
                "question": created_questions[1],
                "user_id": admin_user.id
            },
            {
                "content": "In Flask, configure `SQLALCHEMY_DATABASE_URI = 'sqlite:///app.db'` in your app config and use SQLAlchemy.",
                "question": created_questions[2],
                "user_id": student_user.id
            }
        ]

        for sol in solutions_data:
            existing_sol = Solution.query.filter_by(content=sol["content"]).first()
            if not existing_sol:
                db.session.add(Solution(
                    content=sol["content"],
                    question_id=sol["question"].id,
                    user_id=sol["user_id"]
                ))
                print(f"✓ Created solution for: {sol['question'].title}")

        # --- Commit all changes ---
        db.session.commit()
        print("\n🎉 Database seeded successfully!")
        print("\nSample accounts created/updated:")
        print("Admin: admin@moringadesk.com / admin123")
        print("Student: john@example.com / password123")

if __name__ == '__main__':
    try:
        seed_database()
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        sys.exit(1)
