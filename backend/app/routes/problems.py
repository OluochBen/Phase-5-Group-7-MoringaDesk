# app/blueprints/problems.py
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..services import QuestionService

problems_bp = Blueprint("problems", __name__)

def ok(data=None, meta=None, status=200):
    payload = {"data": data}
    if meta is not None:
        payload["meta"] = meta
    return jsonify(payload), status

def err(message, status=400):
    return jsonify({"error": message}), status


@problems_bp.route("", methods=["GET"])
def get_problems():
    """Get paginated list of problems"""
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)
    problem_type = request.args.get("problem_type")
    search = request.args.get("search")

    try:
        # Service can return different shapes across teams; normalize here.
        result = QuestionService.get_questions(page, per_page, problem_type, search)
        if isinstance(result, dict) and "questions" in result:
            # Your list endpoint appears to return {"questions":[...], "pages": N, "current_page": M}
            data = result.get("questions", [])
            meta = {
                "current_page": result.get("current_page"),
                "pages": result.get("pages"),
                "per_page": per_page,
                "count": len(data),
            }
            return ok(data, meta)
        # Already normalized by the service
        return ok(result)
    except Exception as e:
        current_app.logger.exception("GET /problems failed")
        return err("Internal server error", 500)


@problems_bp.route("", methods=["POST"])
@jwt_required()
def create_problem():
    """Create a new problem"""
    user_id = get_jwt_identity()
    data = request.get_json() or {}
    try:
        result, status_code = QuestionService.create_question(data, user_id)
        # normalize payload
        if status_code >= 400:
            return err(result.get("error") or "Failed to create", status_code)
        return ok(result.get("data") or result, status=status_code)
    except Exception as e:
        current_app.logger.exception("POST /problems failed")
        return err("Internal server error", 500)


@problems_bp.route("/<int:question_id>", methods=["GET"])
def get_problem(question_id):
    """Get a single problem"""
    try:
        result = QuestionService.get_question_by_id(question_id)
        if not result:
            return err("Problem not found", 404)
        # Wrap as {"data": {...}} for consistency
        return ok(result)
    except Exception:
        current_app.logger.exception("GET /problems/%s failed", question_id)
        return err("Internal server error", 500)


@problems_bp.route("/<int:question_id>/follow", methods=["POST"])
@jwt_required()
def follow_problem(question_id):
    """Follow a problem"""
    user_id = get_jwt_identity()
    try:
        result, status_code = QuestionService.follow_question(question_id, user_id)
        if status_code >= 400:
            return err(result.get("error") or "Unable to follow", status_code)
        return ok(result, status=status_code)
    except Exception:
        current_app.logger.exception("POST /problems/%s/follow failed", question_id)
        return err("Internal server error", 500)


@problems_bp.route("/<int:question_id>/follow", methods=["DELETE"])
@jwt_required()
def unfollow_problem(question_id):
    """Unfollow a problem"""
    user_id = get_jwt_identity()
    try:
        result, status_code = QuestionService.unfollow_question(question_id, user_id)
        if status_code >= 400:
            return err(result.get("error") or "Unable to unfollow", status_code)
        return ok(result, status=status_code)
    except Exception:
        current_app.logger.exception("DELETE /problems/%s/follow failed", question_id)
        return err("Internal server error", 500)


@problems_bp.route("/<int:question_id>/related/<int:related_question_id>", methods=["POST"])
@jwt_required()
def link_related_problems(question_id, related_question_id):
    """Link two problems as related"""
    try:
        result, status_code = QuestionService.link_related_questions(
            question_id, related_question_id
        )
        if status_code >= 400:
            return err(result.get("error") or "Unable to link related", status_code)
        return ok(result, status=status_code)
    except Exception:
        current_app.logger.exception(
            "POST /problems/%s/related/%s failed", question_id, related_question_id
        )
        return err("Internal server error", 500)


@problems_bp.route("/<int:question_id>/solutions", methods=["GET"])
def get_problem_solutions(question_id):
    """Get solutions for a problem (paginated)"""
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)

    # NOTE: Your direct browser test returned 500 here → the service is crashing.
    # We guard it to avoid blank 500s and to keep the frontend working.
    try:
        from ..services import SolutionService

        svc = SolutionService.get_solutions_by_question(question_id, page, per_page)

        # The service might return (data, status) OR a dict. Normalize.
        if isinstance(svc, tuple) and len(svc) == 2 and isinstance(svc[1], int):
            result, status_code = svc
        else:
            result, status_code = svc, 200

        if status_code >= 400:
            # If the service uses 404 for missing question, pass it through
            return err(result.get("error") or "Failed to fetch solutions", status_code)

        # Common shapes the service might return:
        # - {"solutions":[...], "pages": N, "current_page": M}
        # - {"data":[...], "meta": {...}}
        if isinstance(result, dict):
            if "solutions" in result:
                data = result.get("solutions", [])
                meta = {
                    "current_page": result.get("current_page"),
                    "pages": result.get("pages"),
                    "per_page": per_page,
                    "count": len(data),
                }
                return ok(data, meta, status=status_code)
            if "data" in result:
                return ok(result["data"], result.get("meta"), status=status_code)

        # Already a list
        return ok(result, status=status_code)

    except Exception:
        current_app.logger.exception(
            "GET /problems/%s/solutions failed", question_id
        )
        return err("Internal server error", 500)


@problems_bp.route("/<int:question_id>/solutions", methods=["POST"])
@jwt_required()
def create_problem_solution(question_id):
    """Create a solution for a problem"""
    user_id = get_jwt_identity()
    data = request.get_json() or {}
    try:
        from ..services import SolutionService

        result, status_code = SolutionService.create_solution(
            question_id, data, user_id
        )
        if status_code >= 400:
            return err(result.get("error") or "Failed to create solution", status_code)
        return ok(result.get("data") or result, status=status_code)
    except Exception:
        current_app.logger.exception(
            "POST /problems/%s/solutions failed", question_id
        )
        return err("Internal server error", 500)
