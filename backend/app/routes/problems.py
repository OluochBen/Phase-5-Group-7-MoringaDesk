from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity

from ..services import QuestionService, SolutionService

problems_bp = Blueprint("problems", __name__)

# ---------- Helpers ----------
def ok_item(item, status=200):
    if isinstance(item, dict):
        payload = {"item": item}
        payload.update(item)
    else:
        payload = {"item": item}
    return jsonify(payload), status


def ok_items(items, meta=None, status=200):
    payload = {"items": items, "meta": meta or {}}
    if isinstance(items, list):
        payload["questions"] = items
    return jsonify(payload), status


def err(message, status=400):
    return jsonify({"error": message}), status


# ---------- Routes ----------
@problems_bp.route("", methods=["GET"])
@jwt_required(optional=True)
def get_problems():
    """Get paginated list of problems"""
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)
    problem_type = request.args.get("problem_type")
    search = request.args.get("search")
    created_by = request.args.get("created_by", type=int)
    current_user_id = get_jwt_identity()

    try:
        result = QuestionService.get_questions(
            page,
            per_page,
            problem_type=problem_type,
            search=search,
            current_user_id=current_user_id,
            created_by=created_by,
        )

        if isinstance(result, dict):
            items = result.get("items") or result.get("questions") or []
            meta = {
                "current_page": result.get("current_page") or page,
                "pages": result.get("pages"),
                "per_page": result.get("per_page", per_page),
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
            message = payload.get("error") if isinstance(payload, dict) else "Failed to create"
            return err(message, status_code)

        return ok_item(payload, status=status_code)

    except Exception:
        current_app.logger.exception("POST /problems failed")
        return err("Internal server error", 500)


@problems_bp.route("/<int:question_id>", methods=["GET"])
@jwt_required(optional=True)
def get_problem(question_id):
    """Get a single problem"""
    try:
        current_user_id = get_jwt_identity()
        result = QuestionService.get_question_by_id(question_id, current_user_id=current_user_id)
        if not result:
            return err("Problem not found", 404)
        return ok_item(result)
    except Exception:
        current_app.logger.exception("GET /problems/<id> failed")
        return err("Internal server error", 500)


@problems_bp.route("/<int:question_id>", methods=["PUT"])
@jwt_required()
def update_problem(question_id):
    data = request.get_json() or {}
    user_id = get_jwt_identity()
    try:
        payload, status_code = QuestionService.update_question(question_id, data, user_id)
        if status_code >= 400:
            message = payload.get("error") if isinstance(payload, dict) else "Failed to update"
            return err(message, status_code)
        return ok_item(payload, status=status_code)
    except Exception:
        current_app.logger.exception("PUT /problems/<id> failed")
        return err("Internal server error", 500)


@problems_bp.route("/<int:question_id>", methods=["DELETE"])
@jwt_required()
def delete_problem(question_id):
    user_id = get_jwt_identity()
    try:
        payload, status_code = QuestionService.delete_question(question_id, user_id)
        if status_code >= 400:
            message = payload.get("error") if isinstance(payload, dict) else "Failed to delete"
            return err(message, status_code)
        return jsonify(payload), status_code
    except Exception:
        current_app.logger.exception("DELETE /problems/<id> failed")
        return err("Internal server error", 500)


@problems_bp.route("/<int:question_id>/solutions", methods=["GET"])
@jwt_required(optional=True)
def list_solutions(question_id):
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)
    current_user_id = get_jwt_identity()
    try:
        result = SolutionService.get_solutions_by_question(
            question_id,
            page=page,
            per_page=per_page,
            current_user_id=current_user_id,
        )
        return jsonify(result), 200
    except Exception:
        current_app.logger.exception("GET /problems/%s/solutions failed", question_id)
        return err("Internal server error", 500)


@problems_bp.route("/<int:question_id>/solutions", methods=["POST"])
@jwt_required()
def create_solution(question_id):
    user_id = get_jwt_identity()
    data = request.get_json() or {}
    try:
        payload, status_code = SolutionService.create_solution(question_id, data, user_id)
        if status_code >= 400:
            message = payload.get("error") if isinstance(payload, dict) else "Unable to create solution"
            return err(message, status_code)
        return jsonify({"item": payload}), status_code
    except Exception:
        current_app.logger.exception("POST /problems/%s/solutions failed", question_id)
        return err("Internal server error", 500)


@problems_bp.route("/<int:question_id>/solutions/<int:solution_id>", methods=["GET"])
@jwt_required(optional=True)
def get_solution(question_id, solution_id):
    current_user_id = get_jwt_identity()
    result = SolutionService.get_solution_by_id(solution_id, current_user_id=current_user_id)
    if not result or result.get("question_id") != question_id:
        return err("Solution not found", 404)
    return jsonify({"item": result}), 200


@problems_bp.route("/<int:question_id>/solutions/<int:solution_id>", methods=["PUT"])
@jwt_required()
def update_solution(question_id, solution_id):
    user_id = get_jwt_identity()
    data = request.get_json() or {}
    payload, status_code = SolutionService.update_solution(solution_id, data, user_id)
    if status_code >= 400:
        message = payload.get("error") if isinstance(payload, dict) else "Unable to update solution"
        return err(message, status_code)
    if payload.get("question_id") != question_id:
        return err("Solution not found", 404)
    return jsonify({"item": payload}), status_code


@problems_bp.route("/<int:question_id>/solutions/<int:solution_id>", methods=["DELETE"])
@jwt_required()
def delete_solution(question_id, solution_id):
    user_id = get_jwt_identity()
    payload, status_code = SolutionService.delete_solution(solution_id, user_id)
    if status_code >= 400:
        message = payload.get("error") if isinstance(payload, dict) else "Unable to delete solution"
        return err(message, status_code)
    return jsonify(payload), status_code


@problems_bp.route("/<int:question_id>/follow", methods=["POST"])
@jwt_required()
def follow_problem(question_id):
    user_id = get_jwt_identity()
    try:
        payload, status_code = QuestionService.follow_question(question_id, user_id)
        if status_code >= 400:
            message = payload.get("error") if isinstance(payload, dict) else "Unable to follow"
            return err(message, status_code)
        return jsonify(payload), status_code
    except Exception:
        current_app.logger.exception("POST /problems/%s/follow failed", question_id)
        return err("Internal server error", 500)


@problems_bp.route("/<int:question_id>/follow", methods=["DELETE"])
@jwt_required()
def unfollow_problem(question_id):
    user_id = get_jwt_identity()
    try:
        payload, status_code = QuestionService.unfollow_question(question_id, user_id)
        if status_code >= 400:
            message = payload.get("error") if isinstance(payload, dict) else "Unable to unfollow"
            return err(message, status_code)
        return jsonify(payload), status_code
    except Exception:
        current_app.logger.exception("DELETE /problems/%s/follow failed", question_id)
        return err("Internal server error", 500)


@problems_bp.route("/<int:question_id>/related/<int:related_question_id>", methods=["POST"])
@jwt_required()
def link_related(question_id, related_question_id):
    try:
        payload, status_code = QuestionService.link_related_questions(question_id, related_question_id)
        if status_code >= 400:
            message = payload.get("error") if isinstance(payload, dict) else "Unable to link questions"
            return err(message, status_code)
        return jsonify(payload), status_code
    except Exception:
        current_app.logger.exception(
            "POST /problems/%s/related/%s failed", question_id, related_question_id
        )
        return err("Internal server error", 500)
