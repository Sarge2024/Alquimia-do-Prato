import { motion } from 'motion/react';
import { ArrowRight, Clock, Utensils, Loader2, Coffee, Soup, Pizza, GlassWater, Cake } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { recipeService, Recipe } from '../services/recipeService';
import { RecipeCard } from '../components/RecipeCard';

const CATEGORIES = [
  { name: 'Café da Manhã', icon: Coffee, img: 'https://images.unsplash.com/photo-1493770348161-369560ae357d?auto=format&fit=crop&q=80&w=800' },
  { name: 'Almoço', icon: Soup, img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=800' },
  { name: 'Jantar', icon: Pizza, img: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=800' },
  { name: 'Cocktail', icon: GlassWater, img: 'https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&q=80&w=800' },
  { name: 'Sobremesas', icon: Cake, img: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=800' },
];

const MOCK_RECIPES: Recipe[] = [
  {
    id: 'tapioca-rendada',
    title: 'Tapioca Rendada com Queijo Coalho',
    category: 'Café da Manhã',
    time: '12 min',
    rating: 4.9,
    reviewsCount: 45,
    difficulty: 'Fácil',
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
    difficulty: 'Médio',
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
    difficulty: 'Fácil',
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

  return (
    <div className="pb-xl">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 mb-xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl md:rounded-3xl overflow-hidden bg-stone-900 h-[500px] md:h-[600px] flex items-center group"
        >
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=1200" 
              alt="Featured Recipe" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-70 md:opacity-100"
              referrerPolicy="no-referrer"
            />
            {/* Desktop Gradient Overlay */}
            <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-stone-950/90 via-stone-900/40 to-transparent"></div>
            {/* Mobile Ambient Overlay */}
            <div className="md:hidden absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/60 to-stone-900/40"></div>
          </div>

          <div className="relative z-10 max-w-2xl px-6 md:px-12 py-10 md:py-16 text-white w-full">
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-block px-3 py-1 rounded-full bg-secondary text-white text-[10px] md:text-sm font-bold mb-4 md:mb-6 tracking-widest uppercase"
            >
              Escolha do Editor
            </motion.span>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6 leading-tight font-sans drop-shadow-md">
              Segredos da Alquimia do Prato: Tradição e Sabor
            </h1>
            <p className="text-base md:text-lg text-stone-200 mb-6 md:mb-8 max-w-lg leading-relaxed drop-shadow-sm">
              Celebre a magia dos sabores com pratos que honram ingredientes frescos e técnicas artesanais passadas por gerações.
            </p>
            
            <div className="flex flex-wrap items-center gap-4 md:gap-6 mb-8 md:mb-10 text-stone-300 text-sm md:text-base">
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                <Clock className="w-4 h-4 text-secondary" />
                <span className="font-medium">Variado</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                <Utensils className="w-4 h-4 text-secondary" />
                <span className="font-medium">Autêntico</span>
              </div>
            </div>

            <Link to="/explore" className="inline-flex bg-primary hover:bg-primary-container text-white font-bold px-6 md:px-8 py-3.5 md:py-4 rounded-xl shadow-lg transition-all items-center gap-3 active:scale-95 w-full sm:w-fit text-base md:text-lg justify-center shadow-primary/30">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-wrap md:justify-center gap-3 md:gap-16">
          {CATEGORIES.map((cat, i) => (
            <Link 
              key={i} 
              to={`/explore?category=${encodeURIComponent(cat.name)}`}
              className="group flex items-center md:flex-col gap-4 cursor-pointer p-3 md:p-0 rounded-2xl bg-surface-container-low md:bg-transparent border border-stone-100 md:border-0 hover:border-primary/30 transition-all"
            >
              <div className="md:hidden w-12 h-12 flex-shrink-0 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                <cat.icon size={24} />
              </div>

              <motion.div 
                whileHover={{ y: -5 }}
                className="hidden md:block w-32 h-32 rounded-full overflow-hidden border-4 border-transparent group-hover:border-primary transition-all duration-300 p-1 bg-surface-container shadow-inner"
              >
                <img src={cat.img} alt={cat.name} className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
              </motion.div>

              <div className="flex flex-col md:items-center min-w-0">
                <span className={`font-semibold text-on-surface group-hover:text-primary transition-colors whitespace-nowrap overflow-hidden text-ellipsis ${cat.name.length > 10 ? 'text-sm md:text-xl' : 'text-base md:text-xl'}`}>
                  {cat.name}
                </span>
                <span className="md:hidden text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mt-0.5">Explorar</span>
              </div>

              <div className="ml-auto md:hidden pr-2">
                <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-primary transition-colors" />
              </div>
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
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id || `home-recipe-${Math.random()}`} recipe={recipe} />
            ))}
          </div>
        )}
      </section>

      {/* Community Section */}
      <section className="bg-surface-container-high py-20 mt-12 rounded-3xl max-w-7xl mx-auto overflow-hidden">
        <div className="px-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="rounded-2xl overflow-hidden shadow-2xl">
            <img 
              src="https://lh3.googleusercontent.com/d/1-jM6qODVnceVhAS7ULlwrUizuBl0IxNS" 
              alt="Comunidade Alquimia do Prato" 
              className="w-full h-[400px] object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // Fallback to high-quality Unsplash if Drive fails
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=800";
              }}
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
