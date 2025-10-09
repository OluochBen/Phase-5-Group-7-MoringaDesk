from datetime import datetime

from sqlalchemy import distinct, func

from .. import db
from ..models import (
    Follow,
    Question,
    QuestionTag,
    Solution,
    Tag,
    User,
    Vote,
)
from .question_service import QuestionService


class AdminDashboardService:
    @staticmethod
    def _format_timeago(value):
        if not value:
            return None
        if isinstance(value, str):
            try:
                timestamp = datetime.fromisoformat(value.replace("Z", "+00:00"))
            except ValueError:
                return value
        else:
            timestamp = value
        now = datetime.utcnow()
        diff = now - timestamp
        minutes = diff.total_seconds() / 60
        if minutes < 1:
            return "just now"
        if minutes < 60:
            return f"{int(minutes)}m ago"
        hours = minutes / 60
        if hours < 24:
            return f"{int(hours)}h ago"
        days = hours / 24
        if days < 7:
            return f"{int(days)}d ago"
        weeks = days / 7
        if weeks < 4:
            return f"{int(weeks)}w ago"
        months = days / 30
        if months < 12:
            return f"{int(months)}mo ago"
        years = days / 365
        return f"{int(years)}y ago"

    @staticmethod
    def get_dashboard(current_user_id=None, limit_questions=30):
        total_questions = db.session.query(func.count(Question.id)).scalar() or 0
        answered_questions = (
            db.session.query(func.count(distinct(Question.id)))
            .join(Solution, Solution.question_id == Question.id)
            .scalar()
            or 0
        )
        total_answers = db.session.query(func.count(Solution.id)).scalar() or 0
        total_views = db.session.query(func.count(Follow.id)).scalar() or 0
        followed_questions = (
            db.session.query(func.count(distinct(Follow.question_id))).scalar() or 0
        )
        total_votes = db.session.query(func.count(Vote.id)).scalar() or 0
        bounty_questions = (
            db.session.query(func.count(Question.id))
            .filter(Question.problem_type.ilike("%bounty%"))
            .scalar()
            or 0
        )

        answer_rate = (
            round((answered_questions / total_questions) * 100, 1)
            if total_questions
            else 0.0
        )

        question_query = (
            QuestionService._base_query()
            .order_by(Question.created_at.desc())
            .limit(limit_questions)
        )
        question_rows = question_query.all()
        serialized_questions = []
        featured_count = 0
        bounty_count = 0
        following_count = 0

        for row in question_rows:
            item = QuestionService._serialize_question(
                row, include_answers=False, current_user_id=current_user_id
            )
            if item.get("is_featured"):
                featured_count += 1
            if (item.get("bounty") or 0) > 0:
                bounty_count += 1
            if item.get("follows_count"):
                following_count += 1
            serialized_questions.append(item)

        tag_rows = (
            db.session.query(Tag.name, func.count(QuestionTag.id).label("count"))
            .join(QuestionTag, QuestionTag.tag_id == Tag.id)
            .group_by(Tag.id)
            .order_by(func.count(QuestionTag.id).desc())
            .limit(6)
            .all()
        )
        popular_tags = [
            {"name": name, "count": count}
            for name, count in tag_rows
            if name is not None
        ]

        question_counts_sub = (
            db.session.query(
                Question.user_id.label("user_id"),
                func.count(Question.id).label("question_count"),
            )
            .group_by(Question.user_id)
            .subquery()
        )

        solution_counts_sub = (
            db.session.query(
                Solution.user_id.label("user_id"),
                func.count(Solution.id).label("solution_count"),
            )
            .group_by(Solution.user_id)
            .subquery()
        )

        contributor_rows = (
            db.session.query(
                User.id,
                User.name,
                func.coalesce(question_counts_sub.c.question_count, 0).label(
                    "questions"
                ),
                func.coalesce(solution_counts_sub.c.solution_count, 0).label(
                    "answers"
                ),
            )
            .outerjoin(question_counts_sub, question_counts_sub.c.user_id == User.id)
            .outerjoin(solution_counts_sub, solution_counts_sub.c.user_id == User.id)
            .filter(User.role != "admin")
            .order_by(
                (
                    func.coalesce(solution_counts_sub.c.solution_count, 0) * 2
                    + func.coalesce(question_counts_sub.c.question_count, 0)
                ).desc()
            )
            .limit(3)
            .all()
        )

        top_contributors = []
        for rank, row in enumerate(contributor_rows, start=1):
            reputation = row.answers * 20 + row.questions * 10
            top_contributors.append(
                {
                    "id": row.id,
                    "name": row.name,
                    "rank": rank,
                    "questions": row.questions,
                    "answers": row.answers,
                    "reputation": reputation,
                }
            )

        recent_rows = (
            QuestionService._base_query()
            .order_by(Question.updated_at.desc())
            .limit(5)
            .all()
        )
        recent_activity = []
        for row in recent_rows:
            recent_activity.append(
                {
                    "id": row.id,
                    "title": row.title,
                    "answers": len(getattr(row, "solutions", [])),
                    "updated_at": row.updated_at.isoformat() if row.updated_at else None,
                    "time_ago": AdminDashboardService._format_timeago(row.updated_at),
                }
            )

        metrics = {
            "total_questions": total_questions,
            "answered_questions": answered_questions,
            "unanswered_questions": total_questions - answered_questions,
            "answer_rate": answer_rate,
            "total_views": total_views,
            "tracked_views": followed_questions,
            "total_answers": total_answers,
            "total_votes": total_votes,
            "total_bounty": bounty_questions * 50,
        }

        filters = {
            "all": total_questions,
            "unanswered": total_questions - answered_questions,
            "bounty": bounty_count,
            "following": following_count,
            "featured": featured_count,
        }

        return {
            "metrics": metrics,
            "filters": filters,
            "questions": serialized_questions,
            "popular_tags": popular_tags,
            "top_contributors": top_contributors,
            "recent_activity": recent_activity,
        }
