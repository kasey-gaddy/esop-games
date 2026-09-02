import { useState } from 'react'

export default function MythFact({ questions, onFinish }) {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)

  const q = questions[index]
  const isLast = index === questions.length - 1

  function choose(answer) {
    if (selected) return
    setSelected(answer)
    if (answer === q.payload.answer) setScore((s) => s + 1)
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
      <p className="desc">Statement {index + 1} of {questions.length}</p>
      <h2 style={{ fontSize: '1.2rem' }}>{q.payload.statement}</h2>

      <div style={{ display: 'flex', gap: 12, margin: '20px 0' }}>
        {['MYTH', 'FACT'].map((opt) => {
          const isChosen = selected === opt
          const isRight = opt === q.payload.answer
          let bg = 'transparent', color = '#233E87', border = '#233E87'
          if (selected) {
            if (isRight) { bg = '#233E87'; color = '#fff' }
            else if (isChosen && !isRight) { bg = '#f6dede'; color = '#a4302a'; border = '#a4302a' }
          }
          return (
            <button
              key={opt}
              onClick={() => choose(opt)}
              disabled={!!selected}
              className="btn"
              style={{ background: bg, color, border: `2px solid ${border}`, flex: 1 }}
            >
              {opt}
            </button>
          )
        })}
      </div>

      {selected && (
        <div>
          <p className={selected === q.payload.answer ? 'success-text' : 'error-text'}>
            {selected === q.payload.answer ? 'Correct!' : `Not quite — this one is ${q.payload.answer}.`}
          </p>
          {q.payload.explanation && <p className="desc">{q.payload.explanation}</p>}
          <button className="btn" onClick={next}>{isLast ? 'See my results' : 'Next statement'}</button>
        </div>
      )}
    </div>
  )
}
