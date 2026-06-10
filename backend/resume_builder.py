import io
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable, Table, TableStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import platform
import os


def register_fonts():
    # Try Liberation Sans first (Linux), fall back to Helvetica (built-in)
    linux_path = "/usr/share/fonts/truetype/liberation/"
    mac_paths = [
        "/Library/Fonts/",
        "/System/Library/Fonts/",
        os.path.expanduser("~/Library/Fonts/"),
    ]

    try:
        if os.path.exists(linux_path + "LiberationSans-Regular.ttf"):
            pdfmetrics.registerFont(TTFont("LS",      linux_path + "LiberationSans-Regular.ttf"))
            pdfmetrics.registerFont(TTFont("LS-Bold", linux_path + "LiberationSans-Bold.ttf"))
            pdfmetrics.registerFont(TTFont("LS-It",   linux_path + "LiberationSans-Italic.ttf"))
            return "LS", "LS-Bold", "LS-It"
    except Exception:
        pass

    # Fallback: Helvetica (built-in ReportLab, always available)
    return "Helvetica", "Helvetica-Bold", "Helvetica-Oblique"


def build_resume_pdf(data: dict) -> bytes:
    REGULAR, BOLD, ITALIC = register_fonts()

    BLACK  = colors.HexColor("#000000")
    DARK   = colors.HexColor("#111111")
    MID    = colors.HexColor("#333333")
    MUTED  = colors.HexColor("#555555")
    BG_ROW = colors.HexColor("#F5F5F5")
    GRID_C = colors.HexColor("#E0E0E0")

    def S(name, **kw): return ParagraphStyle(name, **kw)

    NAME_ST  = S("Name",  fontName=BOLD,    fontSize=18, textColor=BLACK, leading=22, spaceAfter=1)
    TITLE_ST = S("Title", fontName=ITALIC,  fontSize=9,  textColor=MID,   leading=12, spaceAfter=2)
    CONT_ST  = S("Cont",  fontName=REGULAR, fontSize=8.3,textColor=MUTED, leading=11, spaceAfter=0)
    SEC_ST   = S("Sec",   fontName=BOLD,    fontSize=8.8,textColor=BLACK, spaceBefore=4, spaceAfter=2, leading=11)
    ROLE_ST  = S("Role",  fontName=BOLD,    fontSize=8.8,textColor=BLACK, leading=11, spaceAfter=0)
    DATE_ST  = S("Date",  fontName=ITALIC,  fontSize=8,  textColor=MUTED, leading=11, spaceAfter=0)
    CO_ST    = S("Co",    fontName=ITALIC,  fontSize=8,  textColor=MID,   leading=10.5, spaceAfter=1)
    BODY_ST  = S("Body",  fontName=REGULAR, fontSize=8.5,textColor=DARK,  leading=12, spaceAfter=1)
    CERT_ST  = S("Cert",  fontName=REGULAR, fontSize=8.3,textColor=DARK,  leading=11.5, spaceAfter=0.8)

    def section(title):
        return [
            Paragraph(title.upper(), SEC_ST),
            HRFlowable(width="100%", thickness=0.65, color=BLACK, spaceAfter=3),
        ]

    def bl(text):
        return Paragraph(f"\u2022  {text}", BODY_ST)

    def exp_header(role, date):
        t = Table([[Paragraph(role, ROLE_ST), Paragraph(date, DATE_ST)]],
                  colWidths=[4.45*inch, 2.70*inch])
        t.setStyle(TableStyle([
            ("ALIGN",(1,0),(1,0),"RIGHT"),("VALIGN",(0,0),(-1,-1),"BOTTOM"),
            ("LEFTPADDING",(0,0),(-1,-1),0),("RIGHTPADDING",(0,0),(-1,-1),0),
            ("TOPPADDING",(0,0),(-1,-1),0),("BOTTOMPADDING",(0,0),(-1,-1),0),
        ]))
        return t

    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=letter,
        leftMargin=0.58*inch, rightMargin=0.58*inch,
        topMargin=0.42*inch,  bottomMargin=0.36*inch)

    story = []

    # HEADER
    story.append(Paragraph(data.get("name", "").upper(), NAME_ST))

    title_line = data.get("title", "")
    story.append(Paragraph(title_line, TITLE_ST))

    contact_parts = [
        data.get("phone", ""),
        data.get("email", ""),
        data.get("location", ""),
        data.get("linkedin", ""),
    ]
    contact_line = "   ".join(p for p in contact_parts if p)
    story.append(Paragraph(contact_line, CONT_ST))
    story.append(Spacer(1, 2))
    story.append(HRFlowable(width="100%", thickness=1.1, color=BLACK, spaceAfter=1))

    # SUMMARY
    story += section("Professional Summary")
    story.append(Paragraph(data.get("summary", ""), BODY_ST))

    # SKILLS
    story += section("Technical Skills")
    skill_rows = data.get("skills", [])
    if skill_rows:
        col_w = 7.14 * inch / max(len(skill_rows[0]), 1)
        stbl = Table(skill_rows, colWidths=[col_w] * len(skill_rows[0]))
        stbl.setStyle(TableStyle([
            ("FONTNAME",(0,0),(-1,-1),REGULAR),("FONTSIZE",(0,0),(-1,-1),8.5),
            ("TEXTCOLOR",(0,0),(-1,-1),DARK),
            ("ROWBACKGROUNDS",(0,0),(-1,-1),[BG_ROW, colors.white]),
            ("LEFTPADDING",(0,0),(-1,-1),5),("RIGHTPADDING",(0,0),(-1,-1),4),
            ("TOPPADDING",(0,0),(-1,-1),2.8),("BOTTOMPADDING",(0,0),(-1,-1),2.8),
            ("BOX",(0,0),(-1,-1),0.4,GRID_C),("INNERGRID",(0,0),(-1,-1),0.3,GRID_C),
        ]))
        story.append(stbl)

    # EXPERIENCE
    story += section("Work Experience")
    for exp in data.get("experience", []):
        story.append(exp_header(exp.get("title", ""), exp.get("date", "")))
        for b in exp.get("bullets", []):
            story.append(bl(b))
        story.append(Spacer(1, 3))

    # PROJECTS
    story += section("Projects")
    for proj in data.get("projects", []):
        t = proj.get("title", "")
        gh = proj.get("github", "")
        title_str = f"{t}  |  {gh}" if gh else t
        story.append(Paragraph(title_str, ROLE_ST))
        story.append(Paragraph(proj.get("tech", ""), CO_ST))
        story.append(bl(proj.get("bullet", "")))
        story.append(Spacer(1, 3))

    # EDUCATION
    story += section("Education")
    for edu in data.get("education", []):
        story.append(exp_header(edu.get("degree", ""), edu.get("date", "")))
        story.append(Paragraph(edu.get("school", ""), CO_ST))
        story.append(Spacer(1, 3))

    # CERTIFICATIONS
    certs = data.get("certifications", [])
    if certs:
        story += section("Certifications")
        for cert in certs:
            story.append(Paragraph(
                f"<b>{cert.get('issuer', '')}:</b>  {cert.get('items', '')}",
                CERT_ST))

    # LANGUAGES
    langs = data.get("languages", "")
    if langs:
        story += section("Languages")
        story.append(Paragraph(langs, BODY_ST))

    doc.build(story)
    return buf.getvalue()
