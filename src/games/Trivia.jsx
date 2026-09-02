import { useState } from 'react'

export default function Trivia({ questions, onFinish }) {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)

  const q = questions[index]
  const isLast = index === questions.length - 1

  function choose(i) {
    if (selected != null) return
    setSelected(i)
    if (i === q.payload.correctIndex) setScore((s) => s + 1)
  }

  function next() {
    if (isLast) {
      setDone(true)
      onFinish({ correct: score, total: questions.length })
      return
    }
    setIndex((i) => i + 1)
    setSelected(null)
  }

  if (done) return null

  return (
    <div className="sheet">
      <p className="desc">Question {index + 1} of {questions.length}</p>
      <h2 style={{ fontSize: '1.2rem' }}>{q.payload.question}</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: '20px 0' }}>
        {q.payload.options.map((opt, i) => {
          const isChosen = selected === i
          const isRight = i === q.payload.correctIndex
          let bg = 'transparent', color = '#101826', border = '#A3BAD6'
          if (selected != null) {
            if (isRight) { bg = '#233E87'; color = '#fff'; border = '#233E87' }
            else if (isChosen && !isRight) { bg = '#f6dede'; color = '#a4302a'; border = '#a4302a' }
          }
          return (
            <button
              key={i}
              onClick={() => choose(i)}
              disabled={selected != null}
              style={{
                textAlign: 'left',
                padding: '12px 14px',
                background: bg,
                color,
                border: `1.5px solid ${border}`,
                cursor: selected != null ? 'default' : 'pointer',
                fontSize: '0.98rem'
              }}
            >
              {opt}
            </button>
          )
        })}
      </div>

      {selected != null && (
        <div>
          <p className={selected === q.payload.correctIndex ? 'success-text' : 'error-text'}>
            {selected === q.payload.correctIndex ? 'Correct!' : 'Not quite.'}
          </p>
          <button className="btn" onClick={next}>{isLast ? 'See my results' : 'Next question'}</button>
        </div>
      )}
    </div>
  )
}
