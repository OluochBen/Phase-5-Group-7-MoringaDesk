# app/services/question_service.py
from .. import db
from ..models.question import Question
from sqlalchemy import or_

class QuestionService:
    @staticmethod
    def get_questions(page=1, per_page=10, problem_type=None, search=None):
        """
        Return paginated list of questions
        """
        query = Question.query

        if problem_type:
            query = query.filter_by(problem_type=problem_type)

        if search:
            like = f"%{search}%"
            query = query.filter(
                or_(Question.title.ilike(like), Question.description.ilike(like))
            )

        pagination = query.order_by(Question.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )

        return {
            "items": [q.to_dict() for q in pagination.items],
            "current_page": pagination.page,
            "pages": pagination.pages,
            "per_page": pagination.per_page,
            "total": pagination.total,
        }

    @staticmethod
    def get_question_by_id(question_id):
        """
        Fetch single question by ID
        """
        q = Question.query.get(question_id)
        if not q:
            return None
        return q.to_dict()

    @staticmethod
    def create_question(data, user_id):
        """
        Create and save a new question
        """
        try:
            q = Question(
                title=data.get("title"),
                description=data.get("description"),
                problem_type=data.get("problem_type", "technical"),
                user_id=user_id,
            )
            db.session.add(q)
            db.session.commit()
            return q.to_dict(), 201
        except Exception as e:
            db.session.rollback()
            return {"error": str(e)}, 400

    @staticmethod
    def follow_question(question_id, user_id):
        # (stub - optional implementation later)
        return {"message": "Follow not implemented"}, 200

    @staticmethod
    def unfollow_question(question_id, user_id):
        # (stub - optional implementation later)
        return {"message": "Unfollow not implemented"}, 200

    @staticmethod
    def link_related_questions(question_id, related_question_id):
        # (stub - optional implementation later)
        return {"message": "Related link not implemented"}, 200
