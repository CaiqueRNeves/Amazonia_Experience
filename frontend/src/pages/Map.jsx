import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useEffect, useState } from 'react'
const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api'

export default function Map() {
  const [places, setPlaces] = useState([])
  const [events, setEvents] = useState([])
  useEffect(() => {
    fetch(`${BASE}/places?limit=200`).then(r=>r.json()).then(j=>setPlaces(j?.data?.places || []))
    fetch(`${BASE}/events?limit=200`).then(r=>r.json()).then(j=>setEvents(j?.data?.events || []))
  }, [])
  const center = [-1.4558, -48.4902]

  return (
    <section className="space-y-5">
      <h2 className="text-2xl font-semibold text-forest">Mapa Interativo</h2>
      <MapContainer center={center} zoom={12} scrollWheelZoom>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {places.map(p => (
          <Marker key={`p-${p.id}`} position={[p.latitude, p.longitude]}>
            <Popup><b>{p.name}</b><br/>{p.address}<br/><i>Ponto turístico</i></Popup>
          </Marker>
        ))}
        {events.map(e => (
          <Marker key={`e-${e.id}`} position={[e.latitude, e.longitude]}>
            <Popup><b>{e.name}</b><br/>{e.location}<br/><i>Evento oficial</i></Popup>
          </Marker>
        ))}
      </MapContainer>
    </section>
  )
}
