from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_user
import models
from pdf_generator import generate_report
from scoring import calculate_scores_with_commits, calculate_breakdown, detect_imbalance

router = APIRouter(prefix="/projects", tags=["reports"])

@router.get("/{project_id}/report")
def download_report(
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

    # Get project
    project = db.query(models.Project).filter(
        models.Project.id == project_id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Get members
    memberships = db.query(models.ProjectMember).filter(
        models.ProjectMember.project_id == project_id
    ).all()
    member_list = []
    for m in memberships:
        user = db.query(models.User).filter(models.User.id == m.user_id).first()
        if user:
            member_list.append({"id": user.id, "name": user.name, "role": m.role})

    # Get tasks
    tasks = db.query(models.Task).filter(
        models.Task.project_id == project_id
    ).all()
    task_list = []
    for t in tasks:
        user = db.query(models.User).filter(models.User.id == t.user_id).first()
        task_list.append({
            "title": t.title,
            "task_type": t.task_type,
            "hours": t.hours,
            "member_name": user.name if user else "Unknown"
        })

    # Get commits
    commits = db.query(models.GitHubCommit).filter(
        models.GitHubCommit.project_id == project_id
    ).all()
    commit_list = []
    for c in commits:
        user = db.query(models.User).filter(models.User.id == c.user_id).first() if c.user_id else None
        commit_list.append({
            "sha": c.sha,
            "message": c.message,
            "author_name": c.author_name,
            "member_name": user.name if user else None,
            "matched": c.user_id is not None
        })

    # Calculate scores
    task_scoring = [{"user_id": t.user_id, "task_type": t.task_type, "hours": t.hours} for t in tasks]
    commit_scoring = [{"user_id": c.user_id, "task_type": c.task_type, "hours": 0.5} for c in commits if c.user_id]
    scores_dict = calculate_scores_with_commits(task_scoring, commit_scoring, member_list)
    imbalance = detect_imbalance(scores_dict)

    score_list = []
    for member in member_list:
        uid = member["id"]
        breakdown = calculate_breakdown(task_scoring + commit_scoring, uid)
        score_list.append({
            "name": member["name"],
            "score": scores_dict.get(uid, 0),
            "total_hours": sum(t["hours"] for t in task_scoring if t["user_id"] == uid),
            "commit_count": sum(1 for c in commits if c.user_id == uid),
            "breakdown": breakdown
        })
    score_list.sort(key=lambda x: x["score"], reverse=True)

    # Generate PDF
    pdf_bytes = generate_report(
        project={"name": project.name, "description": project.description, "deadline": project.deadline},
        members=member_list,
        scores=score_list,
        tasks=task_list,
        commits=commit_list,
        imbalance=imbalance
    )

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{project.name}_report.pdf"'
        }
    )