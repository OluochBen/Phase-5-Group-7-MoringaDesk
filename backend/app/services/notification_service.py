from .. import db
from ..models import Notification, Solution, Question, Vote


class NotificationService:
    @staticmethod
    def _serialize(notification):
        base = notification.to_dict()
        base["read"] = notification.is_read
        base["title"] = (notification.type or "notification").replace("_", " ").title()
        base["message"] = base["title"]
        base["actionUrl"] = None

        if notification.type in {"answer", "new_answer"}:
            solution = Solution.query.get(notification.reference_id)
            if solution:
                question = Question.query.get(solution.question_id)
                question_title = question.title if question else "your question"
                base["message"] = f"New answer on {question_title}"
                base["actionUrl"] = f"/questions/{solution.question_id}"
        elif notification.type == "vote":
            vote = Vote.query.get(notification.reference_id)
            if vote:
                solution = Solution.query.get(vote.solution_id)
                if solution:
                    base["message"] = "Your answer received a new vote"
                    base["actionUrl"] = f"/questions/{solution.question_id}"

        return base

    @staticmethod
    def get_user_notifications(user_id, page=1, per_page=10, unread_only=False):
        """Get notifications for a user"""
        query = Notification.query.filter_by(user_id=user_id)

        if unread_only:
            query = query.filter_by(is_read=False)

        query = query.order_by(Notification.created_at.desc())
        notifications = db.paginate(query, page=page, per_page=per_page, error_out=False)

        items = [NotificationService._serialize(n) for n in notifications.items]
        meta = {
            "current_page": notifications.page,
            "pages": notifications.pages,
            "per_page": notifications.per_page,
            "total": notifications.total,
        }

        return {
            "notifications": items,
            "items": items,
            "meta": meta,
            "total": notifications.total,
            "pages": notifications.pages,
            "current_page": notifications.page,
        }

    @staticmethod
    def mark_notification_read(notification_id, user_id):
        """Mark a notification as read"""
        notification = Notification.query.filter_by(
            id=notification_id, user_id=user_id
        ).first()

        if not notification:
            return {"error": "Notification not found"}, 404

        notification.is_read = True
        db.session.commit()

        NotificationService._push_unread_update(user_id)
        return {"message": "Notification marked as read"}, 200

    @staticmethod
    def mark_all_notifications_read(user_id):
        """Mark all notifications as read for a user"""
        Notification.query.filter_by(user_id=user_id, is_read=False).update({"is_read": True})
        db.session.commit()

        NotificationService._push_unread_update(user_id)
        return {"message": "All notifications marked as read"}, 200

    @staticmethod
    def get_unread_count(user_id):
        """Get count of unread notifications"""
        count = Notification.query.filter_by(user_id=user_id, is_read=False).count()
        return {"unread_count": count}

    @staticmethod
    def _push_unread_update(user_id):
        try:
            from .websocket_service import WebSocketService
        except ImportError:
            WebSocketService = None

        if not user_id or WebSocketService is None:
            return

        unread_count = NotificationService.get_unread_count(user_id)["unread_count"]
        WebSocketService.send_notification_count_update(user_id, unread_count)
