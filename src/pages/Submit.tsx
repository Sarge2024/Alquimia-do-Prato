import { motion } from 'motion/react';
import { Upload, Plus, Trash2, Loader2, Play } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { recipeService, Recipe } from '../services/recipeService';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function Submit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [user, setUser] = useState(auth.currentUser);

  const [formData, setFormData] = useState<Omit<Recipe, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>>({
    title: '',
    description: '',
    image: '',
    category: 'Almoço',
    time: '',
    servings: '',
    difficulty: 'Médio',
    ingredients: [''],
    instructions: [''],
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        // Optional: Redirect to home or show login message if user is not logged in
      }
    });

    if (isEditing) {
      loadRecipe(id);
    } else if (location.state?.scrapedData) {
      setFormData(prev => ({
        ...prev,
        ...location.state.scrapedData
      }));
    }

    return () => unsubscribe();
  }, [id, isEditing, location.state]);

  const loadRecipe = async (recipeId: string) => {
    try {
      const recipe = await recipeService.getRecipe(recipeId);
      if (recipe) {
        // Security check: only owner can edit
        if (auth.currentUser && recipe.ownerId !== auth.currentUser.uid) {
          alert('You do not have permission to edit this recipe.');
          navigate('/explore');
          return;
        }
        setFormData({
          title: recipe.title,
          description: recipe.description || '',
          image: recipe.image || '',
          category: recipe.category,
          time: recipe.time || '',
          servings: recipe.servings || '',
          difficulty: recipe.difficulty || 'Médio',
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
        });
      }
    } catch (error) {
      console.error('Error fetching recipe:', error);
    } finally {
      setFetching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (index: number, value: string, field: 'ingredients' | 'instructions') => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  const addArrayItem = (field: 'ingredients' | 'instructions') => {
    setFormData(prev => ({ ...prev, [field]: [...prev[field], ''] }));
  };

  const removeArrayItem = (index: number, field: 'ingredients' | 'instructions') => {
    if (formData[field].length > 1) {
      const newArray = [...formData[field]];
      newArray.splice(index, 1);
      setFormData(prev => ({ ...prev, [field]: newArray }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Por favor, faça login para publicar uma receita.');
      return;
    }

    setLoading(true);
    try {
      if (isEditing && id) {
        await recipeService.updateRecipe(id, {
          ...formData,
          ownerId: user.uid,
        });
        alert('Receita atualizada com sucesso!');
      } else {
        await recipeService.createRecipe({
          ...formData,
          ownerId: user.uid,
        });
        alert('Receita publicada com sucesso!');
      }
      navigate('/explore');
    } catch (error) {
      console.error('Error saving recipe:', error);
      alert('Erro ao salvar a receita. Verifique as regras de segurança.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-on-surface-variant font-semibold">Carregando dados da receita...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto px-6 pb-xl"
    >
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-on-surface mb-2">
          {isEditing ? 'Editar Receita' : 'Publicar uma Receita'}
        </h1>
        <p className="text-on-surface-variant text-lg">
          {isEditing ? 'Atualize os detalhes da sua criação culinária.' : 'Compartilhe sua herança culinária com nossa comunidade.'}
        </p>
      </header>

      {!user && (
        <div className="mb-12 p-6 bg-secondary-container text-on-secondary-container rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-secondary">
            <Play className="w-6 h-6 rotate-90 fill-secondary" />
          </div>
          <p className="font-bold text-lg">Você precisa estar logado para publicar receitas.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-12">
        {/* Basic Info */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-on-surface border-b border-stone-200 pb-4">Informações Básicas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block font-semibold text-on-surface-variant">Título da Receita</label>
              <input 
                type="text" 
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="Ex: Torta de Maçã da Vovó" 
                className="w-full p-4 rounded-xl bg-surface-container border-none focus:ring-2 focus:ring-primary outline-none" 
              />
            </div>
            <div className="space-y-2">
              <label className="block font-semibold text-on-surface-variant">Categoria</label>
              <select 
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full p-4 rounded-xl bg-surface-container border-none focus:ring-2 focus:ring-primary outline-none appearance-none"
              >
                <option>Café da Manhã</option>
                <option>Almoço</option>
                <option>Jantar</option>
                <option>Sobremesas</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block font-semibold text-on-surface-variant">Tempo de Preparo</label>
              <input 
                type="text" 
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                placeholder="Ex: 45 min" 
                className="w-full p-4 rounded-xl bg-surface-container border-none focus:ring-2 focus:ring-primary outline-none" 
              />
            </div>
            <div className="space-y-2">
              <label className="block font-semibold text-on-surface-variant">Porções</label>
              <input 
                type="text" 
                name="servings"
                value={formData.servings}
                onChange={handleInputChange}
                placeholder="Ex: 4 pessoas" 
                className="w-full p-4 rounded-xl bg-surface-container border-none focus:ring-2 focus:ring-primary outline-none" 
              />
            </div>
            <div className="space-y-2">
              <label className="block font-semibold text-on-surface-variant">Dificuldade</label>
              <select 
                name="difficulty"
                value={formData.difficulty}
                onChange={handleInputChange}
                className="w-full p-4 rounded-xl bg-surface-container border-none focus:ring-2 focus:ring-primary outline-none appearance-none"
              >
                <option>Fácil</option>
                <option>Médio</option>
                <option>Avançado</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="block font-semibold text-on-surface-variant">Pequena Descrição</label>
            <textarea 
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3} 
              placeholder="Conte a história por trás deste prato..." 
              className="w-full p-4 rounded-xl bg-surface-container border-none focus:ring-2 focus:ring-primary outline-none resize-none"
            ></textarea>
          </div>
        </section>

        {/* Media */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-on-surface border-b border-stone-200 pb-4">Imagem da Receita</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block font-semibold text-on-surface-variant">URL da Imagem</label>
              <input 
                type="url" 
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                placeholder="https://exemplo.com/imagem.jpg" 
                className="w-full p-4 rounded-xl bg-surface-container border-none focus:ring-2 focus:ring-primary outline-none" 
              />
            </div>
            {formData.image && (
              <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-inner bg-stone-100 border border-stone-200">
                <img src={formData.image} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            )}
            {!formData.image && (
              <div className="aspect-video w-full rounded-2xl border-4 border-dashed border-stone-200 flex flex-col items-center justify-center bg-surface-container-low">
                <Upload className="w-12 h-12 text-stone-300 mb-4" />
                <p className="text-stone-400 font-semibold">Insira uma URL de imagem acima</p>
              </div>
            )}
          </div>
        </section>

        {/* Ingredients */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-stone-200 pb-4">
            <h2 className="text-2xl font-bold text-on-surface">Ingredientes</h2>
            <button 
              type="button" 
              onClick={() => addArrayItem('ingredients')}
              className="text-primary font-bold flex items-center gap-2 hover:bg-primary/10 px-4 py-2 rounded-lg transition-all"
            >
              <Plus className="w-5 h-5" /> Adicionar
            </button>
          </div>
          <div className="space-y-4">
            {formData.ingredients.map((ing, i) => (
              <div key={i} className="flex gap-4">
                <input 
                  type="text" 
                  value={ing}
                  onChange={(e) => handleArrayChange(i, e.target.value, 'ingredients')}
                  placeholder={`Ingrediente ${i + 1}`} 
                  className="flex-1 p-4 rounded-xl bg-surface-container border-none focus:ring-2 focus:ring-primary outline-none" 
                />
                {formData.ingredients.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeArrayItem(i, 'ingredients')}
                    className="p-4 text-stone-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Instructions */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-stone-200 pb-4">
            <h2 className="text-2xl font-bold text-on-surface">Modo de Preparo</h2>
            <button 
              type="button" 
              onClick={() => addArrayItem('instructions')}
              className="text-primary font-bold flex items-center gap-2 hover:bg-primary/10 px-4 py-2 rounded-lg transition-all"
            >
              <Plus className="w-5 h-5" /> Adicionar Passo
            </button>
          </div>
          <div className="space-y-4">
            {formData.instructions.map((step, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center flex-shrink-0 font-bold text-stone-400 mt-2">
                  {i + 1}
                </div>
                <textarea 
                  value={step}
                  onChange={(e) => handleArrayChange(i, e.target.value, 'instructions')}
                  placeholder={`Instrução ${i + 1}`} 
                  rows={2}
                  className="flex-1 p-4 rounded-xl bg-surface-container border-none focus:ring-2 focus:ring-primary outline-none resize-none" 
                />
                {formData.instructions.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeArrayItem(i, 'instructions')}
                    className="p-4 text-stone-400 hover:text-red-500 transition-colors mt-2"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        <div className="pt-8">
          <button 
            type="submit" 
            disabled={loading || !user}
            className="w-full bg-primary disabled:bg-stone-300 text-white font-bold text-xl py-6 rounded-2xl shadow-xl hover:bg-primary-container transition-all active:scale-[0.98] flex items-center justify-center gap-4"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : null}
            {isEditing ? 'Salvar Alterações' : 'Publicar Receita'}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
