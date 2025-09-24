from .. import db
from datetime import datetime

class RelatedQuestion(db.Model):
    __tablename__ = 'related_questions'
    
    id = db.Column(db.Integer, primary_key=True)
    question_id = db.Column(db.Integer, db.ForeignKey('questions.id'), nullable=False)
    related_question_id = db.Column(db.Integer, db.ForeignKey('questions.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Unique constraint on question_id and related_question_id
    __table_args__ = (db.UniqueConstraint('question_id', 'related_question_id', name='unique_related_question'),)
    
    def to_dict(self):
        """Convert related_question to dictionary"""
        return {
            'id': self.id,
            'question_id': self.question_id,
            'related_question_id': self.related_question_id,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
