from marshmallow import ValidationError

from .. import db
from ..models import Vote, Solution, Notification
from ..schemas import VoteCreateSchema
from .solution_service import SolutionService


class VoteService:
    @staticmethod
    def vote_solution(solution_id, data, user_id):
        """Create or update a vote on a solution."""
        solution = Solution.query.get(solution_id)
        if not solution:
            return {"error": "Solution not found"}, 404

        try:
            voter_id = int(user_id)
        except (TypeError, ValueError):
            voter_id = user_id

        schema = VoteCreateSchema()
        try:
            validated_data = schema.load(data)
        except ValidationError as err:
            return {"error": err.messages}, 400

        existing_vote = Vote.query.filter_by(
            user_id=voter_id, solution_id=solution_id
        ).first()

        message = "Vote recorded successfully"
        commit_needed = False
        notified_users = set()

        new_type = validated_data["vote_type"]

        if existing_vote:
            if existing_vote.vote_type == new_type:
                message = "Vote unchanged"
            else:
                existing_vote.vote_type = new_type
                message = "Vote updated successfully"
                commit_needed = True
                if new_type == "up":
                    notified_users.update(
                        VoteService._create_upvote_notifications(solution, voter_id, existing_vote.id)
                    )
        else:
            vote = Vote(
                solution_id=solution_id,
                user_id=voter_id,
                vote_type=new_type,
            )
            db.session.add(vote)
            db.session.flush()  # assign vote.id

            if new_type == "up":
                notified_users.update(
                    VoteService._create_upvote_notifications(solution, voter_id, vote.id)
                )
            commit_needed = True

        if commit_needed:
            db.session.commit()

        if notified_users:
            SolutionService._push_unread_updates(notified_users)

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
            return {"error": "Vote not found"}, 404

        db.session.delete(vote)
        db.session.commit()

        serialized = SolutionService.get_solution_by_id(solution_id, current_user_id=voter_id)
        return {"item": serialized, "message": "Vote removed successfully"}, 200

    @staticmethod
    def get_votes_by_solution(solution_id):
        """Get all votes for a solution"""
        votes = Vote.query.filter_by(solution_id=solution_id).all()
        return [vote.to_dict() for vote in votes]

    @staticmethod
    def _create_upvote_notifications(solution, voter_user_id, vote_id):
        """Create notifications for an upvote.

        Returns a set of user IDs that should have their unread counts refreshed.
        """
        notified_users = set()

        from ..models import Question

        question = Question.query.get(solution.question_id)
        if not question:
            return notified_users

        # Notify solution author about upvote (if not voting on own solution)
        if solution.user_id != voter_user_id:
            notification = Notification(
                user_id=solution.user_id,
                type="vote",
                reference_id=vote_id,
            )
            db.session.add(notification)
            notified_users.add(solution.user_id)

        # Notify question author (if distinct from solution author and voter)
        if question.user_id not in {solution.user_id, voter_user_id}:
            notification = Notification(
                user_id=question.user_id,
                type="vote",
                reference_id=vote_id,
            )
            db.session.add(notification)
            notified_users.add(question.user_id)

        return notified_users
