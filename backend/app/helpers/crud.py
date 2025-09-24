# app/helpers/crud.py
from .. import db
from ..models import db, User, Question, Solution, Vote, Tag, Follow, Notification, FAQ, LinkedQuestion, Report, AuditLog
from sqlalchemy import func
from typing import List, Optional

def get_user_by_email(email: str) -> Optional[User]:
    return User.query.filter_by(email=email).first()

def create_user(email: str, username: str, password_hash: str, role: str = "student"):
    user = User(email=email, username=username, password_hash=password_hash, role=role)
    db.session.add(user)
    db.session.commit()
    return user

def create_question(user_id: str, title: str, content: str, category: str, tags: List[str] = None):
    q = Question(user_id=user_id, title=title, content=content, category=category)
    db.session.add(q)
    db.session.commit()
    if tags:
        set_tags_for_question(q, tags)
    return q

def list_questions(limit=10, offset=0):
    return Question.query.order_by(Question.created_at.desc()).offset(offset).limit(limit).all()

def create_solution(user_id: str, question_id: str, content: str):
    sol = Solution(user_id=user_id, question_id=question_id, content=content)
    db.session.add(sol)
    db.session.commit()
    return sol

def accept_solution(solution: Solution):
    solution.is_accepted = True
    db.session.commit()
    return solution

def create_vote(user_id: str, solution_id: str, value: int):
    vote = Vote(user_id=user_id, solution_id=solution_id, value=value)
    db.session.add(vote)
    sol = Solution.query.get(solution_id)
    if sol:
        sol.vote_score += value
    db.session.commit()
    return vote

def get_or_create_tag(name: str):
    tag = Tag.query.filter_by(name=name).first()
    if not tag:
        tag = Tag(name=name)
        db.session.add(tag)
        db.session.commit()
    return tag

def set_tags_for_question(question: Question, tag_names: List[str]):
    question.tags_rel.clear()
    for t in tag_names:
        tag = get_or_create_tag(t)
        question.tags_rel.append(tag)
    db.session.commit()
    return question

def follow_question(user_id: str, question_id: str):
    fl = Follow.query.filter_by(user_id=user_id, question_id=question_id).first()
    if not fl:
        fl = Follow(user_id=user_id, question_id=question_id)
        db.session.add(fl)
        db.session.commit()
    return fl

def create_notification(user_id: str, type: str, payload: dict):
    notif = Notification(user_id=user_id, type=type, payload=payload)
    db.session.add(notif)
    db.session.commit()
    return notif

def create_faq(question: str, answer: str, author_id: str, category: str = None):
    faq = FAQ(question=question, answer=answer, created_by=author_id, category=category)
    db.session.add(faq)
    db.session.commit()
    return faq

def link_questions(question_id: str, linked_question_id: str):
    if question_id == linked_question_id:
        return None
    lq = LinkedQuestion.query.filter_by(question_id=question_id, linked_question_id=linked_question_id).first()
    if not lq:
        lq = LinkedQuestion(question_id=question_id, linked_question_id=linked_question_id)
        db.session.add(lq)
        db.session.commit()
    return lq

def create_report(reporter_id: str, object_type: str, object_id: str, reason: str):
    rpt = Report(reporter_id=reporter_id, object_type=object_type, object_id=object_id, reason=reason)
    db.session.add(rpt)
    db.session.commit()
    return rpt

def create_audit_log(actor_id: str, action: str, meta: dict = None):
    log = AuditLog(actor_id=actor_id, action=action, meta=meta or {})
    db.session.add(log)
    db.session.commit()
    return log
