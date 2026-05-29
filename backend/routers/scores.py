from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_user
import models
from scoring import calculate_scores, calculate_breakdown, detect_imbalance

router = APIRouter(prefix="/projects", tags=["scores"])

@router.get("/{project_id}/scores")
def get_scores(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Check membership
    membership = db.query(models.ProjectMember).filter(
        models.ProjectMember.project_id == project_id,
        models.ProjectMember.user_id == current_user.id
    ).first()
    if not membership:
        raise HTTPException(status_code=403, detail="Not a member")

    # Get all tasks and members
    tasks = db.query(models.Task).filter(
        models.Task.project_id == project_id
    ).all()

    members = db.query(models.ProjectMember).filter(
        models.ProjectMember.project_id == project_id
    ).all()

    # Build task and member dicts for scoring
    task_list = [
        {
            "user_id": t.user_id,
            "task_type": t.task_type,
            "hours": t.hours,
            "title": t.title
        }
        for t in tasks
    ]

    member_list = []
    for m in members:
        user = db.query(models.User).filter(models.User.id == m.user_id).first()
        if user:
            member_list.append({"id": user.id, "name": user.name})

    # Calculate scores
    scores = calculate_scores(task_list, member_list)
    imbalance = detect_imbalance(scores)

    # Build breakdown per member
    breakdowns = {}
    for member in member_list:
        breakdowns[member["id"]] = calculate_breakdown(task_list, member["id"])

    # Build final response
    result = []
    for member in member_list:
        uid = member["id"]
        result.append({
            "user_id": uid,
            "name": member["name"],
            "score": scores.get(uid, 0),
            "breakdown": breakdowns.get(uid, {}),
            "total_hours": sum(
                t["hours"] for t in task_list if t["user_id"] == uid
            )
        })

    # Sort by score descending
    result.sort(key=lambda x: x["score"], reverse=True)

    return {
        "scores": result,
        "imbalance": imbalance
    }