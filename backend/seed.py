#!/usr/bin/env python3
"""
Seed script for MoringaDesk database
Run this script to populate the database with initial data
"""

from datetime import datetime, timedelta

from app import create_app, db
from app.models import User, Tag, FAQ, Question, Solution, BlogPost, Feedback
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
                "question": "What is MoringaDesk?",
                "answer": (
                    "MoringaDesk is the central hub for Moringa School learners, alumni, and mentors. "
                    "It lets you ask questions, share solutions, and collaborate across cohorts in one place."
                ),
                "category": "Getting Started",
                "tags": ["overview", "community"],
            },
            {
                "question": "How do I earn reputation on MoringaDesk?",
                "answer": (
                    "Contribute valuable answers, have your solutions accepted, and receive upvotes from the community. "
                    "Reputation helps showcase your expertise to facilitators and peers."
                ),
                "category": "Reputation",
                "tags": ["reputation", "contributions"],
            },
            {
                "question": "Can I track updates from my cohort?",
                "answer": (
                    "Follow questions from your classmates, enable notifications, and join discussions to stay in sync. "
                    "Facilitators can also highlight important threads for your cohort."
                ),
                "category": "Collaboration",
                "tags": ["cohort", "notifications"],
            },
            {
                "question": "How do I report inappropriate content?",
                "answer": (
                    "Use the report button on any question or answer. The moderation team reviews every report and "
                    "keeps you updated on the resolution."
                ),
                "category": "Moderation",
                "tags": ["moderation", "support"],
            },
            {
                "question": "Does MoringaDesk work on mobile?",
                "answer": (
                    "Yes. MoringaDesk is responsive and works on any modern mobile browser. "
                    "Add it to your home screen for quick access."
                ),
                "category": "Product",
                "tags": ["mobile", "accessibility"],
            },
        ]

        for faq in faqs_data:
            existing_faq = FAQ.query.filter_by(question=faq["question"]).first()
            if not existing_faq:
                db.session.add(
                    FAQ(
                        question=faq["question"],
                        answer=faq["answer"],
                        category=faq.get("category", "General"),
                        tags=faq.get("tags", []),
                        created_by=admin_user.id,
                    )
                )
                print(f"✓ Created FAQ: {faq['question'][:50]}...")
            else:
                existing_faq.category = faq.get("category", existing_faq.category)
                existing_faq.tags = faq.get("tags", existing_faq.tags or [])
                print(f"✓ FAQ already exists: {faq['question'][:50]}...")

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

        # --- Blog Posts ---
        blog_posts = [
            {
                "slug": "welcome-to-moringadesk",
                "title": "Welcome to MoringaDesk",
                "excerpt": "How a simple idea grew into the knowledge base that keeps every cohort connected.",
                "content": (
                    "MoringaDesk began as a student-led initiative to preserve the best answers from our cohorts. "
                    "Today it brings facilitators, alumni, and current learners together. In this post we share "
                    "why we built it, how it works, and where the community is headed next.\n\n"
                    "Expect regular posts with facilitation tips, alumni stories, product updates, and deep dives "
                    "into how we support collaborative learning."
                ),
                "cover_image": "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80",
                "days_ago": 14,
            },
            {
                "slug": "five-ways-to-get-answers-faster",
                "title": "Five ways to get answers faster on MoringaDesk",
                "excerpt": "Quick wins that help your peers and mentors spot tough questions and jump in quickly.",
                "content": (
                    "Getting a response quickly starts with how you ask. Include the problem statement, "
                    "what you have tried, and any error messages. Tag your question with the relevant stack "
                    "so the right people see it. And remember to mark accepted answers—doing so signals that "
                    "solutions work and keeps our catalog tidy.\n\n"
                    "In this guide we outline five habits that have helped cohorts resolve blockers in hours, not days."
                ),
                "cover_image": "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&w=1200&q=80",
                "days_ago": 7,
            },
            {
                "slug": "facilitator-spotlight-anne-w",
                "title": "Facilitator spotlight: Anne W.",
                "excerpt": "Meet Anne, a facilitator helping learners master debugging and pair programming.",
                "content": (
                    "Anne has guided dozens of Moringa cohorts through intense sprints. She shares why she leans "
                    "on MoringaDesk to capture recurring blockers, how she encourages learners to document what they "
                    "discover, and tips for keeping morale high.\n\n"
                    "\"The more our students document, the faster the next cohort thrives,\" she says. "
                    "Read on for her playbook."
                ),
                "cover_image": "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=1200&q=80",
                "days_ago": 3,
            },
        ]

        for post in blog_posts:
            existing_post = BlogPost.query.filter_by(slug=post["slug"]).first()
            if existing_post:
                continue

            published_at = datetime.utcnow() - timedelta(days=post.get("days_ago", 0))
            new_post = BlogPost(
                title=post["title"],
                slug=post["slug"],
                excerpt=post["excerpt"],
                content=post["content"],
                cover_image=post.get("cover_image"),
                status="published",
                published_at=published_at,
                author_id=admin_user.id,
            )
            db.session.add(new_post)
            print(f"✓ Created blog post: {post['title']}")

        # --- Feedback samples ---
        feedback_samples = [
            {
                "feedback_type": "bug",
                "title": "Images fail to load on Safari",
                "description": "Screenshots attached to questions sometimes fail to load on Safari 16.",
                "priority": "high",
                "status": "reviewing",
                "contact_name": "Jane",
                "contact_email": "jane@example.com",
            },
            {
                "feedback_type": "feature",
                "title": "Add dark mode",
                "description": "It would be great to match IDE themes with a native dark mode option.",
                "priority": "normal",
                "status": "open",
                "contact_name": "Ali",
                "contact_email": "ali@example.com",
            },
        ]

        for item in feedback_samples:
            existing_feedback = Feedback.query.filter_by(title=item["title"]).first()
            if existing_feedback:
                existing_feedback.description = item["description"]
                existing_feedback.priority = item["priority"]
                existing_feedback.status = item["status"]
                existing_feedback.contact_name = item.get("contact_name")
                existing_feedback.contact_email = item.get("contact_email")
                print(f"✓ Feedback already exists: {item['title']}")
            else:
                db.session.add(Feedback(**item))
                print(f"✓ Created feedback entry: {item['title']}")

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
