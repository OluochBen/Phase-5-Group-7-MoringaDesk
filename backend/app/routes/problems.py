from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..services import QuestionService

problems_bp = Blueprint("problems", __name__)

# ---------- Helpers ----------
def ok_item(item, status=200):
    return jsonify({"item": item}), status

def ok_items(items, meta=None, status=200):
    return jsonify({"items": items, "meta": meta or {}}), status

def err(message, status=400):
    return jsonify({"error": message}), status


# ---------- Routes ----------
@problems_bp.route("", methods=["GET"])
def get_problems():
    """Get paginated list of problems"""
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)
    problem_type = request.args.get("problem_type")
    search = request.args.get("search")

    try:
        result = QuestionService.get_questions(page, per_page, problem_type, search)

        if isinstance(result, dict):
            items = result.get("questions") or result.get("items") or []
            meta = {
                "current_page": result.get("current_page") or page,
                "pages": result.get("pages"),
                "per_page": per_page,
                "count": len(items),
                "total": result.get("total"),
            }
            return ok_items(items, meta)

        if isinstance(result, list):
            meta = {"current_page": page, "per_page": per_page, "count": len(result)}
            return ok_items(result, meta)

        return ok_items([], {"current_page": page, "per_page": per_page, "count": 0})

    except Exception:
        current_app.logger.exception("GET /problems failed")
        return err("Internal server error", 500)


@problems_bp.route("", methods=["POST"])
@jwt_required()
def create_problem():
    """Create a new problem"""
    user_id = get_jwt_identity()
    data = request.get_json() or {}
    try:
        res = QuestionService.create_question(data, user_id)

        if isinstance(res, tuple):
            payload, status_code = res
        else:
            payload, status_code = res, 201

        if status_code >= 400:
            return err(payload.get("error") if isinstance(payload, dict) else "Failed to create", status_code)

        item = payload.get("data") if isinstance(payload, dict) else payload
        return ok_item(item, status=status_code)

    except Exception:
        current_app.logger.exception("POST /problems failed")
        return err("Internal server error", 500)


@problems_bp.route("/<int:question_id>", methods=["GET"])
def get_problem(question_id):
    """Get a single problem"""
    try:
        result = QuestionService.get_question_by_id(question_id)
        if not result:
            return err("Problem not found", 404)
        return ok_item(result)
    except Exception:
        current_app.logger.exception("GET /problems/<id> failed")
        return err("Internal server error", 500)
