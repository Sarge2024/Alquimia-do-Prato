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
      - title, description.
      - momento (string[]): USE APENAS: 'Café da Manhã', 'Brunch', 'Almoço', 'Lanche / Chá da Tarde', 'Jantar', 'Ceia', 'Petiscos / Aperitivos', 'Bebidas'. (Pode ser mais de um).
      - tipo_prato (string[]): USE APENAS: 'Assados', 'Frituras', 'Grelhados', 'Sopas e Caldos', 'Cremes e Purés', 'Massas e Risotos', 'Saladas e Pratos Frios', 'Cozidos / Guisados', 'Padaria e Pastelaria', 'Bebidas', 'Doces e Sobremesas'.
      - base_alimento (string[]): USE APENAS: 'Carnes', 'Frutos do Mar', 'Vegetais e Legumes', 'Ovos e Laticínios', 'Grãos e Leguminosas'.
      - origem (string): USE PREFERENCIALMENTE: 'Latino-Americana', 'Brasileira', 'Mexicana', 'Argentina', 'Asiática', 'Japonesa', 'Chinesa', 'Tailandesa', 'Coreana', 'Indiana', 'Europeia', 'Italiana', 'Francesa', 'Portuguesa', 'Espanhola', 'Árabe / Médio Oriente', 'Americana'.
      - custo_estimado (string): USE: '$', '$$', '$$$', '$$$$'.
      - time (string): TEMPO TOTAL (ex: '45 min').
      - prepTime (string): TEMPO DE PREPARAÇÃO (ex: '15 min').
      - dietType (string): TIPO DE DIETA (USE EXATAMENTE UMA DESTAS: 'Convencional', 'Vegana', 'Vegetariana', 'Low Carb', 'Keto', 'Sem Glúten', 'Fit'). Se não houver restrição clara, use 'Convencional'.
      - difficulty (Fácil, Médio, Difícil), servings.
      - isClassic (boolean): Determine se esta é uma receita CLÁSSICA ou TRADICIONAL. Receitas clássicas são aquelas amplamente conhecidas, com origem histórica clara, herança cultural ou pratos icônicos (ex: Feijoada, Carbonara, Ratatouille). Se o texto descrever uma história de família ou herança, também marque como true.
      - ingredients (objeto[] com name, quantity e group). O campo 'group' deve ser usado para separar partes da receita (ex: 'Massa', 'Recheio', 'Cobertura', 'Calda'). Se a receita não tiver partes distintas, deixe 'group' como null ou vazio. Quantidade nunca vazia (use "a gosto" se necessário).
      - instructions (string[]).
      - image, imageOptions (string[]).
    `;

    const contentPrompt = isUrlOnly 
      ? `Acesse e pesquise os detalhes da receita no seguinte link: ${options.url}. Se for um petisco, quitute ou acompanhamento para coffee break, classifique como 'Petiscos / Aperitivos'. Use ferramentas de busca se necessário para encontrar o conteúdo completo.`
      : `Extraia do seguinte HTML: ${html.substring(0, 12000)}. Se for um petisco, quitute ou acompanhamento para coffee break, classifique como 'Petiscos / Aperitivos'.`;

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
      
      // Robust JSON extraction: Find the first { and the last }
      let jsonStr = text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      } else {
        // Fallback to simple clean if block search fails
        jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
      }

      let result: any;
      try {
        result = JSON.parse(jsonStr);
      } catch (parseError) {
        console.error("Initial JSON parse failure, attempting to clean response:", text);
        // Deep search for JSON if first match failed (sometimes Gemini wraps JSON in markdown blocks)
        const cleanerMatch = text.match(/\{[\s\S]*\}/);
        if (cleanerMatch) {
           result = JSON.parse(cleanerMatch[0]);
        } else {
           throw parseError;
        }
      }

      // Sanitize fields to ensure they are the correct types for Firestore
      result.title = String(result.title || "").substring(0, 300);
      result.description = String(result.description || "").substring(0, 5000);
      
      const ALL_MOMENTOS = ['Café da Manhã', 'Brunch', 'Almoço', 'Lanche / Chá da Tarde', 'Jantar', 'Ceia', 'Petiscos / Aperitivos', 'Bebidas'];
      result.momento = Array.isArray(result.momento) 
        ? result.momento.filter((m: string) => ALL_MOMENTOS.includes(m))
        : [];
      if (result.momento.length === 0) result.momento = ["Almoço"];

      const ALL_TIPOS = ["Assados", "Frituras", "Grelhados", "Sopas e Caldos", "Cremes e Purés", "Massas e Risotos", "Saladas e Pratos Frios", "Cozidos / Guisados", "Padaria e Pastelaria", "Bebidas", "Doces e Sobremesas"];
      result.tipo_prato = Array.isArray(result.tipo_prato)
        ? result.tipo_prato.filter((t: string) => ALL_TIPOS.includes(t))
        : [];
      if (result.tipo_prato.length === 0) result.tipo_prato = ["Cozidos / Guisados"];

      const ALL_BASES = ["Carnes", "Frutos do Mar", "Vegetais e Legumes", "Ovos e Laticínios", "Grãos e Leguminosas"];
      result.base_alimento = Array.isArray(result.base_alimento)
        ? result.base_alimento.filter((b: string) => ALL_BASES.includes(b))
        : [];
      
      // For drinks, base_alimento might be empty, so we add a generic or use specific logic
      if (result.base_alimento.length === 0) {
        if (result.momento?.includes('Bebidas') || result.tipo_prato?.includes('Bebidas')) {
          result.base_alimento = ["Vegetais e Legumes"]; // Default for fruit/botanical drinks
        } else {
          result.base_alimento = ["Vegetais e Legumes"];
        }
      }

      result.origem = String(result.origem || "Brasileira");
      result.custo_estimado = ["$", "$$", "$$$", "$$$$"].includes(result.custo_estimado) ? result.custo_estimado : "$$";
      
      const dietTypes = ['Convencional', 'Vegana', 'Vegetariana', 'Low Carb', 'Keto', 'Sem Glúten', 'Fit'];
      if (!dietTypes.includes(result.dietType)) {
        result.dietType = "Convencional";
      }

      result.time = String(result.time || "");
      result.prepTime = String(result.prepTime || "");
      result.servings = String(result.servings || "");
      result.difficulty = result.difficulty || "Médio";
      if (!['Fácil', 'Médio', 'Difícil'].includes(result.difficulty)) {
        result.difficulty = "Médio";
      }

      result.isClassic = Boolean(result.isClassic);
      
      if (Array.isArray(result.ingredients)) {
        result.ingredients = result.ingredients.map((ing: any) => ({
          name: String(ing.name || ing || "").substring(0, 200),
          quantity: String(ing.quantity || "").substring(0, 100),
          group: ing.group ? String(ing.group).substring(0, 100) : null
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
      result.image = result.image || (result.imageOptions.length > 0 ? result.imageOptions[0] : "");

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

      // Ensure no fields are undefined before returning
      const finalResult: Partial<Recipe> = {
        title: result.title || "Receita sem título",
        description: result.description || "",
        momento: result.momento || ["Bebidas"],
        tipo_prato: result.tipo_prato || ["Bebidas"],
        base_alimento: result.base_alimento || ["Vegetais e Legumes"],
        origem: result.origem || "Brasileira",
        custo_estimado: result.custo_estimado || "$$",
        dietType: result.dietType || "Convencional",
        time: result.time || "",
        prepTime: result.prepTime || "",
        servings: result.servings || "",
        difficulty: result.difficulty || "Médio",
        isClassic: !!result.isClassic,
        ingredients: result.ingredients || [],
        instructions: result.instructions || [],
        image: result.image || "",
        imageOptions: result.imageOptions || []
      };

      return finalResult;
    } catch (error) {
      console.error("Gemini extraction error:", error);
      throw new Error("Falha ao extrair dados da receita via AI.");
    }
  }
};
