from sqlalchemy import or_
from marshmallow import ValidationError

from .. import db
from ..models import (
    Question,
    Tag,
    RelatedQuestion,
    Follow,
    Notification,
)
from ..schemas import QuestionCreateSchema


class QuestionService:
    @staticmethod
    def create_question(data, user_id):
        """Create a new question."""
        schema = QuestionCreateSchema()
        try:
            validated = schema.load(data or {})
        except ValidationError as err:
            return {"error": err.messages}, 400

        q = Question(
            user_id=user_id,
            title=validated["title"],
            description=validated["description"],
            problem_type=validated["problem_type"],
        )

        db.session.add(q)
        db.session.flush()  # acquire q.id

        # optional tags
        for tag_id in (validated.get("tag_ids") or []):
            tag = db.session.get(Tag, tag_id)
            if tag:
                q.tags.append(tag)

        db.session.commit()

        QuestionService._notify_similar_questions(q)
        return q.to_dict(), 201

    @staticmethod
    def get_questions(page=1, per_page=10, problem_type=None, search=None):
        """Get paginated list of questions."""
        query = Question.query

        if problem_type:
            query = query.filter(Question.problem_type == problem_type)

        if search:
            query = query.filter(
                or_(
                    Question.title.contains(search),
                    Question.description.contains(search),
                )
            )

        pagination = query.order_by(Question.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )

        return {
            "questions": [q.to_dict() for q in pagination.items],
            "total": pagination.total,
            "pages": pagination.pages,
            "current_page": page,
        }

    @staticmethod
    def get_question_by_id(question_id):
        """Get question by ID with related questions (safe, no implicit join)."""
        q = db.session.get(Question, question_id)
        if not q:
            return None

        data = q.to_dict()

        # 1) fetch relation rows first (avoid implicit join errors)
        links = (
            RelatedQuestion.query.filter(
                or_(
                    RelatedQuestion.question_id == question_id,
                    RelatedQuestion.related_question_id == question_id,
                )
            ).all()
        )

        # 2) compute counterpart ids
        related_ids = set()
        for lk in links:
            if lk.question_id == question_id:
                related_ids.add(lk.related_question_id)
            else:
                related_ids.add(lk.question_id)

        # 3) fetch the related questions explicitly
        related = []
        if related_ids:
            related = Question.query.filter(Question.id.in_(related_ids)).all()

        # 4) serialize
        data["related_questions"] = [rq.to_dict() for rq in related]
        return data

    @staticmethod
    def follow_question(question_id, user_id):
        """Follow a question."""
        existing = Follow.query.filter_by(
            user_id=user_id, question_id=question_id
        ).first()
        if existing:
            return {"error": "Already following this question"}, 400

        follow = Follow(user_id=user_id, question_id=question_id)
        db.session.add(follow)
        db.session.commit()
        return {"message": "Question followed successfully"}, 201

    @staticmethod
    def unfollow_question(question_id, user_id):
        """Unfollow a question."""
        follow = Follow.query.filter_by(
            user_id=user_id, question_id=question_id
        ).first()
        if not follow:
            return {"error": "Not following this question"}, 404

        db.session.delete(follow)
        db.session.commit()
        return {"message": "Question unfollowed successfully"}, 200

    @staticmethod
    def link_related_questions(question_id, related_question_id):
        """Link two questions as related (bidirectional)."""
        if question_id == related_question_id:
            return {"error": "Cannot link question to itself"}, 400

        exists = RelatedQuestion.query.filter_by(
            question_id=question_id, related_question_id=related_question_id
        ).first()
        if exists:
            return {"error": "Questions already linked"}, 400

        link1 = RelatedQuestion(
            question_id=question_id, related_question_id=related_question_id
        )
        link2 = RelatedQuestion(
            question_id=related_question_id, related_question_id=question_id
        )
        db.session.add(link1)
        db.session.add(link2)
        db.session.commit()
        return {"message": "Questions linked successfully"}, 201

    @staticmethod
    def _notify_similar_questions(question):
        """Notify followers of similar questions about a new question."""
        tag_ids = [t.id for t in (question.tags or [])]
        if not tag_ids:
            return

        similar = (
            Question.query.join(Question.tags)
            .filter(Tag.id.in_(tag_ids))
            .filter(Question.id != question.id)
            .all()
        )

        for sq in similar:
            for follow in sq.follows:
                db.session.add(
                    Notification(
                        user_id=follow.user_id,
                        type="follow_update",
                        reference_id=question.id,
                    )
                )

        db.session.commit()
