import { motion } from 'motion/react';
import { Upload, Plus, Trash2, Loader2, Play, AlertTriangle } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { recipeService, Recipe, Ingredient } from '../services/recipeService';
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
  const [imageOptions, setImageOptions] = useState<string[]>([]);

  const [formData, setFormData] = useState<Omit<Recipe, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>>({
    title: '',
    description: '',
    image: '',
    momento: [],
    tipo_prato: [],
    base_alimento: [],
    origem: 'Brasileira',
    custo_estimado: '$$',
    dietType: 'Convencional',
    time: '',
    prepTime: '',
    servings: '',
    difficulty: 'Médio',
    ingredients: [{ name: '', quantity: '' }],
    instructions: [''],
  });

  const [originalRecipe, setOriginalRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (isEditing && u) {
        loadRecipe(id!);
      }
    });

    if (isEditing && auth.currentUser) {
      loadRecipe(id!);
    } else if (!isEditing && location.state?.scrapedData) {
      setImageOptions(location.state.scrapedData.imageOptions || []);
      setFormData(prev => ({
        ...prev,
        ...location.state.scrapedData,
        // Ensure ingredients are in the correct format if they came as strings or mismatch
        ingredients: Array.isArray(location.state.scrapedData.ingredients) 
          ? location.state.scrapedData.ingredients.map((ing: any) => 
              typeof ing === 'string' ? { name: ing, quantity: '' } : ing
            )
          : [{ name: '', quantity: '' }]
      }));
    }

    return () => unsubscribe();
  }, [id, isEditing, location.state]);

  const loadRecipe = async (recipeId: string) => {
    setFetching(true);
    try {
      const recipe = await recipeService.getRecipe(recipeId);
      if (recipe) {
        // Double check permissions with current user
        const currentUser = auth.currentUser;
        const isAdmin = currentUser?.email === 'sagacitas.sistemas@gmail.com';
        
        if (currentUser && recipe.ownerId !== currentUser.uid && !isAdmin) {
          alert('Você não tem permissão para editar esta receita.');
          navigate('/explore');
          return;
        }
        setOriginalRecipe(recipe);
        setFormData({
          title: recipe.title,
          description: recipe.description || '',
          image: recipe.image || '',
          momento: recipe.momento || [],
          tipo_prato: recipe.tipo_prato || [],
          base_alimento: recipe.base_alimento || [],
          origem: recipe.origem || 'Brasileira',
          custo_estimado: recipe.custo_estimado || '$$',
          dietType: recipe.dietType || 'Convencional',
          time: recipe.time || '',
          prepTime: recipe.prepTime || '',
          servings: recipe.servings || '',
          difficulty: recipe.difficulty || 'Médio',
          ingredients: recipe.ingredients.map(ing => 
            typeof ing === 'string' ? { name: ing, quantity: '' } : ing
          ),
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

  const handleIngredientChange = (index: number, field: keyof Ingredient, value: string) => {
    const newIngredients = [...formData.ingredients] as Ingredient[];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setFormData(prev => ({ ...prev, ingredients: newIngredients }));
  };

  const handleArrayChange = (index: number, value: string, field: 'instructions') => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  const addArrayItem = (field: 'ingredients' | 'instructions') => {
    if (field === 'ingredients') {
      setFormData(prev => ({ ...prev, ingredients: [...prev.ingredients, { name: '', quantity: '' }] }));
    } else {
      setFormData(prev => ({ ...prev, instructions: [...prev.instructions, ''] }));
    }
  };

  const removeArrayItem = (index: number, field: 'ingredients' | 'instructions') => {
    if (formData[field].length > 1) {
      const newArray = [...formData[field]];
      newArray.splice(index, 1);
      setFormData(prev => ({ ...prev, [field]: newArray } as any));
    }
  };

  const [errorHeader, setErrorHeader] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorHeader(null);
    if (!user) {
      alert('Por favor, faça login para publicar uma receita.');
      return;
    }

    console.log('Iniciando submissão da receita...', { isEditing, id });
    setLoading(true);

    if (formData.momento.length === 0 || formData.tipo_prato.length === 0 || formData.base_alimento.length === 0) {
      console.warn('Validação falhou: Campos obrigatórios vazios');
      const errorMsg = 'Por favor, selecione pelo menos um Momento, uma Técnica e uma Base de Alimento.';
      setErrorHeader(errorMsg);
      alert(errorMsg);
      setLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      console.log('Dados do formulário sendo enviados:', formData);
      if (isEditing && id) {
        console.log('Chamando updateRecipe...');
        await recipeService.updateRecipe(id, {
          ...formData,
          ownerId: originalRecipe?.ownerId || user.uid,
        });
        console.log('updateRecipe concluído com sucesso');
        alert('Receita atualizada com sucesso!');
      } else {
        console.log('Chamando createRecipe...');
        const newId = await recipeService.createRecipe({
          ...formData,
          ownerId: user.uid,
        });
        console.log('createRecipe concluído com sucesso, novo ID:', newId);
        alert('Receita publicada com sucesso!');
      }
      
      console.log('Navegando para /explore');
      navigate('/explore');
    } catch (error: any) {
      console.error('Erro detalhado ao salvar receita:', error);
      
      let message = 'Erro ao salvar a receita. Verifique o console para mais detalhes.';
      if (error?.message) {
        try {
          if (error.message.includes('Firestore operation failed:')) {
             const cleanMsg = error.message.replace('Firestore operation failed: ', '');
             try {
               const parsed = JSON.parse(cleanMsg);
               message = `Erro Firestore (${parsed.operationType}): ${parsed.error}`;
             } catch (e) {
               message = `Erro: ${cleanMsg}`;
             }
          } else {
            message = `Erro: ${error.message}`;
          }
        } catch (e) {
          message = `Erro: ${error.message}`;
        }
      }
      
      setErrorHeader(message);
      alert(message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
      console.log('Processo de submissão finalizado');
    }
  };

  const toggleCheckbox = (field: 'momento' | 'tipo_prato' | 'base_alimento', value: string) => {
    const current = [...(formData[field] as string[])];
    const index = current.indexOf(value);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(value);
    }
    setFormData(prev => ({ ...prev, [field]: current }));
  };

  const MOMENTOS = ["Café da Manhã", "Brunch", "Almoço", "Lanche / Chá da Tarde", "Jantar", "Ceia", "Petiscos / Aperitivos", "Bebidas"];
  const TIPOS_PRATO = ["Assados", "Frituras", "Grelhados", "Sopas e Caldos", "Cremes e Purés", "Massas e Risotos", "Saladas e Pratos Frios", "Cozidos / Guisados", "Padaria e Pastelaria", "Bebidas"];
  const BASES_ALIMENTO = ["Carnes", "Frutos do Mar", "Vegetais e Legumes", "Ovos e Laticínios", "Grãos e Leguminosas"];
  const ORIGENS = ["Latino-Americana", "Brasileira", "Mexicana", "Argentina", "Asiática", "Japonesa", "Chinesa", "Tailandesa", "Coreana", "Indiana", "Europeia", "Italiana", "Francesa", "Portuguesa", "Espanhola", "Árabe / Médio Oriente", "Americana"];
  const CUSTOS = ["$", "$$", "$$$", "$$$$"];

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
      <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-on-surface mb-2">
            {isEditing ? 'Editar Receita' : 'Publicar uma Receita'}
          </h1>
          <p className="text-on-surface-variant text-lg">
            {isEditing ? 'Atualize os detalhes da sua criação culinária.' : 'Compartilhe sua herança culinária com nossa comunidade.'}
          </p>
        </div>

        {(isEditing || location.state?.scrapedData) && (
          <div className="flex-shrink-0">
            <button 
              onClick={handleSubmit}
              type="button"
              disabled={loading || !user}
              className="w-full md:w-auto bg-primary disabled:bg-stone-300 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {isEditing ? 'Salvar Alterações' : 'Publicar Receita'}
            </button>
          </div>
        )}
      </header>

      {errorHeader && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p className="font-semibold text-sm">{errorHeader}</p>
        </div>
      )}

      {!user && (
        <div className="mb-12 p-6 bg-secondary-container text-on-secondary-container rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-secondary">
            <Play className="w-6 h-6 rotate-90 fill-secondary" />
          </div>
          <p className="font-bold text-lg">Você precisa estar logado para publicar receitas.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-12">
        {/* Taxonomy Axes */}
        <section className="space-y-8">
          <h2 className="text-2xl font-bold text-on-surface border-b border-stone-200 pb-4">Taxonomia e Classificação</h2>
          
          {/* Momento de Consumo */}
          <div className="space-y-4">
            <label className="block font-bold text-on-surface-variant flex items-center gap-2">
              Momento de Consumo <span className="text-primary">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {MOMENTOS.map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => toggleCheckbox('momento', m)}
                  className={`px-4 py-2 rounded-full border-2 transition-all font-medium text-sm ${formData.momento.includes(m) ? 'bg-primary border-primary text-white' : 'border-stone-200 text-stone-600 hover:border-primary/50'}`}
                >
                  {m}
                </button>
              ))}
            </div>
            {formData.momento.length === 0 && <p className="text-red-500 text-xs">Selecione pelo menos um momento.</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Categoria e Técnica */}
            <div className="space-y-4">
              <label className="block font-bold text-on-surface-variant">Categoria e Técnica <span className="text-primary">*</span></label>
              <div className="flex flex-wrap gap-2">
                {TIPOS_PRATO.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleCheckbox('tipo_prato', t)}
                    className={`px-3 py-1.5 rounded-lg border-2 transition-all font-medium text-xs ${formData.tipo_prato.includes(t) ? 'bg-secondary border-secondary text-white' : 'border-stone-200 text-stone-600 hover:border-secondary/50'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Base de Alimento */}
            <div className="space-y-4">
              <label className="block font-bold text-on-surface-variant">Base de Alimento <span className="text-primary">*</span></label>
              <div className="flex flex-wrap gap-2">
                {BASES_ALIMENTO.map(b => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => toggleCheckbox('base_alimento', b)}
                    className={`px-3 py-1.5 rounded-lg border-2 transition-all font-medium text-xs ${formData.base_alimento.includes(b) ? 'bg-stone-700 border-stone-700 text-white' : 'border-stone-200 text-stone-600 hover:border-stone-500'}`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block font-semibold text-on-surface-variant">Origem e Cultura</label>
              <select 
                name="origem"
                value={formData.origem}
                onChange={handleInputChange}
                className="w-full p-4 rounded-xl bg-surface-container border-none focus:ring-2 focus:ring-primary outline-none appearance-none"
              >
                {ORIGENS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="block font-semibold text-on-surface-variant">Custo Estimado</label>
              <select 
                name="custo_estimado"
                value={formData.custo_estimado}
                onChange={handleInputChange}
                className="w-full p-4 rounded-xl bg-surface-container border-none focus:ring-2 focus:ring-primary outline-none appearance-none"
              >
                {CUSTOS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="block font-semibold text-on-surface-variant">Tipo de Dieta</label>
              <select 
                name="dietType"
                value={formData.dietType}
                onChange={handleInputChange}
                className="w-full p-4 rounded-xl bg-surface-container border-none focus:ring-2 focus:ring-primary outline-none appearance-none"
              >
                <option>Convencional</option>
                <option>Vegana</option>
                <option>Vegetariana</option>
                <option>Low Carb</option>
                <option>Keto</option>
                <option>Sem Glúten</option>
                <option>Fit</option>
              </select>
            </div>
          </div>
        </section>

        {/* Basic Info */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-on-surface border-b border-stone-200 pb-4">Detalhes da Receita</h2>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
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
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="block font-semibold text-on-surface-variant">Tempo de Preparação</label>
              <input 
                type="text" 
                name="prepTime"
                value={formData.prepTime}
                onChange={handleInputChange}
                placeholder="Ex: 15 min" 
                className="w-full p-4 rounded-xl bg-surface-container border-none focus:ring-2 focus:ring-primary outline-none" 
              />
            </div>
            <div className="space-y-2">
              <label className="block font-semibold text-on-surface-variant">Tempo Total</label>
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
                <option>Difícil</option>
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
            {imageOptions.length > 0 && (
              <div className="space-y-4">
                <label className="block font-semibold text-on-surface-variant">Outras imagens encontradas (Clique para substituir):</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                  {imageOptions.map((opt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, image: opt }))}
                      className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${formData.image === opt ? 'border-primary shadow-md scale-95' : 'border-transparent hover:border-stone-300'}`}
                    >
                      <img src={opt} alt={`Option ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
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
            {(formData.ingredients as Ingredient[]).map((ing, i) => (
              <div key={i} className="flex flex-col md:flex-row gap-4 p-4 bg-surface-container rounded-2xl relative group">
                <div className="flex-1 space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Quantidade</label>
                  <input 
                    type="text" 
                    value={ing.quantity}
                    onChange={(e) => handleIngredientChange(i, 'quantity', e.target.value)}
                    placeholder="Ex: 1 xícara, 200g..." 
                    className="w-full p-3 rounded-xl bg-white border border-stone-100 focus:ring-2 focus:ring-primary outline-none text-sm" 
                  />
                </div>
                <div className="flex-[2] space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Ingrediente</label>
                  <input 
                    type="text" 
                    value={ing.name}
                    onChange={(e) => handleIngredientChange(i, 'name', e.target.value)}
                    placeholder="Ex: Açúcar, Farinha de trigo..." 
                    className="w-full p-3 rounded-xl bg-white border border-stone-100 focus:ring-2 focus:ring-primary outline-none text-sm" 
                  />
                </div>
                {formData.ingredients.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeArrayItem(i, 'ingredients')}
                    className="absolute -top-2 -right-2 md:static p-2 text-stone-400 hover:text-red-500 transition-colors bg-white md:bg-transparent rounded-full shadow-sm md:shadow-none"
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
