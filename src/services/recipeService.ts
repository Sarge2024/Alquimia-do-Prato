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
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface Recipe {
  id?: string;
  title: string;
  description?: string;
  image?: string;
  category: string;
  time?: string;
  servings?: string;
  difficulty?: string;
  ingredients: string[];
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
      const q = query(collection(db, RECIPES_COLLECTION), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Recipe));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, RECIPES_COLLECTION);
      return [];
    }
  },

  async getRecipesByCategory(category: string): Promise<Recipe[]> {
    try {
      const q = query(
        collection(db, RECIPES_COLLECTION), 
        where('category', '==', category),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Recipe));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, RECIPES_COLLECTION);
      return [];
    }
  }
};
