import { motion } from 'motion/react';
import { Heart, Star, Clock, Filter, ChevronDown, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { recipeService, Recipe } from '../services/recipeService';

const MOCK_RECIPES = [
  {
    id: 'pesto-manjericao',
    title: 'Pesto de Manjericão Silvestre',
    category: 'Jantar',
    time: '15 min',
    rating: 4.9,
    reviewsCount: 124,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCfTTB9gpP4nLbclNAIwY-gebxMg0T9maHRMG5vO-onmKiaOCLR3TA3ZcSWs-e5ooXvYvxxYvitvEPV0qNzQ4nfJEBpGGaMJoHaLfYpffsIdLIDwNLroUQjrApzq4NJtcUiHlLUNVMIA8gkHTqry1JcHA3B7VpW66kNKvwfEpzZZuva-AybbQ_qBurtARZqE6dj1_NMOIRx91VmUi916qYy5T9JHR8qhZHfH_I0_I4o-7_UIo9k7UgToSRqRqo6lq3G59Rp7wVJHAE4'
  },
  {
    id: 'salada-beterraba',
    title: 'Salada de Beterraba Tostada',
    category: 'Almoço',
    time: '35 min',
    rating: 4.8,
    reviewsCount: 89,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCyC3dJg4m6w-bPPmM-yMlsyYX-L2LQA1pSxYvSKdyN_DK4ilQj4l8O6x4GWefOV5bUk2-r5QnGulqo0TzoLYtaIwiMnftOFGe3F0n32bqG1ds77JejLfx1FvLdTr_k-2eUDiozk5nlkL-yLPtQFaz5U3CatR0jCkVoK6fXma1o7hGRuJEaD7QX7QsxJWn0fWEPbIemSpntgFOGv_R2bEBPZuzYLYvSJP7gsiBz4r2JKJiB4yuSTYkSoG4dIcPQCUkQIn4JbP40gvll'
  }
];

export default function Explore() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      const data = await recipeService.getAllRecipes();
      if (data.length > 0) {
        setRecipes(data);
      } else {
        // Fallback to mock data if collection is empty
        setRecipes(MOCK_RECIPES as any);
      }
    } catch (error) {
      console.error('Error loading recipes:', error);
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
    <div className="max-w-7xl mx-auto px-6 pb-xl">
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-on-surface mb-4">Explorar Receitas</h1>
        <p className="text-on-surface-variant text-lg">Navegue por nossa coleção completa de receitas artesanais.</p>
      </header>

      <div className="flex flex-col md:flex-row gap-8 mb-12">
        {/* Filters Sidebar */}
        <aside className="w-full md:w-64 space-y-8">
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Filter className="w-5 h-5" /> Filtros
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-surface-container rounded-xl">
                <button className="w-full flex items-center justify-between font-semibold">
                  Dieta <ChevronDown className="w-4 h-4" />
                </button>
                <div className="mt-3 space-y-2 text-sm text-on-surface-variant">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded text-primary focus:ring-primary" />
                    <span>Vegano</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded text-primary focus:ring-primary" />
                    <span>Sem Glúten</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded text-primary focus:ring-primary" />
                    <span>Sem Lactose</span>
                  </label>
                </div>
              </div>

              <div className="p-4 bg-surface-container rounded-xl">
                <button className="w-full flex items-center justify-between font-semibold">
                  Dificuldade <ChevronDown className="w-4 h-4" />
                </button>
                <div className="mt-3 space-y-2 text-sm text-on-surface-variant">
                  {['Fácil', 'Médio', 'Avançado'].map(level => (
                    <label key={level} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="difficulty" className="text-primary focus:ring-primary" />
                      <span>{level}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Recipe Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-on-surface-variant">Buscando as melhores receitas...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.map((recipe, i) => (
                <Link key={recipe.id || i} to={`/recipe/${recipe.id}`}>
                  <motion.article 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="group bg-surface-container-low rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer border border-stone-100 h-full"
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
                          Sem Imagem
                        </div>
                      )}
                      <button className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                        <Heart className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getTagColor(recipe.category)} inline-block mb-3`}>
                        {recipe.category}
                      </span>
                      <h3 className="text-xl font-bold text-on-surface mb-3 group-hover:text-primary transition-colors line-clamp-1">
                        {recipe.title}
                      </h3>
                      <div className="flex items-center justify-between text-on-surface-variant text-xs font-semibold">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {recipe.time || 'N/A'}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                          {recipe.rating?.toFixed(1) || '0.0'}
                        </div>
                      </div>
                    </div>
                  </motion.article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
