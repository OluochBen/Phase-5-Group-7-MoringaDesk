from app import db
from datetime import datetime

class FAQ(db.Model):
    __tablename__ = 'faqs'
    
    id = db.Column(db.Integer, primary_key=True)
    question = db.Column(db.String(255), nullable=False)
    answer = db.Column(db.Text, nullable=False)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        """Convert FAQ to dictionary"""
        return {
            'id': self.id,
            'question': self.question,
            'answer': self.answer,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'creator': self.creator.to_dict() if self.creator else None
        }
