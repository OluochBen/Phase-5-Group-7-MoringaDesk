from app import db
from datetime import datetime

class Question(db.Model):
    __tablename__ = 'questions'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    problem_type = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    solutions = db.relationship('Solution', backref='question', lazy=True, cascade='all, delete-orphan')
    tags = db.relationship('Tag', secondary='question_tags', backref='questions', lazy=True)
    follows = db.relationship('Follow', backref='question', lazy=True, cascade='all, delete-orphan')
    
    # Related questions (self-referential)
    related_questions = db.relationship(
        'Question',
        secondary='related_questions',
        primaryjoin='Question.id == related_questions.c.question_id',
        secondaryjoin='Question.id == related_questions.c.related_question_id',
        backref='related_to',
        lazy=True
    )
    
    def to_dict(self):
        """Convert question to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'description': self.description,
            'problem_type': self.problem_type,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'author': self.author.to_dict() if self.author else None,
            'solutions_count': len(self.solutions),
            'tags': [tag.to_dict() for tag in self.tags],
            'follows_count': len(self.follows)
        }
    
    def get_vote_count(self):
        """Get total vote count for all solutions"""
        total_votes = 0
        for solution in self.solutions:
            total_votes += solution.get_vote_count()
        return total_votes