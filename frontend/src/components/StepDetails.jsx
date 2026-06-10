import { useState } from 'react'

const card = {
  background: '#fff',
  border: '1px solid #e0e0e0',
  borderRadius: 12,
  padding: '1.25rem',
  marginBottom: '1rem',
}

const sectionTitle = {
  fontSize: 15,
  fontWeight: 700,
  marginBottom: 12,
  color: '#111',
}

const fieldRow = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 12,
  marginBottom: 12,
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

const modeBar = {
  display: 'flex',
  gap: 8,
  marginBottom: '1rem',
}

const modeBtn = (active) => ({
  flex: 1,
  padding: '8px',
  borderRadius: 8,
  border: `1px solid ${active ? '#6c63ff' : '#e0e0e0'}`,
  background: active ? '#f0effe' : '#fff',
  color: active ? '#4338ca' : '#555',
  fontWeight: active ? 600 : 400,
  fontSize: 13,
  cursor: 'pointer',
  textAlign: 'center',
})

const btnRow = {
  display: 'flex',
  justifyContent: 'flex-end',
  marginTop: '1rem',
}

const btnPrimary = {
  padding: '9px 22px',
  borderRadius: 8,
  border: 'none',
  background: '#6c63ff',
  color: '#fff',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
}

export default function StepDetails({ userDetails, setUserDetails, onNext }) {
  const [mode, setMode] = useState('form')
  const [form, setForm] = useState({
    name: '', title: '', email: '', phone: '', location: '', linkedin: '',
    summary: '', experience: '', education: '', skills: '', certifications: ''
  })

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  function buildDetailsString() {
    if (mode === 'paste') return userDetails
    return [
      form.name        && `Name: ${form.name}`,
      form.title       && `Target Title: ${form.title}`,
      form.email       && `Email: ${form.email}`,
      form.phone       && `Phone: ${form.phone}`,
      form.location    && `Location: ${form.location}`,
      form.linkedin    && `LinkedIn: ${form.linkedin}`,
      form.summary     && `\nSummary:\n${form.summary}`,
      form.experience  && `\nWork Experience:\n${form.experience}`,
      form.education   && `\nEducation:\n${form.education}`,
      form.skills      && `\nSkills:\n${form.skills}`,
      form.certifications && `\nCertifications:\n${form.certifications}`,
    ].filter(Boolean).join('\n')
  }

  function handleNext() {
    const details = buildDetailsString()
    if (!details || details.length < 20) {
      alert('Please fill in at least your name and a few details.')
      return
    }
    setUserDetails(details)
    onNext()
  }

  return (
    <div>
      <div style={tip}>
        Fill in the form below, or switch to <strong>Paste / JSON</strong> to drop in your existing resume text or a JSON export.
      </div>

      <div style={modeBar}>
        <div style={modeBtn(mode === 'form')} onClick={() => setMode('form')}>Form</div>
        <div style={modeBtn(mode === 'paste')} onClick={() => setMode('paste')}>Paste / JSON</div>
      </div>

      {mode === 'form' && (
        <>
          <div style={card}>
            <div style={sectionTitle}>Personal info</div>
            <div style={fieldRow}>
              <div><label>Full name</label><input value={form.name} onChange={f('name')} placeholder="e.g. Premkrishna V P" /></div>
              <div><label>Target job title</label><input value={form.title} onChange={f('title')} placeholder="e.g. Junior DevOps Engineer" /></div>
            </div>
            <div style={fieldRow}>
              <div><label>Email</label><input value={form.email} onChange={f('email')} placeholder="you@email.com" /></div>
              <div><label>Phone</label><input value={form.phone} onChange={f('phone')} placeholder="+91 9999999999" /></div>
            </div>
            <div style={fieldRow}>
              <div><label>Location</label><input value={form.location} onChange={f('location')} placeholder="City, State, Country" /></div>
              <div><label>LinkedIn (optional)</label><input value={form.linkedin} onChange={f('linkedin')} placeholder="linkedin.com/in/yourname" /></div>
            </div>
          </div>

          <div style={card}>
            <div style={sectionTitle}>Professional summary</div>
            <textarea rows={3} value={form.summary} onChange={f('summary')}
              placeholder="Write a 3–4 sentence summary of your background and skills..." />
          </div>

          <div style={card}>
            <div style={sectionTitle}>Work experience</div>
            <textarea rows={8} value={form.experience} onChange={f('experience')}
              placeholder={`Company | Job Title | Start – End\n- What you did and achieved\n- Another bullet\n\nCompany | Job Title | Date\n- Bullet...`} />
          </div>

          <div style={card}>
            <div style={sectionTitle}>Education</div>
            <textarea rows={3} value={form.education} onChange={f('education')}
              placeholder="B.Tech Computer Science | Adi Shankara College | 2022 – 2026" />
          </div>

          <div style={card}>
            <div style={sectionTitle}>Skills</div>
            <textarea rows={3} value={form.skills} onChange={f('skills')}
              placeholder="Docker, Kubernetes, Python, Linux, Git, CI/CD, AWS, Terraform..." />
          </div>

          <div style={card}>
            <div style={sectionTitle}>Certifications</div>
            <textarea rows={3} value={form.certifications} onChange={f('certifications')}
              placeholder={`Docker for Absolute Beginners (KodeKloud)\nBasics of Python (Infosys Springboard)`} />
          </div>
        </>
      )}

      {mode === 'paste' && (
        <div style={card}>
          <label>Paste your resume text or JSON here</label>
          <textarea rows={18} value={userDetails} onChange={(e) => setUserDetails(e.target.value)}
            placeholder={`Paste your existing resume text, or JSON like:\n{\n  "name": "Your Name",\n  "position": "DevOps Engineer",\n  "email": "you@email.com",\n  ...\n}`} />
        </div>
      )}

      <div style={btnRow}>
        <button style={btnPrimary} onClick={handleNext}>Next: Job Description →</button>
      </div>
    </div>
  )
}
