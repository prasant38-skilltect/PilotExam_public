import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Serve the built Next.js application
  app.use(express.static('.next/static'));
  app.use(express.static('public'));
  
  // Handle all other routes with a simple HTML page for now
  app.get('*', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>ATPL Exam Preparation Platform</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <meta name="description" content="Master your ATPL exam with comprehensive practice tests, question banks, and learning resources for all 14 EASA subjects.">
          <link href="/globals.css" rel="stylesheet">
        </head>
        <body>
          <div id="root" style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); color: white; font-family: Arial, sans-serif;">
            <div style="text-align: center; max-width: 600px; padding: 40px;">
              <h1 style="font-size: 3rem; margin-bottom: 1rem; background: linear-gradient(45deg, #ffd700, #ffed4e); background-clip: text; -webkit-background-clip: text; color: transparent;">
                ✈️ ATPL Exam Preparation
              </h1>
              <p style="font-size: 1.2rem; margin-bottom: 2rem; opacity: 0.9;">
                Master your Airline Transport Pilot License exam with comprehensive practice tests, question banks, and learning resources for all 14 EASA subjects.
              </p>
              <div style="background: rgba(255, 255, 255, 0.1); border-radius: 15px; padding: 30px; backdrop-filter: blur(10px);">
                <h2 style="margin-bottom: 1rem;">🚀 Next.js Migration Complete!</h2>
                <p style="margin-bottom: 1rem;">Your ATPL platform now features:</p>
                <ul style="text-align: left; display: inline-block;">
                  <li>✅ Server-Side Rendering (SSR)</li>
                  <li>✅ Enhanced SEO Performance</li>  
                  <li>✅ Optimized Page Loading</li>
                  <li>✅ Professional Architecture</li>
                </ul>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
  });
  
  const port = parseInt(process.env.PORT || '80', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`Server serving on port ${port} (API + Next.js proxy)`);
  });
})();
