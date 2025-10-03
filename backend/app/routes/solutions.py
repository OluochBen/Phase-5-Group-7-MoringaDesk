# app/blueprints/solutions.py
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..services import SolutionService, VoteService

solutions_bp = Blueprint("solutions", __name__)

def ok(data=None, meta=None, status=200):
    payload = {"data": data}
    if meta is not None:
        payload["meta"] = meta
    return jsonify(payload), status

def err(message, status=400):
    return jsonify({"error": message}), status


@solutions_bp.route("/<int:solution_id>", methods=["GET"])
def get_solution(solution_id):
    """Get a single solution"""
    try:
        result = SolutionService.get_solution_by_id(solution_id)
        if not result:
            return err("Solution not found", 404)
        return ok(result)
    except Exception:
        current_app.logger.exception("GET /solutions/%s failed", solution_id)
        return err("Internal server error", 500)


@solutions_bp.route("/<int:solution_id>/vote", methods=["POST"])
@jwt_required()
def vote_solution(solution_id):
    """Vote on a solution"""
    user_id = get_jwt_identity()
    data = request.get_json() or {}
    try:
        result, status_code = VoteService.vote_solution(solution_id, data, user_id)
        if status_code >= 400:
            return err(result.get("error") or "Unable to vote", status_code)
        return ok(result, status=status_code)
    except Exception:
        current_app.logger.exception("POST /solutions/%s/vote failed", solution_id)
        return err("Internal server error", 500)


@solutions_bp.route("/<int:solution_id>/vote", methods=["DELETE"])
@jwt_required()
def remove_vote(solution_id):
    """Remove vote from solution"""
    user_id = get_jwt_identity()
    try:
        result, status_code = VoteService.remove_vote(solution_id, user_id)
        if status_code >= 400:
            return err(result.get("error") or "Unable to remove vote", status_code)
        return ok(result, status=status_code)
    except Exception:
        current_app.logger.exception("DELETE /solutions/%s/vote failed", solution_id)
        return err("Internal server error", 500)


@solutions_bp.route("/<int:solution_id>/votes", methods=["GET"])
def get_solution_votes(solution_id):
    """Get all votes for a solution"""
    try:
        votes = VoteService.get_votes_by_solution(solution_id)
        # Always wrap as data list
        return ok(list(votes) if votes is not None else [])
    except Exception:
        current_app.logger.exception("GET /solutions/%s/votes failed", solution_id)
        return err("Internal server error", 500)


@solutions_bp.route("/user/<int:user_id>", methods=["GET"])
def get_user_solutions(user_id):
    """Get solutions created by a specific user"""
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)
    
    try:
        result = SolutionService.get_user_solutions(user_id, page, per_page)
        
        meta = {
            "current_page": result.get("current_page", page),
            "pages": result.get("pages"),
            "per_page": per_page,
            "count": len(result.get("solutions", [])),
            "total": result.get("total")
        }
        
        return ok(result.get("solutions", []), meta)
    except Exception:
        current_app.logger.exception("GET /solutions/user/%s failed", user_id)
        return err("Internal server error", 500)