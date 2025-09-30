from functools import wraps
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from .. import db
from ..models.user import User
from ..models.question import Question
from ..models.solution import Solution
from ..models.faq import FAQ
from ..models.report import Report
from ..models.audit_log import AuditLog

admin_bp = Blueprint("admin", __name__)

# ---- Helpers ----
def admin_required(f):
    """Decorator to require admin role on protected routes."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user or not user.is_admin():
            return jsonify({"error": "Admin access required"}), 403
        return f(*args, **kwargs)
    return decorated_function


# ---- Users ----
@admin_bp.route("/users", methods=["GET"])
@jwt_required()
@admin_required
def get_users():
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)

    users = User.query.paginate(page=page, per_page=per_page, error_out=False)
    return jsonify({
        "users": [u.to_dict() for u in users.items],
        "total": users.total,
        "pages": users.pages,
        "current_page": page
    }), 200


@admin_bp.route("/users/<int:user_id>", methods=["PUT"])
@jwt_required()
@admin_required
def update_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json() or {}
    role = data.get("role")
    if role in ["student", "admin"]:
        user.role = role
        db.session.commit()
        return jsonify({"message": "User updated successfully", "user": user.to_dict()}), 200

    return jsonify({"error": "Invalid role"}), 400


@admin_bp.route("/users/<int:user_id>", methods=["DELETE"])
@jwt_required()
@admin_required
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "User deleted successfully"}), 200


# ---- Questions ----
@admin_bp.route("/questions", methods=["GET"])
@jwt_required()
@admin_required
def get_all_questions():
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)

    questions = Question.query.paginate(page=page, per_page=per_page, error_out=False)
    return jsonify({
        "questions": [q.to_dict() for q in questions.items],
        "total": questions.total,
        "pages": questions.pages,
        "current_page": page
    }), 200


@admin_bp.route("/questions/<int:question_id>", methods=["DELETE"])
@jwt_required()
@admin_required
def delete_question(question_id):
    question = Question.query.get(question_id)
    if not question:
        return jsonify({"error": "Question not found"}), 404

    db.session.delete(question)
    db.session.commit()
    return jsonify({"message": "Question deleted successfully"}), 200


# ---- Solutions ----
@admin_bp.route("/solutions/<int:solution_id>", methods=["DELETE"])
@jwt_required()
@admin_required
def delete_solution(solution_id):
    solution = Solution.query.get(solution_id)
    if not solution:
        return jsonify({"error": "Solution not found"}), 404

    db.session.delete(solution)
    db.session.commit()
    return jsonify({"message": "Solution deleted successfully"}), 200


# ---- Stats ----
@admin_bp.route("/stats", methods=["GET"])
@jwt_required()
@admin_required
def get_stats():
    return jsonify({
        "totalUsers": User.query.count(),
        "totalQuestions": Question.query.count(),
        "totalAnswers": Solution.query.count(),
        "pendingReports": Report.query.filter_by(status="pending").count(),
        "resolvedReports": Report.query.filter_by(status="resolved").count(),
        # Replace with actual logic if you track active users
        "activeUsers": 0
    }), 200


# ---- Reports ----
@admin_bp.route("/reports", methods=["GET"])
@jwt_required()
@admin_required
def get_reports():
    reports = Report.query.order_by(Report.created_at.desc()).all()
    return jsonify([r.to_dict() for r in reports]), 200


@admin_bp.route("/reports/<int:report_id>/resolve", methods=["POST"])
@jwt_required()
@admin_required
def resolve_report(report_id):
    report = Report.query.get(report_id)
    if not report:
        return jsonify({"error": "Report not found"}), 404

    report.status = "resolved"
    db.session.commit()

    log = AuditLog(
        action="resolve_report",
        target=f"Report {report.id}",
        admin_id=get_jwt_identity(),
        reason="Report marked resolved"
    )
    db.session.add(log)
    db.session.commit()

    return jsonify({"message": "Report resolved", "report": report.to_dict()}), 200


@admin_bp.route("/reports/<int:report_id>/dismiss", methods=["POST"])
@jwt_required()
@admin_required
def dismiss_report(report_id):
    report = Report.query.get(report_id)
    if not report:
        return jsonify({"error": "Report not found"}), 404

    report.status = "dismissed"
    db.session.commit()

    log = AuditLog(
        action="dismiss_report",
        target=f"Report {report.id}",
        admin_id=get_jwt_identity(),
        reason="Report dismissed"
    )
    db.session.add(log)
    db.session.commit()

    return jsonify({"message": "Report dismissed", "report": report.to_dict()}), 200


# ---- Audit Logs ----
@admin_bp.route("/audit", methods=["GET"])
@jwt_required()
@admin_required
def get_audit_logs():
    logs = AuditLog.query.order_by(AuditLog.timestamp.desc()).limit(50).all()
    return jsonify([log.to_dict() for log in logs]), 200
