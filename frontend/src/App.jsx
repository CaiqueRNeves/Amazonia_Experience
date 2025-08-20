// Importação dos componentes de rota e páginas principais
import { Routes, Route, NavLink } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Events from './pages/Events'
import Quiz from './pages/Quiz'
import SAC from './pages/SAC'
import Map from './pages/Map'

// Navbar: barra de navegação superior do site
function Navbar() {
  // Função para definir estilos dos links de navegação
  const link = ({ isActive }) =>
    'px-3 py-2 rounded-md transition ' +
    (isActive ? 'bg-primary text-white' : 'hover:bg-white/60 text-white')

  return (
    <header className="bg-gradient-to-r from-forest to-primary text-white shadow-soft">
      <div className="container mx-auto px-4 py-3 flex items-center gap-4">
        {/* Logo e nome do site */}
        <NavLink to="/" className="text-xl font-semibold">Amazônia Experience</NavLink>
        {/* Links de navegação */}
        <nav className="flex gap-1">
          <NavLink to="/events" className={link}>Agenda</NavLink>
          <NavLink to="/quiz" className={link}>Quiz</NavLink>
          <NavLink to="/sac" className={link}>SAC</NavLink>
          <NavLink to="/map" className={link}>Mapa</NavLink>
        </nav>
        {/* Botões de login e registro */}
        <div className="ml-auto flex gap-2">
          <NavLink to="/login" className={link}>Entrar</NavLink>
          <NavLink to="/register" className="px-3 py-2 rounded-md bg-white text-forest hover:bg-sand">Criar conta</NavLink>
        </div>
      </div>
    </header>
  )
}

// Footer: rodapé do site com informações e links úteis
function Footer() {
  return (
    <footer className="bg-sand text-forest">
      <div className="container mx-auto px-4 py-8 grid sm:grid-cols-3 gap-6">
        {/* Informações sobre o site */}
        <div>
          <h4 className="font-semibold mb-2">Amazônia Experience</h4>
          <p className="text-sm opacity-80">Seu guia da COP30: programação, mapa, serviços e experiências locais.</p>
        </div>
        {/* Links úteis */}
        <div>
          <h4 className="font-semibold mb-2">Links úteis</h4>
          <ul className="space-y-1 text-sm">
            <li><NavLink to="/events" className="hover:underline">Agenda</NavLink></li>
            <li><NavLink to="/map" className="hover:underline">Mapa Interativo</NavLink></li>
            <li><NavLink to="/sac" className="hover:underline">SAC & Emergência</NavLink></li>
          </ul>
        </div>
        {/* Informações de contato */}
        <div>
          <h4 className="font-semibold mb-2">Contato</h4>
          <p className="text-sm opacity-80">Belém • Pará • Brasil</p>
        </div>
      </div>
      {/* Direitos autorais */}
      <div className="text-center text-xs py-3 bg-white/70">© {new Date().getFullYear()} Amazônia Experience</div>
    </footer>
  )
}

// Função principal do App, responsável por renderizar toda a estrutura do site
// Inclui Navbar, conteúdo principal (rotas) e Footer
export default function App() {
  return (
    // Container principal do site, aplica gradiente de fundo e layout flexível
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-sand to-white">
      {/* Navbar: barra de navegação superior */}
      <Navbar />
      {/* Main: área principal onde as páginas são renderizadas conforme a rota */}
      <main className="container mx-auto px-4 py-8 flex-1">
        <Routes>
          {/* Rota para a homepage */}
          <Route path="/" element={<Home />} />
          {/* Rota para login */}
          <Route path="/login" element={<Login />} />
          {/* Rota para registro */}
          <Route path="/register" element={<Register />} />
          {/* Rota para eventos */}
          <Route path="/events" element={<Events />} />
          {/* Rota para quiz */}
          <Route path="/quiz" element={<Quiz />} />
          {/* Rota para SAC */}
          <Route path="/sac" element={<SAC />} />
          {/* Rota para mapa */}
          <Route path="/map" element={<Map />} />
        </Routes>
      </main>
      {/* Footer: rodapé do site */}
      <Footer />
    </div>
  )
}
