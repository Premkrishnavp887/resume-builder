import { useEffect, useState } from 'react'

const card = {
  background: '#fff',
  border: '1px solid #e0e0e0',
  borderRadius: 12,
  padding: '1.25rem',
  marginBottom: '1rem',
}

const tip = (color = '#f0effe', border = '#6c63ff', text = '#4338ca') => ({
  background: color,
  borderLeft: `3px solid ${border}`,
  borderRadius: '0 8px 8px 0',
  padding: '10px 14px',
  fontSize: 13,
  color: text,
  marginBottom: '1rem',
  lineHeight: 1.6,
})

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

const btnGreen = {
  ...btn,
  border: 'none',
  background: '#16a34a',
  color: '#fff',
  fontWeight: 600,
}

const btnRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: 8,
  marginTop: '1rem',
}

const spinner = {
  width: 18,
  height: 18,
  border: '2px solid #e0e0e0',
  borderTop: '2px solid #6c63ff',
  borderRadius: '50%',
  animation: 'spin .7s linear infinite',
  flexShrink: 0,
}

const badge = (color = '#f0effe', text = '#4338ca') => ({
  display: 'inline-block',
  padding: '3px 10px',
  borderRadius: 20,
  fontSize: 11,
  fontWeight: 600,
  background: color,
  color: text,
  marginRight: 5,
  marginBottom: 5,
})

export default function StepBuild({ userDetails, jobDescription, resumeData, setResumeData, onBack }) {
  const [status, setStatus] = useState('idle') // idle | loading | done | error
  const [errorMsg, setErrorMsg] = useState('')
  const [pdfLoading, setPdfLoading] = useState(false)

  useEffect(() => {
    if (!resumeData) buildResume()
  }, [])

  async function buildResume() {
    setStatus('loading')
    setErrorMsg('')
    setResumeData(null)
    try {
      const res = await fetch('/api/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userDetails, jobDescription }),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || 'Server error')
      setResumeData(data.resume)
      setStatus('done')
    } catch (e) {
      setErrorMsg(e.message)
      setStatus('error')
    }
  }

  async function downloadPDF() {
    if (!resumeData) return
    setPdfLoading(true)
    try {
      const res = await fetch('/api/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume: resumeData }),
      })
      if (!res.ok) throw new Error('PDF generation failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${(resumeData.name || 'Resume').replace(/\s+/g, '_')}_Resume.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      alert('PDF download failed: ' + e.message)
    } finally {
      setPdfLoading(false)
    }
  }

  return (
    <div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      {/* Loading */}
      {status === 'loading' && (
        <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 12, color: '#555' }}>
          <div style={spinner} />
          <span>Analyzing job description and tailoring your resume with AI...</span>
        </div>
      )}

      {/* Error */}
      {status === 'error' && (
        <>
          <div style={tip('#fef2f2', '#ef4444', '#991b1b')}>
            <strong>Error:</strong> {errorMsg}
            <br />Make sure your Flask backend is running on <code>http://localhost:5000</code> and your <code>ANTHROPIC_API_KEY</code> is set.
          </div>
          <button style={btnPrimary} onClick={buildResume}>Retry</button>
        </>
      )}

      {/* Done */}
      {status === 'done' && resumeData && (
        <>
          <div style={tip('#f0fdf4', '#16a34a', '#15803d')}>
            <strong>Resume built! Estimated ATS score: {resumeData.ats_score || 96}/100</strong>
            <br />Tailored to the job description. Download your PDF below.
          </div>

          {/* ATS Insights */}
          <div style={card}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: '#111' }}>ATS Optimization Summary</div>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 4 }}>Keywords used</div>
              {(resumeData.keywords_used || []).map(k => <span key={k} style={badge()}>{k}</span>)}
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 4 }}>Soft skills integrated</div>
              {(resumeData.soft_skills_integrated || []).map(k => <span key={k} style={badge('#f0fdf4', '#15803d')}>{k}</span>)}
            </div>
          </div>

          {/* Resume Preview */}
          <div style={card}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: '#111' }}>Resume Preview</div>

            <PreviewField label="Name" value={resumeData.name} />
            <PreviewField label="Title" value={resumeData.title} />
            <PreviewField label="Contact" value={[resumeData.phone, resumeData.email, resumeData.location, resumeData.linkedin].filter(Boolean).join('  |  ')} />
            <PreviewField label="Summary" value={resumeData.summary} />

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 6 }}>Technical Skills</div>
              {(resumeData.skills || []).map((row, i) => (
                <div key={i} style={{ fontSize: 13, color: '#333', marginBottom: 2 }}>{row.join('  ·  ')}</div>
              ))}
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 6 }}>Work Experience</div>
              {(resumeData.experience || []).map((exp, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>{exp.title} <span style={{ fontWeight: 400, color: '#888' }}>| {exp.date}</span></div>
                  {(exp.bullets || []).map((b, j) => (
                    <div key={j} style={{ fontSize: 12, color: '#444', paddingLeft: 12, marginTop: 2 }}>• {b}</div>
                  ))}
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 6 }}>Projects</div>
              {(resumeData.projects || []).map((p, i) => (
                <div key={i} style={{ marginBottom: 6 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>{p.title}</div>
                  <div style={{ fontSize: 11, color: '#777', marginBottom: 2 }}>{p.tech}</div>
                  <div style={{ fontSize: 12, color: '#444', paddingLeft: 12 }}>• {p.bullet}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={btnRow}>
            <button style={btn} onClick={onBack}>← Back</button>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button style={btn} onClick={buildResume}>Rebuild ↺</button>
              <button style={btnGreen} onClick={downloadPDF} disabled={pdfLoading}>
                {pdfLoading ? 'Generating PDF...' : '⬇ Download PDF'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Idle (shouldn't show normally) */}
      {status === 'idle' && (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#aaa' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📄</div>
          <p>Complete steps 1 and 2 to build your resume.</p>
        </div>
      )}
    </div>
  )
}

function PreviewField({ label, value }) {
  if (!value) return null
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 13, color: '#222', lineHeight: 1.6 }}>{value}</div>
    </div>
  )
}
