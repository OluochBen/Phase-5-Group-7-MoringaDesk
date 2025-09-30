class SolutionService:
    @staticmethod
    def get_solutions_by_question(question_id, page, per_page):
        return {
            "solutions": [
                {"id": 1, "content": "Example solution", "user_id": 1, "question_id": question_id}
            ],
            "pages": 1,
            "current_page": page
        }

    @staticmethod
    def create_solution(question_id, data, user_id):
        return {
            "id": 2,
            "content": data.get("content"),
            "user_id": user_id,
            "question_id": question_id
        }, 201
