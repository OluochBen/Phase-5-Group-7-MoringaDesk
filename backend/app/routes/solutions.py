from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services import SolutionService, VoteService

solutions_bp = Blueprint('solutions', __name__)

@solutions_bp.route('/<int:solution_id>', methods=['GET'])
def get_solution(solution_id):
    """Get a single solution"""
    result = SolutionService.get_solution_by_id(solution_id)
    
    if not result:
        return jsonify({'error': 'Solution not found'}), 404
    
    return jsonify(result), 200

@solutions_bp.route('/<int:solution_id>/vote', methods=['POST'])
@jwt_required()
def vote_solution(solution_id):
    """Vote on a solution"""
    user_id = get_jwt_identity()
    data = request.get_json()
    result, status_code = VoteService.vote_solution(solution_id, data, user_id)
    return jsonify(result), status_code

@solutions_bp.route('/<int:solution_id>/vote', methods=['DELETE'])
@jwt_required()
def remove_vote(solution_id):
    """Remove vote from solution"""
    user_id = get_jwt_identity()
    result, status_code = VoteService.remove_vote(solution_id, user_id)
    return jsonify(result), status_code

@solutions_bp.route('/<int:solution_id>/votes', methods=['GET'])
def get_solution_votes(solution_id):
    """Get all votes for a solution"""
    votes = VoteService.get_votes_by_solution(solution_id)
    return jsonify({'votes': votes}), 200
