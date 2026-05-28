from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import uuid
from database import get_db
from auth import get_current_user
import models

router = APIRouter(prefix="/projects", tags=["projects"])

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    deadline: Optional[str] = ""

class ProjectResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    deadline: Optional[str]
    invite_code: str

    class Config:
        from_attributes = True

class MemberResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str

    class Config:
        from_attributes = True

@router.post("/", response_model=ProjectResponse)
def create_project(
    data: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    project = models.Project(
        name=data.name,
        description=data.description,
        deadline=data.deadline,
        invite_code=str(uuid.uuid4())[:8]
    )
    db.add(project)
    db.commit()
    db.refresh(project)

    member = models.ProjectMember(
        user_id=current_user.id,
        project_id=project.id,
        role="admin"
    )
    db.add(member)
    db.commit()

    return project

@router.get("/", response_model=list[ProjectResponse])
def get_my_projects(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    memberships = db.query(models.ProjectMember).filter(
        models.ProjectMember.user_id == current_user.id
    ).all()
    project_ids = [m.project_id for m in memberships]
    return db.query(models.Project).filter(models.Project.id.in_(project_ids)).all()

@router.post("/join/{invite_code}")
def join_project(
    invite_code: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    project = db.query(models.Project).filter(
        models.Project.invite_code == invite_code
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Invalid invite code")

    existing = db.query(models.ProjectMember).filter(
        models.ProjectMember.project_id == project.id,
        models.ProjectMember.user_id == current_user.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already a member")

    member = models.ProjectMember(
        user_id=current_user.id,
        project_id=project.id,
        role="member"
    )
    db.add(member)
    db.commit()
    return {"message": "Joined successfully", "project_id": project.id, "project_name": project.name}

@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(
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

    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.get("/{project_id}/members", response_model=list[MemberResponse])
def get_members(
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

    members = db.query(models.ProjectMember).filter(
        models.ProjectMember.project_id == project_id
    ).all()

    result = []
    for m in members:
        user = db.query(models.User).filter(models.User.id == m.user_id).first()
        result.append({
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": m.role
        })
    return result