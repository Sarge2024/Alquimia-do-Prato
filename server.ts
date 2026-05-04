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
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const html = await response.text();
      
      // Clean HTML slightly on server to save payload size
      const dom = new JSDOM(html);
      const doc = dom.window.document;
      const scripts = doc.querySelectorAll('script, style, nav, footer, iframe, noscript, header, svg');
      scripts.forEach(s => s.remove());
      
      res.json({ 
        html: doc.body.innerHTML?.substring(0, 50000), // Limit size
        metaDescription: doc.querySelector('meta[name="description"]')?.getAttribute('content') || "",
        ogImage: doc.querySelector('meta[property="og:image"]')?.getAttribute('content') || ""
      });
    } catch (error) {
      console.error("Fetch HTML error:", error);
      res.status(500).json({ error: "Falha ao buscar o conteúdo da URL." });
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
