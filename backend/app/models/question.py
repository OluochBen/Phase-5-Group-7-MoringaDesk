# app/models/questions.py

from app import db

class Question(db.Model):
    __tablename__ = 'questions'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    body = db.Column(db.Text, nullable=False)
    user_id = db.Column(db.Integer, nullable=False)

    # Relationship to answers
    answers = db.relationship('Answer', backref='question', cascade='all, delete-orphan')
