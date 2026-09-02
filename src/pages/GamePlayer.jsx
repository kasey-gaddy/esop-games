import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api, getEmployee } from '../lib/api.js'
import WordSearch from '../games/WordSearch.jsx'
import Crossword from '../games/Crossword.jsx'
import MythFact from '../games/MythFact.jsx'
import Trivia from '../games/Trivia.jsx'

export default function GamePlayer() {
  const { gameId } = useParams()
  const employee = getEmployee()
  const [game, setGame] = useState(null)
  const [questions, setQuestions] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [finished, setFinished] = useState(false)
  const [finalScore, setFinalScore] = useState(null)

  useEffect(() => {
    api.getQuestions(gameId)
      .then(({ game, questions }) => {
        setGame(game)
        setQuestions(questions)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [gameId])

  async function handleFinish(score) {
    setFinalScore(score)
    setFinished(true)
    try {
      await api.complete(employee.id, gameId, score)
    } catch {
      // Completion tracking failure shouldn't block the player from seeing their result.
    }
  }

  return (
    <div className="shell">
      <p style={{ marginBottom: 16 }}>
        <Link to="/games" className="small-link">&larr; Back to games</Link>
      </p>

      {loading && <p>Loading…</p>}
      {error && <p className="error-text">{error}</p>}

      {game && !finished && (
        <>
          <div className="title-block">
            <div>
              <span className="mark">{game.title.toUpperCase()}</span>
              <h1 style={{ fontSize: '1.6rem' }}>{game.title}</h1>
            </div>
          </div>

          {game.type === 'word_search' && <WordSearch questions={questions} onFinish={handleFinish} />}
          {game.type === 'crossword' && <Crossword questions={questions} onFinish={handleFinish} />}
          {game.type === 'myth_fact' && <MythFact questions={questions} onFinish={handleFinish} />}
          {game.type === 'trivia' && <Trivia questions={questions} onFinish={handleFinish} />}
        </>
      )}

      {finished && (
        <div className="sheet">
          <span className="stamp done">COMPLETE</span>
          <h2>Nice work, {employee.name.split(' ')[0]}!</h2>
          <p className="desc">
            {finalScore != null
              ? `You scored ${finalScore.correct} out of ${finalScore.total}.`
              : "You've completed this game."}
          </p>
          <Link to="/games" className="btn">Back to games</Link>
        </div>
      )}
    </div>
  )
}
