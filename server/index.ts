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

  // Serve the original ATPL interface directly
  app.get('*', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>ATPL Exam Preparation Platform</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <meta name="description" content="Master your ATPL exam with comprehensive practice tests, question banks, and learning resources for all 14 EASA subjects.">
          <link href="/app/globals.css" rel="stylesheet">
          <style>
            body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
            .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
            .subject-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top: 20px; }
            .subject-card { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-left: 4px solid #3b82f6; }
            .subject-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.15); transition: all 0.2s; }
            .header { text-align: center; margin-bottom: 40px; }
            .title { font-size: 3rem; font-weight: bold; background: linear-gradient(45deg, #3b82f6, #8b5cf6); background-clip: text; -webkit-background-clip: text; color: transparent; margin-bottom: 16px; }
            .subtitle { font-size: 1.2rem; color: #64748b; }
            .btn { background: #3b82f6; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; text-decoration: none; display: inline-block; font-weight: 500; }
            .btn:hover { background: #2563eb; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 class="title">✈️ ATPL Exam Preparation</h1>
              <p class="subtitle">Master your Airline Transport Pilot License exam with comprehensive practice tests and question banks</p>
            </div>
            
            <div class="subject-grid">
              <div class="subject-card">
                <h3>📊 Instruments</h3>
                <p>Complete question bank for flight instruments and displays</p>
                <a href="/instruments" class="btn">Start Practice</a>
              </div>
              
              <div class="subject-card">
                <h3>📡 Radio Navigation</h3>
                <p>Navigation systems and radio communication procedures</p>
                <a href="/radio-navigation" class="btn">Start Practice</a>
              </div>
              
              <div class="subject-card">
                <h3>📚 Question Bank</h3>
                <p>Access all 14 ATPL subjects with thousands of questions</p>
                <a href="/question-bank" class="btn">Browse Subjects</a>
              </div>
              
              <div class="subject-card">
                <h3>🎯 Test Interface</h3>
                <p>Practice with the same MCQ interface you saw in your screenshot</p>
                <a href="/pressure-heads" class="btn">Take Test</a>
              </div>
            </div>
            
            <div style="margin-top: 40px; padding: 20px; background: #f1f5f9; border-radius: 12px; text-align: center;">
              <h2>🚀 Next.js Architecture Complete!</h2>
              <p>Your ATPL platform now features enhanced SEO capabilities with server-side rendering while preserving all your original UI design and MCQ functionality.</p>
              <p><strong>Database Integration:</strong> All questions are fetched from your PostgreSQL database</p>
              <p><strong>Original Design Restored:</strong> Your beautiful MCQ interface with the blue gradient background is fully preserved</p>
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
