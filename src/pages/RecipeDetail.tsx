import { motion } from 'motion/react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Clock, Utensils, Heart, Share2, Printer, ChevronLeft, CheckCircle2, Edit3, Trash2, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { recipeService, Recipe } from '../services/recipeService';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, u => setUser(u));
    if (id) {
      loadRecipe(id);
    }
    return () => unsubscribe();
  }, [id]);

  const loadRecipe = async (recipeId: string) => {
    try {
      const data = await recipeService.getRecipe(recipeId);
      if (data) {
        setRecipe(data);
      } else {
        // Fallback for static demo routes if needed, but usually we want real data
        console.warn('Recipe not found in Firestore');
      }
    } catch (error) {
      console.error('Error loading recipe:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!recipe || !recipe.id) return;
    if (window.confirm('Tem certeza que deseja excluir esta receita?')) {
      try {
        await recipeService.deleteRecipe(recipe.id);
        alert('Receita excluída com sucesso.');
        navigate('/explore');
      } catch (error) {
        console.error('Delete error:', error);
        alert('Erro ao excluir a receita.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-on-surface-variant font-semibold">Buscando segredos culinários...</p>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold text-on-surface mb-4">Receita não encontrada</h2>
        <Link to="/explore" className="text-primary font-bold hover:underline">Voltar para Explorar</Link>
      </div>
    );
  }

  const isOwner = user && recipe.ownerId === user.uid;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-5xl mx-auto px-6 pb-xl"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-8">
        <Link to="/explore" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-semibold">
          <ChevronLeft className="w-5 h-5" /> Explorar Receitas
        </Link>
        
        {isOwner && (
          <div className="flex gap-3">
            <Link 
              to={`/submit/${recipe.id}`}
              className="flex items-center gap-2 px-4 py-2 bg-stone-100 text-on-surface rounded-lg hover:bg-stone-200 transition-all font-semibold"
            >
              <Edit3 className="w-4 h-4" /> Editar
            </Link>
            <button 
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all font-semibold"
            >
              <Trash2 className="w-4 h-4" /> Excluir
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Gallery/Image */}
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="rounded-3xl overflow-hidden shadow-2xl h-[500px] bg-stone-100"
        >
          {recipe.image ? (
            <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-300 font-bold uppercase tracking-widest text-4xl">
              Alquimia
            </div>
          )}
        </motion.div>

        {/* Content Header */}
        <div className="flex flex-col justify-center space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-on-surface leading-tight font-sans">
              {recipe.title}
            </h1>
            <p className="text-lg text-on-surface-variant leading-relaxed">
              {recipe.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 py-6 border-y border-stone-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Tempo</p>
                <p className="font-semibold">{recipe.time || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary">
                <Utensils className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Porções</p>
                <p className="font-semibold">{recipe.servings || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Dificuldade</p>
                <p className="font-semibold">{recipe.difficulty || 'Médio'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Avaliação</p>
                <p className="font-semibold">{recipe.rating?.toFixed(1) || '0.0'} ({recipe.reviewsCount || 0} avaliações)</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button className="flex-1 bg-primary text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-primary-container transition-all active:scale-95 shadow-lg shadow-primary/20">
              <Heart className="w-5 h-5 fill-white" /> Salvar Receita
            </button>
            <button className="p-4 rounded-xl border-2 border-stone-200 hover:border-primary hover:text-primary transition-all active:scale-95">
              <Share2 className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Ingredients & Instructions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <aside className="lg:col-span-1 space-y-8">
          <div className="bg-surface-container-low p-8 rounded-3xl border border-stone-100">
            <h3 className="text-2xl font-bold mb-6 text-primary border-b border-primary/10 pb-4">Ingredientes</h3>
            <ul className="space-y-4">
              {recipe.ingredients.map((ing, i) => (
                <li key={i} className="flex items-start gap-4 group cursor-pointer">
                  <div className="mt-1 flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-stone-300 group-hover:text-secondary transition-colors" />
                  </div>
                  <span className="text-on-surface-variant group-hover:text-on-surface transition-colors font-medium">{ing}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <section className="lg:col-span-2 space-y-8">
          <h3 className="text-2xl font-bold text-primary">Modo de Preparo</h3>
          <div className="space-y-12">
            {recipe.instructions.map((step, i) => (
              <div key={i} className="flex gap-8 group">
                <div className="flex-shrink-0 w-14 h-14 rounded-full bg-surface-container text-primary flex items-center justify-center font-bold text-xl shadow-inner group-hover:bg-primary group-hover:text-white transition-all duration-500">
                  {i + 1}
                </div>
                <div className="pt-3">
                  <p className="text-lg text-on-surface-variant leading-relaxed font-sans">
                    {step}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </motion.div>
  );
}
