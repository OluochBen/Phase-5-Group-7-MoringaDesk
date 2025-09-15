from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import User, Question, Solution, FAQ
from app import db

admin_bp = Blueprint('admin', __name__)

def admin_required(f):
    """Decorator to require admin role"""
    from functools import wraps
    
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or not user.is_admin():
            return jsonify({'error': 'Admin access required'}), 403
        
        return f(*args, **kwargs)
    
    return decorated_function

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
@admin_required
def get_users():
    """Get all users (admin only)"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    users = User.query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'users': [user.to_dict() for user in users.items],
        'total': users.total,
        'pages': users.pages,
        'current_page': page
    }), 200

@admin_bp.route('/users/<int:user_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_user(user_id):
    """Update user role (admin only)"""
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    if 'role' in data and data['role'] in ['student', 'admin']:
        user.role = data['role']
        db.session.commit()
        return jsonify({'message': 'User updated successfully', 'user': user.to_dict()}), 200
    
    return jsonify({'error': 'Invalid role'}), 400

@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_user(user_id):
    """Delete user (admin only)"""
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    db.session.delete(user)
    db.session.commit()
    
    return jsonify({'message': 'User deleted successfully'}), 200

@admin_bp.route('/questions', methods=['GET'])
@jwt_required()
@admin_required
def get_all_questions():
    """Get all questions (admin only)"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    questions = Question.query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'questions': [q.to_dict() for q in questions.items],
        'total': questions.total,
        'pages': questions.pages,
        'current_page': page
    }), 200

@admin_bp.route('/questions/<int:question_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_question(question_id):
    """Delete question (admin only)"""
    question = Question.query.get(question_id)
    if not question:
        return jsonify({'error': 'Question not found'}), 404
    
    db.session.delete(question)
    db.session.commit()
    
    return jsonify({'message': 'Question deleted successfully'}), 200

@admin_bp.route('/solutions/<int:solution_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_solution(solution_id):
    """Delete solution (admin only)"""
    solution = Solution.query.get(solution_id)
    if not solution:
        return jsonify({'error': 'Solution not found'}), 404
    
    db.session.delete(solution)
    db.session.commit()
    
    return jsonify({'message': 'Solution deleted successfully'}), 200

@admin_bp.route('/reports/summary', methods=['GET'])
@jwt_required()
@admin_required
def get_reports_summary():
    """Get summary reports (admin only)"""
    total_users = User.query.count()
    total_questions = Question.query.count()
    total_solutions = Solution.query.count()
    total_faqs = FAQ.query.count()
    
    # Top contributors (users with most questions + solutions)
    from sqlalchemy import func
    top_contributors = db.session.query(
        User.id, User.name, 
        func.count(Question.id).label('questions_count'),
        func.count(Solution.id).label('solutions_count')
    ).outerjoin(Question, User.id == Question.user_id)\
     .outerjoin(Solution, User.id == Solution.user_id)\
     .group_by(User.id, User.name)\
     .order_by((func.count(Question.id) + func.count(Solution.id)).desc())\
     .limit(10).all()
    
    # Problem categories breakdown
    problem_categories = db.session.query(
        Question.problem_type, func.count(Question.id).label('count')
    ).group_by(Question.problem_type).all()
    
    return jsonify({
        'summary': {
            'total_users': total_users,
            'total_questions': total_questions,
            'total_solutions': total_solutions,
            'total_faqs': total_faqs
        },
        'top_contributors': [
            {
                'id': user.id,
                'name': user.name,
                'questions_count': user.questions_count,
                'solutions_count': user.solutions_count,
                'total_contributions': user.questions_count + user.solutions_count
            }
            for user in top_contributors
        ],
        'problem_categories': [
            {'type': cat.problem_type, 'count': cat.count}
            for cat in problem_categories
        ]
    }), 200
