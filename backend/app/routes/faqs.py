from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..services import FAQService

faqs_bp = Blueprint('faqs', __name__)

@faqs_bp.route('', methods=['GET'])
def get_faqs():
    """Get paginated list of FAQs"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    search = request.args.get('search', type=str)
    category = request.args.get('category', type=str)

    result = FAQService.get_faqs(page, per_page, search=search, category=category)
    return jsonify(result), 200

@faqs_bp.route('/stats', methods=['GET'])
def get_faq_stats():
    """Return aggregated FAQ statistics"""
    result = FAQService.get_stats()
    return jsonify(result), 200

@faqs_bp.route('/<faq_id>/view', methods=['POST'])
@jwt_required(optional=True)
def record_faq_view(faq_id):
    """Record a view for an FAQ (non-persistent placeholder)."""
    payload = FAQService.record_view(faq_id)
    return jsonify(payload), 200

@faqs_bp.route('/<faq_id>/helpful', methods=['POST'])
@jwt_required(optional=True)
def mark_faq_helpful(faq_id):
    """Mark an FAQ as helpful (non-persistent placeholder)."""
    payload = FAQService.mark_helpful(faq_id)
    return jsonify(payload), 200

@faqs_bp.route('', methods=['POST'])
@jwt_required()
def create_faq():
    """Create a new FAQ"""
    user_id = get_jwt_identity()
    data = request.get_json()
    result, status_code = FAQService.create_faq(data, user_id)
    return jsonify(result), status_code

@faqs_bp.route('/<int:faq_id>', methods=['GET'])
def get_faq(faq_id):
    """Get a single FAQ"""
    result = FAQService.get_faq_by_id(faq_id)
    
    if not result:
        return jsonify({'error': 'FAQ not found'}), 404
    
    return jsonify(result), 200

@faqs_bp.route('/<int:faq_id>', methods=['PUT'])
@jwt_required()
def update_faq(faq_id):
    """Update an FAQ"""
    user_id = get_jwt_identity()
    data = request.get_json()
    result, status_code = FAQService.update_faq(faq_id, data, user_id)
    return jsonify(result), status_code

@faqs_bp.route('/<int:faq_id>', methods=['DELETE'])
@jwt_required()
def delete_faq(faq_id):
    """Delete an FAQ"""
    result, status_code = FAQService.delete_faq(faq_id)
    return jsonify(result), status_code
