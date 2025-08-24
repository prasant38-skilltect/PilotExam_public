import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add request logging
app.use((req, _res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = _res.json;
  _res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(this, [bodyJson, ...args]);
  };

  _res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${_res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse).substring(0, 80)}`;
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

  // Redirect old auth routes to new custom pages
  app.get('/api/login', (req, res) => {
    res.redirect('/sign-in');
  });

  app.get('/api/logout', (req, res) => {
    res.redirect('/');
  });

  app.get('/sign-out', (req, res) => {
    res.redirect('/');
  });

  // Note: Authentication pages are now handled by React components
  // in client/src/pages/SignIn.tsx, SignUp.tsx, and ForgotPassword.tsx

  // Setup Vite for development or static files for production
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const PORT = 5000;
  server.listen(PORT, "0.0.0.0", () => {
    log(`Server serving on port ${PORT} (API + ${app.get("env") === "development" ? "Vite" : "Static"})`);
  });
})();