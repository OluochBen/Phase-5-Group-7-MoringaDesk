from sqlalchemy import or_
from sqlalchemy.orm import joinedload

from .. import db
from ..models.question import Question
from ..models.tag import Tag
from ..models.user import User
from ..models.follow import Follow
from ..models.related_question import RelatedQuestion
from ..models.solution import Solution
from ..schemas.question_schema import QuestionCreateSchema
from marshmallow import ValidationError

from .solution_service import SolutionService


class QuestionService:
    @staticmethod
    def _base_query():
        return Question.query.options(
            joinedload(Question.author),
            joinedload(Question.tags),
            joinedload(Question.solutions).joinedload(Solution.author),
            joinedload(Question.solutions).joinedload(Solution.votes),
            joinedload(Question.follows),
            joinedload(Question.related_questions).joinedload(Question.author),
            joinedload(Question.related_questions).joinedload(Question.tags),
            joinedload(Question.related_questions).joinedload(Question.follows),
            joinedload(Question.related_questions).joinedload(Question.solutions),
            joinedload(Question.related_to).joinedload(Question.author),
            joinedload(Question.related_to).joinedload(Question.tags),
            joinedload(Question.related_to).joinedload(Question.follows),
            joinedload(Question.related_to).joinedload(Question.solutions),
        )

    @staticmethod
    def _serialize_question(question, include_answers=False, current_user_id=None):
        tags = [tag.name for tag in getattr(question, "tags", [])]
        author = question.author.to_dict() if getattr(question, "author", None) else None

        created_at = question.created_at.isoformat() if question.created_at else None
        updated_at = question.updated_at.isoformat() if question.updated_at else None
        base = {
            "id": question.id,
            "user_id": question.user_id,
            "title": question.title,
            "description": question.description,
            "body": question.description,
            "problem_type": question.problem_type,
            "created_at": created_at,
            "updated_at": updated_at,
            "timestamp": created_at,
            "author": author,
            "authorId": author.get("id") if author else question.user_id,
            "authorName": author.get("name") if author else None,
            "tags": tags,
            "solutions_count": len(question.solutions),
            "follows_count": len(question.follows),
        }

        if include_answers:
            ordered_solutions = sorted(
                question.solutions,
                key=lambda sol: (sol.created_at.timestamp() if sol.created_at else 0),
            )
            base["answers"] = [
                SolutionService._serialize_solution(solution, current_user_id=current_user_id)
                for solution in ordered_solutions
            ]

        if current_user_id is not None:
            base["is_following"] = any(f.user_id == current_user_id for f in question.follows)

        related_candidates = []
        seen_related_ids = set()

        for related in list(getattr(question, "related_questions", [])) + list(
            getattr(question, "related_to", [])
        ):
            if not related or related.id == question.id or related.id in seen_related_ids:
                continue
            seen_related_ids.add(related.id)

            related_author = related.author.to_dict() if getattr(related, "author", None) else None
            related_created = related.created_at.isoformat() if related.created_at else None
            related_updated = related.updated_at.isoformat() if related.updated_at else None

            related_candidates.append(
                {
                    "id": related.id,
                    "title": related.title,
                    "description": related.description,
                    "problem_type": related.problem_type,
                    "tags": [tag.name for tag in getattr(related, "tags", [])],
                    "follows_count": len(getattr(related, "follows", [])),
                    "solutions_count": len(getattr(related, "solutions", [])),
                    "author": related_author,
                    "authorId": related_author.get("id") if related_author else related.user_id,
                    "authorName": related_author.get("name") if related_author else None,
                    "created_at": related_created,
                    "updated_at": related_updated,
                    "timestamp": related_created,
                    "is_direct_related": True,
                }
            )

        if related_candidates:
            base["related_questions"] = related_candidates

        return base

    @staticmethod
    def get_questions(page=1, per_page=10, problem_type=None, search=None, current_user_id=None, created_by=None):
        """Return paginated list of questions."""

        query = QuestionService._base_query()

        if problem_type:
            query = query.filter(Question.problem_type == problem_type)

        if search:
            like = f"%{search}%"
            query = query.filter(or_(Question.title.ilike(like), Question.description.ilike(like)))

        if created_by:
            query = query.filter(Question.user_id == created_by)

        query = query.order_by(Question.created_at.desc())
        pagination = db.paginate(query, page=page, per_page=per_page, error_out=False)

        items = [
            QuestionService._serialize_question(question, include_answers=False, current_user_id=current_user_id)
            for question in pagination.items
        ]

        return {
            "items": items,
            "current_page": pagination.page,
            "pages": pagination.pages,
            "per_page": pagination.per_page,
            "total": pagination.total,
        }

    @staticmethod
    def get_question_by_id(question_id, current_user_id=None):
        question = QuestionService._base_query().filter(Question.id == question_id).first()
        if not question:
            return None
        return QuestionService._serialize_question(question, include_answers=True, current_user_id=current_user_id)

    @staticmethod
    def create_question(data, user_id):
        schema = QuestionCreateSchema()
        try:
            payload = schema.load(data or {})
        except ValidationError as err:
            return {"error": err.messages}, 400

        tag_ids = payload.pop("tag_ids", [])

        question = Question(
            title=payload["title"],
            description=payload["description"],
            problem_type=payload.get("problem_type", "technical"),
            user_id=user_id,
        )

        try:
            if tag_ids:
                tags = Tag.query.filter(Tag.id.in_(tag_ids)).all()
                question.tags = tags

            db.session.add(question)
            db.session.commit()
        except Exception as exc:
            db.session.rollback()
            return {"error": str(exc)}, 500

        return QuestionService.get_question_by_id(question.id, current_user_id=user_id), 201

    @staticmethod
    def update_question(question_id, data, user_id):
        question = Question.query.get(question_id)
        if not question:
            return {"error": "Question not found"}, 404

        if question.user_id != user_id:
            user = User.query.get(user_id)
            if not user or not user.is_admin():
                return {"error": "Not authorized to update this question"}, 403

        schema = QuestionCreateSchema(partial=True)
        try:
            payload = schema.load(data or {})
        except ValidationError as err:
            return {"error": err.messages}, 400

        for field in ("title", "description", "problem_type"):
            if field in payload:
                setattr(question, field, payload[field])

        if "tag_ids" in payload:
            tags = Tag.query.filter(Tag.id.in_(payload["tag_ids"])).all()
            question.tags = tags

        try:
            db.session.commit()
        except Exception as exc:
            db.session.rollback()
            return {"error": str(exc)}, 500

        return QuestionService.get_question_by_id(question.id, current_user_id=user_id), 200

    @staticmethod
    def delete_question(question_id, user_id):
        question = Question.query.get(question_id)
        if not question:
            return {"error": "Question not found"}, 404

        if question.user_id != user_id:
            user = User.query.get(user_id)
            if not user or not user.is_admin():
                return {"error": "Not authorized to delete this question"}, 403

        try:
            db.session.delete(question)
            db.session.commit()
        except Exception as exc:
            db.session.rollback()
            return {"error": str(exc)}, 500

        return {"message": "Question deleted"}, 200

    @staticmethod
    def follow_question(question_id, user_id):
        existing = Follow.query.filter_by(question_id=question_id, user_id=user_id).first()
        if existing:
            return {"error": "Already following"}, 409

        follow = Follow(question_id=question_id, user_id=user_id)
        db.session.add(follow)
        db.session.commit()
        return {"message": "Followed"}, 201

    @staticmethod
    def unfollow_question(question_id, user_id):
        follow = Follow.query.filter_by(question_id=question_id, user_id=user_id).first()
        if not follow:
            return {"error": "Not following"}, 404

        db.session.delete(follow)
        db.session.commit()
        return {"message": "Unfollowed"}, 200

    @staticmethod
    def link_related_questions(question_id, related_question_id):
        if question_id == related_question_id:
            return {"error": "Cannot relate a question to itself"}, 400

        existing = RelatedQuestion.query.filter_by(
            question_id=question_id, related_question_id=related_question_id
        ).first()
        if existing:
            return {"message": "Already linked"}, 200

        relation = RelatedQuestion(question_id=question_id, related_question_id=related_question_id)
        db.session.add(relation)
        db.session.commit()
        return {"message": "Linked"}, 201
