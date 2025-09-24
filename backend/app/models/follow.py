from .. import db
from datetime import datetime

class Follow(db.Model):
    __tablename__ = 'follows'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    question_id = db.Column(db.Integer, db.ForeignKey('questions.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Unique constraint on user_id and question_id
    __table_args__ = (db.UniqueConstraint('user_id', 'question_id', name='unique_user_question_follow'),)
    
    def to_dict(self):
        """Convert follow to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'question_id': self.question_id,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
