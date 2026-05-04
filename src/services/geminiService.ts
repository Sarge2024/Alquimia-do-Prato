import { GoogleGenAI } from "@google/genai";
import { Recipe } from "./recipeService";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const geminiService = {
  async extractRecipeFromHtml(html: string, options: { metaDescription?: string, ogImage?: string }): Promise<Partial<Recipe>> {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const prompt = `
      Extraia os detalhes da receita do seguinte conteúdo HTML (fragmento limpo).
      Retorne APENAS um objeto JSON válido com os seguintes campos:
      - title (string)
      - description (string)
      - category (uma das seguintes: 'Café da Manhã', 'Almoço', 'Jantar', 'Sobremesas')
      - time (string, ex: '45 min')
      - difficulty (uma das seguintes: 'Fácil', 'Médio', 'Avançado')
      - servings (string, ex: '4')
      - ingredients (string[])
      - instructions (string[])
      - image (string, use a URL da imagem se encontrada, caso contrário deixe vazio)

      HTML:
      ${html.substring(0, 5000)}
      Meta Descrição: ${options.metaDescription || ""}
      OG Image: ${options.ogImage || ""}
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      const text = response.text || "";
      const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error("Gemini extraction error:", error);
      throw new Error("Falha ao extrair dados da receita via AI.");
    }
  }
};
