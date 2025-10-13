from flask import Blueprint, jsonify, request
from marshmallow import ValidationError
from sqlalchemy.exc import IntegrityError

from .. import db
from ..models import NewsletterSubscriber, Question, Solution, Tag, User
from ..schemas import SubscriptionCreateSchema

public_bp = Blueprint("public", __name__)


@public_bp.route("/stats", methods=["GET"])
def public_stats():
    """Expose aggregate metrics for the public landing page."""
    total_questions = Question.query.count() or 0
    total_answers = Solution.query.count() or 0
    total_users = User.query.count() or 0
    total_communities = Tag.query.count() or 0

    return (
        jsonify(
            {
                "questions": total_questions,
                "answers": total_answers,
                "users": total_users,
                "communities": total_communities,
            }
        ),
        200,
    )


@public_bp.route("/subscribe", methods=["POST"])
def subscribe_newsletter():
    schema = SubscriptionCreateSchema()
    try:
        payload = schema.load(request.get_json() or {})
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400

    email = payload["email"].lower()
    source = payload.get("source")

    existing = NewsletterSubscriber.query.filter_by(email=email).first()
    if existing:
        return jsonify({"message": "You’re already subscribed!"}), 200

    subscriber = NewsletterSubscriber(email=email, source=source)
    db.session.add(subscriber)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"message": "You’re already subscribed!"}), 200

    return jsonify({"message": "Thanks for subscribing!"}), 201
