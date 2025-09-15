from app import db
from app.models import Question, Tag, QuestionTag, RelatedQuestion, Follow, Notification
from app.schemas import QuestionCreateSchema
from marshmallow import ValidationError

class QuestionService:
    @staticmethod
    def create_question(data, user_id):
        """Create a new question"""
        print(data)
        schema = QuestionCreateSchema()
        try:
            validated_data = schema.load(data)
        except ValidationError as err:
            return {'error': err.messages}, 400
        
        # Create question
        question = Question(
            user_id=user_id,
            title=validated_data['title'],
            description=validated_data['description'],
            problem_type=validated_data['problem_type']
        )
        
        db.session.add(question)
        db.session.flush()  # Get the question ID
        
        # Add tags if provided
        if validated_data.get('tag_ids'):
            for tag_id in validated_data['tag_ids']:
                tag = Tag.query.get(tag_id)
                if tag:
                    question.tags.append(tag)
        
        db.session.commit()
        
        # Notify followers of similar questions
        QuestionService._notify_similar_questions(question)
        
        return question.to_dict(), 201
    
    @staticmethod
    def get_questions(page=1, per_page=10, problem_type=None, search=None):
        """Get paginated list of questions"""
        query = Question.query
        
        if problem_type:
            query = query.filter(Question.problem_type == problem_type)
        
        if search:
            query = query.filter(
                db.or_(
                    Question.title.contains(search),
                    Question.description.contains(search)
                )
            )
        
        questions = query.order_by(Question.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return {
            'questions': [q.to_dict() for q in questions.items],
            'total': questions.total,
            'pages': questions.pages,
            'current_page': page
        }
    
    @staticmethod
    def get_question_by_id(question_id):
        """Get question by ID with related questions"""
        question = Question.query.get(question_id)
        if not question:
            return None
        
        question_dict = question.to_dict()
        
        # Get related questions
        related_questions = Question.query.join(RelatedQuestion).filter(
            db.or_(
                RelatedQuestion.question_id == question_id,
                RelatedQuestion.related_question_id == question_id
            )
        ).all()
        
        question_dict['related_questions'] = [q.to_dict() for q in related_questions]
        
        return question_dict
    
    @staticmethod
    def follow_question(question_id, user_id):
        """Follow a question"""
        # Check if already following
        existing_follow = Follow.query.filter_by(
            user_id=user_id, question_id=question_id
        ).first()
        
        if existing_follow:
            return {'error': 'Already following this question'}, 400
        
        follow = Follow(user_id=user_id, question_id=question_id)
        db.session.add(follow)
        db.session.commit()
        
        return {'message': 'Question followed successfully'}, 201
    
    @staticmethod
    def unfollow_question(question_id, user_id):
        """Unfollow a question"""
        follow = Follow.query.filter_by(
            user_id=user_id, question_id=question_id
        ).first()
        
        if not follow:
            return {'error': 'Not following this question'}, 404
        
        db.session.delete(follow)
        db.session.commit()
        
        return {'message': 'Question unfollowed successfully'}, 200
    
    @staticmethod
    def link_related_questions(question_id, related_question_id):
        """Link two questions as related"""
        if question_id == related_question_id:
            return {'error': 'Cannot link question to itself'}, 400
        
        # Check if already linked
        existing_link = RelatedQuestion.query.filter_by(
            question_id=question_id, related_question_id=related_question_id
        ).first()
        
        if existing_link:
            return {'error': 'Questions already linked'}, 400
        
        # Create bidirectional link
        link1 = RelatedQuestion(question_id=question_id, related_question_id=related_question_id)
        link2 = RelatedQuestion(question_id=related_question_id, related_question_id=question_id)
        
        db.session.add(link1)
        db.session.add(link2)
        db.session.commit()
        
        return {'message': 'Questions linked successfully'}, 201
    
    @staticmethod
    def _notify_similar_questions(question):
        """Notify followers of similar questions about new question"""
        # Find questions with similar tags
        similar_questions = Question.query.join(Question.tags).filter(
            Tag.id.in_([tag.id for tag in question.tags])
        ).filter(Question.id != question.id).all()
        
        for similar_question in similar_questions:
            # Notify followers of similar questions
            for follow in similar_question.follows:
                notification = Notification(
                    user_id=follow.user_id,
                    type='follow_update',
                    reference_id=question.id
                )
                db.session.add(notification)
        
        db.session.commit()
