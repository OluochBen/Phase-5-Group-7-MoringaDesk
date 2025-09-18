from app import db
from app.models import Solution, Question, Follow, Notification
from app.schemas import SolutionCreateSchema
from marshmallow import ValidationError

class SolutionService:
    @staticmethod
    def create_solution(question_id, data, user_id):
        """Create a new solution for a question"""
        # Check if question exists
        question = Question.query.get(question_id)
        if not question:
            return {'error': 'Question not found'}, 404
        
        schema = SolutionCreateSchema()
        try:
            validated_data = schema.load(data)
        except ValidationError as err:
            return {'error': err.messages}, 400
        
        # Create solution
        solution = Solution(
            question_id=question_id,
            user_id=user_id,
            content=validated_data['content']
        )
        
        db.session.add(solution)
        db.session.flush()  # Get the solution ID
        
        # Notify question followers about new answer
        for follow in question.follows:
            if follow.user_id != user_id:  # Don't notify the solution author
                notification = Notification(
                    user_id=follow.user_id,
                    type='new_answer',
                    reference_id=solution.id
                )
                db.session.add(notification)
        
        db.session.commit()
        
        return solution.to_dict(), 201
    
    @staticmethod
    def get_solutions_by_question(question_id, page=1, per_page=10):
        """Get solutions for a question"""
        question = Question.query.get(question_id)
        if not question:
            return {'error': 'Question not found'}, 404
        
        solutions = Solution.query.filter_by(question_id=question_id)\
            .order_by(Solution.created_at.desc())\
            .paginate(page=page, per_page=per_page, error_out=False)
        
        return {
            'solutions': [s.to_dict() for s in solutions.items],
            'total': solutions.total,
            'pages': solutions.pages,
            'current_page': page
        }
    
    @staticmethod
    def get_solution_by_id(solution_id):
        """Get solution by ID"""
        solution = Solution.query.get(solution_id)
        if not solution:
            return None
        
        return solution.to_dict()
