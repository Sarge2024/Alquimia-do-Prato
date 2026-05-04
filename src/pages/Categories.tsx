import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

const CATEGORIES_DETAILED = [
  { 
    name: 'Café da Manhã', 
    desc: 'Comece o dia com receitas nutritivas e reconfortantes.',
    count: '42 receitas',
    img: 'https://images.unsplash.com/photo-1493770348161-369560ae357d?auto=format&fit=crop&q=80&w=800' 
  },
  { 
    name: 'Almoço', 
    desc: 'Refeições leves e equilibradas para o seu meio de dia.',
    count: '38 receitas',
    img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=800' 
  },
  { 
    name: 'Jantar', 
    desc: 'Pratos sofisticados para encantar a família e amigos.',
    count: '54 receitas',
    img: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=800' 
  },
  { 
    name: 'Sobremesas', 
    desc: 'Doces artesanais que celebram sabores naturais.',
    count: '27 receitas',
    img: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=800' 
  },
  { 
    name: 'Bebidas', 
    desc: 'Sucos naturais, chás e coquetéis botânicos.',
    count: '15 receitas',
    img: 'https://images.unsplash.com/photo-1544145945-f904253d0c7b?auto=format&fit=crop&q=80&w=800'
  }
];

export default function Categories() {
  return (
    <div className="max-w-7xl mx-auto px-6 pb-xl">
      <header className="mb-12 text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-on-surface mb-4">Categorias de Receitas</h1>
        <p className="text-on-surface-variant text-lg">Explore nosso universo culinário agrupado por momentos e sabores.</p>
      </header>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {CATEGORIES_DETAILED.map((cat, i) => (
          <Link key={i} to={`/explore?category=${encodeURIComponent(cat.name)}`}>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group relative h-80 rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500"
            >
              <img src={cat.img} alt={cat.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-900/40 to-transparent" />
              <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                <span className="text-sm font-bold text-secondary-container mb-2 tracking-widest uppercase">{cat.count}</span>
                <h3 className="text-3xl font-bold mb-2">{cat.name}</h3>
                <p className="text-stone-300 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  {cat.desc}
                </p>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}
