from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    github_email = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    projects = relationship("ProjectMember", back_populates="user")
    tasks = relationship("Task", back_populates="user")


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String)
    deadline = Column(String, nullable=True)
    invite_code = Column(String, unique=True, index=True)
    github_repo = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    members = relationship("ProjectMember", back_populates="project")
    tasks = relationship("Task", back_populates="project")


class ProjectMember(Base):
    __tablename__ = "project_members"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    project_id = Column(Integer, ForeignKey("projects.id"))
    role = Column(String, default="member")
    joined_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="projects")
    project = relationship("Project", back_populates="members")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String)
    task_type = Column(String, nullable=False)
    hours = Column(Float, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"))
    project_id = Column(Integer, ForeignKey("projects.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="tasks")
    project = relationship("Project", back_populates="tasks")


class GitHubCommit(Base):
    __tablename__ = "github_commits"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    sha = Column(String, unique=True, index=True)
    message = Column(String)
    author_name = Column(String)
    author_email = Column(String)
    task_type = Column(String)
    date = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)