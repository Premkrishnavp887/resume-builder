import { useState } from 'react'
import StepDetails from './components/StepDetails.jsx'
import StepJD from './components/StepJD.jsx'
import StepBuild from './components/StepBuild.jsx'

const steps = ['Your Details', 'Job Description', 'Build Resume']

export default function App() {
  const [step, setStep] = useState(0)
  const [userDetails, setUserDetails] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [resumeData, setResumeData] = useState(null)

  const s = {
    wrapper: {
      minHeight: '100vh',
      background: '#f8f8f6',
      padding: '2rem 1rem',
    },
    container: {
      maxWidth: 720,
      margin: '0 auto',
    },
    header: {
      marginBottom: '2rem',
      textAlign: 'center',
    },
    h1: {
      fontSize: 28,
      fontWeight: 700,
      letterSpacing: '-0.5px',
      marginBottom: 6,
    },
    sub: {
      fontSize: 14,
      color: '#666',
    },
    stepBar: {
      display: 'flex',
      gap: 8,
      marginBottom: '2rem',
    },
    stepItem: (i) => ({
      flex: 1,
      padding: '10px 14px',
      borderRadius: 10,
      border: `1px solid ${i === step ? '#6c63ff' : i < step ? '#22c55e' : '#e0e0e0'}`,
      background: i === step ? '#f0effe' : i < step ? '#f0fdf4' : '#fff',
      cursor: i < step ? 'pointer' : 'default',
      transition: 'all .15s',
    }),
    stepNum: (i) => ({
      fontSize: 11,
      fontWeight: 600,
      color: i === step ? '#6c63ff' : i < step ? '#16a34a' : '#aaa',
      textTransform: 'uppercase',
      letterSpacing: '.5px',
      marginBottom: 2,
    }),
    stepLabel: (i) => ({
      fontSize: 13,
      fontWeight: 600,
      color: i === step ? '#3730a3' : i < step ? '#15803d' : '#555',
    }),
  }

  return (
    <div style={s.wrapper}>
      <div style={s.container}>
        <div style={s.header}>
          <h1 style={s.h1}>AI Resume Builder</h1>
          <p style={s.sub}>Paste your details + job description — get a tailored, ATS-optimized PDF resume.</p>
        </div>

        <div style={s.stepBar}>
          {steps.map((label, i) => (
            <div key={i} style={s.stepItem(i)} onClick={() => i < step && setStep(i)}>
              <div style={s.stepNum(i)}>
                {i < step ? '✓ done' : `step ${i + 1}`}
              </div>
              <div style={s.stepLabel(i)}>{label}</div>
            </div>
          ))}
        </div>

        {step === 0 && (
          <StepDetails
            userDetails={userDetails}
            setUserDetails={setUserDetails}
            onNext={() => setStep(1)}
          />
        )}
        {step === 1 && (
          <StepJD
            jobDescription={jobDescription}
            setJobDescription={setJobDescription}
            onBack={() => setStep(0)}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <StepBuild
            userDetails={userDetails}
            jobDescription={jobDescription}
            resumeData={resumeData}
            setResumeData={setResumeData}
            onBack={() => setStep(1)}
          />
        )}
      </div>
    </div>
  )
}
