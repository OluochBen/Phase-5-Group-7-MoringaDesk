from app import db
from app.models import Notification

class NotificationService:
    @staticmethod
    def get_user_notifications(user_id, page=1, per_page=10, unread_only=False):
        """Get notifications for a user"""
        query = Notification.query.filter_by(user_id=user_id)
        
        if unread_only:
            query = query.filter_by(is_read=False)
        
        notifications = query.order_by(Notification.created_at.desc())\
            .paginate(page=page, per_page=per_page, error_out=False)
        
        return {
            'notifications': [n.to_dict() for n in notifications.items],
            'total': notifications.total,
            'pages': notifications.pages,
            'current_page': page
        }
    
    @staticmethod
    def mark_notification_read(notification_id, user_id):
        """Mark a notification as read"""
        notification = Notification.query.filter_by(
            id=notification_id, user_id=user_id
        ).first()
        
        if not notification:
            return {'error': 'Notification not found'}, 404
        
        notification.is_read = True
        db.session.commit()
        
        return {'message': 'Notification marked as read'}, 200
    
    @staticmethod
    def mark_all_notifications_read(user_id):
        """Mark all notifications as read for a user"""
        Notification.query.filter_by(user_id=user_id, is_read=False)\
            .update({'is_read': True})
        db.session.commit()
        
        return {'message': 'All notifications marked as read'}, 200
    
    @staticmethod
    def get_unread_count(user_id):
        """Get count of unread notifications"""
        count = Notification.query.filter_by(user_id=user_id, is_read=False).count()
        return {'unread_count': count}
