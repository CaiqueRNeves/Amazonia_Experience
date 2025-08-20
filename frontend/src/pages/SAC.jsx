import { useEffect, useState } from 'react'
const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api'

export default function SAC() {
  const [services, setServices] = useState([])
  const [contacts, setContacts] = useState(null)
  const [lang, setLang] = useState('pt-BR')

  useEffect(() => { load() }, [lang])
  async function load() {
    const s = await fetch(`${BASE}/emergency/services?is_24h=true`).then(r=>r.json())
    setServices(s?.data?.services || [])
    const c = await fetch(`${BASE}/emergency/contacts/${lang}`).then(r=>r.json())
    setContacts(c?.data?.contacts || null)
  }

  return (
    <section className="space-y-6">
      <div className="flex items-end gap-3">
        <h2 className="text-2xl font-semibold text-forest">SAC & Contatos de Emergência</h2>
        <select className="border rounded-md px-2 py-1" value={lang} onChange={e=>setLang(e.target.value)}>
          <option>pt-BR</option><option>en-US</option><option>es-ES</option>
        </select>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-xl shadow-soft border">
          <h3 className="font-semibold mb-2">Serviços 24h</h3>
          <ul className="space-y-3">
            {services.map(s => (
              <li key={s.id} className="border rounded-md p-3">
                <div className="font-medium">{s.name}</div>
                <div className="text-sm text-gray-600">{s.address}</div>
                <div className="text-sm text-gray-700">Tipo: {s.service_type} • Fone: {s.phone_number}</div>
              </li>
            ))}
            {!services.length && <p>Nenhum serviço listado.</p>}
          </ul>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-soft border">
          <h3 className="font-semibold mb-2">Contatos oficiais</h3>
          {!contacts ? <p>Carregando…</p> : (
            <ul className="space-y-2 text-sm">
              {Object.entries(contacts).map(([group, val]) => (
                <li key={group}><span className="font-medium capitalize">{group}:</span> {typeof val === 'string' ? val : JSON.stringify(val)}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}
