from sqlalchemy.orm import joinedload
from marshmallow import ValidationError

from .. import db
from ..models import Solution, Question, Notification, User, Follow
from ..schemas.solution_schema import SolutionCreateSchema


class SolutionService:
    @staticmethod
    def _serialize_solution(solution, current_user_id=None):
        my_vote = 0
        if current_user_id is not None:
            for vote in solution.votes:
                if vote.user_id == current_user_id:
                    my_vote = 1 if vote.vote_type == "up" else -1
                    break

        author = solution.author.to_dict() if getattr(solution, "author", None) else None
        created_at = solution.created_at.isoformat() if solution.created_at else None
        updated_at = solution.updated_at.isoformat() if solution.updated_at else None

        return {
            "id": solution.id,
            "question_id": solution.question_id,
            "user_id": solution.user_id,
            "content": solution.content,
            "body": solution.content,
            "created_at": created_at,
            "updated_at": updated_at,
            "timestamp": created_at,
            "author": author,
            "authorId": author.get("id") if author else solution.user_id,
            "authorName": author.get("name") if author else None,
            "vote_count": solution.get_vote_count(),
            "votes": solution.get_vote_count(),
            "upvotes": solution.get_upvotes(),
            "downvotes": solution.get_downvotes(),
            "my_vote": my_vote,
            "user_vote": my_vote,
        }

    @staticmethod
    def get_solutions_by_question(question_id, page=1, per_page=10, current_user_id=None):
        query = (
            Solution.query.filter_by(question_id=question_id)
            .options(joinedload(Solution.author), joinedload(Solution.votes))
            .order_by(Solution.created_at.asc())
        )

        pagination = db.paginate(query, page=page, per_page=per_page, error_out=False)

        items = [
            SolutionService._serialize_solution(solution, current_user_id=current_user_id)
            for solution in pagination.items
        ]

        return {
            "items": items,
            "solutions": items,
            "total": pagination.total,
            "pages": pagination.pages,
            "current_page": pagination.page,
            "per_page": pagination.per_page,
        }

    @staticmethod
    def get_solution_by_id(solution_id, current_user_id=None):
        solution = (
            Solution.query.options(joinedload(Solution.author), joinedload(Solution.votes))
            .filter_by(id=solution_id)
            .first()
        )
        if not solution:
            return None
        return SolutionService._serialize_solution(solution, current_user_id=current_user_id)

    @staticmethod
    def get_user_solutions(user_id, page=1, per_page=10, current_user_id=None):
        query = (
            Solution.query.filter_by(user_id=user_id)
            .options(joinedload(Solution.author), joinedload(Solution.votes))
            .order_by(Solution.created_at.desc())
        )
        pagination = db.paginate(query, page=page, per_page=per_page, error_out=False)
        items = [
            SolutionService._serialize_solution(solution, current_user_id=current_user_id)
            for solution in pagination.items
        ]
        meta = {
            "current_page": pagination.page,
            "pages": pagination.pages,
            "per_page": pagination.per_page,
            "total": pagination.total,
        }
        return {"items": items, "meta": meta}

    @staticmethod
    def create_solution(question_id, data, user_id):
        question = Question.query.get(question_id)
        if not question:
            return {"error": "Question not found"}, 404

        schema = SolutionCreateSchema()
        try:
            payload = schema.load(data or {})
        except ValidationError as err:
            return {"error": err.messages}, 400

        solution = Solution(
            question_id=question_id,
            user_id=user_id,
            content=payload["content"],
        )

        try:
            db.session.add(solution)
            db.session.flush()

            notified_user_ids = set()

            # Notify followers of the question (excluding the author of the solution)
            followers = (
                Follow.query.filter(Follow.question_id == question_id)
                .filter(Follow.user_id != user_id)
                .all()
            )
            for follow in followers:
                notification = Notification(
                    user_id=follow.user_id,
                    type="new_answer",
                    reference_id=solution.id,
                )
                db.session.add(notification)
                notified_user_ids.add(follow.user_id)

            # Notify question author about new answer (skip self notifications)
            if question.user_id != user_id:
                notification = Notification(
                    user_id=question.user_id,
                    type="new_answer",
                    reference_id=solution.id,
                )
                db.session.add(notification)
                notified_user_ids.add(question.user_id)

            db.session.commit()
        except Exception as exc:
            db.session.rollback()
            return {"error": str(exc)}, 500

        if notified_user_ids:
            SolutionService._push_unread_updates(notified_user_ids)

        serialized = SolutionService.get_solution_by_id(solution.id, current_user_id=user_id)
        return serialized, 201

    @staticmethod
    def update_solution(solution_id, data, user_id):
        solution = Solution.query.get(solution_id)
        if not solution:
            return {"error": "Solution not found"}, 404

        if solution.user_id != user_id:
            user = User.query.get(user_id)
            if not user or not user.is_admin():
                return {"error": "Not authorized to update this solution"}, 403

        schema = SolutionCreateSchema(partial=True)
        try:
            payload = schema.load(data or {})
        except ValidationError as err:
            return {"error": err.messages}, 400

        if "content" in payload:
            solution.content = payload["content"]

        try:
            db.session.commit()
        except Exception as exc:
            db.session.rollback()
            return {"error": str(exc)}, 500

        serialized = SolutionService.get_solution_by_id(solution.id, current_user_id=user_id)
        return serialized, 200

    @staticmethod
    def delete_solution(solution_id, user_id):
        solution = Solution.query.get(solution_id)
        if not solution:
            return {"error": "Solution not found"}, 404

        if solution.user_id != user_id:
            user = User.query.get(user_id)
            if not user or not user.is_admin():
                return {"error": "Not authorized to delete this solution"}, 403

        try:
            db.session.delete(solution)
            db.session.commit()
        except Exception as exc:
            db.session.rollback()
            return {"error": str(exc)}, 500

        return {"message": "Solution deleted"}, 200

    @staticmethod
    def _push_unread_updates(user_ids):
        if not user_ids:
            return
        try:
            from .notification_service import NotificationService
            from .websocket_service import WebSocketService
        except ImportError:
            NotificationService = None
            WebSocketService = None

        if not NotificationService:
            return

        for uid in set(user_ids):
            unread = NotificationService.get_unread_count(uid)["unread_count"]
            if WebSocketService:
                WebSocketService.send_notification_count_update(uid, unread)
