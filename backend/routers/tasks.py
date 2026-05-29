from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from database import get_db
from auth import get_current_user
import models

router = APIRouter(prefix="/projects", tags=["tasks"])

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    task_type: str  # code, design, docs, research
    hours: float

class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    task_type: str
    hours: float
    user_id: int
    project_id: int
    member_name: Optional[str] = ""

    class Config:
        from_attributes = True

@router.post("/{project_id}/tasks", response_model=TaskResponse)
def create_task(
    project_id: int,
    data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    membership = db.query(models.ProjectMember).filter(
        models.ProjectMember.project_id == project_id,
        models.ProjectMember.user_id == current_user.id
    ).first()
    if not membership:
        raise HTTPException(status_code=403, detail="Not a member of this project")

    task = models.Task(
        title=data.title,
        description=data.description,
        task_type=data.task_type,
        hours=data.hours,
        user_id=current_user.id,
        project_id=project_id
    )
    db.add(task)
    db.commit()
    db.refresh(task)

    task.member_name = current_user.name
    return task

@router.get("/{project_id}/tasks", response_model=list[TaskResponse])
def get_tasks(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    membership = db.query(models.ProjectMember).filter(
        models.ProjectMember.project_id == project_id,
        models.ProjectMember.user_id == current_user.id
    ).first()
    if not membership:
        raise HTTPException(status_code=403, detail="Not a member of this project")

    tasks = db.query(models.Task).filter(
        models.Task.project_id == project_id
    ).all()

    result = []
    for task in tasks:
        user = db.query(models.User).filter(models.User.id == task.user_id).first()
        result.append(TaskResponse(
            id=task.id,
            title=task.title,
            description=task.description,
            task_type=task.task_type,
            hours=task.hours,
            user_id=task.user_id,
            project_id=task.project_id,
            member_name=user.name if user else "Unknown"
        ))
    return result