from flask import Blueprint, jsonify

from ..models import Question, Solution, Tag, User

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
