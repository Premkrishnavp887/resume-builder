from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from dotenv import load_dotenv
import anthropic
import os
import json
import io
from resume_builder import build_resume_pdf

load_dotenv()

app = Flask(__name__)
CORS(app)

client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))


def tailor_resume_with_ai(user_details: str, job_description: str) -> dict:
    prompt = f"""You are an expert ATS resume writer. Create a perfectly tailored resume that scores above 95/100.

CANDIDATE DETAILS:
{user_details}

JOB DESCRIPTION:
{job_description}

Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):
{{
  "name": "Full Name",
  "title": "Exact job title from JD",
  "phone": "phone number",
  "email": "email",
  "location": "city, state, country",
  "linkedin": "linkedin url or empty string",
  "summary": "3-4 sentence summary packed with JD keywords, action language, soft skills (communication, leadership, teamwork, adaptability)",
  "skills": [
    ["Skill1", "Skill2", "Skill3", "Skill4"],
    ["Skill5", "Skill6", "Skill7", "Skill8"]
  ],
  "experience": [
    {{
      "title": "Job Title — Company Name",
      "date": "Start – End",
      "bullets": [
        "Strong action verb + what you did + how + result/impact (include JD keywords)",
        "Action verb + soft skill woven in naturally + outcome",
        "Action verb + tool from JD + measurable result"
      ]
    }}
  ],
  "projects": [
    {{
      "title": "Project Name",
      "tech": "Tech1 | Tech2 | Tech3",
      "github": "url or empty string",
      "bullet": "Action verb + what it does + JD relevance + impact"
    }}
  ],
  "education": [
    {{
      "degree": "Degree Name",
      "school": "University Name, Location",
      "date": "Year – Year"
    }}
  ],
  "certifications": [
    {{
      "issuer": "Issuer Name",
      "items": "Cert1 | Cert2"
    }}
  ],
  "languages": "Language1 (Level) | Language2 (Level)",
  "ats_score": 96,
  "keywords_used": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "soft_skills_integrated": ["Communication", "Leadership", "Teamwork"]
}}

Rules:
- title MUST exactly match the job title in the JD
- Every bullet starts with a strong action verb: Engineered, Developed, Led, Managed, Automated, Designed, Delivered, Collaborated, Optimized, Built, Implemented, Coordinated
- Mirror exact keywords and tools from the JD
- Integrate soft skills into bullets naturally, never as a standalone list
- Keep content concise enough for one page"""

    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1000,
        messages=[{"role": "user", "content": prompt}]
    )

    text = message.content[0].text.strip()
    # Strip markdown fences if present
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    text = text.strip()

    return json.loads(text)


@app.route("/api/build", methods=["POST"])
def build():
    data = request.get_json()
    user_details = data.get("userDetails", "").strip()
    job_description = data.get("jobDescription", "").strip()

    if not user_details or not job_description:
        return jsonify({"error": "Both user details and job description are required."}), 400

    try:
        resume_data = tailor_resume_with_ai(user_details, job_description)
        return jsonify({"success": True, "resume": resume_data})
    except json.JSONDecodeError as e:
        return jsonify({"error": f"AI response parsing failed: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/pdf", methods=["POST"])
def generate_pdf():
    data = request.get_json()
    resume_data = data.get("resume")

    if not resume_data:
        return jsonify({"error": "Resume data is required."}), 400

    try:
        pdf_bytes = build_resume_pdf(resume_data)
        name_slug = resume_data.get("name", "resume").replace(" ", "_")
        return send_file(
            io.BytesIO(pdf_bytes),
            mimetype="application/pdf",
            as_attachment=True,
            download_name=f"{name_slug}_Resume.pdf"
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "model": "claude-sonnet-4-20250514"})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
