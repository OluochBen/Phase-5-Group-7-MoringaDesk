from .. import db

class QuestionTag(db.Model):
    __tablename__ = 'question_tags'
    
    id = db.Column(db.Integer, primary_key=True)
    question_id = db.Column(db.Integer, db.ForeignKey('questions.id'), nullable=False)
    tag_id = db.Column(db.Integer, db.ForeignKey('tags.id'), nullable=False)
    
    # Unique constraint on question_id and tag_id
    __table_args__ = (db.UniqueConstraint('question_id', 'tag_id', name='unique_question_tag'),)
    
    def to_dict(self):
        """Convert question_tag to dictionary"""
        return {
            'id': self.id,
            'question_id': self.question_id,
            'tag_id': self.tag_id
        }
