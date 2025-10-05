from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.orm import joinedload

from ..models import User, Question, Solution
from ..services import QuestionService, SolutionService

profile_bp = Blueprint('profile', __name__)


@profile_bp.route('/<int:user_id>', methods=['GET'])
@jwt_required(optional=True)
def get_profile(user_id):
    """Retrieve a user's public profile along with their questions and answers."""
    current_user_id = get_jwt_identity()

    user = (
        User.query.options(
            joinedload(User.questions)
            .joinedload(Question.tags),
            joinedload(User.questions)
            .joinedload(Question.solutions),
            joinedload(User.questions)
            .joinedload(Question.follows),
            joinedload(User.solutions)
            .joinedload(Solution.votes),
            joinedload(User.solutions)
            .joinedload(Solution.author),
        )
        .filter_by(id=user_id)
        .first()
    )

    if not user:
        return jsonify({'error': 'User not found'}), 404

    questions = [
        QuestionService._serialize_question(q, include_answers=False, current_user_id=current_user_id)
        for q in sorted(user.questions, key=lambda item: (item.created_at.timestamp() if item.created_at else 0), reverse=True)
    ]

    answers = [
        SolutionService._serialize_solution(s, current_user_id=current_user_id)
        for s in sorted(user.solutions, key=lambda item: (item.created_at.timestamp() if item.created_at else 0), reverse=True)
    ]

    profile_data = user.to_dict()
    profile_data.update({
        'questions_count': len(questions),
        'answers_count': len(answers),
    })

    return jsonify({
        'user': profile_data,
        'questions': questions,
        'answers': answers,
    }), 200
