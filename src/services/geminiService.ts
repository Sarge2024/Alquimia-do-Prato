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
      - title, description, category (Café da Manhã, Almoço, Jantar, Sobremesas).
      - time (string): TEMPO TOTAL (ex: '45 min').
      - prepTime (string): TEMPO DE PREPARAÇÃO (ex: '15 min').
      - difficulty, servings.
      - ingredients (objeto[] com name e quantity). Quantidade nunca vazia (use "a gosto" se necessário).
      - instructions (string[]).
      - image, imageOptions (string[]).
    `;

    const contentPrompt = isUrlOnly 
      ? `Acesse e pesquise os detalhes da receita no seguinte link: ${options.url}. Use ferramentas de busca se necessário para encontrar o conteúdo completo.`
      : `Extraia do seguinte HTML: ${html.substring(0, 12000)}`;

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

      // Conferência de Disponibilidade de Dados
      const hasIngredients = result.ingredients && result.ingredients.length > 0;
      const hasInstructions = result.instructions && result.instructions.length > 0;

      if (result.title && (!hasIngredients || !hasInstructions)) {
        console.log(`Dados incompletos para "${result.title}". Iniciando busca de recuperação...`);
        try {
          const recoveryPrompt = `Complete a receita para "${result.title}". 
          Forneça a lista de ingredientes (com name e quantity) e o modo de preparo (passo a passo).
          Retorne APENAS um JSON com os campos "ingredients" e "instructions".`;
          
          const recoveryResponse = await (ai.models as any).generateContent({
            model: "gemini-3-flash-preview",
            contents: recoveryPrompt,
            tools: [{ googleSearch: {} }]
          });

          const recoveryText = recoveryResponse.text || "";
          const recoveryJsonMatch = recoveryText.match(/\{[\s\S]*\}/);
          if (recoveryJsonMatch) {
            const recoveryData = JSON.parse(recoveryJsonMatch[0]);
            if (!hasIngredients && recoveryData.ingredients) result.ingredients = recoveryData.ingredients;
            if (!hasInstructions && recoveryData.instructions) result.instructions = recoveryData.instructions;
          }
        } catch (recoveryError) {
          console.error("Erro na recuperação de dados:", recoveryError);
        }
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
