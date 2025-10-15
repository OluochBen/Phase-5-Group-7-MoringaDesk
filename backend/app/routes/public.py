from datetime import datetime

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from marshmallow import ValidationError
from sqlalchemy.exc import IntegrityError

from .. import db
from ..models import NewsletterSubscriber, Question, Solution, Tag, User
from ..schemas import SubscriptionCreateSchema
from ..services import FeedbackService

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


@public_bp.route("/status", methods=["GET"])
def system_status():
    """Expose high-level service health information for the status page."""

    checks = []
    overall_healthy = True

    # API health (always reachable if this handler executes)
    checks.append({
        "id": "api",
        "name": "API",
        "status": "healthy",
        "details": "Application is reachable",
    })

    # Database connectivity check
    db_status = {
        "id": "database",
        "name": "Database",
        "status": "healthy",
        "details": None,
        "metrics": {},
    }
    try:
        total_users = db.session.query(User.id).count()
        total_questions = db.session.query(Question.id).count()
        db_status["metrics"] = {
            "users": total_users,
            "questions": total_questions,
        }
    except Exception as exc:  # pragma: no cover - defensive
        db_status["status"] = "degraded"
        db_status["details"] = str(exc)
        overall_healthy = False

    checks.append(db_status)

    # Placeholder services (extend as capabilities grow)
    checks.append({
        "id": "websocket",
        "name": "Real-time updates",
        "status": "operational",
        "details": "Socket server available",
    })

    checks.append({
        "id": "jobs",
        "name": "Background jobs",
        "status": "operational",
        "details": "No queued jobs",
    })

    return (
        jsonify(
            {
                "status": "healthy" if overall_healthy else "degraded",
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "checks": checks,
            }
        ),
        200,
    )


@public_bp.route("/feedback", methods=["POST"])
@jwt_required(optional=True)
def submit_feedback():
    """Allow learners and visitors to file bug reports or feature requests."""

    user_id = get_jwt_identity()
    payload, status = FeedbackService.create_feedback(request.get_json() or {}, user_id)
    return jsonify(payload), status
