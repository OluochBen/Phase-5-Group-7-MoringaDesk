from .. import db
from ..models import Solution, Question, Notification, Follow
from sqlalchemy import and_

class SolutionService:
    @staticmethod
    def get_solutions_by_question(question_id, page=1, per_page=10):
        """Get paginated solutions for a specific question"""
        question = Question.query.get_or_404(question_id)
        
        solutions = Solution.query.filter_by(question_id=question_id)\
            .order_by(Solution.created_at.desc())\
            .paginate(page=page, per_page=per_page, error_out=False)
        
        return {
            "solutions": [solution.to_dict() for solution in solutions.items],
            "total": solutions.total,
            "pages": solutions.pages,
            "current_page": page,
            "question": question.to_dict()
        }

    @staticmethod
    def create_solution(question_id, data, user_id):
        """Create a new solution and notify followers"""
        # Validate question exists
        question = Question.query.get_or_404(question_id)
        
        # Create the solution
        solution = Solution(
            question_id=question_id,
            user_id=user_id,
            content=data.get("content")
        )
        
        db.session.add(solution)
        db.session.flush()  # Get the solution ID before committing
        
        # Create notifications for question followers (excluding the solution author)
        followers = Follow.query.filter(
            and_(
                Follow.question_id == question_id,
                Follow.user_id != user_id
            )
        ).all()
        
        for follow in followers:
            notification = Notification(
                user_id=follow.user_id,
                type='new_answer',
                reference_id=solution.id
            )
            db.session.add(notification)
        
        # Also notify the question author if they're not the solution author
        if question.user_id != user_id:
            notification = Notification(
                user_id=question.user_id,
                type='new_answer',
                reference_id=solution.id
            )
            db.session.add(notification)
        
        db.session.commit()
        
        # Send WebSocket notifications
        from .websocket_service import WebSocketService
        from .notification_service import NotificationService
        
        # Notify followers via WebSocket
        for follow in followers:
            unread_count = NotificationService.get_unread_count(follow.user_id)
            WebSocketService.send_notification_count_update(follow.user_id, unread_count['unread_count'])
        
        # Notify question author via WebSocket
        if question.user_id != user_id:
            unread_count = NotificationService.get_unread_count(question.user_id)
            WebSocketService.send_notification_count_update(question.user_id, unread_count['unread_count'])
        
        return solution.to_dict(), 201

    @staticmethod
    def get_solution_by_id(solution_id):
        """Get a specific solution by ID"""
        solution = Solution.query.get_or_404(solution_id)
        return solution.to_dict()

    @staticmethod
    def update_solution(solution_id, data, user_id):
        """Update a solution (only by the author)"""
        solution = Solution.query.get_or_404(solution_id)
        
        # Check if user is the author
        if solution.user_id != user_id:
            return {'error': 'Unauthorized to update this solution'}, 403
        
        solution.content = data.get("content", solution.content)
        db.session.commit()
        
        return solution.to_dict(), 200

    @staticmethod
    def delete_solution(solution_id, user_id):
        """Delete a solution (only by the author or admin)"""
        solution = Solution.query.get_or_404(solution_id)
        
        # Check if user is the author or admin
        from ..models import User
        user = User.query.get(user_id)
        if solution.user_id != user_id and not user.is_admin():
            return {'error': 'Unauthorized to delete this solution'}, 403
        
        db.session.delete(solution)
        db.session.commit()
        
        return {'message': 'Solution deleted successfully'}, 200

    @staticmethod
    def get_user_solutions(user_id, page=1, per_page=10):
        """Get solutions created by a specific user"""
        solutions = Solution.query.filter_by(user_id=user_id)\
            .order_by(Solution.created_at.desc())\
            .paginate(page=page, per_page=per_page, error_out=False)
        
        return {
            "solutions": [solution.to_dict() for solution in solutions.items],
            "total": solutions.total,
            "pages": solutions.pages,
            "current_page": page
        }
