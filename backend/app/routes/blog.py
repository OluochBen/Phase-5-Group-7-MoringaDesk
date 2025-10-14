from functools import wraps

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from ..models import User
from ..services import BlogService

blog_bp = Blueprint("blog", __name__)


def _get_current_admin():
    user_id = get_jwt_identity()
    if not user_id:
        return None
    user = User.query.get(user_id)
    if user and user.is_admin():
        return user
    return None


def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        admin = _get_current_admin()
        if not admin:
            return jsonify({"error": "Admin access required"}), 403
        return fn(admin, *args, **kwargs)

    return wrapper


@blog_bp.route("/posts", methods=["GET"])
@jwt_required(optional=True)
def list_posts():
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)
    search = request.args.get("search")
    status = request.args.get("status")

    admin = _get_current_admin()
    include_unpublished = bool(admin)

    result = BlogService.list_posts(
        page=page,
        per_page=per_page,
        status=status if include_unpublished else None,
        search=search,
        include_unpublished=include_unpublished,
        author_id=request.args.get("author_id", type=int) if include_unpublished else None,
    )
    return jsonify(result), 200


@blog_bp.route("/posts/<path:identifier>", methods=["GET"])
@jwt_required(optional=True)
def get_post(identifier):
    admin = _get_current_admin()
    post = BlogService.get_post(identifier, include_unpublished=bool(admin))
    if not post:
        return jsonify({"error": "Post not found"}), 404
    include_body = request.args.get("include", "full") != "summary"
    return jsonify({"item": post.to_dict(include_body=include_body)}), 200


@blog_bp.route("/posts", methods=["POST"])
@jwt_required()
@admin_required
def create_post(admin_user):
    data = request.get_json() or {}
    payload, status = BlogService.create_post(data, admin_user.id)
    return jsonify(payload), status


@blog_bp.route("/posts/<int:post_id>", methods=["PUT", "PATCH"])
@jwt_required()
@admin_required
def update_post(admin_user, post_id):
    data = request.get_json() or {}
    payload, status = BlogService.update_post(post_id, data)
    return jsonify(payload), status


@blog_bp.route("/posts/<int:post_id>", methods=["DELETE"])
@jwt_required()
@admin_required
def delete_post(admin_user, post_id):
    payload, status = BlogService.delete_post(post_id)
    return jsonify(payload), status
