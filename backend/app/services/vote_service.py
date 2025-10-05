from marshmallow import ValidationError

from .. import db
from ..models import Vote, Solution, Notification
from ..schemas import VoteCreateSchema
from .solution_service import SolutionService


class VoteService:
    @staticmethod
    def vote_solution(solution_id, data, user_id):
        """Vote on a solution"""
        # Check if solution exists
        solution = Solution.query.get(solution_id)
        if not solution:
            return {'error': 'Solution not found'}, 404

        try:
            voter_id = int(user_id)
        except (TypeError, ValueError):
            voter_id = user_id

        schema = VoteCreateSchema()
        try:
            validated_data = schema.load(data)
        except ValidationError as err:
            return {'error': err.messages}, 400
        
        # Check if user already voted
        existing_vote = Vote.query.filter_by(
            user_id=voter_id, solution_id=solution_id
        ).first()
        
        message = "Vote recorded successfully"
        commit_needed = False

        if existing_vote:
            new_type = validated_data['vote_type']
            if existing_vote.vote_type == new_type:
                message = "Vote unchanged"
            else:
                existing_vote.vote_type = new_type
                message = "Vote updated successfully"
                commit_needed = True
        else:
            # Create new vote
            vote = Vote(
                solution_id=solution_id,
                user_id=voter_id,
                vote_type=validated_data['vote_type']
            )
            db.session.add(vote)
            db.session.flush()  # Get the vote ID
            
            # Notify solution author about vote (if not voting on own solution)
            if solution.user_id != voter_id:
                notification = Notification(
                    user_id=solution.user_id,
                    type='vote',
                    reference_id=vote.id
                )
                db.session.add(notification)
            
            commit_needed = True

        if commit_needed:
            db.session.commit()

        serialized = SolutionService.get_solution_by_id(solution_id, current_user_id=voter_id)
        return {"item": serialized, "message": message}, 200
    
    @staticmethod
    def remove_vote(solution_id, user_id):
        """Remove vote from solution"""
        try:
            voter_id = int(user_id)
        except (TypeError, ValueError):
            voter_id = user_id

        vote = Vote.query.filter_by(
            user_id=voter_id, solution_id=solution_id
        ).first()
        
        if not vote:
            return {'error': 'Vote not found'}, 404
        
        db.session.delete(vote)
        db.session.commit()

        serialized = SolutionService.get_solution_by_id(solution_id, current_user_id=voter_id)
        return {"item": serialized, "message": 'Vote removed successfully'}, 200
    
    @staticmethod
    def get_votes_by_solution(solution_id):
        """Get all votes for a solution"""
        votes = Vote.query.filter_by(solution_id=solution_id).all()
        return [vote.to_dict() for vote in votes]
