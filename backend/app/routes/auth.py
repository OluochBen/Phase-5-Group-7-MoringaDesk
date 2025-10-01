from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity
)
from .. import db
from ..models.user import User
import datetime

auth_bp = Blueprint("auth", __name__)

# --- Register ---
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role", "student")  # default = student

    if not name or not email or not password:
        return jsonify({"error": "Name, email, and password are required"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 400

    user = User(name=name, email=email, role=role)
    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    # issue token
    access_token = create_access_token(identity=str(user.id), expires_delta=datetime.timedelta(hours=1))

    return jsonify({
        "access_token": access_token,
        "user": user.to_dict()
    }), 201


# --- Login ---
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid credentials"}), 401

    access_token = create_access_token(identity=str(user.id), expires_delta=datetime.timedelta(hours=1))

    return jsonify({
        "access_token": access_token,
        "user": user.to_dict()
    }), 200


# --- Current User ---
@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    try:
        user_id = int(user_id)  # ✅ convert back to int
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid token"}), 422

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({"user": user.to_dict()}), 200
