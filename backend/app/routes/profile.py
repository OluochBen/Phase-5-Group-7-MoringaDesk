from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from sqlalchemy.orm import joinedload
from app.models import User
from app.utils import error_response  # Optional helper for consistent errors

profile_bp = Blueprint('profile', __name__)

@profile_bp.route("/<uuid:user_id>", methods=["GET"])
@jwt_required()
def get_profile(user_id):
    """Retrieve a user's public profile with related content"""
    user = User.query.options(
        joinedload(User.badges),
        joinedload(User.questions),
        joinedload(User.answers)
    ).get(user_id)

    if not user:
        return error_response("User not found", 404)

    return jsonify({
        "id": str(user.id),
        "name": user.display_name or user.username,
        "email": user.email,
        "role": user.role,
        "bio": user.bio,
        "avatar": user.avatar_url,
        "reputation": user.reputation,
        "joinDate": user.created_at.isoformat(),
        "lastActive": user.last_active.isoformat() if user.last_active else None,
        "location": user.location,
        "website": user.website,
        "badges": [badge.to_dict() for badge in user.badges],
        "questions": [q.to_dict() for q in user.questions[:10]],  # Optional pagination
        "answers": [a.to_dict() for a in user.answers[:10]],      # Optional pagination
    }), 200
