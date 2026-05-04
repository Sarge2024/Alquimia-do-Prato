import { motion } from 'motion/react';
import { ArrowRight, Clock, Utensils, Heart, Star, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { recipeService, Recipe } from '../services/recipeService';

const CATEGORIES = [
  { name: 'Café da Manhã', img: 'https://images.unsplash.com/photo-1493770348161-369560ae357d?auto=format&fit=crop&q=80&w=800' },
  { name: 'Almoço', img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=800' },
  { name: 'Jantar', img: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=800' },
  { name: 'Sobremesas', img: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=800' },
];

const MOCK_RECIPES = [
  {
    id: 'tapioca-rendada',
    title: 'Tapioca Rendada com Queijo Coalho',
    category: 'Café da Manhã',
    time: '12 min',
    rating: 4.9,
    reviewsCount: 45,
    image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?auto=format&fit=crop&q=80&w=800',
    ownerId: 'system',
    ingredients: [],
    instructions: []
  },
  {
    id: 'feijoada-completa',
    title: 'Feijoada Completa Tradicional',
    category: 'Almoço',
    time: '3h 00min',
    rating: 5.0,
    reviewsCount: 128,
    image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&q=80&w=800',
    ownerId: 'system',
    ingredients: [],
    instructions: []
  },
  {
    id: 'salmao-ervas',
    title: 'Salmão com Crosta de Ervas',
    category: 'Jantar',
    time: '25 min',
    rating: 4.8,
    reviewsCount: 67,
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=800',
    ownerId: 'system',
    ingredients: [],
    instructions: []
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
        setRecipes(MOCK_RECIPES);
      }
    } catch (error) {
      console.error('Error loading recent recipes:', error);
      setRecipes(MOCK_RECIPES);
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
              src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=1200" 
              alt="Featured Recipe" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
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
        <div className="flex flex-wrap justify-center gap-8 md:gap-16">
          {CATEGORIES.map((cat, i) => (
            <Link 
              key={i} 
              to={`/explore?category=${encodeURIComponent(cat.name)}`}
              className="group flex flex-col items-center gap-4 cursor-pointer min-w-[140px]"
            >
              <motion.div 
                whileHover={{ y: -5 }}
                className="w-32 h-32 rounded-full overflow-hidden border-4 border-transparent group-hover:border-primary transition-all duration-300 p-1 bg-surface-container shadow-inner"
              >
                <img src={cat.img} alt={cat.name} className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
              </motion.div>
              <span className="text-xl font-semibold text-on-surface group-hover:text-primary transition-colors text-center">{cat.name}</span>
            </Link>
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
              <div key={recipe.id || `home-recipe-${i}`} className="relative group">
                <Link to={`/recipe/${recipe.id}`}>
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
                        referrerPolicy="no-referrer"
                      />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-400 font-bold uppercase text-xs">
                          Alquimia
                        </div>
                      )}
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
                <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors shadow-sm z-10">
                  <Heart className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Community Section */}
      <section className="bg-surface-container-high py-20 mt-12 rounded-3xl max-w-7xl mx-auto overflow-hidden">
        <div className="px-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="rounded-2xl overflow-hidden shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=800" 
              alt="Community" 
              className="w-full h-[400px] object-cover"
              referrerPolicy="no-referrer"
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
