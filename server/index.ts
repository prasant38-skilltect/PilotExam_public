import express, { type Request, Response, NextFunction } from "express";
import path from "path";

import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

const __dirname = path.resolve(); // if using ES modules, compute like before

// --- Secure upload access ---
app.use("/uploads", (req, res, next) => {
  const referer = req.get("Referer");

  // Allow access if coming from your own domain or localhost
  if (
    referer &&
    (referer.startsWith("http://127.0.0.1:5000") ||
     referer.startsWith("http://localhost:5000") ||
     referer.startsWith("https://eatpl.org") ||
     referer.startsWith("https://eatpl.in") ||
     referer.startsWith("https://eatpl.io"))
  ) {
    return next();
  }

  // Block all other requests
  res.status(403).send("Access denied");
});

app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

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

  // Serve static test files from public/test directory
  app.use('/test', express.static('public/test'));

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