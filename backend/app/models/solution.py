from .. import db
from datetime import datetime

class Solution(db.Model):
    __tablename__ = 'solutions'
    
    id = db.Column(db.Integer, primary_key=True)
    question_id = db.Column(db.Integer, db.ForeignKey('questions.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    votes = db.relationship('Vote', backref='solution', lazy=True, cascade='all, delete-orphan')
    
    def get_vote_count(self):
        """Get net vote count (upvotes - downvotes)"""
        upvotes = len([v for v in self.votes if v.vote_type == 'up'])
        downvotes = len([v for v in self.votes if v.vote_type == 'down'])
        return upvotes - downvotes
    
    def get_upvotes(self):
        """Get number of upvotes"""
        return len([v for v in self.votes if v.vote_type == 'up'])
    
    def get_downvotes(self):
        """Get number of downvotes"""
        return len([v for v in self.votes if v.vote_type == 'down'])
    
    def to_dict(self):
        """Convert solution to dictionary"""
        return {
            'id': self.id,
            'question_id': self.question_id,
            'user_id': self.user_id,
            'content': self.content,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'author': self.author.to_dict() if self.author else None,
            'vote_count': self.get_vote_count(),
            'upvotes': self.get_upvotes(),
            'downvotes': self.get_downvotes()
        }