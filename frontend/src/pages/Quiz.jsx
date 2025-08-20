import { useEffect, useState } from 'react'
const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api'

export default function Quiz() {
  const [quizzes, setQuizzes] = useState([])
  const [attempt, setAttempt] = useState(null)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => { load() }, [])
  async function load() {
    const res = await fetch(`${BASE}/quizzes`)
    const json = await res.json()
    setQuizzes(json?.data?.quizzes || [])
  }

  async function startQuiz(id) {
    setLoading(true)
    const res = await fetch(`${BASE}/quizzes/${id}/start`, { method: 'POST' })
    const js = await res.json()
    setAttempt(js?.data?.attempt)
    const res2 = await fetch(`${BASE}/quizzes/${id}`)
    const js2 = await res2.json()
    setQuestions(js2?.data?.questions || [])
    setLoading(false)
  }

  async function submit() {
    setLoading(true)
    for (const [qId, answer] of Object.entries(answers)) {
      await fetch(`${BASE}/quizzes/attempts/${attempt.id}/answer`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question_id: Number(qId), answer })
      })
    }
    const res = await fetch(`${BASE}/quizzes/attempts/${attempt.id}/submit`, { method: 'POST' })
    const js = await res.json()
    alert(`Pontuação: ${js?.data?.score ?? '-'}%  •  AmaCoins: ${js?.data?.amacoins_earned ?? 0}`)
    setAttempt(null); setQuestions([]); setAnswers({})
    setLoading(false)
  }

  return (
    <section className="space-y-5">
      <h2 className="text-2xl font-semibold text-forest">Quizzes</h2>
      {!attempt ? (
        <ul className="grid md:grid-cols-2 gap-4">
          {quizzes.map(q => (
            <li key={q.id} className="bg-white rounded-xl p-4 shadow-soft border">
              <h3 className="font-semibold text-lg">{q.title}</h3>
              <p className="text-gray-700">{q.description}</p>
              <div className="text-sm text-gray-600 mt-1">
                Dificuldade: {q.difficulty} • Recompensa: {q.amacoins_reward} AmaCoins
              </div>
              <button disabled={loading} onClick={() => startQuiz(q.id)}
                      className="mt-3 px-4 py-2 rounded-md bg-primary text-white">Iniciar</button>
            </li>
          ))}
          {!quizzes.length && <p>Nenhum quiz disponível.</p>}
        </ul>
      ) : (
        <div className="bg-white rounded-xl p-5 shadow-soft border">
          <h3 className="font-semibold text-lg mb-3">Tentativa #{attempt.id}</h3>
          <div className="space-y-4">
            {questions.map(q => (
              <div key={q.id}>
                <p className="font-medium">{q.question_text}</p>
                {Array.isArray(q.options) && q.options.length ? (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {q.options.map(opt => (
                      <label key={opt} className="flex gap-2 items-center border rounded-md px-2 py-1">
                        <input type="radio" name={`q${q.id}`} value={opt}
                          onChange={()=>setAnswers(a=>({ ...a, [q.id]: opt }))} />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <input className="mt-2 w-full border rounded-md px-3 py-2"
                         placeholder="Sua resposta"
                         onChange={e=>setAnswers(a=>({ ...a, [q.id]: e.target.value }))}/>
                )}
              </div>
            ))}
            <button disabled={loading} onClick={submit}
                    className="px-4 py-2 rounded-md bg-secondary text-white">Enviar respostas</button>
          </div>
        </div>
      )}
    </section>
  )
}
