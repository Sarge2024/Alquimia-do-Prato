import { motion } from 'motion/react';

const CATEGORIES_DETAILED = [
  { 
    name: 'Café da Manhã', 
    desc: 'Comece o dia com receitas nutritivas e reconfortantes.',
    count: '42 receitas',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFeBa42Zrz2HEwOgvFogZLBx1_J2LhIjWZVQgu09rdt91vlPJSlnq-b6mxxXyVl6DyrdVf_Bi1fzEnX2vLahPzoaXcY7vXn9yFZ3zZa5bIF53VTGf1ujlJgQuuWTlCbJTqL_tdzCXepHzvoBOmU6RRFQpq9F5wlr_h7m2luNnuV0cSZf2WTXEEK4J1KkeDQ6TimADAheETqLJFCrMtKcEFv47r1nsHGSaiB4Q2nj1JRZgP5r-BeUZKHspiZxLYH0v26jMfFeYV-yZ1' 
  },
  { 
    name: 'Almoço', 
    desc: 'Refeições leves e equilibradas para o seu meio de dia.',
    count: '38 receitas',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBsyb6617k6pr6srGCcRDK1S-0M_6Vm9gBaCtQ78_yv4QSB82i4oBha4j9uqqdbgZYre1Gva7y6L7d1gim69U3ArrexyDj7gy2nJjPRijEuH5b0QtpHKdtHfaenJR10Ps4sj-zEOCoaBDAF5zRJR7elLy4V2egSWjsP1LGieDkSa6eRtb5fub8AeNv22DPOziOHPjTsB4LAVotm6FAatC_QUkou19QYaulkanjv9qU28h54dKnh3HNkgw3tnDJpHKWF5x7U5DGDOsWj' 
  },
  { 
    name: 'Jantar', 
    desc: 'Pratos sofisticados para encantar a família e amigos.',
    count: '54 receitas',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCCvqsV_1Wczh6W9uBqSqwCmAsNi3U-TN6NPq6VqWdNc1pLfC1T7288a58XuCOiBmWa1SwwW88WVSCy2jvAP2DqlePyyoAiLwGbAj2IGL3wvNQK8A7g9NCfBbB1gkI1hFtxtvhchatp_TfOBgIJ7OfT5W5i8WYCNFLoB4Uk3F3OjRxZbfnuiBZgdkAFvYSECsTFFVvU77RzYD0RJ_9oqm2eOwN1axsj6UY10WGpRV2euGdCnWuegzBId0o3qp0MbPTSzxqDZHsw1oDq' 
  },
  { 
    name: 'Sobremesas', 
    desc: 'Doces artesanais que celebram sabores naturais.',
    count: '27 receitas',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDC-RBcMKZPR2GXK9xl5PO0-f0AvjYxMAnIgerLSe1bH6pc6T1f2srd2jNqz7HvExxIVh1xaue_PBrZxAiVwpHbbbKQL6hfep2wVDD63w2KQuCgYbAt1Sgeymp4ZL1HCvTT9qEBfn2dO9S12cZ7Bf07HLOQWkb36iANLiLH1zeK7wi1CFUHDZWDbNvB2w8graCGVjGnmF-UfV5ZBsSvOoxeK72sMo9Lc856flnUNyZiE0RLjm1ljtdOH7rucypsl4c1rgrkHkQLrNDC' 
  },
  { 
    name: 'Bebidas', 
    desc: 'Sucos naturais, chás e coquetéis botânicos.',
    count: '15 receitas',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCfTTB9gpP4nLbclNAIwY-gebxMg0T9maHRMG5vO-onmKiaOCLR3TA3ZcSWs-e5ooXvYvxxYvitvEPV0qNzQ4nfJEBpGGaMJoHaLfYpffsIdLIDwNLroUQjrApzq4NJtcUiHlLUNVMIA8gkHTqry1JcHA3B7VpW66kNKvwfEpzZZuva-AybbQ_qBurtARZqE6dj1_NMOIRx91VmUi916qYy5T9JHR8qhZHfH_I0_I4o-7_UIo9k7UgToSRqRqo6lq3G59Rp7wVJHAE4'
  }
];

export default function Categories() {
  return (
    <div className="max-w-7xl mx-auto px-6 pb-xl">
      <header className="mb-12 text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-on-surface mb-4">Recipes Categories</h1>
        <p className="text-on-surface-variant text-lg">Explore our diverse culinary world grouped by moments and flavors.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {CATEGORIES_DETAILED.map((cat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group relative h-80 rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500"
          >
            <img src={cat.img} alt={cat.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-900/40 to-transparent" />
            <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
              <span className="text-sm font-bold text-secondary-container mb-2 tracking-widest uppercase">{cat.count}</span>
              <h3 className="text-3xl font-bold mb-2">{cat.name}</h3>
              <p className="text-stone-300 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                {cat.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
