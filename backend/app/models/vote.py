from .. import db
from datetime import datetime

class Vote(db.Model):
    __tablename__ = 'votes'
    
    id = db.Column(db.Integer, primary_key=True)
    solution_id = db.Column(db.Integer, db.ForeignKey('solutions.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    vote_type = db.Column(db.String(10), nullable=False)  # 'up' or 'down'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Unique constraint on user_id and solution_id
    __table_args__ = (db.UniqueConstraint('user_id', 'solution_id', name='unique_user_solution_vote'),)
    
    def to_dict(self):
        """Convert vote to dictionary"""
        return {
            'id': self.id,
            'solution_id': self.solution_id,
            'user_id': self.user_id,
            'vote_type': self.vote_type,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
