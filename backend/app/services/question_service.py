from ..models import User
from datetime import datetime

class QuestionService:
    @staticmethod
    def get_questions(page, per_page, problem_type=None, search=None):
        # Placeholder: return sample paginated data
        return {
            "questions": [
                {"id": 1, "title": "Sample Problem", "description": "Fix me", "problem_type": "technical"}
            ],
            "pages": 1,
            "current_page": page
        }

    @staticmethod
    def get_question_by_id(question_id):
        if question_id == 1:
            return {"id": 1, "title": "Sample Problem", "description": "Fix me", "problem_type": "technical"}
        return None

    @staticmethod
    def create_question(data, user_id):
        return {"id": 2, "title": data.get("title"), "description": data.get("description")}, 201

    @staticmethod
    def follow_question(question_id, user_id):
        return {"message": f"user {user_id} followed problem {question_id}"}, 200

    @staticmethod
    def unfollow_question(question_id, user_id):
        return {"message": f"user {user_id} unfollowed problem {question_id}"}, 200

    @staticmethod
    def link_related_questions(question_id, related_question_id):
        return {"message": f"linked {question_id} with {related_question_id}"}, 200
