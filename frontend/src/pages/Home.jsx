import { NavLink } from 'react-router-dom'
import ImageCarousel from '../components/ImageCarousel'

export default function Home() {
  return (
    <section className="grid lg:grid-cols-2 gap-8 items-start">
      <div className="space-y-5">
        <h1 className="text-3xl md:text-4xl font-bold text-forest">
          Bem-vindo à <span className="text-primary">Amazônia Experience</span>
        </h1>
        <p className="text-gray-700 leading-relaxed">
          Acompanhe a agenda oficial da COP30, descubra pontos turísticos, participe de quizzes e
          encontre rapidamente serviços e contatos de emergência. Tudo em um só lugar, com foco em
          sustentabilidade e boas experiências para turistas.
        </p>
        <div className="flex flex-wrap gap-3">
          <NavLink to="/events" className="px-4 py-2 rounded-md bg-primary text-white hover:opacity-95 shadow-soft">Ver Agenda</NavLink>
          <NavLink to="/map" className="px-4 py-2 rounded-md bg-white border hover:bg-sand shadow-soft">Mapa Interativo</NavLink>
          <NavLink to="/quiz" className="px-4 py-2 rounded-md bg-secondary text-white hover:opacity-95 shadow-soft">Jogar Quiz</NavLink>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <Feature title="Eventos" desc="Programação oficial da COP30" />
          <Feature title="SAC & Emergência" desc="Contatos e serviços 24h" />
          <Feature title="Recompensas" desc="Ganhe AmaCoins no Quiz" />
        </div>
      </div>

      <ImageCarousel />

      <div className="lg:col-span-2 grid md:grid-cols-3 gap-6">
        <InfoCard title="Pontos turísticos" text="Conheça Belém, a Estação das Docas, Ver-o-Peso, Mangal das Garças e mais." />
        <InfoCard title="Culinária paraense" text="Tacacá, açaí ‘raiz’, maniçoba, pato no tucupi — sabores autênticos da Amazônia." />
        <InfoCard title="Meio ambiente" text="Dicas de turismo responsável e iniciativas sustentáveis na COP30." />
      </div>
    </section>
  )
}

function Feature({ title, desc }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-soft border">
      <div className="text-primary font-semibold">{title}</div>
      <div className="text-sm text-gray-600">{desc}</div>
    </div>
  )
}

function InfoCard({ title, text }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-soft border">
      <h3 className="font-semibold text-forest mb-1">{title}</h3>
      <p className="text-gray-700 text-sm">{text}</p>
    </div>
  )
}
