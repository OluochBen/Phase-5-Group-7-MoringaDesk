from .. import db
from ..models import Vote, Solution, Notification
from ..schemas import VoteCreateSchema
from marshmallow import ValidationError

class VoteService:
    @staticmethod
    def vote_solution(solution_id, data, user_id):
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
            existing_vote.vote_type = validated_data['vote_type']
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
            
            # Notify solution author about vote (if not voting on own solution)
            if solution.user_id != user_id:
                notification = Notification(
                    user_id=solution.user_id,
                    type='vote',
                    reference_id=vote.id
                )
                db.session.add(notification)
            
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
