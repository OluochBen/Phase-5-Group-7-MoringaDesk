from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..services import QuestionService

problems_bp = Blueprint('problems', __name__)

@problems_bp.route('', methods=['GET'])
def get_problems():
    """Get paginated list of problems"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    problem_type = request.args.get('problem_type')
    search = request.args.get('search')
    
    result = QuestionService.get_questions(page, per_page, problem_type, search)
    return jsonify(result), 200

@problems_bp.route('', methods=['POST'])
@jwt_required()
def create_problem():
    """Create a new problem"""
    user_id = get_jwt_identity()
    data = request.get_json()
    result, status_code = QuestionService.create_question(data, user_id)
    return jsonify(result), status_code

@problems_bp.route('/<int:question_id>', methods=['GET'])
def get_problem(question_id):
    """Get a single problem with related problems"""
    result = QuestionService.get_question_by_id(question_id)
    
    if not result:
        return jsonify({'error': 'Problem not found'}), 404
    
    return jsonify(result), 200

@problems_bp.route('/<int:question_id>/follow', methods=['POST'])
@jwt_required()
def follow_problem(question_id):
    """Follow a problem"""
    user_id = get_jwt_identity()
    result, status_code = QuestionService.follow_question(question_id, user_id)
    return jsonify(result), status_code

@problems_bp.route('/<int:question_id>/follow', methods=['DELETE'])
@jwt_required()
def unfollow_problem(question_id):
    """Unfollow a problem"""
    user_id = get_jwt_identity()
    result, status_code = QuestionService.unfollow_question(question_id, user_id)
    return jsonify(result), status_code

@problems_bp.route('/<int:question_id>/related/<int:related_question_id>', methods=['POST'])
@jwt_required()
def link_related_problems(question_id, related_question_id):
    """Link two problems as related"""
    result, status_code = QuestionService.link_related_questions(question_id, related_question_id)
    return jsonify(result), status_code

@problems_bp.route('/<int:question_id>/solutions', methods=['GET'])
def get_problem_solutions(question_id):
    """Get solutions for a problem"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    from ..services import SolutionService
    result, status_code = SolutionService.get_solutions_by_question(question_id, page, per_page)
    return jsonify(result), status_code

@problems_bp.route('/<int:question_id>/solutions', methods=['POST'])
@jwt_required()
def create_problem_solution(question_id):
    """Create a solution for a problem"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    from ..services import SolutionService
    result, status_code = SolutionService.create_solution(question_id, data, user_id)
    return jsonify(result), status_code
