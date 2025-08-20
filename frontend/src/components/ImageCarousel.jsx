import { useEffect, useRef, useState } from 'react'

const slides = [
  {
    src: 'https://images.unsplash.com/photo-1544989164-31dc3c645987?q=80&w=1600&auto=format&fit=crop',
    title: 'Floresta Amazônica',
    caption: 'A maior floresta tropical do mundo',
  },
  {
    src: 'https://images.unsplash.com/photo-1592861956120-9d4f7e4f1b66?q=80&w=1600&auto=format&fit=crop',
    title: 'Culinária Paraense',
    caption: 'Tacacá, açaí, maniçoba e sabores únicos',
  },
  {
    src: 'https://images.unsplash.com/photo-1526481280698-8fcc13fd74ed?q=80&w=1600&auto=format&fit=crop',
    title: 'Belém do Pará',
    caption: 'Cultura, história e belezas naturais',
  },
  {
    src: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?q=80&w=1600&auto=format&fit=crop',
    title: 'Pontos Turísticos',
    caption: 'Mercado Ver-o-Peso, Mangal das Garças e mais',
  },
]

export default function ImageCarousel() {
  const [index, setIndex] = useState(0)
  const timeoutRef = useRef(null)
  const go = (i) => setIndex((prev) => (prev + i + slides.length) % slides.length)

  useEffect(() => {
    timeoutRef.current && clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => go(1), 4000)
    return () => clearTimeout(timeoutRef.current)
  }, [index])

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-soft">
      <img src={slides[index].src} alt={slides[index].title} className="h-[340px] w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="absolute bottom-4 left-4 text-white">
        <h3 className="text-xl font-semibold drop-shadow">{slides[index].title}</h3>
        <p className="opacity-90">{slides[index].caption}</p>
      </div>
      <div className="absolute inset-y-0 left-0 flex items-center">
        <button onClick={() => go(-1)} className="m-2 rounded-full bg-white/70 hover:bg-white p-2">‹</button>
      </div>
      <div className="absolute inset-y-0 right-0 flex items-center">
        <button onClick={() => go(1)} className="m-2 rounded-full bg-white/70 hover:bg-white p-2">›</button>
      </div>
      <div className="absolute bottom-3 right-4 flex gap-1">
        {slides.map((_, i) => (
          <span key={i}
            className={'h-2 w-2 rounded-full ' + (i === index ? 'bg-white' : 'bg-white/50')} />
        ))}
      </div>
    </div>
  )
}
