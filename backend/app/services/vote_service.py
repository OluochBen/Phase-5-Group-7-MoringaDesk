from .. import db
from ..models import Vote, Solution, Notification
from ..schemas import VoteCreateSchema
from marshmallow import ValidationError

class VoteService:
    @staticmethod
    def vote_solution(self, solution_id, data, user_id):
        """Vote on a solution"""
        # Check if solution exists
        solution = Solution.query.get(solution_id)
        if not solution:
            return {'error': 'Solution not found'}, 404
        
        schema = VoteCreateSchema()
        try:
            validated_data = schema.load(data)
        except ValidationError as err:
            return {'error': err.messages}, 400
        
        # Check if user already voted
        existing_vote = Vote.query.filter_by(
            user_id=user_id, solution_id=solution_id
        ).first()
        
        if existing_vote:
            # Update existing vote
            old_vote_type = existing_vote.vote_type
            existing_vote.vote_type = validated_data['vote_type']
            
            # If vote changed to upvote, create notifications
            if validated_data['vote_type'] == 'up' and old_vote_type != 'up':
                self._create_upvote_notifications(solution, user_id, existing_vote.id)
            
            db.session.commit()
        else:
            # Create new vote
            vote = Vote(
                solution_id=solution_id,
                user_id=user_id,
                vote_type=validated_data['vote_type']
            )
            db.session.add(vote)
            db.session.flush()  # Get the vote ID
            
            # If it's an upvote, create notifications
            if validated_data['vote_type'] == 'up':
                self._create_upvote_notifications(solution, user_id, vote.id)
            
            db.session.commit()
        
        return {'message': 'Vote recorded successfully'}, 200
    
    @staticmethod
    def remove_vote(solution_id, user_id):
        """Remove vote from solution"""
        vote = Vote.query.filter_by(
            user_id=user_id, solution_id=solution_id
        ).first()
        
        if not vote:
            return {'error': 'Vote not found'}, 404
        
        db.session.delete(vote)
        db.session.commit()
        
        return {'message': 'Vote removed successfully'}, 200
    
    @staticmethod
    def get_votes_by_solution(solution_id):
        """Get all votes for a solution"""
        votes = Vote.query.filter_by(solution_id=solution_id).all()
        return [vote.to_dict() for vote in votes]
    
    @staticmethod
    def _create_upvote_notifications(solution, voter_user_id, vote_id):
        """Create notifications for upvote - notify both question creator and solution creator"""
        from ..models import Question
        
        # Get the question to find its creator
        question = Question.query.get(solution.question_id)
        if not question:
            return
        
        # Notify solution author about upvote (if not voting on own solution)
        if solution.user_id != voter_user_id:
            notification = Notification(
                user_id=solution.user_id,
                type='vote',
                reference_id=vote_id
            )
            db.session.add(notification)
        
        # Notify question author about upvote (if not the same as solution author and not the voter)
        if (question.user_id != solution.user_id and 
            question.user_id != voter_user_id):
            notification = Notification(
                user_id=question.user_id,
                type='vote',
                reference_id=vote_id
            )
            db.session.add(notification)
        
        # Send WebSocket notifications
        from .websocket_service import WebSocketService
        from .notification_service import NotificationService
        
        # Notify solution author via WebSocket
        if solution.user_id != voter_user_id:
            unread_count = NotificationService.get_unread_count(solution.user_id)
            WebSocketService.send_notification_count_update(solution.user_id, unread_count['unread_count'])
        
        # Notify question author via WebSocket
        if (question.user_id != solution.user_id and 
            question.user_id != voter_user_id):
            unread_count = NotificationService.get_unread_count(question.user_id)
            WebSocketService.send_notification_count_update(question.user_id, unread_count['unread_count'])
