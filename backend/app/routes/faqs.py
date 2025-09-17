from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services import FAQService

faqs_bp = Blueprint('faqs', __name__)

@faqs_bp.route('', methods=['GET'])
def get_faqs():
    """Get paginated list of FAQs"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    result = FAQService.get_faqs(page, per_page)
    return jsonify(result), 200

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
