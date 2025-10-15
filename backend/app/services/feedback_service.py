from datetime import datetime

from marshmallow import ValidationError
from sqlalchemy import func

from .. import db
from ..models import Feedback
from ..schemas import FeedbackCreateSchema, FeedbackSchema, FeedbackUpdateSchema


create_schema = FeedbackCreateSchema()
update_schema = FeedbackUpdateSchema()
response_schema = FeedbackSchema()


class FeedbackService:
    @staticmethod
    def create_feedback(data, user_id=None):
        try:
            payload = create_schema.load(data or {})
        except ValidationError as err:
            return {"error": err.messages}, 400

        feedback = Feedback(
            feedback_type=payload["feedback_type"],
            title=payload["title"],
            description=payload["description"],
            priority=payload.get("priority", "normal"),
            contact_name=payload.get("contact_name"),
            contact_email=payload.get("contact_email"),
            user_id=user_id,
        )
        db.session.add(feedback)
        db.session.commit()
        return response_schema.dump(feedback), 201

    @staticmethod
    def list_feedback(page=1, per_page=20, feedback_type=None, status=None, priority=None):
        query = Feedback.query.order_by(Feedback.created_at.desc())

        if feedback_type:
            query = query.filter(Feedback.feedback_type == feedback_type)
        if status:
            query = query.filter(Feedback.status == status)
        if priority:
            query = query.filter(Feedback.priority == priority)

        pagination = db.paginate(query, page=max(page, 1), per_page=max(per_page, 1), error_out=False)
        items = [response_schema.dump(item) for item in pagination.items]
        meta = {
            "current_page": pagination.page,
            "pages": pagination.pages or 1,
            "per_page": pagination.per_page,
            "total": pagination.total,
        }
        return {"items": items, "meta": meta}

    @staticmethod
    def update_feedback(feedback_id, data):
        feedback = Feedback.query.get(feedback_id)
        if not feedback:
            return {"error": "Feedback not found"}, 404

        try:
            payload = update_schema.load(data or {})
        except ValidationError as err:
            return {"error": err.messages}, 400

        if "status" in payload:
            feedback.status = payload["status"]
        if "priority" in payload:
            feedback.priority = payload["priority"]

        feedback.updated_at = datetime.utcnow()
        db.session.commit()
        return response_schema.dump(feedback), 200

    @staticmethod
    def get_stats():
        total = db.session.query(func.count(Feedback.id)).scalar() or 0
        by_type = dict(
            db.session.query(Feedback.feedback_type, func.count(Feedback.id))
            .group_by(Feedback.feedback_type)
            .all()
        )
        by_status = dict(
            db.session.query(Feedback.status, func.count(Feedback.id))
            .group_by(Feedback.status)
            .all()
        )
        return {
            "total": total,
            "by_type": by_type,
            "by_status": by_status,
        }
