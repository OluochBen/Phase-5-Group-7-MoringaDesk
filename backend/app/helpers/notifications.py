from app.helpers.crud import create_notification

def notify_new_answer(db, question_owner_id, solution_id):
    return create_notification(
        user_id=question_owner_id,
        type="new_answer",
        payload={"solution_id": solution_id}
    )

def notify_vote(user_id, solution_id, value):
    return create_notification(
        user_id=user_id,
        type="vote_on_solution",
        payload={"solution_id": solution_id, "value": value}
    )
