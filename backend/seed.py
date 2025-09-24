#!/usr/bin/env python3
"""
Seed script for MoringaDesk database
Run this script to populate the database with initial data
"""

from app import create_app, db
from app.models import User, Tag, FAQ
import sys

def seed_database():
    """Seed the database with initial data"""
    app = create_app()
    
    with app.app_context():
        # Tables are already created by migrations
        # No need to call db.create_all()
        
        # Create admin user
        admin_user = User(
            name='Admin User',
            email='admin@moringadesk.com',
            role='admin'
        )
        admin_user.set_password('admin123')
        
        # Check if admin already exists
        existing_admin = User.query.filter_by(email='admin@moringadesk.com').first()
        if not existing_admin:
            db.session.add(admin_user)
            print("✓ Created admin user")
        else:
            print("✓ Admin user already exists")
        
        # Create sample student user
        student_user = User(
            name='John Doe',
            email='john@example.com',
            role='student'
        )
        student_user.set_password('password123')
        
        existing_student = User.query.filter_by(email='john@example.com').first()
        if not existing_student:
            db.session.add(student_user)
            print("✓ Created sample student user")
        else:
            print("✓ Sample student user already exists")
        
        # Create initial tags
        tags_data = [
            'python', 'javascript', 'react', 'flask', 'django',
            'html', 'css', 'sql', 'git', 'algorithms',
            'data-structures', 'debugging', 'testing', 'deployment',
            'api', 'database', 'frontend', 'backend', 'fullstack'
        ]
        
        for tag_name in tags_data:
            existing_tag = Tag.query.filter_by(name=tag_name).first()
            if not existing_tag:
                tag = Tag(name=tag_name)
                db.session.add(tag)
                print(f"✓ Created tag: {tag_name}")
            else:
                print(f"✓ Tag already exists: {tag_name}")
        
        # Create sample FAQs
        faqs_data = [
            {
                'question': 'How do I get started with Python?',
                'answer': 'Start by installing Python from python.org, then learn basic syntax, variables, and control structures. Practice with simple projects and gradually move to more complex ones.'
            },
            {
                'question': 'What is the difference between frontend and backend?',
                'answer': 'Frontend refers to the user interface and user experience (what users see and interact with), while backend refers to the server-side logic, databases, and APIs that power the application.'
            },
            {
                'question': 'How do I debug my code effectively?',
                'answer': 'Use print statements, debuggers, and logging. Read error messages carefully, check your syntax, and test your code incrementally. Don\'t hesitate to ask for help when stuck.'
            },
            {
                'question': 'What are the best practices for version control?',
                'answer': 'Commit frequently with descriptive messages, use branches for features, keep commits focused on single changes, and always pull before pushing to avoid conflicts.'
            },
            {
                'question': 'How do I choose the right programming language?',
                'answer': 'Consider your project requirements, learning goals, community support, job market demand, and personal interest. Start with one language and master it before moving to others.'
            }
        ]
        
        for faq_data in faqs_data:
            existing_faq = FAQ.query.filter_by(question=faq_data['question']).first()
            if not existing_faq:
                faq = FAQ(
                    question=faq_data['question'],
                    answer=faq_data['answer'],
                    created_by=admin_user.id if not existing_admin else existing_admin.id
                )
                db.session.add(faq)
                print(f"✓ Created FAQ: {faq_data['question'][:50]}...")
            else:
                print(f"✓ FAQ already exists: {faq_data['question'][:50]}...")
        
        # Commit all changes
        db.session.commit()
        print("\n🎉 Database seeded successfully!")
        print("\nSample accounts created:")
        print("Admin: admin@moringadesk.com / admin123")
        print("Student: john@example.com / password123")

if __name__ == '__main__':
    try:
        seed_database()
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        sys.exit(1)
