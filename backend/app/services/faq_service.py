import math
from datetime import datetime

from .. import db
from ..models import FAQ
from ..schemas import FAQCreateSchema
from marshmallow import ValidationError

_CURATED_FAQS = [
    {
        "id": "curated-1",
        "question": "How do I ask a good question on MoringaDesk?",
        "answer": (
            "To ask a great question:\\n"
            "1. Search first to avoid duplicates.\\n"
            "2. Write a clear, specific title.\\n"
            "3. Provide context and what you've tried so far.\\n"
            "4. Include relevant code samples or screenshots.\\n"
            "5. Tag your question for faster discovery.\\n"
            "6. Proofread before posting to keep it easy to read."
        ),
        "category": "Getting Started",
        "view_count": 1250,
        "helpful_count": 89,
        "tags": ["questions", "guidelines", "best-practices"],
        "created_at": datetime(2024, 1, 4, 9, 0, 0).isoformat(),
        "updated_at": datetime(2024, 1, 10, 9, 0, 0).isoformat(),
        "source": "curated",
    },
    {
        "id": "curated-2",
        "question": "What is the reputation system and how does it work?",
        "answer": (
            "Reputation reflects how helpful the community finds your contributions. "
            "Earn points when your answers receive upvotes, when a solution is marked as accepted, and "
            "when your questions spark valuable discussions. Higher reputation unlocks badges and moderation powers."
        ),
        "category": "Reputation",
        "view_count": 987,
        "helpful_count": 156,
        "tags": ["reputation", "community"],
        "created_at": datetime(2024, 1, 6, 10, 0, 0).isoformat(),
        "updated_at": datetime(2024, 1, 12, 10, 0, 0).isoformat(),
        "source": "curated",
    },
    {
        "id": "curated-3",
        "question": "How do I format code in my questions and answers?",
        "answer": (
            "Wrap short snippets in backticks and longer blocks with triple backticks (```code```). "
            "Use the toolbar to add syntax highlighting, keep indentation consistent, and comment your code "
            "so reviewers can understand the context quickly."
        ),
        "category": "Formatting",
        "view_count": 756,
        "helpful_count": 234,
        "tags": ["formatting", "markdown"],
        "created_at": datetime(2024, 1, 7, 11, 0, 0).isoformat(),
        "updated_at": datetime(2024, 1, 8, 11, 0, 0).isoformat(),
        "source": "curated",
    },
    {
        "id": "curated-4",
        "question": "Can I edit my questions and answers after posting?",
        "answer": (
            "Yes. Use the edit button to clarify your question, add missing details, or improve an answer. "
            "Edits are versioned, so facilitators can review history and see how the post evolved over time."
        ),
        "category": "Editing",
        "view_count": 432,
        "helpful_count": 67,
        "tags": ["editing", "workflow"],
        "created_at": datetime(2024, 1, 9, 12, 0, 0).isoformat(),
        "updated_at": datetime(2024, 1, 14, 12, 0, 0).isoformat(),
        "source": "curated",
    },
    {
        "id": "curated-5",
        "question": "What should I do if my question is marked as duplicate?",
        "answer": (
            "Review the linked question for an existing solution. If your scenario is different, add a comment explaining "
            "what makes it unique, or update your post with extra context. Moderators can reopen questions when they see new insights."
        ),
        "category": "Moderation",
        "view_count": 543,
        "helpful_count": 89,
        "tags": ["moderation", "support"],
        "created_at": datetime(2024, 1, 5, 8, 30, 0).isoformat(),
        "updated_at": datetime(2024, 1, 11, 8, 30, 0).isoformat(),
        "source": "curated",
    },
]


class FAQService:
    @staticmethod
    def _combined_faqs():
        curated_items = [dict(item) for item in _CURATED_FAQS]

        query = FAQ.query.order_by(FAQ.created_at.desc())
        community_items = []
        for row in query.all():
            item = row.to_dict()
            item.setdefault("category", "Community")
            item.setdefault("view_count", 0)
            item.setdefault("helpful_count", 0)
            item.setdefault("tags", [])
            item.setdefault("updated_at", item.get("created_at"))
            item["source"] = "community"
            community_items.append(item)

        return curated_items + community_items

    @staticmethod
    def create_faq(data, user_id):
        """Create a new FAQ"""
        schema = FAQCreateSchema()
        try:
            validated_data = schema.load(data)
        except ValidationError as err:
            return {'error': err.messages}, 400
        
        faq = FAQ(
            question=validated_data['question'],
            answer=validated_data['answer'],
            created_by=user_id
        )
        
        db.session.add(faq)
        db.session.commit()
        
        return faq.to_dict(), 201
    
    @staticmethod
    def get_faqs(page=1, per_page=10, search=None, category=None):
        """Get paginated list of FAQs with curated MoringaDesk items first."""
        try:
            page = int(page)
        except (TypeError, ValueError):
            page = 1
        try:
            per_page = int(per_page)
        except (TypeError, ValueError):
            per_page = 10

        page = max(page, 1)
        per_page = max(per_page, 1)

        search_term = (search or "").strip().lower()
        category_filter = (category or "").strip().lower()
        if category_filter == "all":
            category_filter = ""

        combined = FAQService._combined_faqs()

        def matches_filters(item):
            if search_term:
                haystack = f"{item.get('question', '')} {item.get('answer', '')}".lower()
                if search_term not in haystack:
                    return False
            if category_filter:
                if (item.get("category") or "").lower() != category_filter:
                    return False
            return True

        filtered = [item for item in combined if matches_filters(item)]
        total = len(filtered)
        pages = max(1, math.ceil(total / per_page)) if total else 1

        current_page = min(page, pages)
        start = (current_page - 1) * per_page
        end = start + per_page
        paginated = filtered[start:end]

        return {
            "faqs": paginated,
            "total": total,
            "pages": pages,
            "current_page": current_page,
        }

    @staticmethod
    def get_stats():
        items = FAQService._combined_faqs()
        total_views = sum(item.get("view_count") or 0 for item in items)
        total_helpful = sum(item.get("helpful_count") or 0 for item in items)

        category_totals = {}
        for item in items:
            category = (item.get("category") or "General").strip()
            category_totals[category] = category_totals.get(category, 0) + 1

        categories = [
            {"name": name, "count": count}
            for name, count in sorted(
                category_totals.items(), key=lambda entry: entry[1], reverse=True
            )
        ]

        return {
            "total_faqs": len(items),
            "total_views": total_views,
            "total_helpful": total_helpful,
            "category_count": len(category_totals),
            "categories": categories,
        }

    @staticmethod
    def record_view(faq_id):
        items = FAQService._combined_faqs()
        target = next((item for item in items if str(item.get("id")) == str(faq_id)), None)
        if not target:
            return {"view_count": 0}
        current = target.get("view_count") or 0
        return {"view_count": current + 1}

    @staticmethod
    def mark_helpful(faq_id):
        items = FAQService._combined_faqs()
        target = next((item for item in items if str(item.get("id")) == str(faq_id)), None)
        if not target:
            return {"helpful_count": 0}
        current = target.get("helpful_count") or 0
        return {"helpful_count": current + 1}
    
    @staticmethod
    def get_faq_by_id(faq_id):
        """Get FAQ by ID"""
        faq = FAQ.query.get(faq_id)
        if not faq:
            return None
        
        return faq.to_dict()
    
    @staticmethod
    def update_faq(faq_id, data, user_id):
        """Update an FAQ"""
        faq = FAQ.query.get(faq_id)
        if not faq:
            return {'error': 'FAQ not found'}, 404
        
        schema = FAQCreateSchema()
        try:
            validated_data = schema.load(data)
        except ValidationError as err:
            return {'error': err.messages}, 400
        
        faq.question = validated_data['question']
        faq.answer = validated_data['answer']
        
        db.session.commit()
        
        return faq.to_dict(), 200
    
    @staticmethod
    def delete_faq(faq_id):
        """Delete an FAQ"""
        faq = FAQ.query.get(faq_id)
        if not faq:
            return {'error': 'FAQ not found'}, 404
        
        db.session.delete(faq)
        db.session.commit()
        
        return {'message': 'FAQ deleted successfully'}, 200
