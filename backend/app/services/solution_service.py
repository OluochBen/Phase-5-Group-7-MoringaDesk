from marshmallow import ValidationError

from .. import db
from ..models import Solution, Question, Notification
from ..schemas import SolutionCreateSchema


class SolutionService:
    @staticmethod
    def create_solution(question_id, data, user_id):
        """Create a new solution for a question."""
        q = db.session.get(Question, question_id)
        if not q:
            return {"error": "Question not found"}, 404

        schema = SolutionCreateSchema()
        try:
            validated = schema.load(data or {})
        except ValidationError as err:
            return {"error": err.messages}, 400

        sol = Solution(
            question_id=question_id,
            user_id=user_id,
            content=validated["content"],
        )
        db.session.add(sol)
        db.session.flush()  # acquire sol.id

        # notify followers (not the author)
        for f in q.follows:
            if f.user_id != user_id:
                db.session.add(
                    Notification(
                        user_id=f.user_id,
                        type="new_answer",
                        reference_id=sol.id,
                    )
                )

        db.session.commit()
        return sol.to_dict(), 201

    @staticmethod
    def get_solutions_by_question(question_id, page=1, per_page=10):
        """Get solutions for a question (defensive)."""
        q = db.session.get(Question, question_id)
        if not q:
            return {"error": "Question not found"}, 404

        pagination = (
            Solution.query.filter_by(question_id=question_id)
            .order_by(Solution.created_at.desc())
            .paginate(page=page, per_page=per_page, error_out=False)
        )

        items = []
        for s in pagination.items:
            # Guard against fragile to_dict implementations
            try:
                items.append(s.to_dict())
            except Exception:
                items.append(
                    {
                        "id": s.id,
                        "question_id": s.question_id,
                        "user_id": s.user_id,
                        "content": getattr(s, "content", ""),
                        "created_at": getattr(s, "created_at", None),
                    }
                )

        return (
            {
                "solutions": items,
                "total": pagination.total,
                "pages": pagination.pages,
                "current_page": page,
            },
            200,
        )

    @staticmethod
    def get_solution_by_id(solution_id):
        """Get solution by ID."""
        s = db.session.get(Solution, solution_id)
        if not s:
            return None
        return s.to_dict()
