# app/routes/questions.py

from flask import Blueprint, request, jsonify
from app import db
from app.models.question import Question  # ← you're using the model here

questions_bp = Blueprint('questions', __name__)

@questions_bp.route('/questions', methods=['GET'])
def get_questions():
    questions = Question.query.all()
    return jsonify([
        {"id": q.id, "title": q.title, "body": q.body}
        for q in questions
    ])
