from .. import db
from ..models import FAQ
from ..schemas import FAQCreateSchema
from marshmallow import ValidationError

class FAQService:
    @staticmethod
    def create_faq(data, user_id):
        """Create a new FAQ"""
        schema = FAQCreateSchema()
        try:
            validated_data = schema.load(data)
        except ValidationError as err:
            return {'error': err.messages}, 400
        
        faq = FAQ(
            question=validated_data['question'],
            answer=validated_data['answer'],
            created_by=user_id
        )
        
        db.session.add(faq)
        db.session.commit()
        
        return faq.to_dict(), 201
    
    @staticmethod
    def get_faqs(page=1, per_page=10):
        """Get paginated list of FAQs"""
        query = FAQ.query.order_by(FAQ.created_at.desc())
        faqs = db.paginate(query, page=page, per_page=per_page, error_out=False)
        
        return {
            'faqs': [f.to_dict() for f in faqs.items],
            'total': faqs.total,
            'pages': faqs.pages,
            'current_page': page
        }
    
    @staticmethod
    def get_faq_by_id(faq_id):
        """Get FAQ by ID"""
        faq = FAQ.query.get(faq_id)
        if not faq:
            return None
        
        return faq.to_dict()
    
    @staticmethod
    def update_faq(faq_id, data, user_id):
        """Update an FAQ"""
        faq = FAQ.query.get(faq_id)
        if not faq:
            return {'error': 'FAQ not found'}, 404
        
        schema = FAQCreateSchema()
        try:
            validated_data = schema.load(data)
        except ValidationError as err:
            return {'error': err.messages}, 400
        
        faq.question = validated_data['question']
        faq.answer = validated_data['answer']
        
        db.session.commit()
        
        return faq.to_dict(), 200
    
    @staticmethod
    def delete_faq(faq_id):
        """Delete an FAQ"""
        faq = FAQ.query.get(faq_id)
        if not faq:
            return {'error': 'FAQ not found'}, 404
        
        db.session.delete(faq)
        db.session.commit()
        
        return {'message': 'FAQ deleted successfully'}, 200
