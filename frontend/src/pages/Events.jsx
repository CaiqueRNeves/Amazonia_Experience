import { useEffect, useState } from 'react'

const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api'

export default function Events() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [type, setType] = useState('')
  const [date, setDate] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const q = new URLSearchParams()
    if (type) q.set('event_type', type)
    if (date) q.set('start_date', date)
    const res = await fetch(`${BASE}/events?${q.toString()}`)
    const json = await res.json()
    setEvents(json?.data?.events || [])
    setLoading(false)
  }

  return (
    <section className="space-y-5">
      <h2 className="text-2xl font-semibold text-forest">Agenda oficial da COP30</h2>
      <div className="bg-white rounded-xl p-4 shadow-soft grid sm:grid-cols-3 gap-3 border">
        <select className="border rounded-md px-3 py-2" value={type} onChange={(e)=>setType(e.target.value)}>
          <option value="">Todos os tipos</option>
          <option value="conference">Conferência</option>
          <option value="panel">Painel</option>
          <option value="workshop">Workshop</option>
        </select>
        <input type="date" className="border rounded-md px-3 py-2" value={date} onChange={(e)=>setDate(e.target.value)} />
        <button onClick={load} className="px-4 py-2 rounded-md bg-primary text-white">Filtrar</button>
      </div>

      {loading ? <p>Carregando…</p> : (
        <ul className="grid md:grid-cols-2 gap-4">
          {events.map(ev => (
            <li key={ev.id} className="bg-white rounded-xl p-4 shadow-soft border">
              <h3 className="font-semibold text-lg text-forest">{ev.name}</h3>
              {ev.description && <p className="text-gray-700 mt-1">{ev.description}</p>}
              <div className="text-sm text-gray-600 mt-2">
                {ev.location} • {ev.event_type}
              </div>
            </li>
          ))}
          {!events.length && <p>Nenhum evento encontrado.</p>}
        </ul>
      )}
    </section>
  )
}
