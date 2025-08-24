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

  // Serve the subjects selection page
  app.get('/subjects', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Eatpl.in - Select ATPL Subject</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
              background: linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #3b82f6 100%);
              min-height: 100vh;
              color: white;
            }
            
            /* Header */
            .header {
              background: rgba(255, 255, 255, 0.1);
              backdrop-filter: blur(10px);
              border-bottom: 1px solid rgba(255, 255, 255, 0.2);
              padding: 0 24px;
              height: 64px;
              display: flex;
              align-items: center;
            }
            .nav-container {
              max-width: 1200px;
              margin: 0 auto;
              width: 100%;
              display: flex;
              align-items: center;
              justify-content: between;
            }
            .logo {
              display: flex;
              align-items: center;
              font-size: 18px;
              font-weight: 600;
              color: white;
              text-decoration: none;
            }
            .logo::before {
              content: "✈️";
              margin-right: 8px;
            }
            .nav-links {
              display: flex;
              align-items: center;
              gap: 32px;
              flex: 1;
              justify-content: center;
            }
            .nav-link {
              color: rgba(255, 255, 255, 0.8);
              text-decoration: none;
              font-size: 14px;
              font-weight: 500;
              transition: color 0.2s;
            }
            .nav-link:hover {
              color: white;
            }
            .header-actions {
              display: flex;
              align-items: center;
              gap: 16px;
            }
            .theme-toggle {
              background: none;
              border: none;
              padding: 8px;
              border-radius: 6px;
              cursor: pointer;
              color: rgba(255, 255, 255, 0.8);
              font-size: 16px;
            }
            .sign-in-btn {
              background: #6366f1;
              color: white;
              border: none;
              padding: 8px 16px;
              border-radius: 8px;
              font-size: 14px;
              font-weight: 500;
              cursor: pointer;
              transition: background 0.2s;
            }
            .sign-in-btn:hover {
              background: #5b57f2;
            }
            
            /* Main Content */
            .main-content {
              max-width: 1200px;
              margin: 0 auto;
              padding: 40px 24px;
            }
            .subjects-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
              gap: 20px;
              margin-top: 20px;
            }
            .subject-card {
              background: rgba(255, 255, 255, 0.1);
              backdrop-filter: blur(10px);
              border: 1px solid rgba(255, 255, 255, 0.2);
              border-radius: 16px;
              padding: 24px;
              text-align: center;
              cursor: pointer;
              transition: all 0.3s;
              text-decoration: none;
              color: white;
              display: block;
            }
            .subject-card:hover {
              transform: translateY(-5px);
              background: rgba(255, 255, 255, 0.2);
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            }
            .subject-title {
              font-size: 16px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              line-height: 1.4;
            }
            .subject-description {
              font-size: 14px;
              opacity: 0.8;
              margin-top: 8px;
            }
            .loading {
              text-align: center;
              padding: 60px;
              font-size: 18px;
              opacity: 0.8;
            }
            
            /* Responsive */
            @media (max-width: 768px) {
              .nav-links { display: none; }
              .subjects-grid {
                grid-template-columns: 1fr;
                gap: 16px;
              }
              .main-content {
                padding: 20px 16px;
              }
            }
          </style>
        </head>
        <body>
          <!-- Header -->
          <header class="header">
            <div class="nav-container">
              <a href="/" class="logo">Eatpl.in</a>
              
              <nav class="nav-links">
                <a href="/question-bank" class="nav-link">Question Bank</a>
                <a href="/airline-interviews" class="nav-link">Airline Interviews & Sim Prep</a>
                <a href="/atpl-viva" class="nav-link">ATPL Viva</a>
                <a href="/classes" class="nav-link">Classes</a>
                <a href="/aptitude-test" class="nav-link">Aptitude Test</a>
                <a href="/airbus-320" class="nav-link">Airbus 320</a>
                <a href="/syllabus" class="nav-link">Syllabus</a>
                <a href="/pilot-resume" class="nav-link">Pilot Resume</a>
              </nav>
              
              <div class="header-actions">
                <button class="theme-toggle">🌙</button>
                <button class="sign-in-btn">Sign In</button>
              </div>
            </div>
          </header>
          
          <!-- Main Content -->
          <main class="main-content">
            <div id="subjects-container">
              <div class="loading">Loading ATPL Subjects...</div>
            </div>
          </main>
          
          <script>
            async function loadSubjects() {
              try {
                const response = await fetch('/api/subjects');
                const subjects = await response.json();
                
                const container = document.getElementById('subjects-container');
                container.innerHTML = '';
                
                const grid = document.createElement('div');
                grid.className = 'subjects-grid';
                
                subjects.forEach(subject => {
                  const card = document.createElement('a');
                  card.className = 'subject-card';
                  // Create specific routes for each subject
                  if (subject.name === 'INSTRUMENTS') {
                    card.href = '/instruments';
                  } else {
                    card.href = '/mcq-test'; // Default for other subjects
                  }
                  
                  const title = document.createElement('div');
                  title.className = 'subject-title';
                  title.textContent = subject.name || subject.title || subject.code || 'Subject';
                  
                  const description = document.createElement('div');
                  description.className = 'subject-description';
                  description.textContent = subject.description || 'ATPL Exam Practice';
                  
                  card.appendChild(title);
                  card.appendChild(description);
                  grid.appendChild(card);
                });
                
                container.appendChild(grid);
                
              } catch (error) {
                console.error('Error loading subjects:', error);
                document.getElementById('subjects-container').innerHTML = 
                  '<div class="loading">Error loading subjects. Please try again.</div>';
              }
            }
            
            // Load subjects on page load
            loadSubjects();
            
            // Sign in functionality
            document.querySelector('.sign-in-btn').addEventListener('click', () => {
              window.location.href = '/api/login';
            });
          </script>
        </body>
      </html>
    `);
  });

  // Serve Instruments chapters page  
  app.get('/instruments', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Instruments - ATPL Chapters</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
              background: linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #3b82f6 100%);
              min-height: 100vh;
              color: white;
            }
            
            .header {
              background: rgba(255, 255, 255, 0.1);
              backdrop-filter: blur(10px);
              border-bottom: 1px solid rgba(255, 255, 255, 0.2);
              padding: 20px 24px;
              display: flex;
              align-items: center;
              gap: 16px;
            }
            .back-btn {
              background: rgba(255, 255, 255, 0.2);
              border: 1px solid rgba(255, 255, 255, 0.3);
              color: white;
              padding: 8px 16px;
              border-radius: 8px;
              text-decoration: none;
              font-size: 14px;
              transition: all 0.2s;
            }
            .back-btn:hover {
              background: rgba(255, 255, 255, 0.3);
            }
            .page-title {
              font-size: 28px;
              font-weight: 700;
            }
            
            .main-content {
              max-width: 1200px;
              margin: 0 auto;
              padding: 40px 24px;
            }
            .chapters-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
              gap: 20px;
              margin-top: 20px;
            }
            .chapter-card {
              background: rgba(255, 255, 255, 0.1);
              backdrop-filter: blur(10px);
              border: 1px solid rgba(255, 255, 255, 0.2);
              border-radius: 16px;
              padding: 32px;
              text-align: center;
              cursor: pointer;
              transition: all 0.3s;
              text-decoration: none;
              color: white;
              display: block;
            }
            .chapter-card:hover {
              transform: translateY(-5px);
              background: rgba(255, 255, 255, 0.2);
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            }
            .chapter-title {
              font-size: 20px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 12px;
            }
            .chapter-description {
              font-size: 16px;
              opacity: 0.8;
            }
            .loading {
              text-align: center;
              padding: 60px;
              font-size: 18px;
              opacity: 0.8;
            }
          </style>
        </head>
        <body>
          <!-- Main Header -->
          <header class="main-header" style="background: white; border-bottom: 1px solid #e5e7eb; padding: 0 24px; height: 64px; display: flex; align-items: center;">
            <div style="max-width: 1200px; margin: 0 auto; width: 100%; display: flex; align-items: center; justify-content: between;">
              <a href="/" style="display: flex; align-items: center; font-size: 18px; font-weight: 600; color: #6366f1; text-decoration: none;">
                <span style="margin-right: 8px;">✈️</span>Eatpl.in
              </a>
              
              <nav style="display: flex; align-items: center; gap: 32px; flex: 1; justify-content: center;">
                <a href="/question-bank" style="color: #6b7280; text-decoration: none; font-size: 14px; font-weight: 500;">Question Bank</a>
                <a href="/airline-interviews" style="color: #6b7280; text-decoration: none; font-size: 14px; font-weight: 500;">Airline Interviews & Sim Prep</a>
                <a href="/atpl-viva" style="color: #6b7280; text-decoration: none; font-size: 14px; font-weight: 500;">ATPL Viva</a>
                <a href="/classes" style="color: #6b7280; text-decoration: none; font-size: 14px; font-weight: 500;">Classes</a>
                <a href="/aptitude-test" style="color: #6b7280; text-decoration: none; font-size: 14px; font-weight: 500;">Aptitude Test</a>
                <a href="/airbus-320" style="color: #6b7280; text-decoration: none; font-size: 14px; font-weight: 500;">Airbus 320</a>
                <a href="/syllabus" style="color: #6b7280; text-decoration: none; font-size: 14px; font-weight: 500;">Syllabus</a>
                <a href="/pilot-resume" style="color: #6b7280; text-decoration: none; font-size: 14px; font-weight: 500;">Pilot Resume</a>
              </nav>
              
              <div style="display: flex; align-items: center; gap: 16px;">
                <button style="background: none; border: none; padding: 8px; border-radius: 6px; cursor: pointer; color: #6b7280; font-size: 16px;">🌙</button>
                <button style="background: #6366f1; color: white; border: none; padding: 8px 16px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer;">Sign In</button>
              </div>
            </div>
          </header>
          
          <div class="header">
            <a href="/subjects" class="back-btn">← Back to Subjects</a>
            <h1 class="page-title">Instruments Chapters</h1>
          </div>
          
          <main class="main-content">
            <div id="chapters-container">
              <div class="loading">Loading chapters...</div>
            </div>
          </main>
          
          <script>
            async function loadChapters() {
              try {
                const response = await fetch('/api/subjects/1/chapters');
                const chapters = await response.json();
                
                const container = document.getElementById('chapters-container');
                container.innerHTML = '';
                
                const grid = document.createElement('div');
                grid.className = 'chapters-grid';
                
                chapters.forEach(chapter => {
                  const card = document.createElement('a');
                  card.className = 'chapter-card';
                  
                  // Route to specific chapter pages
                  if (chapter.name === 'O#F#RD') {
                    card.href = '/oxford-instruments-questions';
                  } else {
                    card.href = '/mcq-test'; // Default for other chapters
                  }
                  
                  const title = document.createElement('div');
                  title.className = 'chapter-title';
                  title.textContent = chapter.name;
                  
                  const description = document.createElement('div');
                  description.className = 'chapter-description';
                  description.textContent = chapter.description || 'Chapter practice questions';
                  
                  card.appendChild(title);
                  card.appendChild(description);
                  grid.appendChild(card);
                });
                
                container.appendChild(grid);
                
              } catch (error) {
                console.error('Error loading chapters:', error);
                document.getElementById('chapters-container').innerHTML = 
                  '<div class="loading">Error loading chapters. Please try again.</div>';
              }
            }
            
            loadChapters();
          </script>
        </body>
      </html>
    `);
  });

  // Serve Oxford Instruments sections page
  app.get('/oxford-instruments-questions', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Oxford Instruments - ATPL Sections</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
              background: linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #3b82f6 100%);
              min-height: 100vh;
              color: white;
            }
            
            .header {
              background: rgba(255, 255, 255, 0.1);
              backdrop-filter: blur(10px);
              border-bottom: 1px solid rgba(255, 255, 255, 0.2);
              padding: 20px 24px;
              display: flex;
              align-items: center;
              gap: 16px;
            }
            .back-btn {
              background: rgba(255, 255, 255, 0.2);
              border: 1px solid rgba(255, 255, 255, 0.3);
              color: white;
              padding: 8px 16px;
              border-radius: 8px;
              text-decoration: none;
              font-size: 14px;
              transition: all 0.2s;
            }
            .back-btn:hover {
              background: rgba(255, 255, 255, 0.3);
            }
            .page-title {
              font-size: 28px;
              font-weight: 700;
            }
            
            .main-content {
              max-width: 1200px;
              margin: 0 auto;
              padding: 40px 24px;
            }
            .sections-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
              gap: 16px;
              margin-top: 20px;
            }
            .section-card {
              background: rgba(255, 255, 255, 0.1);
              backdrop-filter: blur(10px);
              border: 1px solid rgba(255, 255, 255, 0.2);
              border-radius: 12px;
              padding: 20px;
              text-align: center;
              cursor: pointer;
              transition: all 0.3s;
              text-decoration: none;
              color: white;
              display: block;
            }
            .section-card:hover {
              transform: translateY(-3px);
              background: rgba(255, 255, 255, 0.2);
              box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
            }
            .section-title {
              font-size: 16px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.3px;
              line-height: 1.3;
            }
            .loading {
              text-align: center;
              padding: 60px;
              font-size: 18px;
              opacity: 0.8;
            }
          </style>
        </head>
        <body>
          <!-- Main Header -->
          <header class="main-header" style="background: white; border-bottom: 1px solid #e5e7eb; padding: 0 24px; height: 64px; display: flex; align-items: center;">
            <div style="max-width: 1200px; margin: 0 auto; width: 100%; display: flex; align-items: center; justify-content: between;">
              <a href="/" style="display: flex; align-items: center; font-size: 18px; font-weight: 600; color: #6366f1; text-decoration: none;">
                <span style="margin-right: 8px;">✈️</span>Eatpl.in
              </a>
              
              <nav style="display: flex; align-items: center; gap: 32px; flex: 1; justify-content: center;">
                <a href="/question-bank" style="color: #6b7280; text-decoration: none; font-size: 14px; font-weight: 500;">Question Bank</a>
                <a href="/airline-interviews" style="color: #6b7280; text-decoration: none; font-size: 14px; font-weight: 500;">Airline Interviews & Sim Prep</a>
                <a href="/atpl-viva" style="color: #6b7280; text-decoration: none; font-size: 14px; font-weight: 500;">ATPL Viva</a>
                <a href="/classes" style="color: #6b7280; text-decoration: none; font-size: 14px; font-weight: 500;">Classes</a>
                <a href="/aptitude-test" style="color: #6b7280; text-decoration: none; font-size: 14px; font-weight: 500;">Aptitude Test</a>
                <a href="/airbus-320" style="color: #6b7280; text-decoration: none; font-size: 14px; font-weight: 500;">Airbus 320</a>
                <a href="/syllabus" style="color: #6b7280; text-decoration: none; font-size: 14px; font-weight: 500;">Syllabus</a>
                <a href="/pilot-resume" style="color: #6b7280; text-decoration: none; font-size: 14px; font-weight: 500;">Pilot Resume</a>
              </nav>
              
              <div style="display: flex; align-items: center; gap: 16px;">
                <button style="background: none; border: none; padding: 8px; border-radius: 6px; cursor: pointer; color: #6b7280; font-size: 16px;">🌙</button>
                <button style="background: #6366f1; color: white; border: none; padding: 8px 16px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer;">Sign In</button>
              </div>
            </div>
          </header>
          
          <div class="header">
            <a href="/instruments" class="back-btn">← Back to Chapters</a>
            <h1 class="page-title">Oxford Instruments Sections</h1>
          </div>
          
          <main class="main-content">
            <div id="sections-container">
              <div class="loading">Loading sections...</div>
            </div>
          </main>
          
          <script>
            async function loadSections() {
              try {
                const response = await fetch('/api/chapters/4/sections'); // Oxford chapter ID is 4
                const sections = await response.json();
                
                const container = document.getElementById('sections-container');
                container.innerHTML = '';
                
                const grid = document.createElement('div');
                grid.className = 'sections-grid';
                
                sections.forEach(section => {
                  const card = document.createElement('a');
                  card.className = 'section-card';
                  
                  // Route to specific section pages
                  if (section.name === 'PRESSURE HEADS') {
                    card.href = '/pressure-heads';
                  } else {
                    card.href = '/mcq-test'; // Default for other sections
                  }
                  
                  const title = document.createElement('div');
                  title.className = 'section-title';
                  title.textContent = section.name;
                  
                  card.appendChild(title);
                  grid.appendChild(card);
                });
                
                container.appendChild(grid);
                
              } catch (error) {
                console.error('Error loading sections:', error);
                document.getElementById('sections-container').innerHTML = 
                  '<div class="loading">Error loading sections. Please try again.</div>';
              }
            }
            
            loadSections();
          </script>
        </body>
      </html>
    `);
  });

  // Serve Pressure Heads MCQ page
  app.get('/pressure-heads', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Pressure Heads - ATPL MCQ Test</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
              background: linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #3b82f6 100%);
              min-height: 100vh;
              color: white;
            }
            
            /* Header */
            .main-header {
              background: white;
              border-bottom: 1px solid #e5e7eb;
              padding: 0 24px;
              height: 64px;
              display: flex;
              align-items: center;
            }
            .nav-container {
              max-width: 1200px;
              margin: 0 auto;
              width: 100%;
              display: flex;
              align-items: center;
              justify-content: between;
            }
            .logo {
              display: flex;
              align-items: center;
              font-size: 18px;
              font-weight: 600;
              color: #6366f1;
              text-decoration: none;
            }
            .logo::before {
              content: "✈️";
              margin-right: 8px;
            }
            .nav-links {
              display: flex;
              align-items: center;
              gap: 32px;
              flex: 1;
              justify-content: center;
            }
            .nav-link {
              color: #6b7280;
              text-decoration: none;
              font-size: 14px;
              font-weight: 500;
              transition: color 0.2s;
            }
            .nav-link:hover {
              color: #6366f1;
            }
            .header-actions {
              display: flex;
              align-items: center;
              gap: 16px;
            }
            .theme-toggle {
              background: none;
              border: none;
              padding: 8px;
              border-radius: 6px;
              cursor: pointer;
              color: #6b7280;
              font-size: 16px;
            }
            .sign-in-btn {
              background: #6366f1;
              color: white;
              border: none;
              padding: 8px 16px;
              border-radius: 8px;
              font-size: 14px;
              font-weight: 500;
              cursor: pointer;
              transition: background 0.2s;
            }
            .sign-in-btn:hover {
              background: #5b57f2;
            }
            
            /* Sub Header */
            .sub-header {
              background: rgba(255, 255, 255, 0.1);
              backdrop-filter: blur(10px);
              padding: 12px 24px;
              display: flex;
              align-items: center;
              justify-content: between;
              border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            .back-section {
              display: flex;
              align-items: center;
              gap: 12px;
            }
            .back-btn {
              background: rgba(255, 255, 255, 0.2);
              border: 1px solid rgba(255, 255, 255, 0.3);
              color: white;
              padding: 6px 12px;
              border-radius: 6px;
              text-decoration: none;
              font-size: 13px;
              transition: all 0.2s;
            }
            .back-btn:hover {
              background: rgba(255, 255, 255, 0.3);
            }
            .section-title {
              font-size: 18px;
              font-weight: 600;
            }
            .timer {
              display: flex;
              align-items: center;
              gap: 8px;
              font-size: 16px;
              font-weight: 500;
            }
            
            .container { 
              display: flex; 
              height: calc(100vh - 120px);
              background: rgba(255, 255, 255, 0.02);
            }
            
            /* Sidebar */
            .sidebar {
              width: 260px;
              background: rgba(255, 255, 255, 0.95);
              color: #1f2937;
              padding: 20px;
              display: flex;
              flex-direction: column;
            }
            .sidebar-header {
              font-size: 14px;
              font-weight: 600;
              margin-bottom: 16px;
              color: #374151;
            }
            .question-grid {
              display: grid;
              grid-template-columns: repeat(5, 1fr);
              gap: 8px;
              margin-bottom: 20px;
            }
            .question-number {
              width: 32px;
              height: 32px;
              border: 1px solid #d1d5db;
              border-radius: 4px;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              font-size: 12px;
              font-weight: 500;
              background: white;
              color: #6b7280;
              transition: all 0.2s;
            }
            .question-number.current {
              background: #3b82f6;
              border-color: #3b82f6;
              color: white;
            }
            .question-number.correct {
              background: #10b981;
              border-color: #10b981;
              color: white;
            }
            .question-number.incorrect {
              background: #ef4444;
              border-color: #ef4444;
              color: white;
            }
            .finish-btn {
              background: #dc2626;
              color: white;
              border: none;
              padding: 12px;
              border-radius: 8px;
              font-weight: 600;
              cursor: pointer;
              width: 100%;
              margin-top: 20px;
            }
            .finish-btn:hover {
              background: #b91c1c;
            }
            
            /* Main Panel */
            .main-panel {
              flex: 1;
              background: white;
              color: #1f2937;
              display: flex;
              flex-direction: column;
            }
            .content-tabs {
              display: flex;
              border-bottom: 1px solid #e5e7eb;
            }
            .content-tab {
              flex: 1;
              padding: 16px;
              text-align: center;
              background: #f9fafb;
              border-right: 1px solid #e5e7eb;
              cursor: pointer;
              font-weight: 500;
              color: #6b7280;
              transition: all 0.2s;
            }
            .content-tab.active {
              background: white;
              color: #1f2937;
              border-bottom: 2px solid #3b82f6;
            }
            .content-tab:last-child {
              border-right: none;
            }
            
            .content-panel {
              flex: 1;
              padding: 30px;
              overflow-y: auto;
            }
            .question-text {
              font-size: 18px;
              font-weight: 600;
              margin-bottom: 24px;
              color: #1f2937;
            }
            .options {
              margin-bottom: 24px;
            }
            .option {
              display: flex;
              align-items: flex-start;
              gap: 12px;
              padding: 12px;
              margin-bottom: 8px;
              border: 1px solid #e5e7eb;
              border-radius: 6px;
              cursor: pointer;
              transition: all 0.2s;
              background: white;
            }
            .option:hover {
              background: #f9fafb;
              border-color: #d1d5db;
            }
            .option.selected {
              border-color: #3b82f6;
              background: #eff6ff;
            }
            .option.correct {
              background: #dcfce7;
              border-color: #10b981;
            }
            .option.incorrect {
              background: #fef2f2;
              border-color: #ef4444;
            }
            .option-letter {
              font-weight: 700;
              min-width: 20px;
              color: #374151;
            }
            .option-text {
              color: #1f2937;
            }
            
            
            .navigation {
              background: #f9fafb;
              border-top: 1px solid #e5e7eb;
              padding: 16px 30px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .nav-btn {
              background: #6366f1;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 8px;
              cursor: pointer;
              font-weight: 500;
              transition: all 0.2s;
              font-size: 14px;
            }
            .nav-btn:hover:not(:disabled) {
              background: #5b57f2;
            }
            .nav-btn:disabled {
              background: #d1d5db;
              color: #9ca3af;
              cursor: not-allowed;
            }
            .nav-btn.next {
              background: #10b981;
            }
            .nav-btn.next:hover:not(:disabled) {
              background: #059669;
            }
            
            /* Report Modal */
            .modal-overlay {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: rgba(0, 0, 0, 0.5);
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 1000;
            }
            .modal {
              background: white;
              border-radius: 12px;
              padding: 24px;
              max-width: 400px;
              width: 90%;
              box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            }
            .modal-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 20px;
            }
            .modal-title {
              font-size: 18px;
              font-weight: 600;
              color: #1f2937;
            }
            .close-btn {
              background: none;
              border: none;
              font-size: 20px;
              cursor: pointer;
              color: #6b7280;
            }
            .modal-content {
              margin-bottom: 24px;
            }
            .modal-label {
              display: block;
              margin-bottom: 8px;
              font-size: 14px;
              color: #374151;
            }
            .modal-textarea {
              width: 100%;
              min-height: 100px;
              padding: 12px;
              border: 2px solid #e5e7eb;
              border-radius: 8px;
              font-family: inherit;
              font-size: 14px;
              resize: vertical;
            }
            .modal-textarea:focus {
              outline: none;
              border-color: #6366f1;
            }
            .modal-actions {
              display: flex;
              gap: 12px;
              justify-content: flex-end;
            }
            .modal-btn {
              padding: 10px 20px;
              border-radius: 6px;
              font-weight: 500;
              cursor: pointer;
              font-size: 14px;
              border: none;
            }
            .modal-btn.cancel {
              background: #f3f4f6;
              color: #374151;
            }
            .modal-btn.submit {
              background: #6366f1;
              color: white;
            }
            .modal-btn:hover.cancel {
              background: #e5e7eb;
            }
            .modal-btn:hover.submit {
              background: #5b57f2;
            }
            
            .report-btn {
              background: none;
              border: 1px solid #d1d5db;
              color: #6b7280;
              padding: 8px 16px;
              border-radius: 6px;
              cursor: pointer;
              font-size: 12px;
              font-weight: 500;
              display: flex;
              align-items: center;
              gap: 6px;
              margin-left: auto;
              margin-top: 12px;
            }
            .report-btn:hover {
              background: #f9fafb;
              border-color: #9ca3af;
            }
            
            /* Comments Section */
            .comments-section {
              padding: 20px;
              display: none;
            }
            .comments-section.active {
              display: block;
            }
            .comments-header {
              display: flex;
              align-items: center;
              gap: 8px;
              margin-bottom: 20px;
              font-size: 16px;
              font-weight: 600;
              color: #1f2937;
            }
            .comment-input-section {
              margin-bottom: 30px;
            }
            .comment-textarea {
              width: 100%;
              min-height: 80px;
              padding: 12px;
              border: 1px solid #d1d5db;
              border-radius: 8px;
              font-family: inherit;
              font-size: 14px;
              resize: vertical;
              margin-bottom: 12px;
              background: #f9fafb;
            }
            .comment-textarea:focus {
              outline: none;
              border-color: #6366f1;
              background: white;
            }
            .post-comment-btn {
              background: #8b5cf6;
              color: white;
              border: none;
              padding: 8px 16px;
              border-radius: 6px;
              font-size: 14px;
              font-weight: 500;
              cursor: pointer;
            }
            .post-comment-btn:hover {
              background: #7c3aed;
            }
            .comments-list {
              display: flex;
              flex-direction: column;
              gap: 20px;
            }
            .comment {
              display: flex;
              gap: 12px;
            }
            .comment-avatar {
              width: 32px;
              height: 32px;
              border-radius: 50%;
              background: #6b7280;
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 12px;
              font-weight: 600;
              flex-shrink: 0;
            }
            .comment-content {
              flex: 1;
            }
            .comment-header {
              display: flex;
              align-items: center;
              gap: 8px;
              margin-bottom: 4px;
            }
            .comment-username {
              font-weight: 600;
              font-size: 14px;
              color: #1f2937;
            }
            .comment-date {
              font-size: 12px;
              color: #6b7280;
            }
            .comment-text {
              font-size: 14px;
              color: #374151;
              line-height: 1.5;
              margin-bottom: 8px;
            }
            .comment-actions {
              display: flex;
              align-items: center;
              gap: 16px;
            }
            .comment-action {
              display: flex;
              align-items: center;
              gap: 4px;
              font-size: 12px;
              color: #6b7280;
              cursor: pointer;
            }
            .comment-action:hover {
              color: #374151;
            }
            
            /* Responsive */
            @media (max-width: 768px) {
              .nav-links { display: none; }
              .container { flex-direction: column; }
              .sidebar { width: 100%; height: auto; }
            }
          </style>
        </head>
        <body>
          <!-- Main Header -->
          <header class="main-header">
            <div class="nav-container">
              <a href="/" class="logo">Eatpl.in</a>
              
              <nav class="nav-links">
                <a href="/question-bank" class="nav-link">Question Bank</a>
                <a href="/airline-interviews" class="nav-link">Airline Interviews & Sim Prep</a>
                <a href="/atpl-viva" class="nav-link">ATPL Viva</a>
                <a href="/classes" class="nav-link">Classes</a>
                <a href="/aptitude-test" class="nav-link">Aptitude Test</a>
                <a href="/airbus-320" class="nav-link">Airbus 320</a>
                <a href="/syllabus" class="nav-link">Syllabus</a>
                <a href="/pilot-resume" class="nav-link">Pilot Resume</a>
              </nav>
              
              <div class="header-actions">
                <button class="theme-toggle">🌙</button>
                <button class="sign-in-btn">Sign In</button>
              </div>
            </div>
          </header>
          
          <!-- Sub Header -->
          <div class="sub-header">
            <div class="back-section">
              <a href="/oxford-instruments-questions" class="back-btn">🏠 Back</a>
              <h1 class="section-title">PRESSURE HEADS</h1>
            </div>
            <div class="timer">⏰ 4:19</div>
          </div>
          
          <div class="container">
            <!-- Sidebar -->
            <div class="sidebar">
              <div class="sidebar-header">📋 Questions (1/10)</div>
              
              <div class="question-grid" id="question-grid">
                <!-- Question numbers populated by JavaScript -->
              </div>
              
              <button class="finish-btn" id="finish-btn" style="display: none;">Finish Test</button>
            </div>
            
            <!-- Main Panel -->
            <div class="main-panel">
              <div class="content-tabs">
                <div class="content-tab active" data-tab="question">Question</div>
                <div class="content-tab" data-tab="comments">Comments</div>
              </div>
              
              <div class="content-panel">
                <!-- Question Tab Content -->
                <div class="question-content" id="question-content">
                  <div class="question-text" id="question-text">Loading question...</div>
                  
                  <div class="options" id="options-container">
                    <!-- Options populated by JavaScript -->
                  </div>
                  
                  <button class="report-btn" id="report-btn">
                    📋 Report
                  </button>
                </div>
                
                <!-- Comments Tab Content -->
                <div class="comments-section" id="comments-section">
                  <div class="comments-header">
                    💬 Comments
                  </div>
                  
                  <div class="comment-input-section">
                    <textarea class="comment-textarea" id="comment-input" placeholder="Add a comment..."></textarea>
                    <button class="post-comment-btn" id="post-comment">Post Comment</button>
                  </div>
                  
                  <div class="comments-list" id="comments-list">
                    <div class="comment">
                      <div class="comment-avatar">HA</div>
                      <div class="comment-content">
                        <div class="comment-header">
                          <span class="comment-username">Handith99</span>
                          <span class="comment-date">28 Feb 25 | 19:16</span>
                        </div>
                        <div class="comment-text">It appears on ease exam in trial but reworded</div>
                        <div class="comment-actions">
                          <div class="comment-action">👍 1</div>
                          <div class="comment-action">👎 0</div>
                        </div>
                      </div>
                    </div>
                    
                    <div class="comment">
                      <div class="comment-avatar">SV</div>
                      <div class="comment-content">
                        <div class="comment-header">
                          <span class="comment-username">Svindy</span>
                          <span class="comment-date">13 Jul 24 | 17:34</span>
                        </div>
                        <div class="comment-text">Guys on the ground singing to the guy in the air... "Everybooody... Yeeeeeaah... Rock your boooooody... Yeeeeeah!"</div>
                        <div class="comment-actions">
                          <div class="comment-action">👍 2</div>
                          <div class="comment-action">👎 0</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="navigation">
                <button class="nav-btn" id="prev-btn">Previous</button>
                <button class="nav-btn next" id="next-btn">Next</button>
              </div>
            </div>
          </div>
          
          <!-- Report Modal -->
          <div class="modal-overlay" id="report-modal" style="display: none;">
            <div class="modal">
              <div class="modal-header">
                <h3 class="modal-title">Report Issue</h3>
                <button class="close-btn" id="close-modal">×</button>
              </div>
              <div class="modal-content">
                <label class="modal-label">Report an issue with this question:</label>
                <textarea class="modal-textarea" id="report-text" placeholder="Describe the issue..."></textarea>
              </div>
              <div class="modal-actions">
                <button class="modal-btn cancel" id="cancel-report">Cancel</button>
                <button class="modal-btn submit" id="submit-report">Submit Report</button>
              </div>
            </div>
          </div>
          
          <script>
            let questions = [];
            let currentQuestionIndex = 0;
            let selectedAnswers = {};
            let attemptedQuestions = new Set();
            
            async function loadQuestions() {
              try {
                const response = await fetch('/api/sections/7/questions');
                questions = await response.json();
                if (questions.length > 0) {
                  renderQuestion(currentQuestionIndex);
                  renderQuestionGrid();
                  updateSidebarHeader();
                }
              } catch (error) {
                console.error('Error loading questions:', error);
              }
            }
            
            function updateSidebarHeader() {
              document.querySelector('.sidebar-header').textContent = 
                \`📋 Questions (\${currentQuestionIndex + 1}/\${questions.length})\`;
            }
            
            function renderQuestionGrid() {
              const grid = document.getElementById('question-grid');
              grid.innerHTML = '';
              
              questions.forEach((q, index) => {
                const btn = document.createElement('div');
                btn.className = 'question-number';
                btn.textContent = index + 1;
                
                if (index === currentQuestionIndex) {
                  btn.classList.add('current');
                } else if (attemptedQuestions.has(q.id)) {
                  const userAnswer = selectedAnswers[q.id];
                  const correctAnswer = q.correct_answer;
                  if (userAnswer === correctAnswer) {
                    btn.classList.add('correct');
                  } else {
                    btn.classList.add('incorrect');
                  }
                }
                
                btn.addEventListener('click', () => {
                  currentQuestionIndex = index;
                  renderQuestion(index);
                  renderQuestionGrid();
                  updateSidebarHeader();
                });
                
                grid.appendChild(btn);
              });
              
              // Always show finish button
              const finishBtn = document.getElementById('finish-btn');
              finishBtn.style.display = 'block';
            }
            
            function renderQuestion(index) {
              const question = questions[index];
              if (!question) return;
              
              document.getElementById('question-text').textContent = 
                \`#\${index + 1}. \${question.question_text}\`;
              
              const container = document.getElementById('options-container');
              container.innerHTML = '';
              
              const optionTexts = [question.option_a, question.option_b, question.option_c, question.option_d];
              const letters = ['A', 'B', 'C', 'D'];
              
              optionTexts.forEach((text, i) => {
                const option = document.createElement('div');
                option.className = 'option';
                
                const letter = document.createElement('span');
                letter.className = 'option-letter';
                letter.textContent = letters[i] + '.';
                
                const textSpan = document.createElement('span');
                textSpan.className = 'option-text';
                textSpan.textContent = text;
                
                option.appendChild(letter);
                option.appendChild(textSpan);
                
                // Show feedback if question was attempted
                if (attemptedQuestions.has(question.id)) {
                  const userAnswer = selectedAnswers[question.id];
                  const correctAnswer = question.correct_answer;
                  
                  if (letters[i] === correctAnswer) {
                    option.classList.add('correct');
                  }
                  if (letters[i] === userAnswer && userAnswer !== correctAnswer) {
                    option.classList.add('incorrect');
                  }
                  if (letters[i] === userAnswer) {
                    option.classList.add('selected');
                  }
                } else if (selectedAnswers[question.id] === letters[i]) {
                  option.classList.add('selected');
                }
                
                option.onclick = () => selectOption(question.id, letters[i], question.correct_answer);
                container.appendChild(option);
              });
              
              
              // Update navigation buttons
              const prevBtn = document.getElementById('prev-btn');
              const nextBtn = document.getElementById('next-btn');
              
              prevBtn.disabled = index === 0;
              nextBtn.disabled = index === questions.length - 1;
              
              // Always show Next, disable on last question
              nextBtn.textContent = 'Next';
              nextBtn.className = 'nav-btn next';
              
              prevBtn.onclick = () => {
                if (index > 0) {
                  currentQuestionIndex = index - 1;
                  renderQuestion(currentQuestionIndex);
                  renderQuestionGrid();
                  updateSidebarHeader();
                }
              };
              
              nextBtn.onclick = () => {
                if (index < questions.length - 1) {
                  currentQuestionIndex = index + 1;
                  renderQuestion(currentQuestionIndex);
                  renderQuestionGrid();
                  updateSidebarHeader();
                }
              };
            }
            
            function selectOption(questionId, answer, correctAnswer) {
              selectedAnswers[questionId] = answer;
              attemptedQuestions.add(questionId);
              
              // Re-render question to show feedback
              renderQuestion(currentQuestionIndex);
              renderQuestionGrid();
            }
            
            // Tab functionality
            document.querySelectorAll('.content-tab').forEach(tab => {
              tab.addEventListener('click', () => {
                document.querySelectorAll('.content-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                const tabType = tab.dataset.tab;
                const questionContent = document.getElementById('question-content');
                const commentsSection = document.getElementById('comments-section');
                
                // Hide all content sections first
                questionContent.style.display = 'none';
                commentsSection.style.display = 'none';
                
                if (tabType === 'comments') {
                  commentsSection.style.display = 'block';
                } else {
                  // Show question content for question tab
                  questionContent.style.display = 'block';
                }
              });
            });
            
            // Finish button functionality
            document.getElementById('finish-btn').addEventListener('click', () => {
              showResults();
            });
            
            // Report modal functionality
            document.getElementById('report-btn').addEventListener('click', () => {
              document.getElementById('report-modal').style.display = 'flex';
            });
            
            document.getElementById('close-modal').addEventListener('click', () => {
              document.getElementById('report-modal').style.display = 'none';
              document.getElementById('report-text').value = '';
            });
            
            document.getElementById('cancel-report').addEventListener('click', () => {
              document.getElementById('report-modal').style.display = 'none';
              document.getElementById('report-text').value = '';
            });
            
            document.getElementById('submit-report').addEventListener('click', () => {
              const reportText = document.getElementById('report-text').value.trim();
              if (reportText) {
                alert('Thank you for your feedback! Your report has been submitted.');
                document.getElementById('report-modal').style.display = 'none';
                document.getElementById('report-text').value = '';
              } else {
                alert('Please describe the issue before submitting.');
              }
            });
            
            // Close modal on outside click
            document.getElementById('report-modal').addEventListener('click', (e) => {
              if (e.target.id === 'report-modal') {
                document.getElementById('report-modal').style.display = 'none';
                document.getElementById('report-text').value = '';
              }
            });
            
            // Post comment functionality
            document.getElementById('post-comment').addEventListener('click', () => {
              const commentText = document.getElementById('comment-input').value.trim();
              if (commentText) {
                addNewComment(commentText);
                document.getElementById('comment-input').value = '';
              } else {
                alert('Please write a comment before posting.');
              }
            });
            
            function addNewComment(text) {
              const commentsList = document.getElementById('comments-list');
              const newComment = document.createElement('div');
              newComment.className = 'comment';
              
              const now = new Date();
              const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }) + ' | ' + 
                            now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
              
              newComment.innerHTML = \`
                <div class="comment-avatar">ME</div>
                <div class="comment-content">
                  <div class="comment-header">
                    <span class="comment-username">You</span>
                    <span class="comment-date">\${dateStr}</span>
                  </div>
                  <div class="comment-text">\${text}</div>
                  <div class="comment-actions">
                    <div class="comment-action">👍 0</div>
                    <div class="comment-action">👎 0</div>
                  </div>
                </div>
              \`;
              
              commentsList.insertBefore(newComment, commentsList.firstChild);
            }
            
            function showResults() {
              // Calculate score
              let correctCount = 0;
              let totalAttempted = attemptedQuestions.size;
              
              questions.forEach(q => {
                if (attemptedQuestions.has(q.id) && selectedAnswers[q.id] === q.correct_answer) {
                  correctCount++;
                }
              });
              
              const percentage = totalAttempted > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
              
              // Replace main content with results
              document.querySelector('.container').innerHTML = \`
                <div style="max-width: 900px; margin: 0 auto; padding: 40px 20px;">
                  <!-- Score Summary Card -->
                  <div style="background: white; border-radius: 16px; padding: 40px; text-align: center; margin-bottom: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                    <h2 style="font-size: 24px; font-weight: 600; color: #1f2937; margin-bottom: 16px;">Your Score</h2>
                    <div style="font-size: 64px; font-weight: 700; color: #3b82f6; margin-bottom: 16px;">\${percentage}%</div>
                    <div style="font-size: 16px; color: #6b7280; margin-bottom: 8px;">\${correctCount} out of \${questions.length} questions correct</div>
                    <div style="font-size: 14px; color: #9ca3af;">Time taken: 12:26</div>
                  </div>
                  
                  <!-- Questions Review -->
                  <div id="results-questions"></div>
                </div>
              \`;
              
              // Render all questions with results
              const resultsContainer = document.getElementById('results-questions');
              
              questions.forEach((question, index) => {
                const userAnswer = selectedAnswers[question.id];
                const correctAnswer = question.correct_answer;
                const isCorrect = userAnswer === correctAnswer;
                const wasAttempted = attemptedQuestions.has(question.id);
                
                const questionCard = document.createElement('div');
                questionCard.style.cssText = 'background: white; border-radius: 12px; padding: 30px; margin-bottom: 24px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);';
                
                questionCard.innerHTML = \`
                  <h3 style="font-size: 18px; font-weight: 600; color: #1f2937; margin-bottom: 24px;">
                    #\${index + 1}. \${question.question_text}
                  </h3>
                  
                  <div style="margin-bottom: 24px;">
                    \${renderResultOptions(question, userAnswer, correctAnswer, wasAttempted)}
                  </div>
                  
                  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;">
                    <div style="font-size: 16px; font-weight: 600; color: #1e40af; margin-bottom: 12px;">Explanation:</div>
                    <div style="color: #374151; line-height: 1.6;">\${question.explanation_text || question.explanation || 'No explanation available.'}</div>
                  </div>
                \`;
                
                resultsContainer.appendChild(questionCard);
              });
            }
            
            function renderResultOptions(question, userAnswer, correctAnswer, wasAttempted) {
              const optionTexts = [question.option_a, question.option_b, question.option_c, question.option_d];
              const letters = ['A', 'B', 'C', 'D'];
              
              return letters.map((letter, i) => {
                let optionStyle = 'display: flex; align-items: flex-start; gap: 12px; padding: 12px; margin-bottom: 8px; border: 1px solid #e5e7eb; border-radius: 6px; background: white;';
                
                if (wasAttempted) {
                  if (letter === correctAnswer) {
                    // Correct answer - always green
                    optionStyle = 'display: flex; align-items: flex-start; gap: 12px; padding: 12px; margin-bottom: 8px; border: 2px solid #10b981; border-radius: 6px; background: #dcfce7;';
                  } else if (letter === userAnswer && userAnswer !== correctAnswer) {
                    // User's wrong answer - red
                    optionStyle = 'display: flex; align-items: flex-start; gap: 12px; padding: 12px; margin-bottom: 8px; border: 2px solid #ef4444; border-radius: 6px; background: #fef2f2;';
                  }
                }
                
                return \`
                  <div style="\${optionStyle}">
                    <span style="font-weight: 700; min-width: 20px; color: #374151;">\${letter}.</span>
                    <span style="color: #1f2937;">\${optionTexts[i]}</span>
                    \${wasAttempted && letter === correctAnswer ? '<span style="color: #10b981; margin-left: auto; font-weight: 600;">✓ Correct</span>' : ''}
                  </div>
                \`;
              }).join('');
            }
            
            // Initialize
            loadQuestions();
          </script>
        </body>
      </html>
    `);
  });

  // Serve the dynamic MCQ test interface for PRESSURE HEADS
  app.get('/mcq-test', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>ATPL MCQ Test - Question 10</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
              background: linear-gradient(135deg, #2c3e50 0%, #3498db 50%, #2980b9 100%);
              min-height: 100vh;
              padding: 20px;
            }
            .test-container { 
              display: flex; 
              gap: 20px; 
              max-width: 1400px; 
              margin: 0 auto; 
              height: calc(100vh - 40px);
            }
            .sidebar { 
              background: rgba(255, 255, 255, 0.95); 
              border-radius: 16px; 
              padding: 20px; 
              width: 280px; 
              height: fit-content;
              box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            }
            .sidebar h3 { 
              font-size: 16px; 
              margin-bottom: 20px; 
              color: #2c3e50;
              display: flex;
              align-items: center;
            }
            .sidebar h3::before { 
              content: "📋"; 
              margin-right: 8px; 
            }
            .question-grid { 
              display: grid; 
              grid-template-columns: repeat(5, 1fr); 
              gap: 8px; 
              margin-bottom: 20px; 
            }
            .question-number { 
              width: 40px; 
              height: 40px; 
              border-radius: 50%; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              font-weight: 600; 
              cursor: pointer; 
              transition: all 0.2s;
            }
            .question-number.answered { 
              background: #27ae60; 
              color: white; 
            }
            .question-number.current { 
              background: #3498db; 
              color: white; 
              box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.3);
            }
            .question-number.unanswered { 
              background: #ecf0f1; 
              color: #7f8c8d; 
            }
            .finish-btn { 
              background: #e74c3c; 
              color: white; 
              border: none; 
              padding: 12px 20px; 
              border-radius: 8px; 
              font-weight: 600; 
              cursor: pointer; 
              width: 100%;
              transition: background 0.2s;
            }
            .finish-btn:hover { 
              background: #c0392b; 
            }
            .main-content { 
              background: rgba(255, 255, 255, 0.95); 
              border-radius: 16px; 
              flex: 1; 
              padding: 24px;
              box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            }
            .tab-nav { 
              display: flex; 
              background: #ecf0f1; 
              border-radius: 8px; 
              padding: 4px; 
              margin-bottom: 24px; 
            }
            .tab { 
              flex: 1; 
              padding: 12px 16px; 
              text-align: center; 
              border-radius: 6px; 
              cursor: pointer; 
              font-weight: 500;
              transition: all 0.2s;
            }
            .tab.active { 
              background: white; 
              color: #2c3e50;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .question-header { 
              display: flex; 
              justify-content: between; 
              align-items: center; 
              margin-bottom: 20px; 
            }
            .question-text { 
              font-size: 18px; 
              font-weight: 600; 
              color: #2c3e50; 
              margin-bottom: 24px; 
            }
            .report-btn { 
              background: none; 
              border: 1px solid #bdc3c7; 
              padding: 8px 16px; 
              border-radius: 6px; 
              cursor: pointer;
              color: #7f8c8d;
              font-size: 14px;
              margin-left: auto;
            }
            .options { 
              display: flex; 
              flex-direction: column; 
              gap: 12px; 
              margin-bottom: 24px; 
            }
            .option { 
              padding: 16px 20px; 
              border: 2px solid #ecf0f1; 
              border-radius: 12px; 
              cursor: pointer; 
              transition: all 0.2s;
              display: flex;
              align-items: center;
              gap: 12px;
            }
            .option.selected { 
              background: #d5f4e6; 
              border-color: #27ae60;
              color: #27ae60;
            }
            .option-letter { 
              font-weight: 700; 
              font-size: 16px;
              min-width: 24px;
            }
            .option.selected .option-letter::after { 
              content: " ✓"; 
              color: #27ae60; 
            }
            .explanation { 
              background: #ebf3fd; 
              border: 1px solid #bde0ff; 
              border-radius: 12px; 
              padding: 20px; 
              margin-bottom: 24px; 
            }
            .explanation h4 { 
              color: #2c3e50; 
              margin-bottom: 12px; 
            }
            .explanation p { 
              color: #34495e; 
              line-height: 1.6; 
            }
            .navigation { 
              display: flex; 
              justify-content: space-between; 
              align-items: center; 
            }
            .nav-btn { 
              padding: 12px 24px; 
              border: none; 
              border-radius: 8px; 
              cursor: pointer; 
              font-weight: 500;
              transition: all 0.2s;
            }
            .nav-btn.previous { 
              background: #95a5a6; 
              color: white; 
            }
            .nav-btn.next { 
              background: #9b59b6; 
              color: white; 
            }
            .nav-btn:hover { 
              transform: translateY(-1px); 
              box-shadow: 0 4px 12px rgba(0,0,0,0.15); 
            }
          </style>
        </head>
        <body>
          <div class="test-container">
            <div class="sidebar">
              <h3>Questions (10/10)</h3>
              <div class="question-grid">
                <div class="question-number answered">1</div>
                <div class="question-number answered">2</div>
                <div class="question-number answered">3</div>
                <div class="question-number answered">4</div>
                <div class="question-number answered">5</div>
                <div class="question-number answered">6</div>
                <div class="question-number answered">7</div>
                <div class="question-number answered">8</div>
                <div class="question-number answered">9</div>
                <div class="question-number current">10</div>
              </div>
              <button class="finish-btn">Finish Test</button>
            </div>
            
            <div class="main-content">
              <div class="tab-nav">
                <div class="tab active">Question</div>
                <div class="tab">Explanation</div>
                <div class="tab">Comments</div>
              </div>
              
              <div class="question-header">
                <button class="report-btn">📊 Report</button>
              </div>
              
              <div class="question-text">
                #10. Where an alternate static source is fitted, use of this source usually leads to:
              </div>
              
              <div class="options">
                <div class="option selected">
                  <span class="option-letter">A.</span>
                  <span>a temporary increase in lag error.</span>
                </div>
                <div class="option">
                  <span class="option-letter">B.</span>
                  <span>a lower pressure error than with normal sources.</span>
                </div>
                <div class="option">
                  <span class="option-letter">C.</span>
                  <span>an increase in position error.</span>
                </div>
                <div class="option">
                  <span class="option-letter">D.</span>
                  <span>no change in position error.</span>
                </div>
              </div>
              
              <div class="explanation">
                <h4>Explanation:</h4>
                <p>Using an alternate static source on a non-pressurized aircraft typically leads to an increase in position error because the airspeed and altitude readings will be higher than normal. (Alternate instruments are not as accurate as primary instruments.)</p>
              </div>
              
              <div class="navigation">
                <button class="nav-btn previous">Previous</button>
                <button class="nav-btn next">Next</button>
              </div>
            </div>
          </div>
          
          <script>
            // Dynamic MCQ functionality
            let questions = [];
            let currentQuestionIndex = 0;
            let selectedAnswers = {};
            
            // Fetch questions from database
            async function loadQuestions() {
              try {
                const response = await fetch('/api/sections/7/questions'); // PRESSURE HEADS section ID
                questions = await response.json();
                if (questions.length > 0) {
                  renderQuestion(currentQuestionIndex);
                  renderQuestionGrid();
                }
              } catch (error) {
                console.error('Error loading questions:', error);
              }
            }
            
            function renderQuestionGrid() {
              const grid = document.querySelector('.question-grid');
              grid.innerHTML = '';
              
              questions.forEach((q, index) => {
                const btn = document.createElement('div');
                btn.className = 'question-number';
                btn.textContent = index + 1;
                
                if (selectedAnswers[q.id]) {
                  btn.classList.add('answered');
                }
                if (index === currentQuestionIndex) {
                  btn.classList.add('current');
                }
                if (!selectedAnswers[q.id] && index !== currentQuestionIndex) {
                  btn.classList.add('unanswered');
                }
                
                btn.addEventListener('click', () => {
                  currentQuestionIndex = index;
                  renderQuestion(index);
                  renderQuestionGrid();
                });
                
                grid.appendChild(btn);
              });
            }
            
            function renderQuestion(index) {
              const question = questions[index];
              if (!question) return;
              
              // Update question text
              document.querySelector('.question-text').textContent = 
                '#' + (index + 1) + '. ' + question.question_text;
              
              // Update options
              const options = document.querySelectorAll('.option');
              const optionTexts = [question.option_a, question.option_b, question.option_c, question.option_d];
              const letters = ['A', 'B', 'C', 'D'];
              
              options.forEach((option, i) => {
                const letterSpan = option.querySelector('.option-letter');
                const textSpan = option.querySelector('span:last-child');
                
                letterSpan.textContent = letters[i] + '.';
                textSpan.textContent = optionTexts[i];
                
                option.classList.remove('selected');
                if (selectedAnswers[question.id] === letters[i]) {
                  option.classList.add('selected');
                }
                
                option.onclick = () => selectOption(question.id, letters[i], option);
              });
              
              // Update explanation
              const explanation = question.explanation_text || question.explanation || 'No explanation available.';
              document.querySelector('.explanation p').textContent = explanation;
              
              // Update navigation buttons
              const prevBtn = document.querySelector('.nav-btn.previous');
              const nextBtn = document.querySelector('.nav-btn.next');
              
              prevBtn.disabled = index === 0;
              nextBtn.disabled = index === questions.length - 1;
              
              prevBtn.onclick = () => {
                if (index > 0) {
                  currentQuestionIndex = index - 1;
                  renderQuestion(currentQuestionIndex);
                  renderQuestionGrid();
                }
              };
              
              nextBtn.onclick = () => {
                if (index < questions.length - 1) {
                  currentQuestionIndex = index + 1;
                  renderQuestion(currentQuestionIndex);
                  renderQuestionGrid();
                }
              };
            }
            
            function selectOption(questionId, answer, optionElement) {
              selectedAnswers[questionId] = answer;
              
              // Remove selected class from all options
              document.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
              
              // Add selected class to clicked option
              optionElement.classList.add('selected');
              
              // Update question grid to show answered state
              renderQuestionGrid();
            }
            
            // Tab functionality
            document.querySelectorAll('.tab').forEach(tab => {
              tab.addEventListener('click', () => {
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
              });
            });
            
            // Initialize
            loadQuestions();
          </script>
        </body>
      </html>
    `);
  });

  // Serve the Eatpl.in home page design
  app.get('*', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Eatpl.in - 14 ATPL Subject Modules</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <meta name="description" content="Master all EASA ATPL subjects with our comprehensive question bank and practice tests">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
              background: #ffffff;
              color: #1f2937;
              line-height: 1.6;
            }
            
            /* Header */
            .header {
              background: white;
              border-bottom: 1px solid #e5e7eb;
              padding: 0 24px;
              height: 64px;
              display: flex;
              align-items: center;
              justify-content: between;
            }
            .nav-container {
              max-width: 1200px;
              margin: 0 auto;
              width: 100%;
              display: flex;
              align-items: center;
              justify-content: between;
            }
            .logo {
              display: flex;
              align-items: center;
              font-size: 18px;
              font-weight: 600;
              color: #6366f1;
              text-decoration: none;
            }
            .logo::before {
              content: "✈️";
              margin-right: 8px;
            }
            .nav-links {
              display: flex;
              align-items: center;
              gap: 32px;
              flex: 1;
              justify-content: center;
            }
            .nav-link {
              color: #6b7280;
              text-decoration: none;
              font-size: 14px;
              font-weight: 500;
              transition: color 0.2s;
            }
            .nav-link:hover {
              color: #6366f1;
            }
            .header-actions {
              display: flex;
              align-items: center;
              gap: 16px;
            }
            .theme-toggle {
              background: none;
              border: none;
              padding: 8px;
              border-radius: 6px;
              cursor: pointer;
              color: #6b7280;
              font-size: 16px;
            }
            .sign-in-btn {
              background: #6366f1;
              color: white;
              border: none;
              padding: 8px 16px;
              border-radius: 8px;
              font-size: 14px;
              font-weight: 500;
              cursor: pointer;
              transition: background 0.2s;
            }
            .sign-in-btn:hover {
              background: #5b57f2;
            }
            
            /* Main Content */
            .main-content {
              max-width: 1200px;
              margin: 0 auto;
              padding: 80px 24px;
              text-align: center;
            }
            .main-title {
              font-size: 48px;
              font-weight: 700;
              color: #6366f1;
              margin-bottom: 24px;
              line-height: 1.2;
            }
            .subtitle {
              font-size: 18px;
              color: #6b7280;
              margin-bottom: 40px;
              max-width: 600px;
              margin-left: auto;
              margin-right: auto;
            }
            .cta-button {
              display: inline-flex;
              align-items: center;
              background: #3b82f6;
              color: white;
              padding: 14px 28px;
              border: none;
              border-radius: 12px;
              font-size: 16px;
              font-weight: 600;
              text-decoration: none;
              cursor: pointer;
              transition: all 0.2s;
              margin-bottom: 40px;
            }
            .cta-button:hover {
              background: #2563eb;
              transform: translateY(-2px);
              box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
            }
            .cta-button::before {
              content: "✈️";
              margin-right: 8px;
            }
            
            /* Search Bar */
            .search-container {
              max-width: 400px;
              margin: 0 auto;
              position: relative;
            }
            .search-input {
              width: 100%;
              padding: 12px 16px 12px 48px;
              border: 1px solid #d1d5db;
              border-radius: 12px;
              font-size: 16px;
              background: white;
              outline: none;
              transition: border-color 0.2s, box-shadow 0.2s;
            }
            .search-input:focus {
              border-color: #6366f1;
              box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
            }
            .search-icon {
              position: absolute;
              left: 16px;
              top: 50%;
              transform: translateY(-50%);
              color: #9ca3af;
            }
            
            /* Responsive */
            @media (max-width: 768px) {
              .nav-links {
                display: none;
              }
              .main-title {
                font-size: 36px;
              }
              .subtitle {
                font-size: 16px;
              }
              .main-content {
                padding: 60px 20px;
              }
            }
          </style>
        </head>
        <body>
          <!-- Header -->
          <header class="header">
            <div class="nav-container">
              <a href="/" class="logo">Eatpl.in</a>
              
              <nav class="nav-links">
                <a href="/question-bank" class="nav-link">Question Bank</a>
                <a href="/airline-interviews" class="nav-link">Airline Interviews & Sim Prep</a>
                <a href="/atpl-viva" class="nav-link">ATPL Viva</a>
                <a href="/classes" class="nav-link">Classes</a>
                <a href="/aptitude-test" class="nav-link">Aptitude Test</a>
                <a href="/airbus-320" class="nav-link">Airbus 320</a>
                <a href="/syllabus" class="nav-link">Syllabus</a>
                <a href="/pilot-resume" class="nav-link">Pilot Resume</a>
              </nav>
              
              <div class="header-actions">
                <button class="theme-toggle" onclick="toggleTheme()">🌙</button>
                <button class="sign-in-btn">Sign In</button>
              </div>
            </div>
          </header>
          
          <!-- Main Content -->
          <main class="main-content">
            <h1 class="main-title">14 ATPL Subject Modules</h1>
            <p class="subtitle">
              Master all EASA ATPL subjects with our comprehensive question bank 
              and practice tests
            </p>
            
            <a href="/subjects" class="cta-button">Start Your Flight Prep</a>
            
            <div class="search-container">
              <div class="search-icon">🔍</div>
              <input 
                type="text" 
                class="search-input" 
                placeholder="Search subjects..."
                onkeyup="searchSubjects(this.value)"
              >
            </div>
          </main>
          
          <script>
            function toggleTheme() {
              // Theme toggle functionality
              const body = document.body;
              const isDark = body.classList.contains('dark-theme');
              
              if (isDark) {
                body.classList.remove('dark-theme');
                document.querySelector('.theme-toggle').textContent = '🌙';
              } else {
                body.classList.add('dark-theme');
                document.querySelector('.theme-toggle').textContent = '☀️';
              }
            }
            
            function searchSubjects(query) {
              // Search functionality - can be connected to actual search later
              if (query.length > 2) {
                console.log('Searching for:', query);
                // Here you would implement the actual search logic
              }
            }
            
            // Sign in functionality
            document.querySelector('.sign-in-btn').addEventListener('click', () => {
              window.location.href = '/api/login';
            });
          </script>
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
