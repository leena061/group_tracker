from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from database import get_db
from auth import get_current_user
import models
from github_service import parse_repo_url, fetch_commits, parse_commits, classify_commit

router = APIRouter(prefix="/projects", tags=["github"])

class GitHubLinkRequest(BaseModel):
    repo_url: str
    token: Optional[str] = None

@router.post("/{project_id}/github/sync")
async def sync_github(
    project_id: int,
    data: GitHubLinkRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Admin only
    membership = db.query(models.ProjectMember).filter(
        models.ProjectMember.project_id == project_id,
        models.ProjectMember.user_id == current_user.id,
        models.ProjectMember.role == "admin"
    ).first()
    if not membership:
        raise HTTPException(status_code=403, detail="Only admin can link GitHub")

    # Parse URL
    parsed = parse_repo_url(data.repo_url)
    if not parsed:
        raise HTTPException(status_code=400, detail="Invalid GitHub URL")

    owner, repo = parsed

    # Fetch commits from GitHub
    try:
        raw_commits = await fetch_commits(owner, repo, data.token)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    commits = parse_commits(raw_commits)

    # Save repo URL to project
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    project.github_repo = data.repo_url
    db.commit()

    # Get all project members and their emails
    members = db.query(models.ProjectMember).filter(
        models.ProjectMember.project_id == project_id
    ).all()

    member_emails = {}
    member_usernames = {}
    for m in members:
        user = db.query(models.User).filter(models.User.id == m.user_id).first()
        if user:
            member_emails[user.email.lower()] = user.id
            if user.github_email:
                member_emails[user.github_email.lower()] = user.id
            if user.github_username:
                member_usernames[user.github_username.lower()] = user.id

    # Clear old commits for this project before syncing fresh
    db.query(models.GitHubCommit).filter(
        models.GitHubCommit.project_id == project_id
    ).delete()
    db.commit()

    # Save commits and match to members
    saved = 0
    matched = 0

    for commit in commits:
        user_id = member_emails.get(commit["author_email"])
        if not user_id and commit.get("github_username"):
            user_id = member_usernames.get(commit["github_username"].lower())
        task_type = classify_commit(commit["message"])

        db_commit = models.GitHubCommit(
            project_id=project_id,
            user_id=user_id,
            sha=commit["sha"],
            message=commit["message"],
            author_name=commit["author_name"],
            author_email=commit["author_email"],
            task_type=task_type,
            date=commit["date"]
        )
        db.add(db_commit)
        saved += 1
        if user_id:
            matched += 1

    db.commit()

    return {
        "message": "GitHub sync complete",
        "total_commits": len(commits),
        "new_commits": saved,
        "matched_to_members": matched,
        "repo": f"{owner}/{repo}"
    }


@router.get("/{project_id}/github/commits")
def get_commits(
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

    commits = db.query(models.GitHubCommit).filter(
        models.GitHubCommit.project_id == project_id
    ).order_by(models.GitHubCommit.id.desc()).all()

    result = []
    for c in commits:
        user = None
        if c.user_id:
            user = db.query(models.User).filter(models.User.id == c.user_id).first()
        result.append({
            "sha": c.sha,
            "message": c.message,
            "author_name": c.author_name,
            "author_email": c.author_email,
            "member_name": user.name if user else None,
            "task_type": c.task_type,
            "date": c.date,
            "matched": c.user_id is not None
        })

    return result