from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_user
import models
from scoring import calculate_scores_with_commits, calculate_breakdown, detect_imbalance

router = APIRouter(prefix="/projects", tags=["scores"])

@router.get("/{project_id}/scores")
def get_scores(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    membership = db.query(models.ProjectMember).filter(
        models.ProjectMember.project_id == project_id,
        models.ProjectMember.user_id == current_user.id
    ).first()
    if not membership:
        raise HTTPException(status_code=403, detail="Not a member")

    tasks = db.query(models.Task).filter(
        models.Task.project_id == project_id
    ).all()

    commits = db.query(models.GitHubCommit).filter(
        models.GitHubCommit.project_id == project_id
    ).all()

    members = db.query(models.ProjectMember).filter(
        models.ProjectMember.project_id == project_id
    ).all()

    task_list = [
        {
            "user_id": t.user_id,
            "task_type": t.task_type,
            "hours": t.hours,
            "title": t.title
        }
        for t in tasks
    ]

    commit_list = [
        {
            "user_id": c.user_id,
            "task_type": c.task_type,
            "hours": 0.5
        }
        for c in commits if c.user_id is not None
    ]

    member_list = []
    for m in members:
        user = db.query(models.User).filter(models.User.id == m.user_id).first()
        if user:
            member_list.append({"id": user.id, "name": user.name})

    scores = calculate_scores_with_commits(task_list, commit_list, member_list)
    imbalance = detect_imbalance(scores)

    breakdowns = {}
    for member in member_list:
        breakdowns[member["id"]] = calculate_breakdown(
            task_list + commit_list, member["id"]
        )

    result = []
    for member in member_list:
        uid = member["id"]
        total_hours = sum(t["hours"] for t in task_list if t["user_id"] == uid)
        commit_count = sum(1 for c in commits if c.user_id == uid)
        result.append({
            "user_id": uid,
            "name": member["name"],
            "score": scores.get(uid, 0),
            "breakdown": breakdowns.get(uid, {}),
            "total_hours": total_hours,
            "commit_count": commit_count
        })

    result.sort(key=lambda x: x["score"], reverse=True)

    return {
        "scores": result,
        "imbalance": imbalance
    }