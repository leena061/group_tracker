import httpx
import re
from typing import Optional

GITHUB_API = "https://api.github.com"

def parse_repo_url(url: str) -> Optional[tuple]:
    """
    Extracts owner and repo name from a GitHub URL.
    Supports: https://github.com/owner/repo and owner/repo formats
    """
    url = url.strip().rstrip("/")

    # Full URL format
    match = re.match(r"https?://github\.com/([^/]+)/([^/]+)", url)
    if match:
        return match.group(1), match.group(2).replace(".git", "")

    # Short format: owner/repo
    match = re.match(r"^([^/]+)/([^/]+)$", url)
    if match:
        return match.group(1), match.group(2)

    return None


async def fetch_commits(owner: str, repo: str, token: Optional[str] = None) -> list:
    """
    Fetches up to 100 commits from a GitHub repo.
    Works for public repos without token.
    """
    headers = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "GroupTracker/1.0"
    }
    if token:
        headers["Authorization"] = f"token {token}"

    url = f"{GITHUB_API}/repos/{owner}/{repo}/commits?per_page=100"

    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers, timeout=15.0)

        if response.status_code == 404:
            raise ValueError("Repository not found. Make sure the URL is correct and the repo is public.")
        if response.status_code == 403:
            raise ValueError("GitHub API rate limit reached. Add a GitHub token to continue.")
        if response.status_code != 200:
            raise ValueError(f"GitHub API error: {response.status_code}")

        return response.json()


def parse_commits(raw_commits: list) -> list:
    """
    Extracts useful data from raw GitHub commit response.
    """
    commits = []
    for c in raw_commits:
        commit_data = c.get("commit", {})
        author = commit_data.get("author", {})
        github_author = c.get("author") or {}

        commits.append({
            "sha": c.get("sha", "")[:7],
            "message": commit_data.get("message", "").split("\n")[0],  # first line only
            "author_name": author.get("name", "Unknown"),
            "author_email": author.get("email", "").lower(),
            "github_username": github_author.get("login", ""),
            "date": author.get("date", ""),
        })

    return commits


def classify_commit(message: str) -> str:
    """
    Classifies a commit message into a task type using keyword matching.
    This is the NLP component — keyword-based classification.
    In interviews: 'I used keyword extraction as a lightweight NLP classifier
    since commit messages are short and domain-specific vocabulary is consistent.'
    """
    message = message.lower()

    code_keywords = ["fix", "feat", "add", "implement", "refactor", "update", "build",
                     "api", "function", "component", "route", "model", "bug", "error"]
    design_keywords = ["ui", "style", "css", "design", "layout", "theme", "color",
                       "responsive", "tailwind", "icon", "button"]
    docs_keywords = ["doc", "readme", "comment", "license", "changelog", "docs"]
    research_keywords = ["research", "investigate", "test", "experiment", "analyze", "review"]

    if any(k in message for k in docs_keywords):
        return "docs"
    if any(k in message for k in design_keywords):
        return "design"
    if any(k in message for k in research_keywords):
        return "research"
    if any(k in message for k in code_keywords):
        return "code"

    return "code"  # default