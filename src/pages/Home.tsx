import { motion } from 'motion/react';
import { ArrowRight, Clock, Utensils, Heart, Star, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { recipeService, Recipe } from '../services/recipeService';

const CATEGORIES = [
  { name: 'Café da Manhã', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFeBa42Zrz2HEwOgvFogZLBx1_J2LhIjWZVQgu09rdt91vlPJSlnq-b6mxxXyVl6DyrdVf_Bi1fzEnX2vLahPzoaXcY7vXn9yFZ3zZa5bIF53VTGf1ujlJgQuuWTlCbJTqL_tdzCXepHzvoBOmU6RRFQpq9F5wlr_h7m2luNnuV0cSZf2WTXEEK4J1KkeDQ6TimADAheETqLJFCrMtKcEFv47r1nsHGSaiB4Q2nj1JRZgP5r-BeUZKHspiZxLYH0v26jMfFeYV-yZ1' },
  { name: 'Almoço', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBsyb6617k6pr6srGCcRDK1S-0M_6Vm9gBaCtQ78_yv4QSB82i4oBha4j9uqqdbgZYre1Gva7y6L7d1gim69U3ArrexyDj7gy2nJjPRijEuH5b0QtpHKdtHfaenJR10Ps4sj-zEOCoaBDAF5zRJR7elLy4V2egSWjsP1LGieDkSa6eRtb5fub8AeNv22DPOziOHPjTsB4LAVotm6FAatC_QUkou19QYaulkanjv9qU28h54dKnh3HNkgw3tnDJpHKWF5x7U5DGDOsWj' },
  { name: 'Jantar', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCCvqsV_1Wczh6W9uBqSqwCmAsNi3U-TN6NPq6VqWdNc1pLfC1T7288a58XuCOiBmWa1SwwW88WVSCy2jvAP2DqlePyyoAiLwGbAj2IGL3wvNQK8A7g9NCfBbB1gkI1hFtxtvhchatp_TfOBgIJ7OfT5W5i8WYCNFLoB4Uk3F3OjRxZbfnuiBZgdkAFvYSECsTFFVvU77RzYD0RJ_9oqm2eOwN1axsj6UY10WGpRV2euGdCnWuegzBId0o3qp0MbPTSzxqDZHsw1oDq' },
  { name: 'Sobremesas', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDC-RBcMKZPR2GXK9xl5PO0-f0AvjYxMAnIgerLSe1bH6pc6T1f2srd2jNqz7HvExxIVh1xaue_PBrZxAiVwpHbbbKQL6hfep2wVDD63w2KQuCgYbAt1Sgeymp4ZL1HCvTT9qEBfn2dO9S12cZ7Bf07HLOQWkb36iANLiLH1zeK7wi1CFUHDZWDbNvB2w8graCGVjGnmF-UfV5ZBsSvOoxeK72sMo9Lc856flnUNyZiE0RLjm1ljtdOH7rucypsl4c1rgrkHkQLrNDC' },
];

const MOCK_RECIPES = [
  {
    id: 'pesto-manjericao',
    title: 'Pesto de Manjericão Silvestre',
    category: 'VEGANO',
    time: '15 min',
    rating: 4.9,
    reviewsCount: 124,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCfTTB9gpP4nLbclNAIwY-gebxMg0T9maHRMG5vO-onmKiaOCLR3TA3ZcSWs-e5ooXvYvxxYvitvEPV0qNzQ4nfJEBpGGaMJoHaLfYpffsIdLIDwNLroUQjrApzq4NJtcUiHlLUNVMIA8gkHTqry1JcHA3B7VpW66kNKvwfEpzZZuva-AybbQ_qBurtARZqE6dj1_NMOIRx91VmUi916qYy5T9JHR8qhZHfH_I0_I4o-7_UIo9k7UgToSRqRqo6lq3G59Rp7wVJHAE4'
  },
  {
    id: 'salada-beterraba',
    title: 'Salada de Beterraba Tostada',
    category: 'SEM GLÚTEN',
    time: '35 min',
    rating: 4.8,
    reviewsCount: 89,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCyC3dJg4m6w-bPPmM-yMlsyYX-L2LQA1pSxYvSKdyN_DK4ilQj4l8O6x4GWefOV5bUk2-r5QnGulqo0TzoLYtaIwiMnftOFGe3F0n32bqG1ds77JejLfx1FvLdTr_k-2eUDiozk5nlkL-yLPtQFaz5U3CatR0jCkVoK6fXma1o7hGRuJEaD7QX7QsxJWn0fWEPbIemSpntgFOGv_R2bEBPZuzYLYvSJP7gsiBz4r2JKJiB4yuSTYkSoG4dIcPQCUkQIn4JbP40gvll'
  }
];

export default function Home() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentRecipes();
  }, []);

  const loadRecentRecipes = async () => {
    try {
      const data = await recipeService.getAllRecipes();
      if (data.length > 0) {
        setRecipes(data.slice(0, 3));
      } else {
        setRecipes(MOCK_RECIPES as any);
      }
    } catch (error) {
      console.error('Error loading recent recipes:', error);
      setRecipes(MOCK_RECIPES as any);
    } finally {
      setLoading(false);
    }
  };

  const getTagColor = (category: string) => {
    switch (category) {
      case 'Café da Manhã': return 'bg-yellow-100 text-yellow-700';
      case 'Almoço': return 'bg-primary-fixed text-on-primary-fixed';
      case 'Jantar': return 'bg-secondary-container text-on-secondary-container';
      case 'Sobremesas': return 'bg-pink-100 text-pink-700';
      case 'Bebidas': return 'bg-blue-100 text-blue-700';
      default: return 'bg-stone-100 text-stone-700';
    }
  };

  return (
    <div className="pb-xl">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 mb-xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl overflow-hidden bg-surface-container-high h-[600px] flex items-center group"
        >
          <div className="absolute inset-0 z-0">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAx1FI3Ru7GhZX_vE5YLQy4EyyIqx_8mPJwXKXcTzR0izS8LJ54dkw0DQiCTVs2E2JIYks3we2gTCZ3mM0CE8oxv3dEcHrD--zX1R90nKaK5EYehdNnLEOdwC2ihUXkYKCoVXlSxSTxsZ_lPaBrCP6QM5NhdyWg9NstdRhcz507MZ_Rt2Btteofcw3ydNvc8Gh8AOz65rDaRyTvMYvZjKmERKuaPLhj3F3_sAbxhzP-C6MUjQYMod5eZgoyWyrd17kTn404sFxoVWk4" 
              alt="Featured Recipe" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-stone-900/80 via-stone-900/40 to-transparent"></div>
          </div>
          <div className="relative z-10 max-w-2xl px-12 py-16 text-white">
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-block px-4 py-1 rounded-full bg-secondary-container text-secondary text-sm font-semibold mb-6 tracking-wide"
            >
              Escolha do Editor
            </motion.span>
            <h1 className="text-5xl font-bold mb-6 leading-tight font-sans">
              Segredos da Alquimia do Prato: Tradição e Sabor
            </h1>
            <p className="text-lg text-stone-100 mb-8 max-w-lg leading-relaxed">
              Celebre a magia dos sabores com pratos que honram ingredientes frescos e técnicas artesanais passadas por gerações.
            </p>
            <div className="flex items-center gap-6 mb-10 text-stone-200">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-secondary" />
                <span>Variado</span>
              </div>
              <div className="flex items-center gap-2">
                <Utensils className="w-5 h-5 text-secondary" />
                <span>Autêntico</span>
              </div>
            </div>
            <Link to="/explore" className="inline-block bg-primary hover:bg-primary-container text-white font-bold px-8 py-4 rounded-xl shadow-lg transition-all flex items-center gap-3 active:scale-95 w-fit text-lg">
              Explorar Receitas <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Popular Categories */}
      <section className="max-w-7xl mx-auto px-6 mb-xl">
        <div className="mb-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-on-surface mb-2">Categorias Populares</h2>
              <p className="text-on-surface-variant">Encontre exatamente o que você deseja hoje.</p>
            </div>
            <Link to="/categories" className="text-primary font-bold flex items-center gap-2 hover:underline">
              Ver todas <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {CATEGORIES.map((cat, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -5 }}
              className="group flex flex-col items-center gap-4 cursor-pointer"
            >
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-transparent group-hover:border-primary transition-all duration-300 p-1 bg-surface-container shadow-inner">
                <img src={cat.img} alt={cat.name} className="w-full h-full object-cover rounded-full" />
              </div>
              <span className="text-xl font-semibold text-on-surface group-hover:text-primary transition-colors">{cat.name}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Recent Recipes */}
      <section className="max-w-7xl mx-auto px-6 mb-xl">
        <div className="flex items-center justify-between mb-lg">
          <h2 className="text-3xl font-bold text-on-surface">Receitas Recentes</h2>
          <Link to="/explore" className="text-primary font-bold flex items-center gap-2 hover:underline">
            Ver todas <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
            <p className="text-sm text-on-surface-variant">Carregando novidades...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {recipes.map((recipe, i) => (
              <Link key={recipe.id || i} to={`/recipe/${recipe.id}`}>
                <motion.article 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group bg-surface-container-low rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer h-full border border-stone-100"
                >
                  <div className="aspect-[4/3] overflow-hidden relative bg-stone-200">
                    {recipe.image ? (
                      <img 
                      src={recipe.image} 
                      alt={recipe.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-400 font-bold uppercase text-xs">
                        Alquimia
                      </div>
                    )}
                    <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors shadow-sm">
                      <Heart className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-6">
                    <div className="flex gap-2 mb-3">
                      <span className={`px-3 py-0.5 rounded-full text-[12px] font-bold tracking-wider uppercase ${getTagColor(recipe.category)}`}>
                        {recipe.category}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-on-surface mb-4 group-hover:text-primary transition-colors leading-snug line-clamp-1">
                      {recipe.title}
                    </h3>
                    <div className="flex items-center justify-between text-on-surface-variant font-semibold text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {recipe.time || 'N/A'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        {recipe.rating?.toFixed(1) || '0.0'} ({recipe.reviewsCount || 0})
                      </div>
                    </div>
                  </div>
                </motion.article>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Community Section */}
      <section className="bg-surface-container-high py-20 mt-12 rounded-3xl max-w-7xl mx-auto overflow-hidden">
        <div className="px-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="rounded-2xl overflow-hidden shadow-2xl">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBQFfXNftAiRWd3JqLPpA43bf_SAjc3SaZxkWtId8qrj4pJ74LjSnenC2vlyOWHFr7nceW4HAzT8vWEHpiQYm2p_w14c5XRyrHSxd-oE-6CkkZhSKv6dknmla9mOflF5bT3N6lyLhhDpIa7gVF2Zt0XeNxZICYsIwr6xBK2Ka4mabWPT5ZYSExJe8nVVVW3vbMbiSt9yvTVl5K3x0HN1Pf46Ap2k-hMewG2ZMmS-N-1gJs_F4ePS2E8W6MoWnt2pgDyIbqZ9nF0VTYC" 
              alt="Community" 
              className="w-full h-[400px] object-cover"
            />
          </div>
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-on-surface leading-tight">Compartilhe sua Jornada Culinária</h2>
            <p className="text-lg text-on-surface-variant leading-relaxed">
              Junte-se a uma comunidade de cozinheiros que valorizam ingredientes de verdade e técnicas ancestrais. Envie suas próprias receitas e inspire outros.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/submit" className="bg-primary text-white font-bold px-8 py-3 rounded-xl hover:shadow-lg transition-all active:scale-95 text-center shadow-xl shadow-primary/20">
                Publicar uma Receita
              </Link>
              <button className="border-2 border-primary text-primary font-bold px-8 py-3 rounded-xl hover:bg-primary hover:text-white transition-all active:scale-95">
                Saiba Mais
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
