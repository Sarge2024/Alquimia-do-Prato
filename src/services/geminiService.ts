import { GoogleGenAI } from "@google/genai";
import { Recipe } from "./recipeService";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const geminiService = {
  async extractRecipeFromHtml(html: string, options: { metaDescription?: string, ogImage?: string, allImagesFound?: string[], url?: string }): Promise<Partial<Recipe>> {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const isUrlOnly = !html || html.trim().length < 200;

    const basePrompt = `
      Você é um especialista em culinária, tradução e extração de dados. Extraia as informações da receita.
      
      REGRAS DE TRADUÇÃO E CONVERSÃO:
      1. IDIOMA: Se a fonte não for Português (PT-BR), TRADUZA tudo para Português do Brasil.
      2. MEDIDAS: Converta unidades imperiais (cups, oz, °F) para métricas (ml, g, °C) ou medidas comuns no Brasil (xícaras, colheres).
      
      REGRAS ESTRITAS DE RETORNO (JSON):
      - title, description, category (USE EXATAMENTE UMA DESTAS: 'Café da Manhã', 'Almoço', 'Jantar', 'Sobremesas', 'Cocktail', 'Bebidas').
      - time (string): TEMPO TOTAL (ex: '45 min').
      - prepTime (string): TEMPO DE PREPARAÇÃO (ex: '15 min').
      - dietType (string): TIPO DE DIETA (USE EXATAMENTE UMA DESTAS: 'Convencional', 'Vegana', 'Vegetariana', 'Low Carb', 'Keto', 'Sem Glúten', 'Fit'). Se não houver restrição clara, use 'Convencional'.
      - difficulty (Fácil, Médio, Avançado), servings.
      - ingredients (objeto[] com name e quantity). Quantidade nunca vazia (use "a gosto" se necessário).
      - instructions (string[]).
      - image, imageOptions (string[]).
    `;

    const contentPrompt = isUrlOnly 
      ? `Acesse e pesquise os detalhes da receita no seguinte link: ${options.url}. Se for um petisco, quitute ou acompanhamento para coffee break, classifique como 'Cocktail'. Use ferramentas de busca se necessário para encontrar o conteúdo completo.`
      : `Extraia do seguinte HTML: ${html.substring(0, 12000)}. Se for um petisco, quitute ou acompanhamento para coffee break, classifique como 'Cocktail'.`;

    const prompt = `
      ${basePrompt}
      ${contentPrompt}
      Meta Descrição: ${options.metaDescription || ""}
      OG Image: ${options.ogImage || ""}
      Imagens encontradas no site: ${options.allImagesFound?.join(', ') || "Nenhuma"}
    `;

    try {
      const modelParams: any = {
        model: "gemini-3-flash-preview",
        contents: prompt,
      };

      // If we don't have HTML, we MUST use tools to find the content
      if (isUrlOnly) {
        modelParams.tools = [{ googleSearch: {} }];
      }

      const response = await (ai.models as any).generateContent(modelParams);
      const text = response.text || "";
      const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
      let result = JSON.parse(jsonStr);

      // Sanitize fields to ensure they are the correct types for Firestore
      result.title = String(result.title || "").substring(0, 300);
      result.description = String(result.description || "").substring(0, 5000);
      
      const categories = ['Café da Manhã', 'Almoço', 'Jantar', 'Sobremesas', 'Cocktail', 'Bebidas'];
      if (!categories.includes(result.category)) {
        result.category = "Almoço";
      }
      
      const dietTypes = ['Convencional', 'Vegana', 'Vegetariana', 'Low Carb', 'Keto', 'Sem Glúten', 'Fit'];
      if (!dietTypes.includes(result.dietType)) {
        result.dietType = "Convencional";
      }

      result.time = String(result.time || "");
      result.prepTime = String(result.prepTime || "");
      result.servings = String(result.servings || "");
      result.difficulty = result.difficulty || "Médio";
      if (!['Fácil', 'Médio', 'Avançado'].includes(result.difficulty)) {
        result.difficulty = "Médio";
      }
      
      if (Array.isArray(result.ingredients)) {
        result.ingredients = result.ingredients.map((ing: any) => ({
          name: String(ing.name || ing || "").substring(0, 200),
          quantity: String(ing.quantity || "").substring(0, 100)
        }));
      } else {
        result.ingredients = [];
      }

      if (Array.isArray(result.instructions)) {
        result.instructions = result.instructions.map((step: any) => String(step).substring(0, 1000));
      } else {
        result.instructions = [];
      }

      // Final merge of image options: Original site images + AI found images + Google Search (if needed)
      let finalOptions = Array.from(new Set([
        ...(options.ogImage ? [options.ogImage] : []),
        ...(result.imageOptions || []),
        ...(options.allImagesFound || [])
      ])).filter(Boolean);

      // Prioritize the original main image (ogImage) as the default option
      if (options.ogImage) {
        const existingIndex = finalOptions.indexOf(options.ogImage);
        if (existingIndex > -1) {
          finalOptions.splice(existingIndex, 1);
        }
        finalOptions.unshift(options.ogImage);
        result.image = options.ogImage;
      }

      result.imageOptions = finalOptions.slice(0, 10);

      // Fallback Search: If fewer than 2 image options are found, try searching for more using Gemini search grounding
      if (result.imageOptions.length < 2 && result.title) {
        try {
          const searchPrompt = `Encontre até 5 URLs de imagens de alta qualidade para a receita: "${result.title}". 
          Retorne APENAS um array JSON de strings com as URLs.`;
          
          const searchResponse = await (ai.models as any).generateContent({
            model: "gemini-3-flash-preview",
            contents: searchPrompt,
            tools: [{ googleSearch: {} }] // Using search grounding to find real images
          });

          const searchResult = searchResponse.text || "";
          const foundUrlsMatch = searchResult.match(/https?:\/\/[^\s"'<>\])]+\.(jpg|jpeg|png|webp|gif)/gi);
          
          if (foundUrlsMatch) {
            const newOptions = Array.from(new Set([...(result.imageOptions || []), ...foundUrlsMatch])).slice(0, 8);
            result.imageOptions = newOptions;
            if (!result.image && newOptions.length > 0) {
              result.image = newOptions[0];
            }
          }
        } catch (searchError) {
          console.error("Gemini search grounding error:", searchError);
          // Don't fail the whole process if search fails, just keep what we have
        }
      }

      return result;
    } catch (error) {
      console.error("Gemini extraction error:", error);
      throw new Error("Falha ao extrair dados da receita via AI.");
    }
  }
};
