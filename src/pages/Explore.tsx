import { motion } from 'motion/react';
import { Heart, Star, Clock, Filter, ChevronDown, Loader2, X, LayoutGrid, List, Utensils } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { recipeService, Recipe } from '../services/recipeService';

import { RecipeCard } from '../components/RecipeCard';

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
  },
  {
    id: 'pudim-leite',
    title: 'Pudim de Leite Condensado',
    category: 'Sobremesas',
    time: '1h 30min',
    rating: 4.9,
    reviewsCount: 210,
    difficulty: 'Médio',
    image: 'https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c?auto=format&fit=crop&q=80&w=800',
    ownerId: 'system',
    ingredients: [],
    instructions: []
  }
];

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');
  
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadRecipes();
  }, []);

  useEffect(() => {
    const category = searchParams.get('category');
    const diet = searchParams.get('diet');
    
    let filtered = [...recipes];
    
    if (category) {
      filtered = filtered.filter(r => r.category === category);
    }
    
    if (diet) {
      filtered = filtered.filter(r => r.dietType === diet);
    }
    
    setFilteredRecipes(filtered);
  }, [searchParams, recipes]);

  const loadRecipes = async () => {
    try {
      const data = await recipeService.getAllRecipes();
      const allRecipes = data.length > 0 ? data : MOCK_RECIPES;
      setRecipes(allRecipes);
    } catch (error) {
      console.error('Error loading recipes:', error);
      setRecipes(MOCK_RECIPES);
    } finally {
      setLoading(false);
    }
  };

  const clearFilter = () => {
    setSearchParams({});
  };

  const getTagColor = (category: string) => {
    switch (category) {
      case 'Café da Manhã': return 'bg-yellow-100 text-yellow-700';
      case 'Almoço': return 'bg-primary-fixed text-on-primary-fixed';
      case 'Jantar': return 'bg-secondary-container text-on-secondary-container';
      case 'Cocktail': return 'bg-orange-100 text-orange-700';
      case 'Bebidas': return 'bg-blue-100 text-blue-700';
      case 'Sobremesas': return 'bg-pink-100 text-pink-700';
      default: return 'bg-stone-100 text-stone-700';
    }
  };

  const getDietTagColor = (diet?: string) => {
    switch (diet) {
      case 'Vegana': return 'bg-green-100 text-green-700';
      case 'Vegetariana': return 'bg-emerald-100 text-emerald-700';
      case 'Low Carb': return 'bg-blue-100 text-blue-700';
      case 'Fit': return 'bg-cyan-100 text-cyan-700';
      case 'Sem Glúten': return 'bg-amber-100 text-amber-700';
      case 'Keto': return 'bg-indigo-100 text-indigo-700';
      default: return 'bg-stone-50 text-stone-500 border border-stone-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pb-xl">
      <header className="mb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-6">
          <div>
            <h1 className="text-4xl font-bold text-on-surface mb-2">Explorar Receitas</h1>
            <p className="text-on-surface-variant text-lg">Navegue por nossa coleção completa de receitas artesanais.</p>
          </div>
          
          <div className="flex items-center bg-surface-container rounded-xl p-1 shadow-inner">
            <button 
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'grid' ? 'bg-primary text-white shadow-md' : 'text-on-surface-variant hover:text-primary'}`}
            >
              <LayoutGrid className="w-4 h-4" />
              Grid
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'list' ? 'bg-primary text-white shadow-md' : 'text-on-surface-variant hover:text-primary'}`}
            >
              <List className="w-4 h-4" />
              Lista
            </button>
          </div>
        </div>
        
        {categoryFilter && (
          <div className="mt-6 flex items-center gap-3">
            <span className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider">Filtrando por:</span>
            <div className={`px-4 py-1 rounded-full text-sm font-bold flex items-center gap-2 ${getTagColor(categoryFilter)}`}>
              {categoryFilter}
              <button 
                onClick={clearFilter}
                className="p-0.5 hover:bg-black/10 rounded-full transition-colors"
                title="Limpar filtro"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </header>

      <div className="flex flex-col md:flex-row gap-8 mb-12">
        {/* Filters Sidebar */}
        <aside className="w-full md:w-64 space-y-8">
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Filter className="w-5 h-5" /> Filtros
            </h3>
            <div className="space-y-4">
              {/* Category Filter in Sidebar */}
              <div className="p-4 bg-surface-container rounded-xl">
                <button className="w-full flex items-center justify-between font-semibold">
                  Categorias <ChevronDown className="w-4 h-4" />
                </button>
                <div className="mt-3 space-y-2 text-sm text-on-surface-variant">
                  {['Café da Manhã', 'Almoço', 'Jantar', 'Cocktail', 'Sobremesas', 'Bebidas'].map(cat => (
                    <label key={cat} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="category" 
                        checked={categoryFilter === cat}
                        onChange={() => setSearchParams({ category: cat })}
                        className="text-primary focus:ring-primary" 
                      />
                      <span>{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-surface-container rounded-xl">
                <button className="w-full flex items-center justify-between font-semibold">
                  Dieta <ChevronDown className="w-4 h-4" />
                </button>
                <div className="mt-3 space-y-2 text-sm text-on-surface-variant">
                  {['Convencional', 'Vegana', 'Vegetariana', 'Low Carb', 'Keto', 'Sem Glúten', 'Fit'].map(diet => (
                    <label key={diet} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="rounded text-primary focus:ring-primary"
                        checked={searchParams.get('diet') === diet}
                        onChange={(e) => {
                          const newParams = new URLSearchParams(searchParams);
                          if (e.target.checked) {
                            newParams.set('diet', diet);
                          } else {
                            newParams.delete('diet');
                          }
                          setSearchParams(newParams);
                        }}
                      />
                      <span>{diet}</span>
                    </label>
                  ))}
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
            <>
              {filteredRecipes.length > 0 ? (
                <>
                  {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredRecipes.map((recipe) => (
                        <RecipeCard key={recipe.id || `explore-grid-${Math.random()}`} recipe={recipe} />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredRecipes.map((recipe, i) => (
                        <motion.div
                          key={recipe.id || `explore-list-${i}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.03 }}
                        >
                          <Link 
                            to={`/recipe/${recipe.id}`}
                            className="bg-surface-container-low p-3 md:p-4 rounded-xl border border-stone-100 flex items-center gap-4 hover:bg-surface-container transition-colors group"
                          >
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden flex-shrink-0 bg-stone-200">
                              {recipe.image ? (
                                <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] text-stone-400 font-bold uppercase">N/A</div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight ${getTagColor(recipe.category)}`}>
                                  {recipe.category}
                                </span>
                                {recipe.dietType && (
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight ${getDietTagColor(recipe.dietType)}`}>
                                    {recipe.dietType}
                                  </span>
                                )}
                              </div>
                              <h3 className="text-base md:text-lg font-bold text-on-surface truncate group-hover:text-primary transition-colors">
                                {recipe.title}
                              </h3>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-on-surface-variant font-medium mt-1">
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {recipe.time}</span>
                                <span className="flex items-center gap-1"><Utensils className="w-3 h-3" /> {recipe.servings}</span>
                                <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> {recipe.rating?.toFixed(1)}</span>
                              </div>
                            </div>
                            <button className="p-2 text-primary bg-primary/10 rounded-full hover:bg-primary hover:text-white transition-colors">
                              <Heart className="w-4 h-4" />
                            </button>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-20 px-6 bg-surface-container rounded-3xl">
                  <h3 className="text-xl font-bold text-on-surface mb-2">Nenhuma receita encontrada</h3>
                  <p className="text-on-surface-variant mb-6">Parece que não temos nada nessa categoria no momento.</p>
                  <button 
                    onClick={clearFilter}
                    className="bg-primary text-white font-bold px-6 py-2 rounded-xl hover:bg-primary-container transition-all"
                  >
                    Ver todas as receitas
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
