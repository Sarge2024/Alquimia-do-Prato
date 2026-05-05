import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { geminiService } from './geminiService';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error Details:', errInfo);
  throw new Error(`Firestore operation failed: ${errInfo.error}`);
}

export interface Ingredient {
  name: string;
  quantity: string;
}

export interface Recipe {
  id?: string;
  title: string;
  description?: string;
  image?: string;
  momento: string[];
  tipo_prato: string[];
  base_alimento: string[];
  origem?: string;
  time?: string;
  prepTime?: string;
  dietType?: string;
  servings?: string;
  difficulty?: string;
  custo_estimado?: string;
  ingredients: (string | Ingredient)[];
  instructions: string[];
  ownerId: string;
  createdAt?: any;
  updatedAt?: any;
  rating?: number;
  reviewsCount?: number;
}

const RECIPES_COLLECTION = 'recipes';

export const recipeService = {
  async createRecipe(recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const docRef = await addDoc(collection(db, RECIPES_COLLECTION), {
        ...recipe,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        rating: 4.5, // Default rating for new recipes
        reviewsCount: 0
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, RECIPES_COLLECTION);
    }
  },

  async updateRecipe(id: string, recipe: Partial<Recipe>) {
    try {
      const docRef = doc(db, RECIPES_COLLECTION, id);
      await updateDoc(docRef, {
        ...recipe,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${RECIPES_COLLECTION}/${id}`);
    }
  },

  async deleteRecipe(id: string) {
    try {
      const docRef = doc(db, RECIPES_COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${RECIPES_COLLECTION}/${id}`);
    }
  },

  async getRecipe(id: string): Promise<Recipe | null> {
    try {
      const docRef = doc(db, RECIPES_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Recipe;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `${RECIPES_COLLECTION}/${id}`);
      return null;
    }
  },

  async getAllRecipes(): Promise<Recipe[]> {
    try {
      // Try with ordering first
      const q = query(collection(db, RECIPES_COLLECTION), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Recipe));
    } catch (error) {
      console.warn('Query with orderBy failed, falling back to unordered fetch:', error);
      try {
        // Fallback to unordered fetch and sort in memory
        const querySnapshot = await getDocs(collection(db, RECIPES_COLLECTION));
        const recipes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Recipe));
        return recipes.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() ? a.createdAt.toDate() : new Date(a.createdAt || 0);
          const dateB = b.createdAt?.toDate?.() ? b.createdAt.toDate() : new Date(b.createdAt || 0);
          return dateB.getTime() - dateA.getTime();
        });
      } catch (innerError) {
        handleFirestoreError(innerError, OperationType.LIST, RECIPES_COLLECTION);
        return [];
      }
    }
  },

  async getRecipesByMomento(momento: string): Promise<Recipe[]> {
    try {
      const q = query(
        collection(db, RECIPES_COLLECTION), 
        where('momento', 'array-contains', momento),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Recipe));
    } catch (error) {
      console.warn('Momento query with orderBy failed, falling back to client-side filter:', error);
      try {
        const recipes = await this.getAllRecipes();
        return recipes.filter(r => r.momento && r.momento.includes(momento));
      } catch (innerError) {
        handleFirestoreError(innerError, OperationType.LIST, RECIPES_COLLECTION);
        return [];
      }
    }
  },

  async getUserRecipes(userId: string): Promise<Recipe[]> {
    try {
      const q = query(
        collection(db, RECIPES_COLLECTION), 
        where('ownerId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Recipe));
    } catch (error) {
      console.warn('User query with orderBy failed, falling back to client-side filter:', error);
      try {
        const recipes = await this.getAllRecipes();
        return recipes.filter(r => r.ownerId === userId);
      } catch (innerError) {
        handleFirestoreError(innerError, OperationType.LIST, RECIPES_COLLECTION);
        return [];
      }
    }
  },

  async seedRecipes(userId: string) {
    const seeds: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        title: 'Tapioca Rendada com Queijo Coalho',
        description: 'Uma versão gourmet da tradicional tapioca, com uma crosta crocante de queijo que derrete na boca.',
        momento: ['Café da Manhã'],
        tipo_prato: ['Grelhados'],
        base_alimento: ['Ovos e Laticínios', 'Grãos e Leguminosas'],
        origem: 'Brasileira',
        time: '12 min',
        difficulty: 'Fácil',
        custo_estimado: '$',
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
        ownerId: userId
      },
      {
        title: 'Feijoada Completa Tradicional',
        description: 'O prato mais emblemático do Brasil, preparado com carnes selecionadas e cozido lentamente para atingir perfeição.',
        momento: ['Almoço'],
        tipo_prato: ['Cozidos / Guisados'],
        base_alimento: ['Carnes', 'Grãos e Leguminosas'],
        origem: 'Brasileira',
        time: '3h 00min',
        difficulty: 'Médio',
        custo_estimado: '$$',
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
        ownerId: userId
      },
      {
        title: 'Salmão com Crosta de Ervas',
        description: 'Uma opção leve e sofisticada para o jantar. O salmão suculento contrasta perfeitamente com a crosta de ervas e cítricos.',
        momento: ['Jantar'],
        tipo_prato: ['Assados'],
        base_alimento: ['Frutos do Mar'],
        origem: 'Europeia',
        time: '25 min',
        difficulty: 'Fácil',
        custo_estimado: '$$$',
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
        ownerId: userId
      },
      {
        title: 'Pudim de Leite Condensado',
        description: 'O clássico dos domingos brasileiros. Textura aveludada, sem furinhos e uma calda de caramelo brilhante.',
        momento: ['Lanche / Chá da Tarde', 'Ceia'],
        tipo_prato: ['Assados'],
        base_alimento: ['Ovos e Laticínios'],
        origem: 'Brasileira',
        time: '1h 30min',
        difficulty: 'Médio',
        custo_estimado: '$',
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
        ownerId: userId
      }
    ];

    try {
      const promises = seeds.map(s => this.createRecipe(s));
      await Promise.all(promises);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, RECIPES_COLLECTION);
    }
  },

  async scrapeRecipe(url: string): Promise<Partial<Recipe>> {
    const response = await fetch('/api/fetch-html', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });

    let responseData;
    try {
      responseData = await response.json();
    } catch (e) {
      console.error('Failed to parse proxy response as JSON:', e);
      // If parsing fails (e.g. redirected to HTML page), fallback to URL only
      return await geminiService.extractRecipeFromHtml("", { url });
    }
    
    if (!responseData.success) {
      console.warn(`Scraping direct fetch failed: ${responseData.error || 'Unknown error'}. Attempting search-based extraction for: ${url}`);
      return await geminiService.extractRecipeFromHtml("", { url });
    }

    const { html, metaDescription, ogImage, allImagesFound } = responseData;
    return await geminiService.extractRecipeFromHtml(html, { metaDescription, ogImage, allImagesFound });
  }
};
