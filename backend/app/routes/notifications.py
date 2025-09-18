from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services import NotificationService

notifications_bp = Blueprint('notifications', __name__)

@notifications_bp.route('', methods=['GET'])
@jwt_required()
def get_notifications():
    """Get user notifications"""
    user_id = get_jwt_identity()
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    unread_only = request.args.get('unread_only', False, type=bool)
    
    result = NotificationService.get_user_notifications(user_id, page, per_page, unread_only)
    return jsonify(result), 200

@notifications_bp.route('/unread-count', methods=['GET'])
@jwt_required()
def get_unread_count():
    """Get count of unread notifications"""
    user_id = get_jwt_identity()
    result = NotificationService.get_unread_count(user_id)
    return jsonify(result), 200

@notifications_bp.route('/<int:notification_id>/read', methods=['PUT'])
@jwt_required()
def mark_notification_read(notification_id):
    """Mark a notification as read"""
    user_id = get_jwt_identity()
    result, status_code = NotificationService.mark_notification_read(notification_id, user_id)
    return jsonify(result), status_code

@notifications_bp.route('/read-all', methods=['PUT'])
@jwt_required()
def mark_all_notifications_read():
    """Mark all notifications as read"""
    user_id = get_jwt_identity()
    result, status_code = NotificationService.mark_all_notifications_read(user_id)
    return jsonify(result), status_code
