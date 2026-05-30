from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, KeepTogether
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
import io
from datetime import datetime

# Color palette
DARK = colors.HexColor("#1a1a2e")
BLUE = colors.HexColor("#3b82f6")
LIGHT_BLUE = colors.HexColor("#eff6ff")
GREEN = colors.HexColor("#22c55e")
YELLOW = colors.HexColor("#eab308")
RED = colors.HexColor("#ef4444")
GRAY = colors.HexColor("#6b7280")
LIGHT_GRAY = colors.HexColor("#f3f4f6")
WHITE = colors.white
BLACK = colors.black


def get_score_color(score):
    if score >= 70:
        return GREEN
    if score >= 40:
        return YELLOW
    return RED


def generate_report(project: dict, members: list, scores: list,
                    tasks: list, commits: list, imbalance: dict) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=0.75 * inch,
        leftMargin=0.75 * inch,
        topMargin=0.75 * inch,
        bottomMargin=0.75 * inch
    )

    styles = getSampleStyleSheet()
    elements = []

    # ── HEADER ──
    header_data = [[
        Paragraph(
            f'<font size="15" color="white"><b>Group Contribution Report</b></font>',
            ParagraphStyle("h", alignment=TA_LEFT)
        ),
        Paragraph(
            f'<font size="8.5" color="white">Generated: {datetime.now().strftime("%B %d, %Y")}</font>',
            ParagraphStyle("hr", alignment=TA_RIGHT)
        )
    ]]
    header_table = Table(header_data, colWidths=[5 * inch, 1.5 * inch])
    header_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), DARK),
        ("PADDING", (0, 0), (-1, -1), 16),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ROUNDEDCORNERS", [8, 8, 8, 8]),
    ]))
    elements.append(header_table)
    elements.append(Spacer(1, 0.2 * inch))

    elements.append(Spacer(1, 0.05 * inch))
    blue_line = Table([[""]], colWidths=[6.5 * inch])
    blue_line.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), BLUE),
        ("ROWHEIGHT", (0, 0), (-1, -1), 3),
    ]))
    elements.append(blue_line)
    elements.append(Spacer(1, 0.15 * inch))

    # ── PROJECT INFO ──
    elements.append(Paragraph(
        f'<font size="12" color="#1a1a2e"><b>{project["name"]}</b></font>',
        ParagraphStyle("title", alignment=TA_LEFT)
    ))
    elements.append(Spacer(1, 0.05 * inch))

    if project.get("description"):
        elements.append(Paragraph(
            f'<font size="10" color="#6b7280">{project["description"]}</font>',
            ParagraphStyle("desc", alignment=TA_LEFT)
        ))

    info_items = []
    if project.get("deadline"):
        info_items.append(f"Deadline: {project['deadline']}")
    info_items.append(f"Members: {len(members)}")
    info_items.append(f"Total tasks: {len(tasks)}")
    info_items.append(f"GitHub commits: {len(commits)}")

    elements.append(Spacer(1, 0.1 * inch))
    elements.append(Paragraph(
        f'<font size="9" color="#6b7280">{" · ".join(info_items)}</font>',
        ParagraphStyle("info", alignment=TA_LEFT)
    ))
    elements.append(Spacer(1, 0.2 * inch))
    elements.append(HRFlowable(width="100%", thickness=1, color=LIGHT_GRAY))
    elements.append(Spacer(1, 0.2 * inch))

    # ── IMBALANCE WARNING ──
    if imbalance.get("imbalanced"):
        warning_data = [[Paragraph(
            '<font size="10" color="#92400e"><b>⚠ Workload Imbalance Detected</b></font>'
            '<br/><font size="9" color="#92400e">One member is contributing significantly '
            'more than others. Consider redistributing tasks.</font>',
            ParagraphStyle("warn", alignment=TA_LEFT)
        )]]
        warning_table = Table(warning_data, colWidths=[6.5 * inch])
        warning_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#fef3c7")),
            ("BORDER", (0, 0), (-1, -1), 1, colors.HexColor("#f59e0b")),
            ("PADDING", (0, 0), (-1, -1), 12),
            ("ROUNDEDCORNERS", [6, 6, 6, 6]),
        ]))
        elements.append(warning_table)
        elements.append(Spacer(1, 0.2 * inch))

    # ── CONTRIBUTION SCORES ──
    elements.append(Paragraph(
        '<font size="13" color="#1a1a2e"><b>Contribution Scores</b></font>',
        ParagraphStyle("sh", alignment=TA_LEFT)
    ))
    elements.append(Spacer(1, 0.1 * inch))

    score_header = [
        Paragraph('<font size="9" color="white"><b>Rank</b></font>', ParagraphStyle("c", alignment=TA_CENTER)),
        Paragraph('<font size="9" color="white"><b>Member</b></font>', ParagraphStyle("c", alignment=TA_LEFT)),
        Paragraph('<font size="9" color="white"><b>Score</b></font>', ParagraphStyle("c", alignment=TA_CENTER)),
        Paragraph('<font size="9" color="white"><b>Hours</b></font>', ParagraphStyle("c", alignment=TA_CENTER)),
        Paragraph('<font size="9" color="white"><b>Commits</b></font>', ParagraphStyle("c", alignment=TA_CENTER)),
        Paragraph('<font size="9" color="white"><b>Top Contribution</b></font>', ParagraphStyle("c", alignment=TA_LEFT)),
    ]

    score_rows = [score_header]
    medals = ["1", "2", "3"]

    for i, s in enumerate(scores):
        medal = medals[i] if i < 3 else f"#{i+1}"
        top_type = max(s.get("breakdown", {}).items(), key=lambda x: x[1])[0] if s.get("breakdown") else "—"
        score_color = get_score_color(s["score"])

        row = [
            Paragraph(f'<font size="10" color="#3b82f6"><b>{medal}</b></font>', ParagraphStyle("c", alignment=TA_CENTER)),
            Paragraph(f'<font size="10" color="#111827"><b>{s["name"]}</b></font>', ParagraphStyle("c", alignment=TA_LEFT)),
            Paragraph(f'<font size="12" color="{score_color.hexval()}"><b>{s["score"]}</b></font>', ParagraphStyle("c", alignment=TA_CENTER)),
            Paragraph(f'<font size="10" color="#374151">{s["total_hours"]}h</font>', ParagraphStyle("c", alignment=TA_CENTER)),
            Paragraph(f'<font size="10" color="#374151">{s.get("commit_count", 0)}</font>', ParagraphStyle("c", alignment=TA_CENTER)),
            Paragraph(f'<font size="10" color="#374151">{top_type}</font>', ParagraphStyle("c", alignment=TA_LEFT)),
        ]
        score_rows.append(row)

    score_table = Table(score_rows, colWidths=[0.6*inch, 1.8*inch, 0.8*inch, 0.8*inch, 0.8*inch, 1.6*inch])
    score_style = [
        ("BACKGROUND", (0, 0), (-1, 0), DARK),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, LIGHT_GRAY]),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e5e7eb")),
        ("PADDING", (0, 0), (-1, -1), 8),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ROUNDEDCORNERS", [6, 6, 6, 6]),
    ]
    score_table.setStyle(TableStyle(score_style))
    elements.append(score_table)
    elements.append(Spacer(1, 0.25 * inch))

    # ── TASK BREAKDOWN ──
    elements.append(HRFlowable(width="100%", thickness=1, color=LIGHT_GRAY))
    elements.append(Spacer(1, 0.2 * inch))
    elements.append(Paragraph(
        '<font size="13" color="#1a1a2e"><b>Task Log</b></font>',
        ParagraphStyle("sh", alignment=TA_LEFT)
    ))
    elements.append(Spacer(1, 0.1 * inch))

    task_header = [
        Paragraph('<font size="9" color="white"><b>Member</b></font>', ParagraphStyle("c", alignment=TA_LEFT)),
        Paragraph('<font size="9" color="white"><b>Task</b></font>', ParagraphStyle("c", alignment=TA_LEFT)),
        Paragraph('<font size="9" color="white"><b>Type</b></font>', ParagraphStyle("c", alignment=TA_CENTER)),
        Paragraph('<font size="9" color="white"><b>Hours</b></font>', ParagraphStyle("c", alignment=TA_CENTER)),
    ]

    task_rows = [task_header]
    for task in tasks:
        task_rows.append([
            Paragraph(f'<font size="9" color="#374151">{task.get("member_name", "—")}</font>', ParagraphStyle("c", alignment=TA_LEFT)),
            Paragraph(f'<font size="9" color="#111827">{task["title"]}</font>', ParagraphStyle("c", alignment=TA_LEFT)),
            Paragraph(f'<font size="9" color="#374151">{task["task_type"]}</font>', ParagraphStyle("c", alignment=TA_CENTER)),
            Paragraph(f'<font size="9" color="#374151">{task["hours"]}h</font>', ParagraphStyle("c", alignment=TA_CENTER)),
        ])

    task_table = Table(task_rows, colWidths=[1.5*inch, 3*inch, 1*inch, 1*inch])
    task_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), DARK),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, LIGHT_GRAY]),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e5e7eb")),
        ("PADDING", (0, 0), (-1, -1), 7),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    elements.append(task_table)

    # ── GITHUB COMMITS ──
    if commits:
        elements.append(Spacer(1, 0.25 * inch))
        elements.append(HRFlowable(width="100%", thickness=1, color=LIGHT_GRAY))
        elements.append(Spacer(1, 0.2 * inch))
        elements.append(Paragraph(
            '<font size="13" color="#1a1a2e"><b>GitHub Commits</b></font>',
            ParagraphStyle("sh", alignment=TA_LEFT)
        ))
        elements.append(Spacer(1, 0.1 * inch))

        commit_header = [
            Paragraph('<font size="9" color="white"><b>SHA</b></font>', ParagraphStyle("c", alignment=TA_LEFT)),
            Paragraph('<font size="9" color="white"><b>Message</b></font>', ParagraphStyle("c", alignment=TA_LEFT)),
            Paragraph('<font size="9" color="white"><b>Author</b></font>', ParagraphStyle("c", alignment=TA_LEFT)),
            Paragraph('<font size="9" color="white"><b>Matched</b></font>', ParagraphStyle("c", alignment=TA_CENTER)),
        ]

        commit_rows = [commit_header]
        for c in commits[:20]:
            matched_text = c["member_name"] if c.get("matched") else "Unmatched"
            matched_color = "#22c55e" if c.get("matched") else "#9ca3af"
            commit_rows.append([
                Paragraph(f'<font size="8" color="#6b7280">#{c["sha"]}</font>', ParagraphStyle("c", alignment=TA_LEFT)),
                Paragraph(f'<font size="8" color="#111827">{c["message"][:60]}{"..." if len(c["message"]) > 60 else ""}</font>', ParagraphStyle("c", alignment=TA_LEFT)),
                Paragraph(f'<font size="8" color="#374151">{c["author_name"]}</font>', ParagraphStyle("c", alignment=TA_LEFT)),
                Paragraph(f'<font size="8" color="{matched_color}">{matched_text}</font>', ParagraphStyle("c", alignment=TA_CENTER)),
            ])

        commit_table = Table(commit_rows, colWidths=[0.7*inch, 3.3*inch, 1.5*inch, 1*inch])
        commit_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), DARK),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, LIGHT_GRAY]),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e5e7eb")),
            ("PADDING", (0, 0), (-1, -1), 6),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ]))
        elements.append(commit_table)

    # ── FOOTER ──
    elements.append(Spacer(1, 0.3 * inch))
    elements.append(HRFlowable(width="100%", thickness=1, color=LIGHT_GRAY))
    elements.append(Spacer(1, 0.1 * inch))
    elements.append(Paragraph(
        '<font size="8" color="#9ca3af">Generated by Group Contribution Tracker · '
        'Scores are calculated using a weighted model based on task type and hours logged.</font>',
        ParagraphStyle("footer", alignment=TA_CENTER)
    ))

    doc.build(elements)
    buffer.seek(0)
    return buffer.read()