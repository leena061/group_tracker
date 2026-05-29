import pandas as pd
import numpy as np

# Weights per task type — deliberate design decision
# Code and design are weighted higher because they're harder to quantify by hours alone
TASK_WEIGHTS = {
    "code": 1.0,
    "design": 0.9,
    "docs": 0.7,
    "research": 0.8
}

def calculate_scores(tasks: list, members: list) -> dict:
    """
    Takes a list of tasks and members, returns contribution scores per member.
    Score is normalized to 0-100 relative to the team.
    """
    if not tasks or not members:
        return {}

    # Build DataFrame from tasks
    df = pd.DataFrame(tasks)

    if df.empty:
        return {}

    # Apply weight based on task type
    df["weight"] = df["task_type"].map(TASK_WEIGHTS).fillna(0.7)

    # Weighted score = hours * weight
    df["weighted_score"] = df["hours"] * df["weight"]

    # Aggregate by member
    member_scores = df.groupby("user_id")["weighted_score"].sum().reset_index()
    member_scores.columns = ["user_id", "raw_score"]

    # Normalize to 0-100
    max_score = member_scores["raw_score"].max()
    if max_score == 0:
        member_scores["normalized_score"] = 0
    else:
        member_scores["normalized_score"] = (
            member_scores["raw_score"] / max_score * 100
        ).round(1)

    # Build result dict
    result = {}
    for _, row in member_scores.iterrows():
        result[int(row["user_id"])] = float(row["normalized_score"])

    # Members with no tasks get 0
    for member in members:
        if member["id"] not in result:
            result[member["id"]] = 0.0

    return result


def calculate_breakdown(tasks: list, user_id: int) -> dict:
    """
    Returns score breakdown by task type for a specific member.
    """
    if not tasks:
        return {}

    df = pd.DataFrame(tasks)
    df = df[df["user_id"] == user_id]

    if df.empty:
        return {}

    df["weight"] = df["task_type"].map(TASK_WEIGHTS).fillna(0.7)
    df["weighted_score"] = df["hours"] * df["weight"]

    breakdown = df.groupby("task_type")["weighted_score"].sum().to_dict()
    return {k: round(v, 2) for k, v in breakdown.items()}


def detect_imbalance(scores: dict) -> dict:
    """
    Detects if contribution is unfairly distributed.
    Uses standard deviation to flag imbalance.
    Returns imbalance info if detected.
    """
    if len(scores) < 2:
        return {"imbalanced": False}

    values = list(scores.values())
    mean = np.mean(values)
    std = np.std(values)

    # Flag as imbalanced if std is more than 25 points
    if std > 25:
        max_user = max(scores, key=scores.get)
        min_user = min(scores, key=scores.get)
        return {
            "imbalanced": True,
            "std": round(float(std), 1),
            "max_user_id": max_user,
            "min_user_id": min_user,
            "max_score": scores[max_user],
            "min_score": scores[min_user]
        }

    return {"imbalanced": False}