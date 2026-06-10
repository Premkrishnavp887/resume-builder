import { useState } from 'react'

const TECH_KEYWORDS = [
  'docker','kubernetes','ci/cd','python','linux','git','aws','azure','gcp',
  'terraform','ansible','jenkins','github actions','gitlab','helm','prometheus',
  'grafana','mongodb','mysql','postgresql','shell scripting','bash','node.js',
  'java','react','typescript','agile','scrum','devops','cloud','iac',
  'microservices','rest api','flask','django','firebase','openCV','kafka',
  'redis','elasticsearch','nginx','apache','puppet','chef','vault','argocd',
]

const card = {
  background: '#fff',
  border: '1px solid #e0e0e0',
  borderRadius: 12,
  padding: '1.25rem',
  marginBottom: '1rem',
}

const tip = {
  background: '#f0effe',
  borderLeft: '3px solid #6c63ff',
  borderRadius: '0 8px 8px 0',
  padding: '10px 14px',
  fontSize: 13,
  color: '#4338ca',
  marginBottom: '1rem',
  lineHeight: 1.6,
}

const badge = {
  display: 'inline-block',
  padding: '3px 10px',
  borderRadius: 20,
  fontSize: 11,
  fontWeight: 600,
  background: '#f0effe',
  color: '#4338ca',
  marginRight: 5,
  marginBottom: 5,
}

const btnRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: '1rem',
}

const btn = {
  padding: '9px 20px',
  borderRadius: 8,
  border: '1px solid #e0e0e0',
  background: '#fff',
  color: '#555',
  fontSize: 14,
  fontWeight: 500,
  cursor: 'pointer',
}

const btnPrimary = {
  ...btn,
  border: 'none',
  background: '#6c63ff',
  color: '#fff',
  fontWeight: 600,
}

export default function StepJD({ jobDescription, setJobDescription, onBack, onNext }) {
  const [keywords, setKeywords] = useState([])

  function handleChange(e) {
    const val = e.target.value
    setJobDescription(val)
    const found = TECH_KEYWORDS.filter(k => val.toLowerCase().includes(k))
    setKeywords(found)
  }

  function handleNext() {
    if (!jobDescription || jobDescription.trim().length < 50) {
      alert('Please paste a job description (at least a few lines).')
      return
    }
    onNext()
  }

  return (
    <div>
      <div style={tip}>
        Paste the <strong>full job posting</strong> — including title, responsibilities, requirements, and nice-to-haves.
        The AI will mirror its exact keywords and title in your resume.
      </div>

      <div style={card}>
        <label>Job description</label>
        <textarea
          rows={16}
          value={jobDescription}
          onChange={handleChange}
          placeholder="Paste the full job posting here...&#10;&#10;e.g.&#10;Junior DevOps Engineer&#10;TechNova Solutions — Bangalore, India&#10;&#10;Responsibilities:&#10;- Build and maintain CI/CD pipelines...&#10;&#10;Requirements:&#10;- Docker, Kubernetes, Linux..."
        />
      </div>

      {keywords.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 8 }}>
            Detected keywords ({keywords.length})
          </div>
          <div>
            {keywords.map(k => <span key={k} style={badge}>{k}</span>)}
          </div>
        </div>
      )}

      <div style={btnRow}>
        <button style={btn} onClick={onBack}>← Back</button>
        <button style={btnPrimary} onClick={handleNext}>Analyze &amp; Build Resume →</button>
      </div>
    </div>
  )
}
