from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..services.auth_service import AuthService

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    return AuthService.register_user(data)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    return AuthService.login_user(data)

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = AuthService.get_user_by_id(user_id)
    if not user:
        return {'error': 'User not found'}, 404
    return {'user': user.to_dict()}, 200

# --- Password reset endpoints ---
@auth_bp.route('/request-reset', methods=['POST'])
def request_reset():
    data = request.get_json()
    email = data.get('email')
    return AuthService.request_password_reset(email)

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    token = data.get('token')
    new_password = data.get('new_password')
    return AuthService.reset_password(token, new_password)
