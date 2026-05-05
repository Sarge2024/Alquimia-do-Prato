import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { JSDOM } from "jsdom";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Fetching HTML (proxy to avoid CORS)
  app.post("/api/fetch-html", async (req, res) => {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
          "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
          "Cache-Control": "no-cache",
          "Pragma": "no-cache",
          "Sec-Ch-Ua": '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
          "Sec-Ch-Ua-Mobile": "?0",
          "Sec-Ch-Ua-Platform": '"Windows"',
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "none",
          "Sec-Fetch-User": "?1",
          "Upgrade-Insecure-Requests": "1"
        }
      });
      
      if (!response.ok) {
        console.error(`HTTP error! status: ${response.status} for URL: ${url}`);
        return res.json({ 
          success: false, 
          status: response.status,
          error: response.status === 403 ? "site_blocked" : "fetch_failed"
        });
      }
      
      const html = await response.text();
      
      // Clean HTML slightly on server to save payload size
      const dom = new JSDOM(html);
      const doc = dom.window.document;

      // Extract all probable images before cleaning
      const allImagesFound: string[] = [];
      doc.querySelectorAll('img').forEach(img => {
        const src = img.getAttribute('src') || img.getAttribute('data-src') || img.getAttribute('srcset')?.split(' ')[0];
        if (src && src.startsWith('http') && !src.includes('logo') && !src.includes('icon')) {
          if (src.match(/\.(jpg|jpeg|png|webp|gif)/i)) {
            allImagesFound.push(src);
          }
        }
      });
      // Unique and limited list
      const uniqueImages = Array.from(new Set(allImagesFound)).slice(0, 15);

      const scripts = doc.querySelectorAll('script, style, nav, footer, iframe, noscript, header, svg');
      scripts.forEach(s => s.remove());
      
      res.json({ 
        success: true,
        html: doc.body.innerHTML?.substring(0, 50000), // Limit size
        metaDescription: doc.querySelector('meta[name="description"]')?.getAttribute('content') || "",
        ogImage: doc.querySelector('meta[property="og:image"]')?.getAttribute('content') || "",
        allImagesFound: uniqueImages
      });
    } catch (error: any) {
      console.error("Fetch HTML error:", error);
      res.json({ 
        success: false, 
        error: "Falha ao buscar o conteúdo da URL. Verifique o link e tente novamente." 
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
