from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models
from routers import users, auth, projects, tasks, scores, github, reports

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Group Contribution Tracker")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(projects.router)
app.include_router(tasks.router)
app.include_router(scores.router)
app.include_router(github.router)
app.include_router(reports.router)

@app.get("/")
def root():
    return {"message": "Group Tracker API is running"}