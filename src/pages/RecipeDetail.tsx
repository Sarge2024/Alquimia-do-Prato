import { motion } from 'motion/react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Clock, Utensils, Heart, Share2, Printer, ChevronLeft, CheckCircle2, Edit3, Trash2, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { recipeService, Recipe } from '../services/recipeService';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const MOCK_RECIPES_DETAIL: Record<string, Recipe> = {
  'tapioca-rendada': {
    id: 'tapioca-rendada',
    title: 'Tapioca Rendada com Queijo Coalho',
    description: 'Uma versão gourmet da tradicional tapioca, com uma crosta crocante de queijo que derrete na boca.',
    category: 'Café da Manhã',
    time: '12 min',
    difficulty: 'Fácil',
    servings: '1',
    rating: 4.9,
    reviewsCount: 45,
    image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?auto=format&fit=crop&q=80&w=800',
    ingredients: [
      { name: 'goma de tapioca peneirada', quantity: '100g' },
      { name: 'queijo coalho ralado grosso', quantity: '50g' },
      { name: 'Manteiga de garrafa para finalizar', quantity: 'a gosto' },
      { name: 'Recheio de sua preferência (coco, queijo ou carne de sol)', quantity: '' }
    ],
    instructions: [
      'Aqueça uma frigideira antiaderente em fogo médio.',
      'Espalhe o queijo coalho ralado por toda a superfície da frigideira até formar uma camada fina.',
      'Assim que o queijo começar a derreter, peneire a goma de tapioca por cima do queijo.',
      'Espere a tapioca "grudar" no queijo e formar a massa única.',
      'Vire a tapioca para dourar levemente o lado da massa.',
      'Adicione o recheio escolhido, dobre ao meio e finalize com um fio de manteiga de garrafa.'
    ],
    ownerId: 'system',
    createdAt: new Date().toISOString()
  },
  'feijoada-completa': {
    id: 'feijoada-completa',
    title: 'Feijoada Completa Tradicional',
    description: 'O prato mais emblemático do Brasil, preparado com carnes selecionadas e cozido lentamente para atingir perfeição.',
    category: 'Almoço',
    time: '3h 00min',
    difficulty: 'Médio',
    servings: '6',
    rating: 5.0,
    reviewsCount: 128,
    image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&q=80&w=800',
    ingredients: [
      { name: 'feijão preto', quantity: '500g' },
      { name: 'carne seca', quantity: '200g' },
      { name: 'lombo salgado', quantity: '200g' },
      { name: 'paio', quantity: '100g' },
      { name: 'linguiça calabresa', quantity: '100g' },
      { name: 'Arroz branco, couve e farofa para acompanhar', quantity: 'a gosto' }
    ],
    instructions: [
      'Deixe as carnes salgadas de molho por 24h trocando a água.',
      'Cozinhe o feijão com as carnes mais duras primeiro.',
      'Adicione as carnes mais macias e as linguiças no meio do processo.',
      'Faça um refogado com alho, cebola e um pouco do caldo da feijoada e retorne à panela.',
      'Deixe apurar o caldo até engrossar.',
      'Sirva com os acompanhamentos tradicionais.'
    ],
    ownerId: 'system',
    createdAt: new Date().toISOString()
  },
  'salmao-ervas': {
    id: 'salmao-ervas',
    title: 'Salmão com Crosta de Ervas',
    description: 'Uma opção leve e sofisticada para o jantar. O salmão suculento contrasta perfeitamente com a crosta de ervas e cítricos.',
    category: 'Jantar',
    time: '25 min',
    difficulty: 'Fácil',
    servings: '2',
    rating: 4.8,
    reviewsCount: 67,
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=800',
    ingredients: [
      { name: 'Filés de salmão', quantity: '2' },
      { name: 'Salsa e alecrim picados', quantity: 'a gosto' },
      { name: 'Raspas de limão siciliano', quantity: 'a gosto' },
      { name: 'Azeite de oliva extra virgem', quantity: 'a gosto' },
      { name: 'Sal e pimenta a gosto', quantity: '' }
    ],
    instructions: [
      'Tempere os filés com sal e pimenta.',
      'Misture as ervas com as raspas de limão e um pouco de azeite.',
      'Pressione a mistura sobre o topo dos filés de salmão.',
      'Leve ao forno pré-aquecido a 200°C por cerca de 12-15 minutos.',
      'Sirva com legumes grelhados ou uma salada verde fresca.'
    ],
    ownerId: 'system',
    createdAt: new Date().toISOString()
  },
  'pudim-leite': {
    id: 'pudim-leite',
    title: 'Pudim de Leite Condensado',
    description: 'O clássico dos domingos brasileiros. Textura aveludada, sem furinhos (ou com, se preferir!) e uma calda de caramelo brilhante.',
    category: 'Sobremesas',
    time: '1h 30min',
    difficulty: 'Médio',
    servings: '8',
    rating: 4.9,
    reviewsCount: 210,
    image: 'https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c?auto=format&fit=crop&q=80&w=800',
    ingredients: [
      { name: 'leite condensado', quantity: '1 lata' },
      { name: 'leite integral', quantity: '2 latas' },
      { name: 'ovos', quantity: '3' },
      { name: 'açúcar para a calda', quantity: '1 xícara' }
    ],
    instructions: [
      'Prepare a calda derretendo o açúcar na forma de pudim até dourar.',
      'Bata no liquidificador o leite condensado, o leite e os ovos.',
      'Despeje a mistura na forma caramelizada.',
      'Cozinhe em banho-maria no forno por cerca de 1 hora.',
      'Deixe esfriar e leve à geladeira por pelo menos 4 horas antes de desenformar.'
    ],
    ownerId: 'system',
    createdAt: new Date().toISOString()
  }
};

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
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
      } else if (MOCK_RECIPES_DETAIL[recipeId]) {
        // Fallback for popular/mock recipes
        setRecipe(MOCK_RECIPES_DETAIL[recipeId]);
      } else {
        console.warn('Recipe not found in Firestore or Mocks');
      }
    } catch (error) {
      console.error('Error loading recipe:', error);
      // Even on error, try to check mocks as fallback
      if (MOCK_RECIPES_DETAIL[recipeId]) {
        setRecipe(MOCK_RECIPES_DETAIL[recipeId]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!recipe || !recipe.id) return;
    if (window.confirm('Tem certeza que deseja excluir esta receita?')) {
      setIsDeleting(true);
      try {
        await recipeService.deleteRecipe(recipe.id);
        alert('Receita excluída com sucesso.');
        navigate('/explore');
      } catch (error) {
        console.error('Delete error:', error);
        alert('Erro ao excluir a receita.');
      } finally {
        setIsDeleting(false);
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
  const isAdmin = user && user.email === 'sagacitas.sistemas@gmail.com';
  const canManage = isOwner || isAdmin;

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
        
        {canManage && (
          <div className="flex gap-3">
            <Link 
              to={`/submit/${recipe.id}`}
              className="flex items-center gap-2 px-4 py-2 bg-stone-100 text-on-surface rounded-lg hover:bg-stone-200 transition-all font-semibold"
            >
              <Edit3 className="w-4 h-4" /> Editar
            </Link>
            <button 
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all font-semibold disabled:opacity-50"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              {isDeleting ? 'Excluindo...' : 'Excluir'}
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
            <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
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

          <div className="grid grid-cols-2 gap-x-4 gap-y-6 py-6 border-y border-stone-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider text-[10px]">Preparação</p>
                <p className="font-semibold text-sm">{recipe.prepTime || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider text-[10px]">Tempo Total</p>
                <p className="font-semibold text-sm">{recipe.time || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary">
                <Utensils className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider text-[10px]">Porções</p>
                <p className="font-semibold text-sm">{recipe.servings || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider text-[10px]">Dificuldade</p>
                <p className="font-semibold text-sm">{recipe.difficulty || 'Médio'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 col-span-2 pt-4 border-t border-stone-100">
              <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider text-[10px]">Avaliação</p>
                <p className="font-semibold text-sm">{recipe.rating?.toFixed(1) || '0.0'} ({recipe.reviewsCount || 0} avaliações)</p>
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
                <li key={i} className="flex items-start gap-4 group cursor-pointer border-b border-primary/5 pb-2 last:border-0">
                  <div className="mt-1 flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-stone-300 group-hover:text-secondary transition-colors" />
                  </div>
                  <div className="flex flex-col">
                    {typeof ing === 'object' && ing.quantity && (
                      <span className="text-[10px] font-bold uppercase text-primary mb-0.5">{ing.quantity}</span>
                    )}
                    <span className="text-on-surface-variant group-hover:text-on-surface transition-colors font-medium">
                      {typeof ing === 'string' ? ing : ing.name}
                    </span>
                  </div>
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
